import { Localized } from "@fluent/react/compat";
import React, { FunctionComponent } from "react";

import NotAvailable from "coral-admin/components/NotAvailable";

import FlagDetailsCategory from "./FlagDetailsCategory";
import FlagDetailsEntry from "./FlagDetailsEntry";

interface Props {
  category: React.ReactNode;
  nodes: ReadonlyArray<{
    flagger: { id: string; username: string | null } | null;
    additionalDetails: string | null;
    reportID?: string | null;
  }>;
  onUsernameClick: (id?: string) => void;
}

const FlagDetails: FunctionComponent<Props> = ({
  category,
  nodes,
  onUsernameClick,
}) => {
  if (nodes.length === 0) {
    return null;
  }

  return (
    <FlagDetailsCategory category={category}>
      {nodes.map((flag, i) => (
        <FlagDetailsEntry
          key={i}
          onClick={() =>
            flag.flagger ? onUsernameClick(flag.flagger.id) : null
          }
          user={
            flag.flagger ? (
              flag.flagger.username ? (
                flag.flagger.username
              ) : (
                <NotAvailable />
              )
            ) : (
              <Localized id="moderate-card-flag-details-anonymousUser">
                <span>Anonymous user</span>
              </Localized>
            )
          }
          details={flag.additionalDetails}
          reportID={flag.reportID}
        />
      ))}
    </FlagDetailsCategory>
  );
};

export default FlagDetails;
