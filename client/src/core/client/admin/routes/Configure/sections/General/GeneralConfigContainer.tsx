import React, { useMemo } from "react";
import { useForm } from "react-final-form";
import { graphql } from "react-relay";

import {
  purgeMetadata,
  withFragmentContainer,
} from "coral-framework/lib/relay";
import { HorizontalGutter } from "coral-ui/components/v2";

import { GeneralConfigContainer_settings as SettingsData } from "coral-admin/__generated__/GeneralConfigContainer_settings.graphql";

import DSAConfigContainer from "../General/DSAConfigContainer";
import AnnouncementConfigContainer from "./AnnouncementConfigContainer";
import BadgeConfig from "./BadgeConfig";
import ClosedStreamMessageConfig from "./ClosedStreamMessageConfig";
import ClosingCommentStreamsConfig from "./ClosingCommentStreamsConfig";
import CommentEditingConfig from "./CommentEditingConfig";
import CommentLengthConfig from "./CommentLengthConfig";
import FeaturedByConfig from "./FeaturedByConfig";
import FlairBadgeConfigContainer from "./FlairBadgeConfigContainer";
import FlattenRepliesConfig from "./FlattenRepliesConfig";
import GuidelinesConfig from "./GuidelinesConfig";
import InPageNotificationsConfig from "./InPageNotificationsConfig";
import LocaleConfig from "./LocaleConfig";
import MediaLinksConfig from "./MediaLinksConfig";
import MemberBioConfig from "./MemberBioConfig";
import NewCommenterConfig from "./NewCommenterConfig";
import ReactionConfigContainer from "./ReactionConfigContainer";
import RTEConfig from "./RTEConfig";
import SitewideCommentingConfig from "./SitewideCommentingConfig";
import TopCommenterConfig from "./TopCommenterConfig";

import styles from "./GeneralConfigContainer.css";

interface Props {
  submitting: boolean;
  settings: SettingsData;
}

const GeneralConfigContainer: React.FunctionComponent<Props> = ({
  settings,
  submitting,
}) => {
  const form = useForm();
  useMemo(() => form.initialize(purgeMetadata(settings)), []);
  return (
    <HorizontalGutter
      size="double"
      data-testid="configure-generalContainer"
      className={styles.root}
    >
      <LocaleConfig disabled={submitting} />
      <DSAConfigContainer disabled={submitting} settings={settings} />
      <InPageNotificationsConfig disabled={submitting} />
      <FlattenRepliesConfig disabled={submitting} />
      <SitewideCommentingConfig disabled={submitting} />
      <AnnouncementConfigContainer disabled={submitting} settings={settings} />
      <GuidelinesConfig disabled={submitting} />
      <RTEConfig disabled={submitting} />
      <CommentLengthConfig disabled={submitting} />
      <CommentEditingConfig disabled={submitting} />
      <ClosingCommentStreamsConfig disabled={submitting} />
      <ClosedStreamMessageConfig disabled={submitting} />
      <ReactionConfigContainer disabled={submitting} settings={settings} />
      <FeaturedByConfig disabled={submitting} />
      <BadgeConfig disabled={submitting} />
      <NewCommenterConfig disabled={submitting} />
      <TopCommenterConfig disabled={submitting} />
      <FlairBadgeConfigContainer disabled={submitting} settings={settings} />
      <MemberBioConfig disabled={submitting} />
      <MediaLinksConfig disabled={submitting} />
    </HorizontalGutter>
  );
};

const enhanced = withFragmentContainer<Props>({
  settings: graphql`
    fragment GeneralConfigContainer_settings on Settings {
      ...AnnouncementConfigContainer_settings
      ...FlattenRepliesConfig_formValues @relay(mask: false)
      ...InPageNotificationsConfig_formValues @relay(mask: false)
      ...LocaleConfig_formValues @relay(mask: false)
      ...DSAConfigContainer_formValues @relay(mask: false)
      ...DSAConfigContainer_settings
      ...GuidelinesConfig_formValues @relay(mask: false)
      ...CommentLengthConfig_formValues @relay(mask: false)
      ...CommentEditingConfig_formValues @relay(mask: false)
      ...ClosedStreamMessageConfig_formValues @relay(mask: false)
      ...ClosingCommentStreamsConfig_formValues @relay(mask: false)
      ...SitewideCommentingConfig_formValues @relay(mask: false)
      ...FeaturedByConfig_formValues @relay(mask: false)
      ...ReactionConfig_formValues @relay(mask: false)
      ...BadgeConfig_formValues @relay(mask: false)
      ...NewCommenterConfig_formValues @relay(mask: false)
      ...TopCommenterConfig_formValues @relay(mask: false)
      ...FlairBadgeConfigContainer_formValues @relay(mask: false)
      ...FlairBadgeConfigContainer_settings
      ...RTEConfig_formValues @relay(mask: false)
      ...MediaLinksConfig_formValues @relay(mask: false)
      ...MemberBioConfig_formValues @relay(mask: false)
      ...ReactionConfigContainer_settings
    }
  `,
})(GeneralConfigContainer);

export default enhanced;
