import React, { useMemo } from 'react';
import './index.scss';
import Popconfirm, { PopconfirmProps } from 'antd/es/popconfirm';
import { translations } from '../../../translations';
interface TzPopconfirmProps extends PopconfirmProps {}

const TzPopconfirm = (props: TzPopconfirmProps) => {
  const { children, getPopupContainer, ...otherProps } = props;
  const realProps = useMemo(() => {
    return {
      ...otherProps,
      overlayClassName: 'tz-popconfirm',
      cancelText: translations.cancel,
      getPopupContainer: () => document.getElementById('layoutMain') || document.body,
    };
  }, [otherProps]);
  return (
    <Popconfirm {...realProps} getPopupContainer={getPopupContainer}>
      {children}
    </Popconfirm>
  );
};
export default TzPopconfirm;
