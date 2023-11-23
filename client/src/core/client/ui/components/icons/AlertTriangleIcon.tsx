import React, { FunctionComponent } from "react";

const AlertTriangleIcon: FunctionComponent = () => {
  // https://www.streamlinehq.com/icons/streamline-regular/interface-essential/alerts/alert-triangle
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.25 -0.25 24.5 24.5">
      <path
        stroke="currentColor"
        d="M12 19.5C11.7929 19.5 11.625 19.3321 11.625 19.125C11.625 18.9179 11.7929 18.75 12 18.75"
      ></path>
      <path
        stroke="currentColor"
        d="M12 19.5C12.2071 19.5 12.375 19.3321 12.375 19.125C12.375 18.9179 12.2071 18.75 12 18.75"
      ></path>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeMiterlimit="10"
        d="M12 15.75V8.25"
      ></path>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.621 1.76001C13.4722 1.45702 13.2414 1.20181 12.9549 1.02333C12.6684 0.844851 12.3376 0.750244 12 0.750244C11.6624 0.750244 11.3316 0.844851 11.0451 1.02333C10.7586 1.20181 10.5278 1.45702 10.379 1.76001L0.90601 21.058C0.79198 21.29 0.738946 21.5472 0.751916 21.8053C0.764886 22.0635 0.843432 22.3141 0.980137 22.5334C1.11684 22.7528 1.3072 22.9337 1.53324 23.0591C1.75927 23.1845 2.01353 23.2502 2.27201 23.25H21.728C21.9865 23.2502 22.2407 23.1845 22.4668 23.0591C22.6928 22.9337 22.8832 22.7528 23.0199 22.5334C23.1566 22.3141 23.2351 22.0635 23.2481 21.8053C23.2611 21.5472 23.208 21.29 23.094 21.058L13.621 1.76001Z"
      ></path>
    </svg>
  );
};

export default AlertTriangleIcon;
