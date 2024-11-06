import Card, { CardProps } from 'antd/lib/card';
import { merge } from 'lodash';
import React, { forwardRef, useMemo } from 'react';

import './index.scss';

export const TzCard = forwardRef<any, CardProps>((props, ref) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-card ${props.className || ''}`,
    };
  }, [props]);
  let bodyStyle = useMemo(() => {
    return merge({}, { paddingTop: '0px' }, realProps.bodyStyle);
  }, [realProps]);
  return <Card ref={ref} {...realProps} bodyStyle={bodyStyle} />;
});
export const TzCardHeaderState = (props: { title: any; errorInfo?: any; subText?: any }) => {
  let { title, errorInfo, subText } = props;
  return (
    <span className="error-info">
      {title}
      {errorInfo ? (
        <span className="f12 ml8 family-r">
          <i>*</i>&nbsp;
          {errorInfo}
        </span>
      ) : (
        <span className="f12 ml8 family-r">{subText}</span>
      )}
    </span>
  );
};
