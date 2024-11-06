import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './DrawerFullScreen.scss';
import { Drawer, DrawerProps } from 'antd';

interface TzDrawerProps extends DrawerProps {
  children?: any;
  el?: any;
}

export const DrawerFullScreen = (props: TzDrawerProps) => {
  const { children, ...otherProps } = props;

  const onClose = useCallback(
    (e: any) => {
      props?.onClose && props.onClose(e);
    },
    [props.onClose],
  );
  const realProps = useMemo(() => {
    return {
      ...otherProps,
      closeIcon: false,
      className: `full-drawer ${otherProps.className || ''}`,
      width: '100%',
      mask: false,
      headerStyle: { padding: '0px' },
      bodyStyle: {
        padding: '0px',
        paddingTop: '60px',
        display: 'flex',
        flexFlow: 'column',
      },
      contentWrapperStyle: { borderRadius: '0px' },
      onClose,
      zIndex: 900, 
      destroyOnClose: true,
    };
  }, [otherProps]);

  return (
    <Drawer placement="right" {...realProps}>
      {children}
    </Drawer>
  );
};
