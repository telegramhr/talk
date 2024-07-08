import React, { FunctionComponent, useCallback, useState } from "react";
import { graphql } from "relay-runtime";

import { useFetch, useLocal } from "coral-framework/lib/relay";
import { Spinner } from "coral-ui/components/v2";

import { NotificationsListFetchQueryResponse } from "coral-stream/__generated__/NotificationsListFetchQuery.graphql";
import { NotificationsListQueryLocal } from "coral-stream/__generated__/NotificationsListQueryLocal.graphql";

import NotificationsListFetch from "./NotificationsListFetch";
import NotificationsPaginator from "./NotificationsPaginator";

interface Props {
  viewerID: string;
}

const NotificationsListQuery: FunctionComponent<Props> = ({ viewerID }) => {
  const query = useFetch(NotificationsListFetch);
  const [shouldLoad, setShouldLoad] = useState<boolean>(true);
  const [queryResult, setQueryResult] =
    useState<NotificationsListFetchQueryResponse | null>();

  const [, setLocal] = useLocal<NotificationsListQueryLocal>(graphql`
    fragment NotificationsListQueryLocal on Local {
      hasNewNotifications
    }
  `);

  const load = useCallback(async () => {
    setShouldLoad(false);
    setQueryResult(null);
    const result = await query({ viewerID });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    setQueryResult(result);
  }, [query, viewerID]);

  const reload = useCallback(async () => {
    await load();
    setLocal({ hasNewNotifications: false });
  }, [load, setLocal]);

  if (shouldLoad) {
    void load();
  }

  if (!queryResult) {
    return <Spinner />;
  } else {
    return (
      <NotificationsPaginator
        query={queryResult}
        viewerID={viewerID}
        reload={reload}
      />
    );
  }
};

export default NotificationsListQuery;
