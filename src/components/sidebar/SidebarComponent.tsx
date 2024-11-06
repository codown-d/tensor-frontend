import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Resources } from '../../Resources';
import { Routes } from '../../Routes';
import './SidebarComponent.scss';
import { TzMenu } from '../tz-menu';
import { getUserInformation } from '../../services/AccountService';
import { TMenuDataDefault, menuDataDefault } from './SidebarItems';
import { getMenuData, loginOut } from '../../services/RouterService';
import { createAudio } from '../../helpers/until';
import { StatsObj, Store } from '../../services/StoreService';
import { getEventNoticeNum, getNotifyConfig } from '../../services/DataService';
import { SupportedLangauges, WebResponse } from '../../definitions';
import { Subscription } from 'rxjs/internal/Subscription';
import { tap } from 'rxjs/operators';
import { translations } from '../../translations/translations';
import { setLanguage } from '../../services/LanguageService';
import { useStorageState } from '../../helpers/useStorageState';
import { cloneDeep, intersection, merge } from 'lodash';
import EllipsisPopover from '../ellipsisPopover/ellipsisPopover';
import { useMemoizedFn } from 'ahooks';
import RestPwdPopup from '../../screens/Login/component/ResetPwd/RestPwdPopup';
import { TzPopover } from '../tz-popover';
import classNames from 'classnames';
const SideBarHead = (props: any) => {
  let { small } = props;
  return (
    <div style={{ textAlign: 'center', padding: '16px 0 8px' }} className="menu-logo">
      <Link to={Routes.Dashboard}>
        {!small ? (
          <img alt="logo" src={Resources.LogoProIco} style={{ height: '38px' }} />
        ) : (
          <img alt="logo" src={Resources.LogoSmallIcon} style={{ height: '38px' }} />
        )}
      </Link>
    </div>
  );
};
interface BProps {
  title: string;
}
let fatchTimer: Subscription | null = null;
let fetchStoreEvent: Subscription | null = null;
let el: any;
let soundOn: boolean = false;
const NoticeEventBell = (props: BProps) => {
  const { title } = props;
  const [n, setN] = useState(0);
  const statsRef = useRef<StatsObj>({
    anchor: -1,
    timer: -1,
  });

  useEffect(() => {
    Store.eventsSound.subscribe((val: any) => {
      soundOn = val;
    });
    getNotifyConfig()
      .pipe(
        tap((res: any) => {
          let item = res.getItem();
          if (item) {
            const { sound } = item;
            soundOn = sound === 'enabled';
          }
        }),
      )
      .subscribe();
  }, []);

  const fatchScanStatus = useCallback(
    (t: any) => {
      fatchTimer && fatchTimer.unsubscribe();
      fatchTimer = getEventNoticeNum(t ? t : null)
        .pipe(
          tap((res: WebResponse<any>) => {
            if (res.error) {
              fatchTimer?.unsubscribe();
            }
            const item: any = res.getItem();
            if (item) {
              setN((pro) => {
                if (pro !== item?.num) {
                  el || (el = createAudio());
                  soundOn && el && (el as HTMLAudioElement).play();
                  return item?.num;
                }
                return pro;
              });
              if (item?.num === 0 && statsRef.current.anchor !== t) {
                statsRef.current.anchor = item?.anchor;
                Store.eventsCenter.next({ anchor: item?.anchor });
              }
            }
          }),
        )
        .subscribe();
    },
    [location],
  );

  useEffect(() => {
    fetchStoreEvent = Store.eventsCenter
      .pipe(
        tap(({ anchor = 0, timer = 0 }: StatsObj) => {
          if (timer) {
            if (timer > (statsRef.current?.timer || 0)) {
              statsRef.current.timer = +new Date();
              fatchScanStatus(0);
            }
          } else {
            statsRef.current.timer = +new Date();
            fatchScanStatus(anchor);
          }
        }),
      )
      .subscribe();
  }, [fatchScanStatus, Store.eventsCenter.value]);

  useEffect(() => {
    return () => {
      el = null;
      fetchStoreEvent && fetchStoreEvent.unsubscribe();
      fatchTimer && fatchTimer.unsubscribe();
      fetchStoreEvent = null;
      fatchTimer = null;
    };
  }, []);

  const eventFn = useCallback(() => {
    Store.eventsCenter.next({ anchor: 0 });
  }, [n]);

  const bellDom = useMemo(() => {
    if (!n) {
      return;
    }
    return <span className="red-bell">{n}</span>;
  }, [n]);

  return (
    <div className="df dfac dfjb" onClick={eventFn}>
      {title} {bellDom}
    </div>
  );
};
const SideBar = (props: any) => {
  let { collapsed, width = 220 } = props;
  const [showUpdatePwdPopup, setShowUpdatePwdPopup] = useState<boolean>();
  let [menuAct, setMenuAct] = useStorageState<any>('menuAct', {
    defaultOpenKeys: [],
    defaultSelectedKeys: [],
  });
  const { pathname } = useLocation();
  let getMenuParentId = useCallback((list: any, key: string) => {
    for (let o of list || []) {
      if (o.key === key) {
        return o.key;
      }
      if (o.children != null) {
        let node = getMenuParentId(o.children, key);
        if (node !== undefined) {
          return o.key;
        }
      }
    }
  }, []);
  const items = useMemo(() => {
    let paths: any[] = [];
    let startStr = '';
    let strPath = pathname.slice(1);
    let initArr = strPath.split('/');
    if (initArr.length) {
      initArr.map((i) => {
        startStr += `/${i}`;
        paths.push(startStr);
        return i;
      });
    }
    return paths;
  }, [pathname]);
  let navigate = useNavigate();
  let menuClick = useMemoizedFn((menuItem: any) => {
    let { key, item } = menuItem;
    const _id = item.props.id;
    sessionStorage.setItem('sidebar_open_key', _id);
    navigate(key, { replace: true });
  });
  const { account: loginUser, platform } = getUserInformation();
  const dataItems = useMemo(() => {
    const { menu: menuData } = getMenuData();
    const newData = cloneDeep(menuData);

    const notificationCenterItem: TMenuDataDefault | undefined = newData.find(
      (v: TMenuDataDefault) => v.id === 'NotificationCenter',
    );
    notificationCenterItem &&
      !notificationCenterItem?.hidden &&
      (notificationCenterItem.label = <NoticeEventBell title={notificationCenterItem.title}></NoticeEventBell>);
    return newData;
  }, [menuDataDefault]);

  useEffect(() => {
    let result = getMenuParentId(menuDataDefault, pathname);
    const menu2routes = dataItems.reduce((t: string[], v: TMenuDataDefault) => {
      if (v.children?.length) {
        t = t.concat(v.children.map((i) => i.key));
      } else {
        t = t.concat([v.key]);
      }
      return t;
    }, []);
    setMenuAct((prev: any) =>
      intersection(items, menu2routes).length
        ? {
            defaultSelectedKeys: [...items],
            defaultOpenKeys: result ? [result] : prev?.defaultOpenKeys ?? null,
          }
        : prev,
    );
  }, [menuDataDefault, pathname, items]);
  const Menu = useMemo(() => {
    let items: any = [
      {
        key: '1',
        className: 'un-hover',
        style: { height: 'auto' },
        label: (
          <p
            style={{
              cursor: 'default',
              minWidth: '160px',
              paddingTop: '6px',
              paddingBottom: '6px',
            }}
          >
            {loginUser}{' '}
          </p>
        ),
      },
      {
        type: 'divider',
      },
      {
        key: '3',
        label: translations.language,
        children: [
          {
            key: '4',
            onClick: () => {
              setLanguage(SupportedLangauges.Chinese);
            },
            label: '简体中文',
          },
          {
            key: '5',
            onClick: () => {
              setLanguage(SupportedLangauges.English);
            },
            label: 'English',
          },
        ],
      },
      {
        key: '6',
        onClick: () => {
          setShowUpdatePwdPopup(true);
        },
        label: translations.change_password,
      },
      {
        key: '2',
        onClick: loginOut,
        label: translations.log_out,
      },
    ];
    if (platform) {
      items.splice(-2, 1);
    }
    return (
      <TzMenu
        mode={'inline'}
        className={'language'}
        style={{
          maxWidth: '218px',
        }}
        items={items}
      />
    );
  }, [loginUser, platform]);

  let userPopover = useMemo(() => {
    return (
      <EllipsisPopover title={loginUser} style={{ width: `100%` }}>
        <i className={'icon iconfont icon-zhanghu mr12'}></i>
        {loginUser}
      </EllipsisPopover>
    );
  }, [props.width, loginUser]);
  const hideRestPwdPopup = useMemoizedFn(() => {
    setShowUpdatePwdPopup(false);
  });

  return (
    <div className={'sider-bar p-r'} style={{ width: `${width}px` }}>
      <div className={'sider-bar-menu flex-c'} style={{ width: `${width}px` }}>
        <SideBarHead small={collapsed} />
        <TzMenu
          className={'menu-side noScrollbar'}
          inlineCollapsed={collapsed}
          openKeys={menuAct.defaultOpenKeys}
          selectedKeys={menuAct.defaultSelectedKeys}
          onSelect={({ item, key, keyPath, selectedKeys, domEvent }) => {
            setMenuAct((pre: any) => {
              return merge({}, pre, {
                defaultSelectedKeys: key,
              });
            });
          }}
          items={dataItems}
          expandIcon={() => {
            return <i className={'icon iconfont icon-arrow f16'}></i>;
          }}
          onOpenChange={(openKeys) => {
            setMenuAct((pre: any) => {
              return Object.assign({}, pre, {
                defaultOpenKeys: openKeys,
              });
            });
          }}
          mode={'inline'}
          inlineIndent={14}
          onClick={menuClick}
        />
        <TzPopover destroyTooltipOnHide overlayClassName="user-info-wrapper" content={Menu} placement="rightBottom">
          {
            <div className={classNames('user-info', { collapsed })}>
              {collapsed ? <i className={'icon iconfont icon-zhanghu'} /> : userPopover}
            </div>
          }
        </TzPopover>
      </div>
      {showUpdatePwdPopup && <RestPwdPopup open={showUpdatePwdPopup} onCancel={hideRestPwdPopup} />}
    </div>
  );
};

export default memo(SideBar);
