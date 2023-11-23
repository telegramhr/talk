import React, { FunctionComponent, Ref } from "react";

import { RemoveIcon, SvgIcon } from "coral-ui/components/icons";
import { withForwardRef, withStyles } from "coral-ui/hocs";
import { PropTypesOf } from "coral-ui/types";

import BaseButton from "../BaseButton";
import Flex from "../Flex";

import styles from "./CloseButton.css";

export interface CloseButtonProps
  extends Omit<PropTypesOf<typeof BaseButton>, "ref"> {
  /**
   * Override or extend the styles applied to the component.
   */
  classes: typeof styles & PropTypesOf<typeof BaseButton>["classes"];

  /** Internal: Forwarded Ref */
  forwardRef?: Ref<HTMLButtonElement>;
}

const CloseButton: FunctionComponent<CloseButtonProps> = (props) => {
  const {
    classes: { icon: iconClassName, ...restClasses },
    forwardRef,
    ...rest
  } = props;
  return (
    <Flex justifyContent="flex-end">
      <BaseButton classes={restClasses} ref={forwardRef} {...rest}>
        <SvgIcon className={iconClassName} Icon={RemoveIcon} />
      </BaseButton>
    </Flex>
  );
};

const enhanced = withForwardRef(withStyles(styles)(CloseButton));
export default enhanced;
