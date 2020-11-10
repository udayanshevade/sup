import * as React from 'react';
import classnames from 'classnames';
import './index.scss';

const defaultSize = 18;
const defaultViewBoxSize = 24;
const defaultViewBox = `0 0 ${defaultViewBoxSize} ${defaultViewBoxSize}`;

export const CamIconOff = ({
  className,
  size = defaultSize,
  viewBox = defaultViewBox,
}: {
  className?: string;
  size?: number;
  viewBox?: string;
}) => (
  <svg
    className={classnames('cam-icon cam-icon--off', className)}
    width={size}
    height={size}
    viewBox={viewBox}
  >
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M12.39 8L15 10.61V8zM5 8v8h9.73l-8-8z" opacity=".3" />
    <path d="M3.41 1.86L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.55-.18L19.73 21l1.41-1.41L3.41 1.86zM5 16V8h1.73l8 8H5zm10-8v2.61l6 6V6.5l-4 4V7c0-.55-.45-1-1-1h-5.61l2 2H15z" />
  </svg>
);