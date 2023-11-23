import { Localized } from "@fluent/react/compat";
import React from "react";

import AutoLoadMore from "coral-admin/components/AutoLoadMore";
import {
  Flex,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "coral-ui/components/v2";
import { PropTypesOf } from "coral-ui/types";

import styles from "./ReportsTable.css";

import ReportRowContainer from "./ReportRowContainer";

interface Props {
  dsaReports: Array<
    { id: string } & PropTypesOf<typeof ReportRowContainer>["dsaReport"]
  >;
  hasMore: boolean;
  disableLoadMore: boolean;
  onLoadMore: () => void;
  loading: boolean;
}

const ReportsTable: React.FunctionComponent<Props> = ({
  dsaReports,
  hasMore,
  disableLoadMore,
  onLoadMore,
  loading,
}) => {
  return (
    <>
      <Table fullWidth>
        <TableHead>
          <TableRow>
            <Localized id="reportsTable-column-created">
              <TableCell>Created</TableCell>
            </Localized>
            <Localized id="reportsTable-column-lastUpdated">
              <TableCell>Last updated</TableCell>
            </Localized>
            <Localized id="reportsTable-column-reportedBy">
              <TableCell>Reported by</TableCell>
            </Localized>
            <Localized id="reportsTable-column-reference">
              <TableCell>Reference</TableCell>
            </Localized>
            <Localized id="reportsTable-column-lawBroken">
              <TableCell>Law broken</TableCell>
            </Localized>
            <Localized id="reportsTable-column-commentAuthor">
              <TableCell>Comment author</TableCell>
            </Localized>
            <Localized id="reportsTable-column-status">
              <TableCell>Status</TableCell>
            </Localized>
          </TableRow>
        </TableHead>
        <TableBody>
          {dsaReports.map((report) => {
            return <ReportRowContainer key={report.id} dsaReport={report} />;
          })}
        </TableBody>
      </Table>
      {!loading && dsaReports.length === 0 && (
        <Flex justifyContent="center" padding={3}>
          <Localized id="reportsTable-emptyReports">
            <div className={styles.emptyReports}>
              There are no DSA reports to display.
            </div>
          </Localized>
        </Flex>
      )}
      {loading && (
        <Flex justifyContent="center">
          <Spinner />
        </Flex>
      )}
      {hasMore && (
        <Flex justifyContent="center">
          <AutoLoadMore
            disableLoadMore={disableLoadMore}
            onLoadMore={onLoadMore}
          />
        </Flex>
      )}
    </>
  );
};

export default ReportsTable;
