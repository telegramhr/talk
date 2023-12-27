import { Localized } from "@fluent/react/compat";
import React, { FunctionComponent } from "react";
import { graphql } from "react-relay";

import { withFragmentContainer } from "coral-framework/lib/relay";
import { Flex, HorizontalGutter, Timestamp } from "coral-ui/components/v2";

import { DecisionDetailsContainer_comment } from "coral-admin/__generated__/DecisionDetailsContainer_comment.graphql";

import styles from "./DecisionDetailsContainer.css";

import { unsnake } from "../ModerationReason/formatting";

interface Props {
  comment: DecisionDetailsContainer_comment;
}

const DecisionDetailsContainer: FunctionComponent<Props> = ({ comment }) => {
  const statusHistory = comment.statusHistory.edges[0].node;
  const { rejectionReason, createdAt } = statusHistory;

  return (
    <HorizontalGutter className={styles.wrapper} padding={3}>
      <Flex>
        <Flex direction="column" className={styles.full}>
          <Localized id="moderate-decisionDetails-decisionLabel">
            <div className={styles.label}>Decision</div>
          </Localized>
          <Localized id="moderate-decisionDetails-rejected">
            <div className={styles.rejected}>Rejected</div>
          </Localized>
        </Flex>
        {rejectionReason && rejectionReason.code && (
          <Flex direction="column" className={styles.full}>
            <Localized id="moderate-decisionDetails-reasonLabel">
              <div className={styles.label}>Reason</div>
            </Localized>
            <Localized
              id={`common-moderationReason-rejectionReason-${rejectionReason.code}`}
            >
              <div className={styles.info}>{unsnake(rejectionReason.code)}</div>
            </Localized>
          </Flex>
        )}
      </Flex>
      {rejectionReason?.legalGrounds && (
        <Flex direction="column">
          <Localized id="moderate-decisionDetails-lawBrokenLabel">
            <div className={styles.label}>Law broken</div>
          </Localized>
          <div className={styles.info}>{rejectionReason?.legalGrounds}</div>
        </Flex>
      )}
      {rejectionReason?.customReason && (
        <Flex direction="column">
          <Localized id="moderate-decisionDetails-customReasonLabel">
            <div className={styles.label}>Custom reason</div>
          </Localized>
          <div className={styles.info}>{rejectionReason?.customReason}</div>
        </Flex>
      )}
      {rejectionReason?.detailedExplanation && (
        <Flex direction="column">
          <Localized id="moderate-decisionDetails-detailedExplanationLabel">
            <div className={styles.label}>Detailed explanation</div>
          </Localized>
          <div className={styles.info}>
            {rejectionReason?.detailedExplanation}
          </div>
        </Flex>
      )}
      <Flex>
        <div className={styles.label}>
          <Timestamp>{createdAt}</Timestamp>
        </div>
      </Flex>
    </HorizontalGutter>
  );
};

const enhanced = withFragmentContainer<Props>({
  comment: graphql`
    fragment DecisionDetailsContainer_comment on Comment {
      id
      statusHistory(first: 1) {
        edges {
          node {
            createdAt
            rejectionReason {
              code
              legalGrounds
              detailedExplanation
              customReason
            }
          }
        }
      }
    }
  `,
})(DecisionDetailsContainer);

export default enhanced;
