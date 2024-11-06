import React from 'react';
import { Drawer, DrawerProps } from 'antd';
import './TSDrawer.scss';
import { TzDrawer } from '../../tz-drawer';

interface props extends DrawerProps {
  children?: any;
}
const TSDrawer = (props: props) => {
  return (
    <>
      <TzDrawer {...props}>{props.children}</TzDrawer>
    </>
  );
};
export default TSDrawer;
