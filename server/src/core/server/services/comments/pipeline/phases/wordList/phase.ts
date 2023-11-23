import { ACTION_TYPE } from "coral-server/models/action/comment";

import {
  GQLCOMMENT_FLAG_REASON,
  GQLCOMMENT_STATUS,
  GQLREJECTION_REASON_CODE,
} from "coral-server/graph/schema/__generated__/types";

import {
  IntermediateModerationPhase,
  IntermediatePhaseResult,
} from "../../pipeline";
import { WordListCategory } from "./message";

export const wordListPhase: IntermediateModerationPhase = async ({
  config,
  tenant,
  comment,
  wordList,
}): Promise<IntermediatePhaseResult | void> => {
  // If there isn't a body, there can't be a bad word!
  if (!comment.body) {
    return;
  }

  const banned = await wordList.process(
    tenant.id,
    WordListCategory.Banned,
    comment.body
  );

  if (banned.isMatched) {
    return {
      status: GQLCOMMENT_STATUS.REJECTED,
      commentActions: [
        {
          actionType: ACTION_TYPE.FLAG,
          reason: GQLCOMMENT_FLAG_REASON.COMMENT_DETECTED_BANNED_WORD,
        },
      ],
      moderationAction: {
        status: GQLCOMMENT_STATUS.REJECTED,
        moderatorID: null,
        rejectionReason: {
          code: GQLREJECTION_REASON_CODE.BANNED_WORD,
        },
      },
      metadata: {
        wordList: {
          bannedWords: banned.matches,
        },
      },
    };
  } else if (banned.timedOut) {
    return {
      commentActions: [
        {
          actionType: ACTION_TYPE.FLAG,
          reason: GQLCOMMENT_FLAG_REASON.COMMENT_DETECTED_BANNED_WORD,
        },
      ],
      metadata: {
        wordList: {
          timedOut: true,
        },
      },
    };
  }

  const suspect = await wordList.process(
    tenant.id,
    WordListCategory.Suspect,
    comment.body
  );

  if (tenant.premoderateSuspectWords && suspect.isMatched) {
    return {
      status: GQLCOMMENT_STATUS.SYSTEM_WITHHELD,
      commentActions: [
        {
          actionType: ACTION_TYPE.FLAG,
          reason: GQLCOMMENT_FLAG_REASON.COMMENT_DETECTED_SUSPECT_WORD,
        },
      ],
      metadata: {
        wordList: {
          suspectWords: suspect.matches,
        },
      },
    };
  } else if (suspect.isMatched) {
    return {
      commentActions: [
        {
          actionType: ACTION_TYPE.FLAG,
          reason: GQLCOMMENT_FLAG_REASON.COMMENT_DETECTED_SUSPECT_WORD,
        },
      ],
      metadata: {
        wordList: {
          suspectWords: suspect.matches,
        },
      },
    };
  } else if (suspect.timedOut) {
    return {
      commentActions: [
        {
          actionType: ACTION_TYPE.FLAG,
          reason: GQLCOMMENT_FLAG_REASON.COMMENT_DETECTED_SUSPECT_WORD,
        },
      ],
      metadata: {
        wordList: {
          timedOut: true,
        },
      },
    };
  }
};
