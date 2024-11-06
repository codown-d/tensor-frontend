import { Menu, MenuItemProps, MenuProps } from 'antd';
import classNames from 'classnames';
import React, { useCallback, useContext, useMemo } from 'react';
import './index.scss';

const { Item, SubMenu } = Menu;

export const TzMenu = (props: MenuProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-menu ${props.className || ''}`,
    };
  }, [props]);
  return <Menu {...realProps} />;
};

export const TzSubMenu = (props: MenuProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-sub-menu ${props.className || ''}`,
    };
  }, [props]);
  return <SubMenu {...realProps} />;
};
export interface TzMenuItemProps extends MenuItemProps {
  list?: MenuItemProps[];
  showRightOutline?: boolean;
  children?: React.ReactElement;
}
export const TzMenuItem = (props: TzMenuItemProps) => {
  const realProps: any = useMemo(() => {
    return {
      showRightOutline: true,
      ...props,
      className: `tz-menu-item ${props.className || ''}`,
    };
  }, [props]);
  return (
    <Item {...realProps} key={`${props.id}`}>
      {realProps.children}
    </Item>
  );
};

export interface TzMenuItemProps1 extends MenuItemProps {
  list?: MenuItemProps[];
  link?: string;
}
export interface TzMenuNormalProps extends MenuProps {
  list?: TzMenuItemProps1[];
}

// 4.20.0版本后推荐使用items语法糖，5.0版本将删除children
export const TzMenuNormal = (props: TzMenuNormalProps) => {
  const { list, items, ...menuProps } = props;
  const dealMenuItem = useCallback((items) => {
    if (!items.length) {
      return [];
    }
    return items?.map((i: any) => {
      const { icon, className, id, title, link, list } = i;
      let item: any = {
        key: id,
        label: title,
        title,
        icon: <span className={classNames('iconfont menu-icon', icon)}></span>,
        className: classNames('tz-menu-item', className),
      };
      if (list) {
        const children = dealMenuItem(list);
        children.length && (item['children'] = children);
      }
      return item;
    });
  }, []);
  const itemsData = useMemo(() => {
    if (!list && items) {
      return items;
    }
    return dealMenuItem(list);
  }, [list, items, dealMenuItem]);
  return <TzMenu {...menuProps} items={itemsData}></TzMenu>;
};

export const TzMenuPolicy = (props: TzMenuNormalProps) => {
  const { list, ...menuProps } = props;
  const _options = useMemo(() => {
    return list?.map((item: any, index) => {
      return <TzMenuItem key={`${index}`} {...item} />;
    });
  }, [list]);
  return <TzMenu {...menuProps}>{_options}</TzMenu>;
};
