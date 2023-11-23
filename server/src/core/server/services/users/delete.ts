import { Collection, FilterQuery } from "mongodb";
import { v4 as uuid } from "uuid";

import { Config } from "coral-server/config";
import { MongoContext } from "coral-server/data/context";
import { ACTION_TYPE } from "coral-server/models/action/comment";
import { Comment, getLatestRevision } from "coral-server/models/comment";
import { DSAReport } from "coral-server/models/dsaReport";
import { Story } from "coral-server/models/story";
import { retrieveTenant, Tenant } from "coral-server/models/tenant";

import {
  GQLCOMMENT_STATUS,
  GQLDSAReportHistoryType,
  GQLDSAReportStatus,
  GQLREJECTION_REASON_CODE,
  GQLRejectionReason,
} from "coral-server/graph/schema/__generated__/types";

import { moderate } from "../comments/moderation";
import { I18n, translate } from "../i18n";
import { AugmentedRedis } from "../redis";

const BATCH_SIZE = 500;

async function executeBulkOperations<T>(
  collection: Collection<T>,
  operations: any[]
) {
  // TODO: (wyattjoh) fix types here to support actual types when upstream changes applied
  const bulk: any = collection.initializeUnorderedBulkOp();

  for (const operation of operations) {
    bulk.raw(operation);
  }

  await bulk.execute();
}

interface Batch {
  comments: any[];
  stories: any[];
}

interface DSAReportBatch {
  dsaReports: any[];
}

async function deleteUserActionCounts(
  mongo: MongoContext,
  userID: string,
  tenantID: string,
  isArchived: boolean
) {
  const batch: Batch = {
    comments: [],
    stories: [],
  };

  async function processBatch() {
    const comments = isArchived ? mongo.archivedComments() : mongo.comments();

    await executeBulkOperations<Comment>(comments, batch.comments);
    batch.comments = [];

    if (!isArchived) {
      await executeBulkOperations<Story>(mongo.stories(), batch.stories);
      batch.stories = [];
    }
  }

  const commentActions = isArchived
    ? mongo.archivedCommentActions()
    : mongo.commentActions();
  const cursor = commentActions.find({
    tenantID,
    userID,
    actionType: ACTION_TYPE.REACTION,
  });
  while (await cursor.hasNext()) {
    const action = await cursor.next();
    if (!action) {
      continue;
    }

    batch.comments.push({
      updateOne: {
        filter: { tenantID, id: action.commentID },
        update: {
          $inc: {
            "revisions.$[revisions].actionCounts.REACTION": -1,
            "actionCounts.REACTION": -1,
          },
        },
        arrayFilters: [{ "revisions.id": action.commentRevisionID }],
      },
    });

    batch.stories.push({
      updateOne: {
        filter: { tenantID, id: action.storyID },
        update: {
          $inc: {
            "commentCounts.action.REACTION": -1,
          },
        },
      },
    });

    if (
      batch.comments.length >= BATCH_SIZE ||
      batch.stories.length >= BATCH_SIZE
    ) {
      await processBatch();
    }
  }

  if (batch.comments.length > 0 || batch.stories.length > 0) {
    await processBatch();
  }

  await commentActions.deleteMany({
    tenantID,
    userID,
    actionType: ACTION_TYPE.REACTION,
  });
}

async function moderateComments(
  mongo: MongoContext,
  redis: AugmentedRedis,
  config: Config,
  i18n: I18n,
  tenant: Tenant,
  filter: FilterQuery<Comment>,
  targetStatus: GQLCOMMENT_STATUS,
  now: Date,
  isArchived = false,
  rejectionReason?: GQLRejectionReason
) {
  const coll =
    isArchived && mongo.archive ? mongo.archivedComments() : mongo.comments();
  const comments = coll.find(filter);

  while (await comments.hasNext()) {
    const comment = await comments.next();
    if (!comment) {
      continue;
    }

    const updateAllCommentCountsArgs = {
      actionCounts: {},
      options: {
        updateShared: !isArchived,
        updateSite: !isArchived,
        updateStory: true,
        updateUser: true,
      },
    };

    const { result } = await moderate(
      mongo,
      redis,
      config,
      i18n,
      tenant,
      {
        commentID: comment.id,
        commentRevisionID: getLatestRevision(comment).id,
        moderatorID: null,
        status: targetStatus,
        rejectionReason,
      },
      now,
      isArchived,
      updateAllCommentCountsArgs
    );

    if (!result.after) {
      continue;
    }
  }
}

async function updateUserDSAReports(
  mongo: MongoContext,
  tenantID: string,
  authorID: string,
  isArchived?: boolean
) {
  const batch: DSAReportBatch = {
    dsaReports: [],
  };

  async function processBatch() {
    const dsaReports = mongo.dsaReports();

    await executeBulkOperations<DSAReport>(dsaReports, batch.dsaReports);
    batch.dsaReports = [];
  }

  const collection =
    isArchived && mongo.archive ? mongo.archivedComments() : mongo.comments();

  const cursor = collection.find({
    tenantID,
    authorID,
  });
  while (await cursor.hasNext()) {
    const comment = await cursor.next();
    if (!comment) {
      continue;
    }

    const match = mongo.dsaReports().find({
      tenantID,
      commentID: comment.id,
      status: {
        $in: [
          GQLDSAReportStatus.AWAITING_REVIEW,
          GQLDSAReportStatus.UNDER_REVIEW,
        ],
      },
    });

    if (!match) {
      continue;
    }

    const id = uuid();

    const statusChangeHistoryItem = {
      id,
      createdBy: null,
      createdAt: new Date(),
      status: GQLDSAReportStatus.VOID,
      type: GQLDSAReportHistoryType.STATUS_CHANGED,
    };

    batch.dsaReports.push({
      updateMany: {
        filter: {
          tenantID,
          commentID: comment.id,
          status: {
            $in: [
              GQLDSAReportStatus.AWAITING_REVIEW,
              GQLDSAReportStatus.UNDER_REVIEW,
            ],
          },
        },
        update: {
          $set: {
            status: "VOID",
          },
          $push: {
            history: statusChangeHistoryItem,
          },
        },
      },
    });

    if (batch.dsaReports.length >= BATCH_SIZE) {
      await processBatch();
    }
  }

  if (batch.dsaReports.length > 0) {
    await processBatch();
  }
}

async function deleteUserComments(
  mongo: MongoContext,
  redis: AugmentedRedis,
  config: Config,
  i18n: I18n,
  authorID: string,
  tenantID: string,
  now: Date,
  isArchived?: boolean
) {
  const tenant = await retrieveTenant(mongo, tenantID);
  if (!tenant) {
    throw new Error("unable to retrieve tenant");
  }
  // Approve any comments that have children.
  // This allows the children to be visible after
  // the comment is deleted.
  await moderateComments(
    mongo,
    redis,
    config,
    i18n,
    tenant,
    {
      tenantID,
      authorID,
      status: GQLCOMMENT_STATUS.NONE,
      childCount: { $gt: 0 },
    },
    GQLCOMMENT_STATUS.APPROVED,
    now,
    isArchived
  );

  const bundle = i18n.getBundle(tenant.locale);
  const translatedExplanation = translate(
    bundle,
    "User account deleted",
    "common-accountDeleted"
  );

  // reject any comments that don't have children
  // This gets rid of any empty/childless deleted comments.
  await moderateComments(
    mongo,
    redis,
    config,
    i18n,
    tenant,
    {
      tenantID,
      authorID,
      status: {
        $in: [
          GQLCOMMENT_STATUS.PREMOD,
          GQLCOMMENT_STATUS.SYSTEM_WITHHELD,
          GQLCOMMENT_STATUS.NONE,
          GQLCOMMENT_STATUS.APPROVED,
        ],
      },
      childCount: 0,
    },
    GQLCOMMENT_STATUS.REJECTED,
    now,
    isArchived,
    {
      code: GQLREJECTION_REASON_CODE.OTHER,
      detailedExplanation: translatedExplanation,
    }
  );

  const collection =
    isArchived && mongo.archive ? mongo.archivedComments() : mongo.comments();

  await collection.updateMany(
    { tenantID, authorID },
    {
      $set: {
        authorID: null,
        revisions: [],
        tags: [],
        deletedAt: now,
      },
    }
  );
}

export async function deleteUser(
  mongo: MongoContext,
  redis: AugmentedRedis,
  config: Config,
  i18n: I18n,
  userID: string,
  tenantID: string,
  now: Date,
  dsaEnabled: boolean
) {
  const user = await mongo.users().findOne({ id: userID, tenantID });
  if (!user) {
    throw new Error("could not find user by ID");
  }

  // Check to see if the user was already deleted.
  if (user.deletedAt) {
    throw new Error("user was already deleted");
  }

  const tenant = await mongo.tenants().findOne({ id: tenantID });
  if (!tenant) {
    throw new Error("could not find tenant by ID");
  }

  // Delete the user's action counts.
  await deleteUserActionCounts(mongo, userID, tenantID, false);
  if (mongo.archive) {
    await deleteUserActionCounts(mongo, userID, tenantID, true);
  }

  // If DSA is enabled,
  // Update the user's comment's associated DSAReports; set their status to VOID
  if (dsaEnabled) {
    await updateUserDSAReports(mongo, tenantID, userID);
    if (mongo.archive) {
      await updateUserDSAReports(mongo, tenantID, userID, true);
    }
  }

  // Delete the user's comments.
  await deleteUserComments(mongo, redis, config, i18n, userID, tenantID, now);
  if (mongo.archive) {
    await deleteUserComments(
      mongo,
      redis,
      config,
      i18n,
      userID,
      tenantID,
      now,
      true
    );
  }

  // Mark the user as deleted.
  const result = await mongo.users().findOneAndUpdate(
    { tenantID, id: userID },
    {
      $set: {
        deletedAt: now,
      },
      $unset: {
        profiles: "",
        email: "",
      },
    },
    {
      // False to return the updated document instead of the original
      // document.
      returnOriginal: false,
    }
  );

  return result.value || null;
}
