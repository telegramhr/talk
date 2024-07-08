import cn from "classnames";
import React, { FunctionComponent, useEffect } from "react";
import { graphql } from "relay-runtime";

import useGetMessage from "coral-framework/lib/i18n/useGetMessage";
import { useInView } from "coral-framework/lib/intersection";
import { useLocal } from "coral-framework/lib/relay";
import { GQLSTORY_MODE } from "coral-framework/schema";
import CLASSES from "coral-stream/classes";
import { LiveBellIcon } from "coral-stream/tabs/Notifications/LiveBellIcon";
import {
  CogIcon,
  ConversationChatIcon,
  ConversationQuestionWarningIcon,
  MessagesBubbleSquareIcon,
  RatingStarIcon,
  SingleNeutralCircleIcon,
  SvgIcon,
} from "coral-ui/components/icons";
import { MatchMedia, Tab, TabBar } from "coral-ui/components/v2";

import { TabBar_local } from "coral-stream/__generated__/TabBar_local.graphql";

import styles from "./TabBar.css";

type TabValue =
  | "COMMENTS"
  | "PROFILE"
  | "DISCUSSIONS"
  | "CONFIGURE"
  | "NOTIFICATIONS"
  | "%future added value";

export interface Props {
  activeTab: TabValue;
  onTabClick: (tab: TabValue) => void;
  showProfileTab: boolean;
  showDiscussionsTab: boolean;
  showConfigureTab: boolean;
  showNotificationsTab: boolean;
  hasNewNotifications: boolean;
  userNotificationsEnabled: boolean;
  inPageNotifications?: {
    enabled: boolean | null;
    floatingBellIndicator: boolean | null;
  } | null;
  mode:
    | "COMMENTS"
    | "QA"
    | "RATINGS_AND_REVIEWS"
    | "%future added value"
    | null;
}

const AppTabBar: FunctionComponent<Props> = (props) => {
  const [, setLocal] = useLocal<TabBar_local>(graphql`
    fragment TabBar_local on Local {
      appTabBarVisible
    }
  `);

  const { inView, intersectionRef } = useInView();
  useEffect(() => {
    setLocal({ appTabBarVisible: inView });
  }, [inView, setLocal]);

  const getMessage = useGetMessage();

  let commentsTabText: string;
  switch (props.mode) {
    case "QA":
      commentsTabText = getMessage("general-tabBar-qaTab", "Q&A");
      break;
    case "RATINGS_AND_REVIEWS":
      commentsTabText = getMessage("general-tabBar-reviewsTab", "Reviews");
      break;
    default:
      commentsTabText = getMessage("general-tabBar-commentsTab", "Comments");
  }
  const discussionsText = getMessage(
    "general-tabBar-discussionsTab",
    "Discussions"
  );
  const myProfileText = getMessage("general-tabBar-myProfileTab", "My Profile");
  const configureText = getMessage("general-tabBar-configure", "Configure");
  const notificationsText = getMessage("notifications-title", "Notifications");

  return (
    <MatchMedia gteWidth="sm">
      {(matches) => (
        <TabBar
          className={cn(CLASSES.tabBar.$root, {
            [CLASSES.tabBar.mobile]: !matches,
          })}
          activeTab={props.activeTab}
          onTabClick={props.onTabClick}
          variant="streamPrimary"
          forwardRef={intersectionRef}
        >
          <Tab
            className={cn(CLASSES.tabBar.comments, {
              [CLASSES.tabBar.activeTab]: props.activeTab === "COMMENTS",
              [styles.smallTab]: !matches,
            })}
            tabID="COMMENTS"
            variant="streamPrimary"
          >
            {matches ? (
              <span>{commentsTabText}</span>
            ) : (
              <div>
                {!props.mode ||
                  (props.mode === GQLSTORY_MODE.COMMENTS && (
                    <>
                      <SvgIcon size="lg" Icon={MessagesBubbleSquareIcon} />
                      <div className={styles.smallText}>{commentsTabText}</div>
                    </>
                  ))}
                {props.mode === GQLSTORY_MODE.QA && (
                  <>
                    <SvgIcon size="lg" Icon={ConversationQuestionWarningIcon} />
                    <div className={styles.smallText}>{commentsTabText}</div>
                  </>
                )}
                {props.mode === GQLSTORY_MODE.RATINGS_AND_REVIEWS && (
                  <>
                    <SvgIcon size="lg" Icon={RatingStarIcon} />
                    <div className={styles.smallText}>{commentsTabText}</div>
                  </>
                )}
              </div>
            )}
          </Tab>

          {props.showDiscussionsTab && (
            <Tab
              className={cn(CLASSES.tabBar.discussions, {
                [CLASSES.tabBar.activeTab]: props.activeTab === "DISCUSSIONS",
                [styles.smallTab]: !matches,
              })}
              tabID="DISCUSSIONS"
              variant="streamPrimary"
            >
              {matches ? (
                <span>{discussionsText}</span>
              ) : (
                <div>
                  <SvgIcon size="lg" Icon={ConversationChatIcon} />
                  <div className={styles.smallText}>{discussionsText}</div>
                </div>
              )}
            </Tab>
          )}

          {props.showProfileTab && (
            <Tab
              className={cn(CLASSES.tabBar.myProfile, {
                [CLASSES.tabBar.activeTab]: props.activeTab === "PROFILE",
                [styles.smallTab]: !matches,
              })}
              tabID="PROFILE"
              variant="streamPrimary"
            >
              {matches ? (
                <span>{myProfileText}</span>
              ) : (
                <div>
                  <SvgIcon size="lg" Icon={SingleNeutralCircleIcon} />
                  <div className={styles.smallText}>{myProfileText}</div>
                </div>
              )}
            </Tab>
          )}

          {props.showConfigureTab && (
            <Tab
              className={cn(CLASSES.tabBar.configure, {
                [CLASSES.tabBar.activeTab]: props.activeTab === "CONFIGURE",
                [styles.smallTab]: !matches,
              })}
              tabID="CONFIGURE"
              variant="streamPrimary"
            >
              {matches ? (
                <span>{configureText}</span>
              ) : (
                <div>
                  <SvgIcon size="lg" Icon={CogIcon} />
                  <div className={styles.smallText}>{configureText}</div>
                </div>
              )}
            </Tab>
          )}

          {props.showNotificationsTab && (
            <Tab
              className={cn(
                CLASSES.tabBar.notifications,
                styles.notificationsTab,
                {
                  [CLASSES.tabBar.activeTab]:
                    props.activeTab === "NOTIFICATIONS",
                  [styles.notificationsTabSmall]: !matches,
                  [styles.floatingBellDisabled]:
                    !props.inPageNotifications?.floatingBellIndicator,
                }
              )}
              tabID="NOTIFICATIONS"
              variant="notifications"
              float={
                props.inPageNotifications?.floatingBellIndicator
                  ? "right"
                  : "none"
              }
              title={notificationsText}
            >
              <div className={cn(styles.notificationsIcon)}>
                <LiveBellIcon
                  size="lg"
                  enabled={props.userNotificationsEnabled}
                />
              </div>
            </Tab>
          )}
        </TabBar>
      )}
    </MatchMedia>
  );
};

export default AppTabBar;
