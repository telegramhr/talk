import { ACTION_TYPE } from "coral-server/models/action/comment";

import {
  GQLCOMMENT_FLAG_REASON,
  GQLCOMMENT_STATUS,
} from "coral-server/graph/schema/__generated__/types";

import { compose, ModerationPhaseContext } from "./pipeline";

const context = {
  comment: { body: "This is a test" },
} as ModerationPhaseContext;

describe("compose", () => {
  it("handles when a phase throws an error", async () => {
    const err = new Error("this is an error");
    const enhanced = compose([
      () => {
        throw err;
      },
    ]);

    await expect(enhanced(context)).rejects.toEqual(err);
  });

  it("handles when it returns a status", async () => {
    const status = GQLCOMMENT_STATUS.APPROVED;
    const enhanced = compose([() => ({ status })]);

    await expect(enhanced(context)).resolves.toEqual({
      body: context.comment.body,
      status,
      metadata: {},
      commentActions: [],
      tags: [],
    });
  });

  it("merges the metadata", async () => {
    const status = GQLCOMMENT_STATUS.APPROVED;
    const enhanced = compose([
      () => ({ metadata: { akismet: true } }),
      () => ({ metadata: { linkCount: 1 } }),
      () => ({ status, metadata: { akismet: false } }),
    ]);

    await expect(enhanced(context)).resolves.toEqual({
      body: context.comment.body,
      status,
      metadata: { akismet: false, linkCount: 1 },
      commentActions: [],
      tags: [],
    });
  });

  it("merges actions", async () => {
    const status = GQLCOMMENT_STATUS.APPROVED;

    const flags = [
      {
        userID: null,
        actionType: ACTION_TYPE.FLAG,
        reason: GQLCOMMENT_FLAG_REASON.COMMENT_DETECTED_TOXIC,
      },
      {
        userID: null,
        actionType: ACTION_TYPE.FLAG,
        reason: GQLCOMMENT_FLAG_REASON.COMMENT_DETECTED_SPAM,
      },
    ];

    const enhanced = compose([
      () => ({
        commentActions: [flags[0]],
      }),
      () => ({
        status,
        commentActions: [flags[1]],
      }),
      () => ({
        commentActions: [
          {
            userID: null,
            actionType: ACTION_TYPE.FLAG,
            reason: GQLCOMMENT_FLAG_REASON.COMMENT_DETECTED_LINKS,
          },
        ],
      }),
    ]);

    const final = await enhanced(context);

    for (const flag of flags) {
      expect(final.commentActions).toContainEqual(flag);
    }

    expect(final.commentActions).not.toContainEqual({
      body: context.comment.body,
      actionType: ACTION_TYPE.FLAG,
      reason: GQLCOMMENT_FLAG_REASON.COMMENT_DETECTED_LINKS,
    });
  });

  it("handles when it does not return a status", async () => {
    const enhanced = compose([
      () => ({ metadata: { akismet: true } }),
      () => ({ metadata: { akismet: false } }),
    ]);

    await expect(enhanced(context)).resolves.toEqual({
      body: context.comment.body,
      status: GQLCOMMENT_STATUS.NONE,
      metadata: { akismet: false },
      commentActions: [],
      tags: [],
    });
  });
});
