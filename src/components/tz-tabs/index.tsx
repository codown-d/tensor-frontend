import Tabs, { TabPaneProps, TabsProps } from 'antd/lib/tabs';
import { merge } from 'lodash';
import React, { useMemo } from 'react';
import './index.scss';

const { TabPane } = Tabs;

export const TzTabs = (props: TabsProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-tabs ${props.className || ''}`,
    };
  }, [props]);
  return <Tabs {...realProps} />;
};

export const TzTabPane = (props: TabPaneProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-tabpane ${props.className || ''}`,
    };
  }, [props]);
  return <TabPane {...realProps} />;
};

export interface TzTabsNormalProps extends TabsProps {
  tabpanes?: TabPaneProps[];
  tabsProps?: TabsProps;
  obj?: any;
}
export const TzTabsNormal = (props: TzTabsNormalProps) => {
  const { tabpanes, tabsProps, ...obj } = props;

  let defaultActiveKey = useMemo(() => {
    return tabsProps?.defaultActiveKey || undefined;
  }, [tabsProps]);

  let items = useMemo(() => {
    return tabpanes?.map((item: any) => {
      return merge({}, item, { label: item.tab, key: item.tabKey });
    });
  }, [tabpanes]);

  return (
    <TzTabs
      {...obj}
      {...tabsProps}
      defaultActiveKey={defaultActiveKey}
      onChange={(activeKey) => {
        !props?.onChange || props?.onChange(activeKey);
        !tabsProps?.onChange || tabsProps?.onChange(activeKey);
      }}
      items={items}
    />
  );
};
