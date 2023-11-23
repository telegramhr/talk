import { Localized } from "@fluent/react/compat";
import cn from "classnames";
import React, { FunctionComponent } from "react";

import { PropTypesOf } from "coral-framework/types";
import { CheckIcon, SvgIcon } from "coral-ui/components/icons";
import { BaseButton } from "coral-ui/components/v2";

import styles from "./ApproveButton.css";

interface Props extends Omit<PropTypesOf<typeof BaseButton>, "ref"> {
  invert?: boolean;
  readOnly?: boolean;
}

const ApproveButton: FunctionComponent<Props> = ({
  invert,
  readOnly,
  className,
  ...rest
}) => (
  <Localized id="moderate-comment-approveButton" attrs={{ "aria-label": true }}>
    <BaseButton
      {...rest}
      className={cn(className, styles.root, {
        [styles.invert]: invert,
        [styles.readOnly]: readOnly,
      })}
      aria-label="Approve"
    >
      <SvgIcon size="md" className={styles.icon} Icon={CheckIcon} />
    </BaseButton>
  </Localized>
);

export default ApproveButton;
