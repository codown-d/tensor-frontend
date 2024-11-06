import React, { useEffect, useState } from 'react';
import { Store } from '../../services/StoreService';
import './NavbarClustersGraphDetails.scss';
import { Routes } from '../../Routes';
import { Resources } from '../../Resources';
import { Link } from 'react-router-dom';
import { translations } from '../../translations/translations';
import { TzTabsNormal } from '../../components/tz-tabs';
import classNames from 'classnames';
import { getUrlQuery, tabChange } from '../../helpers/until';
import useNewSearchParams from '../../helpers/useNewSearchParams';

// TODO: 弃用页面
export const Logo = () => {
  return (
    <Link to={Routes.Dashboard}>
      <img
        alt="logo"
        src={Resources.LogoProIco}
        onClick={() => {
          let drawerFullIdList = Store.drawerFullIdList.getValue();
          drawerFullIdList.map((item) => {
            $('#' + item).remove();
          });
          Store.drawerFullIdList.next([]);
        }}
        className="sidebar-logo-image large"
        style={{ maxWidth: '126px', maxHeight: '33px' }}
      />
    </Link>
  );
};
const NavbarClustersGraphList = () => {
  const [navList, setNavList] = useState<any>([]);
  const { allSearchParams, addSearchParams } = useNewSearchParams();
  const { tab: tabKey = 'info' } = allSearchParams;
  // let [tabKey, setTabKey] = useState(getUrlQuery('tab') || 'info');
  useEffect(() => {
    Store.navbarSelected.next(tabKey);
    const sub = Store.setNavbarType.subscribe((res: string) => {
      let arr = [
        {
          tab: translations.clusterGraphList_navInfo,
          tabKey: 'info',
          children: null,
        },
      ];

      if (['resource', 'web', 'database'].includes(res)) {
        arr.push({
          tab: translations.clusterGraphList_navImage,
          tabKey: 'image',
          children: null,
        });
      }
      if (['namespace', 'resource', 'Pod', 'container', 'node', 'web', 'database'].includes(res)) {
        arr.push({
          tab: translations.security_events,
          tabKey: 'security_events',
          children: null,
        });
      }
      setNavList(arr);
    });
    return () => sub.unsubscribe();
  }, [tabKey]);
  return (
    // 二级页面的header
    <div style={{ height: 32 }}>
      <div
        className={classNames('navbar-sidebar-case flex-r')}
        style={{ position: 'absolute', bottom: 0, left: 20 }}
      >
        <p style={{ height: '32px', marginRight: 62, float: 'left', marginTop: '-3px' }}>
          <span>
            <Logo />
          </span>
        </p>
        <TzTabsNormal
          tabpanes={navList}
          className="tabs-nav-mb0 tabs-nav-border0 tab-ml0 tabs-tab-pb18"
          activeKey={tabKey}
          onChange={(key: any) => {
            tabChange(key);
            // setTabKey(key);
            addSearchParams({ tab: key });
            Store.navbarSelected.next(key);
            let drawerFullIdList = Store.drawerFullIdList.getValue();
            drawerFullIdList.map((item) => {
              $('#' + item).remove();
            });
            Store.drawerFullIdList.next([]);
          }}
        />
      </div>
    </div>
  );
};

export default NavbarClustersGraphList;
