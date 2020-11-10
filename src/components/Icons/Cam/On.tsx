import * as React from 'react';
import classnames from 'classnames';
import './index.scss';

const defaultSize = 18;
const defaultViewBoxSize = 24;
const defaultViewBox = `0 0 ${defaultViewBoxSize} ${defaultViewBoxSize}`;

export const CamIconOn = ({
  className,
  size = defaultSize,
  viewBox = defaultViewBox,
}: {
  className?: string;
  size?: number;
  viewBox?: string;
}) => (
  <svg
    className={classnames('cam-icon cam-icon--on', className)}
    width={size}
    height={size}
    viewBox={viewBox}
  >
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M5 8h10v8H5z" opacity=".3" />
    <path d="M17 7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7zm-2 9H5V8h10v8z" />
  </svg>
);
