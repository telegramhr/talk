import cn from "classnames";
import { noop } from "lodash";
import React, { ComponentType, FunctionComponent } from "react";

import AutoLoadMore from "coral-admin/components/AutoLoadMore";
import { IntersectionProvider } from "coral-framework/lib/intersection";
import {
  ArrowsDownIcon,
  ArrowsUpIcon,
  ButtonSvgIcon,
} from "coral-ui/components/icons";
import {
  Button,
  ClickOutside,
  Dropdown,
  Flex,
  Popover,
  Spinner,
} from "coral-ui/components/v2";

import styles from "./PaginatedSelect.css";

interface Props {
  onLoadMore?: () => void;
  Icon?: ComponentType;
  hasMore?: boolean;
  disableLoadMore?: boolean;
  loading?: boolean;
  selected: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const PaginatedSelect: FunctionComponent<Props> = ({
  onLoadMore = noop,
  disableLoadMore = false,
  hasMore = false,
  loading = false,
  children,
  Icon,
  selected,
  className,
}) => {
  return (
    <Popover
      id=""
      placement="bottom-end"
      modifiers={{ arrow: { enabled: false }, offset: { offset: "0, 4" } }}
      body={({ toggleVisibility }) => (
        <ClickOutside onClickOutside={toggleVisibility}>
          <IntersectionProvider>
            <Dropdown className={styles.dropdown}>
              {children}
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
            </Dropdown>
          </IntersectionProvider>
        </ClickOutside>
      )}
    >
      {({ toggleVisibility, ref, visible }) => (
        <Button
          className={cn(styles.button, className)}
          variant="flat"
          adornmentLeft
          color="mono"
          onClick={toggleVisibility}
          ref={ref}
          uppercase={false}
        >
          {Icon && (
            <ButtonSvgIcon className={styles.buttonIconLeft} Icon={Icon} />
          )}
          <Flex alignItems="center" className={styles.wrapper}>
            {selected}
          </Flex>
          {!visible && (
            <ButtonSvgIcon
              className={styles.buttonIconRight}
              Icon={ArrowsDownIcon}
              size="xs"
            />
          )}
          {visible && (
            <ButtonSvgIcon
              className={styles.buttonIconRight}
              Icon={ArrowsUpIcon}
              size="xs"
            />
          )}
        </Button>
      )}
    </Popover>
  );
};

export default PaginatedSelect;
