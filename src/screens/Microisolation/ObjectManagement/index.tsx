import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { TzTabs } from '../../../components/tz-tabs';
import { translations } from '../../../translations';
import './index.scss';
import ResourceGroup from './ResourceGroup';
import NamespaceGroup from './NamespaceGroup';
import IPGroup from './IPGroup';
import { Store } from '../../../services/StoreService';
import { useLocation } from 'react-router-dom';
import { useMemoizedFn } from 'ahooks';
import { merge } from 'lodash';

const ObjectManagement = (props: any) => {
  const [activeKey, setActiveKey] = useState<any>('resourceGroup');
  const l = useLocation();
  let item = useMemo(() => {
    return [
      {
        label: translations.microseg_segments_segment_title,
        key: 'resourceGroup',
        children: <ResourceGroup activeKey={activeKey} />,
      },
      { label: translations.ip_group, key: 'ip', children: <IPGroup activeKey={activeKey} /> },
    ];
  }, [activeKey]);
  let setHeader = useMemoizedFn(() => {
    Store.header.next({
      title: translations.object_management,
      footer: (
        <TzTabs
          activeKey={activeKey}
          onChange={setActiveKey}
          items={item.map((ite) => {
            return merge({}, ite, { children: null });
          })}
        />
      ),
    });
  });
  useEffect(() => {
    setHeader();
    return () => {};
  }, [l, activeKey]);
  return (
    <div className="object-management mlr32 mt24" style={{ minHeight: 'calc(100vh - 125px)' }}>
      <TzTabs activeKey={activeKey} items={item} tabBarStyle={{ display: 'none' }} destroyInactiveTabPane />
    </div>
  );
};
export default ObjectManagement;
