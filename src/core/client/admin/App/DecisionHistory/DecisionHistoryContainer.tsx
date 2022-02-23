import React from "react";
import { graphql, RelayPaginationProp } from "react-relay";

import { withPaginationContainer } from "coral-framework/lib/relay";

import { DecisionHistoryContainer_viewer$data as ViewerData } from "coral-admin/__generated__/DecisionHistoryContainer_viewer.graphql";
import { DecisionHistoryContainerPaginationQuery$variables as DecisionHistoryContainerPaginationQueryVariables } from "coral-admin/__generated__/DecisionHistoryContainerPaginationQuery.graphql";

import DecisionHistory from "./DecisionHistory";

interface DecisionHistoryContainerProps {
  viewer: ViewerData;
  relay: RelayPaginationProp;
  onClosePopover: () => void;
}

export class DecisionHistoryContainer extends React.Component<
  DecisionHistoryContainerProps
> {
  public state = {
    disableLoadMore: false,
  };

  public render() {
    const actions = this.props.viewer.commentModerationActionHistory.edges.map(
      (edge) => edge.node
    );
    return (
      <DecisionHistory
        actions={actions}
        onLoadMore={this.loadMore}
        hasMore={this.props.relay.hasMore()}
        disableLoadMore={this.state.disableLoadMore}
        onClosePopover={this.props.onClosePopover}
      />
    );
  }

  private loadMore = () => {
    if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
      return;
    }
    this.setState({ disableLoadMore: true });
    this.props.relay.loadMore(
      10, // Fetch the next 10 feed items
      (error) => {
        this.setState({ disableLoadMore: false });
        if (error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
    );
  };
}

// TODO: (cvle) If this could be autogenerated.
type FragmentVariables = DecisionHistoryContainerPaginationQueryVariables;

const enhanced = withPaginationContainer<
  DecisionHistoryContainerProps,
  DecisionHistoryContainerPaginationQueryVariables,
  FragmentVariables
>(
  {
    viewer: graphql`
      fragment DecisionHistoryContainer_viewer on User
        @argumentDefinitions(
          count: { type: "Int", defaultValue: 5 }
          cursor: { type: "Cursor" }
        ) {
        commentModerationActionHistory(first: $count, after: $cursor)
          @connection(key: "DecisionHistory_commentModerationActionHistory") {
          edges {
            node {
              id
              ...DecisionHistoryItemContainer_action
            }
          }
        }
      }
    `,
  },
  {
    getConnectionFromProps(props) {
      return props.viewer && props.viewer.commentModerationActionHistory;
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        count,
        cursor,
      };
    },
    query: graphql`
      # Pagination query to be fetched upon calling 'loadMore'.
      # Notice that we re-use our fragment, and the shape of this query matches our fragment spec.
      query DecisionHistoryContainerPaginationQuery(
        $count: Int!
        $cursor: Cursor
      ) {
        viewer {
          ...DecisionHistoryContainer_viewer
            @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  }
)(DecisionHistoryContainer);

export default enhanced;
