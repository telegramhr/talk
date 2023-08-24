import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { graphql } from "react-relay";

import { useViewerEvent } from "coral-framework/lib/events";
import { withFragmentContainer } from "coral-framework/lib/relay";
import CLASSES from "coral-stream/classes";
import { ShowModerationPopoverEvent } from "coral-stream/events";
import { Dropdown } from "coral-ui/components/v2";

import { ModerationDropdownContainer_comment } from "coral-stream/__generated__/ModerationDropdownContainer_comment.graphql";
import { ModerationDropdownContainer_settings } from "coral-stream/__generated__/ModerationDropdownContainer_settings.graphql";
import { ModerationDropdownContainer_story } from "coral-stream/__generated__/ModerationDropdownContainer_story.graphql";
import { ModerationDropdownContainer_viewer } from "coral-stream/__generated__/ModerationDropdownContainer_viewer.graphql";

import UserBanPopoverContainer from "../UserBanPopover/UserBanPopoverContainer";
import ModerationActionsContainer from "./ModerationActionsContainer";

export type ModerationDropdownView =
  | "MODERATE"
  | "BAN"
  | "SITE_BAN"
  | "CONFIRM_BAN";

interface Props {
  comment: ModerationDropdownContainer_comment;
  story: ModerationDropdownContainer_story;
  viewer: ModerationDropdownContainer_viewer;
  settings: ModerationDropdownContainer_settings;
  onDismiss: () => void;
  scheduleUpdate: () => void;
  view?: ModerationDropdownView;
}

const ModerationDropdownContainer: FunctionComponent<Props> = ({
  comment,
  story,
  viewer,
  settings,
  onDismiss,
  scheduleUpdate,
  view: viewProp,
}) => {
  const emitShowEvent = useViewerEvent(ShowModerationPopoverEvent);
  const [view, setView] = useState<ModerationDropdownView>(
    viewProp ?? "MODERATE"
  );

  const onBan = useCallback(() => {
    setView("BAN");
    scheduleUpdate();
  }, [setView, scheduleUpdate]);
  const onSiteBan = useCallback(() => {
    setView("SITE_BAN");
    scheduleUpdate();
  }, [setView, scheduleUpdate]);

  // run once.
  useEffect(() => {
    emitShowEvent({ commentID: comment.id });
  }, []);

  return (
    <div>
      {view === "MODERATE" ? (
        <Dropdown className={CLASSES.moderationDropdown.$root}>
          <ModerationActionsContainer
            comment={comment}
            story={story}
            viewer={viewer}
            settings={settings}
            onDismiss={onDismiss}
            onBan={onBan}
            onSiteBan={onSiteBan}
          />
        </Dropdown>
      ) : (
        <UserBanPopoverContainer
          comment={comment}
          settings={settings}
          story={story}
          viewer={viewer}
          onDismiss={onDismiss}
          view={view}
        />
      )}
    </div>
  );
};

const enhanced = withFragmentContainer<Props>({
  comment: graphql`
    fragment ModerationDropdownContainer_comment on Comment {
      id
      author {
        id
        username
      }
      revision {
        id
      }
      status
      tags {
        code
      }
      ...ModerationActionsContainer_comment
      ...UserBanPopoverContainer_comment
    }
  `,
  story: graphql`
    fragment ModerationDropdownContainer_story on Story {
      id
      ...ModerationActionsContainer_story
      ...UserBanPopoverContainer_story
    }
  `,
  settings: graphql`
    fragment ModerationDropdownContainer_settings on Settings {
      ...ModerationActionsContainer_settings
      ...UserBanPopoverContainer_settings
    }
  `,
  viewer: graphql`
    fragment ModerationDropdownContainer_viewer on User {
      ...ModerationActionsContainer_viewer
      ...UserBanPopoverContainer_viewer
    }
  `,
})(ModerationDropdownContainer);

export default enhanced;
