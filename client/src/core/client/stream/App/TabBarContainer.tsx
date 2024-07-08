import React, { FunctionComponent, useCallback, useMemo } from "react";
import { graphql } from "react-relay";

import { useCoralContext } from "coral-framework/lib/bootstrap";
import { IntersectionProvider } from "coral-framework/lib/intersection";
import {
  useLocal,
  useMutation,
  withFragmentContainer,
} from "coral-framework/lib/relay";
import { Ability, can } from "coral-framework/permissions";
import { GQLFEATURE_FLAG, GQLSTORY_MODE } from "coral-framework/schema";
import { SetCommentIDMutation } from "coral-stream/mutations";
import FloatingNotificationButton from "coral-stream/tabs/Notifications/floatingButton/FloatingNotificationButton";
import useLiveNotificationsPolling from "coral-stream/tabs/Notifications/polling/useLiveNotificationsPolling";

import { TabBarContainer_settings } from "coral-stream/__generated__/TabBarContainer_settings.graphql";
import { TabBarContainer_story } from "coral-stream/__generated__/TabBarContainer_story.graphql";
import { TabBarContainer_viewer } from "coral-stream/__generated__/TabBarContainer_viewer.graphql";
import { TabBarContainerLocal } from "coral-stream/__generated__/TabBarContainerLocal.graphql";

import {
  SetActiveTabInput,
  SetActiveTabMutation,
  withSetActiveTabMutation,
} from "./SetActiveTabMutation";
import TabBar from "./TabBar";

interface Props {
  story: TabBarContainer_story | null;
  settings: TabBarContainer_settings | null;
  viewer: TabBarContainer_viewer | null;
  setActiveTab: SetActiveTabMutation;
}

export const TabBarContainer: FunctionComponent<Props> = ({
  viewer,
  story,
  settings,
  setActiveTab,
}) => {
  useLiveNotificationsPolling(settings, viewer);

  const setCommentID = useMutation(SetCommentIDMutation);
  const { window } = useCoralContext();
  const [{ activeTab, hasNewNotifications }] =
    useLocal<TabBarContainerLocal>(graphql`
      fragment TabBarContainerLocal on Local {
        activeTab
        hasNewNotifications
      }
    `);
  const handleSetActiveTab = useCallback(
    (tab: SetActiveTabInput["tab"]) => {
      void setActiveTab({ tab });
      if (tab === "COMMENTS") {
        void setCommentID({ id: null });
        const pathName = window.location.pathname;
        history.pushState(null, "", pathName);
      }
    },
    [setActiveTab, setCommentID, window]
  );

  const showDiscussionsTab = useMemo(
    () =>
      !!viewer &&
      !!settings &&
      settings.featureFlags.includes(GQLFEATURE_FLAG.DISCUSSIONS),
    [viewer, settings]
  );

  const showConfigureTab = useMemo(
    () =>
      !!viewer &&
      !!story &&
      story.canModerate &&
      can(viewer, Ability.CHANGE_STORY_CONFIGURATION),
    [viewer, story]
  );

  return (
    <>
      {!!viewer &&
        !!settings?.inPageNotifications?.enabled &&
        !!settings?.inPageNotifications?.floatingBellIndicator && (
          <FloatingNotificationButton
            viewerID={viewer?.id}
            enabled={!!viewer?.inPageNotifications?.enabled}
          />
        )}
      <IntersectionProvider threshold={[0, 1]}>
        <TabBar
          mode={story ? story.settings.mode : GQLSTORY_MODE.COMMENTS}
          activeTab={activeTab}
          showProfileTab={!!viewer}
          showDiscussionsTab={showDiscussionsTab}
          showConfigureTab={showConfigureTab}
          showNotificationsTab={
            !!viewer && !!settings?.inPageNotifications?.enabled
          }
          hasNewNotifications={!!hasNewNotifications}
          userNotificationsEnabled={!!viewer?.inPageNotifications?.enabled}
          inPageNotifications={settings?.inPageNotifications}
          onTabClick={handleSetActiveTab}
        />
      </IntersectionProvider>
    </>
  );
};

const enhanced = withSetActiveTabMutation(
  withFragmentContainer<Props>({
    viewer: graphql`
      fragment TabBarContainer_viewer on User {
        id
        role
        inPageNotifications {
          enabled
        }
        ...useLiveNotificationsPolling_viewer
      }
    `,
    story: graphql`
      fragment TabBarContainer_story on Story {
        canModerate
        settings {
          mode
        }
      }
    `,
    settings: graphql`
      fragment TabBarContainer_settings on Settings {
        featureFlags
        inPageNotifications {
          enabled
          floatingBellIndicator
        }
        ...useLiveNotificationsPolling_settings
      }
    `,
  })(TabBarContainer)
);

export default enhanced;
