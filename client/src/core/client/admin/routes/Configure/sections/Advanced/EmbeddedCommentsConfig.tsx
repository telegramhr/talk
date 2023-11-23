import { Localized } from "@fluent/react/compat";
import React, { FunctionComponent } from "react";
import { graphql } from "react-relay";

import { FormField, HelperText, Label } from "coral-ui/components/v2";

import ConfigBox from "../../ConfigBox";
import Header from "../../Header";
import OnOffField from "../../OnOffField";
import Subheader from "../../Subheader";
import AllowedOriginsTextarea from "../Sites/AllowedOriginsTextarea";

// eslint-disable-next-line no-unused-expressions
graphql`
  fragment EmbeddedCommentsConfig_formValues on Settings {
    embeddedComments {
      allowReplies
      oEmbedAllowedOrigins
    }
  }
`;

interface Props {
  disabled: boolean;
}

const EmbeddedCommentsConfig: FunctionComponent<Props> = ({ disabled }) => (
  <ConfigBox
    data-testid="embedded-comments-config"
    title={
      <Localized id="configure-advanced-embeddedComments">
        <Header htmlFor="configure-advanced-embeddedComments">
          Embedded comments
        </Header>
      </Localized>
    }
  >
    <FormField>
      <Localized id="configure-advanced-embeddedCommentReplies-label">
        <Label>Allow replies to embedded comments</Label>
      </Localized>
      <Localized id="configure-advanced-embeddedCommentReplies-explanation">
        <HelperText>
          When enabled, a reply button will appear with each embedded comment to
          encourage additional discussion on that specific comment or story.
        </HelperText>
      </Localized>
      <OnOffField name="embeddedComments.allowReplies" disabled={disabled} />
    </FormField>
    <Localized id="configure-advanced-embeddedComments-subheader">
      <Subheader>For sites using oEmbed</Subheader>
    </Localized>
    <FormField>
      <Localized id="configure-advanced-oembedAllowedOrigins-label">
        <Label>oEmbed permitted domains</Label>
      </Localized>
      <Localized id="configure-advanced-oembedAllowedOrigins-description">
        <HelperText>
          Domains that are permitted to make calls to the oEmbed API (ex.
          http://localhost:3000, https://staging.domain.com,
          https://domain.com).
        </HelperText>
      </Localized>
      <AllowedOriginsTextarea
        name="embeddedComments.oEmbedAllowedOrigins"
        disabled={disabled}
      />
    </FormField>
  </ConfigBox>
);

export default EmbeddedCommentsConfig;
