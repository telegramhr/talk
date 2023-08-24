import { Config } from "coral-server/config";
import { DataCache } from "coral-server/data/cache/dataCache";
import { MongoContext } from "coral-server/data/context";
import { CoralEventPublisherBroker } from "coral-server/events/publisher";
import {
  Comment,
  getLatestRevision,
  hasTag,
  UpdateCommentStatus,
} from "coral-server/models/comment";
import { Tenant } from "coral-server/models/tenant";
import { removeTag } from "coral-server/services/comments";
import { moderate } from "coral-server/services/comments/moderation";
import { AugmentedRedis } from "coral-server/services/redis";
import { submitCommentAsSpam } from "coral-server/services/spam";
import { Request } from "coral-server/types/express";

import {
  GQLCOMMENT_STATUS,
  GQLTAG,
} from "coral-server/graph/schema/__generated__/types";

import { publishChanges } from "./helpers";
import { updateTagCommentCounts } from "./helpers/updateAllCommentCounts";

const removeFromCache = async (
  cache: DataCache,
  tenantID: string,
  comment: Readonly<Comment>
) => {
  const cacheAvailable = await cache.available(tenantID);
  if (cacheAvailable) {
    await cache.comments.remove(comment);
  }
};

const stripTag = async (
  mongo: MongoContext,
  redis: AugmentedRedis,
  tenant: Readonly<Tenant>,
  comment: Readonly<Comment>,
  tag: GQLTAG
) => {
  if (!hasTag(comment, tag)) {
    return comment;
  }

  const tagResult = await removeTag(mongo, tenant, comment.id, tag);

  await updateTagCommentCounts(
    tenant.id,
    comment.storyID,
    comment.siteID,
    mongo,
    redis,
    // Create a diff where "before" tags have the target tag and
    // the "after" does not since the previous `removeTag` took
    // away the target tag on the comment
    comment.tags,
    comment.tags.filter((t) => t.type !== tag)
  );

  return tagResult;
};

const rejectComment = async (
  mongo: MongoContext,
  redis: AugmentedRedis,
  cache: DataCache,
  config: Config,
  broker: CoralEventPublisherBroker | null,
  tenant: Tenant,
  commentID: string,
  commentRevisionID: string,
  moderatorID: string,
  now: Date,
  request?: Request | undefined
) => {
  const updateAllCommentCountsArgs = {
    actionCounts: {},
  };

  // Reject the comment.
  const { result, counts } = await moderate(
    mongo,
    redis,
    config,
    tenant,
    {
      commentID,
      commentRevisionID,
      moderatorID,
      status: GQLCOMMENT_STATUS.REJECTED,
    },
    now,
    undefined,
    updateAllCommentCountsArgs
  );

  const revision = getLatestRevision(result.before);
  if (
    revision &&
    tenant.integrations.akismet.enabled &&
    (revision.actionCounts.COMMENT_REPORTED_SPAM > 0 ||
      revision.actionCounts.COMMENT_DETECTED_SPAM > 0)
  ) {
    await submitCommentAsSpam(mongo, tenant, result.before, request);
  }

  // If the comment hasn't been updated, skip the rest of the steps.
  if (!result.after) {
    return result.before;
  }

  let rollingResult: Readonly<Comment> = result.after;

  rollingResult = await stripTag(
    mongo,
    redis,
    tenant,
    rollingResult,
    GQLTAG.FEATURED
  );

  rollingResult = await stripTag(
    mongo,
    redis,
    tenant,
    rollingResult,
    GQLTAG.UNANSWERED
  );

  await removeFromCache(cache, tenant.id, rollingResult);

  const updateStatus: UpdateCommentStatus = {
    before: result.before,
    after: rollingResult,
  };

  // TODO: (wyattjoh) (tessalt) broker cannot easily be passed to stack from tasks,
  // see CORL-935 in jira
  if (broker && counts) {
    // Publish changes to the event publisher.
    await publishChanges(broker, {
      ...updateStatus,
      ...counts,
      moderatorID,
      commentRevisionID,
    });
  }

  // Return the resulting comment.
  return rollingResult;
};

export default rejectComment;
