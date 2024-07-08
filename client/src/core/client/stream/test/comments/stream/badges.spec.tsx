import { act, screen, within } from "@testing-library/react";

import { pureMerge } from "coral-common/common/lib/utils";
import { GQLResolver, GQLSettings, GQLStory } from "coral-framework/schema";

import {
  baseStory,
  commenters,
  commentFromMember,
  commentFromModerator,
  commentFromNewUser,
  commentsFromStaff,
  settings,
} from "../../fixtures";

import {
  createFixture,
  createResolversStub,
  CreateTestRendererParams,
  denormalizeStory,
} from "coral-framework/testHelpers";

import createContext from "../create";

import customRenderAppWithContext from "coral-stream/test/customRenderAppWithContext";

const storyWithBadgeComments = denormalizeStory(
  createFixture<GQLStory>(
    {
      id: "test",
      comments: {
        edges: [
          {
            node: commentFromMember,
            cursor: commentFromMember.createdAt,
          },
          {
            node: commentsFromStaff[0],
            cursor: commentsFromStaff[0].createdAt,
          },
          {
            node: commentFromModerator,
            cursor: commentFromModerator.createdAt,
          },
          {
            node: commentFromNewUser,
            cursor: commentFromNewUser.createdAt,
          },
        ],
      },
    },
    baseStory
  )
);

describe("user badges", () => {
  const uniqueLabels = {
    memberLabel: "MEMBER",
    staffLabel: "STAFF",
    moderatorLabel: "MODERATOR",
  };
  async function createTestRenderer(params: CreateTestRendererParams) {
    const { context } = createContext({
      ...params,
      resolvers: pureMerge(
        createResolversStub<GQLResolver>({
          Query: {
            settings: () =>
              pureMerge<GQLSettings>(settings, {
                badges: uniqueLabels,
              }),
            viewer: () => commenters[0],
          },
        }),
        params.resolvers
      ),
      initLocalState: (localRecord, source, environment) => {
        if (params.initLocalState) {
          params.initLocalState(localRecord, source, environment);
        }
      },
    });

    customRenderAppWithContext(context);

    return context;
  }

  it("renders user badges", async () => {
    const resolvers = createResolversStub<GQLResolver>({
      Query: {
        stream: ({ variables, ...rest }) => {
          return storyWithBadgeComments;
        },
      },
    });
    await act(async () => {
      await createTestRenderer({
        resolvers,
      });
    });

    const memberBadge = await screen.findByText(uniqueLabels.memberLabel);
    const staffBadge = await screen.findByText(uniqueLabels.staffLabel);
    const moderatorBadge = await screen.findByText(uniqueLabels.moderatorLabel);

    expect(memberBadge).toBeDefined();
    expect(staffBadge).toBeDefined();
    expect(moderatorBadge).toBeDefined();
  });

  it("renders custom flair badges", async () => {
    const resolvers = createResolversStub<GQLResolver>({
      Query: {
        stream: ({ variables, ...rest }) => {
          return storyWithBadgeComments;
        },
      },
    });
    await act(async () => {
      await createTestRenderer({
        resolvers,
      });
    });
    const memberComment = screen.getByRole("article", {
      name: "Comment from member 2018-07-06T18:24:00.000Z",
    });
    expect(within(memberComment).getByRole("img")).toHaveAttribute(
      "src",
      "https://wwww.example.com/image.jpg"
    );
  });

  it("renders new user badge if comment by new user", async () => {
    const resolvers = createResolversStub<GQLResolver>({
      Query: {
        stream: () => {
          return storyWithBadgeComments;
        },
        settings: () => {
          return { ...settings, newCommenter: { enabled: true } };
        },
      },
    });
    await act(async () => {
      await createTestRenderer({
        resolvers,
      });
    });

    const comment = screen.getByRole("article", {
      name: "Comment from Markus 2018-07-06T18:24:00.000Z",
    });
    const newUserBadge = within(comment).getByTestId("new-user-badge");
    expect(newUserBadge).toBeVisible();
  });
});
