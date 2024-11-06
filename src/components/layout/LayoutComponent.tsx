import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import './LayoutComponent.scss';
import { Routes } from '../../Routes';
import { translations } from '../../translations/translations';
import { Outlet, useLocation, useNavigate, useNavigationType, useOutlet, useRoutes } from 'react-router-dom';
import { acknowledgeUserSession, getListClusters, getProfile, idpDxhost } from '../../services/DataService';
import { hasPathAuth, loginOut } from '../../services/RouterService';
import { useActivatedRoute } from '../../helpers/useActivatedRoute';
import { Resources } from '../../Resources';
import { TzFileDownContainer } from '../ComponentsLibrary/TzFileDown';
import routers from '../../Router';
import SideBar from '../sidebar/SidebarComponent';
import { BackTop } from 'antd';
import { Store } from '../../services/StoreService';
import TzPageFooter from '../ComponentsLibrary/TzPageFooter';
import { MarkLoading } from './module/MarkLoading';
import TzPageHeader from '../ComponentsLibrary/TzPageHeader';
import { merge } from 'lodash';
import { useMount, useSize, useUpdate } from 'ahooks';
import { getUserInformation, getUserToken, setUserInformation } from '../../services/AccountService';
import { IS_MICRO_FRONT_IFRAME } from '../../helpers/config';
import { GlobalContext } from '../../helpers/GlobalContext';
import RestPwdPopup from '../../screens/Login/component/ResetPwd/RestPwdPopup';
import NoAuth from '../noData/NoAuth';
import { RouteTypes } from '../../definitions';
import LicenseToast from '../licenseToast/LicenseToast';
import { KeepAliveOutlet, OffScreenContext, useActivity } from '@tz/components';
import WebSocketContext, { webSocket } from '../../screens/ImmuneDefense/Info/components/WebSocketContext';
import { TzNotification } from '../../components/tz-notification';
import { TzLayout } from '../../components/tz-layout';
interface IProps {
  hideMenu?: any;
  hideHeader?: boolean;
  hidefoot?: boolean;
  navbarTools?: any;
  breadcrumb?: any;
  title?: string;
  description?: string;
  children?: any;
  accessData?: Pick<RouteTypes, 'roles' | 'access'>;
}

const useAppAvailability = () => {
  const navigate = useNavigate();
  const [isAppAvailable, setAppAvailability] = useState<boolean>(false);
  const location = useLocation();
  const update = useUpdate();
  useEffect(() => {
    if ([Routes.SSOLogin].includes(location.pathname)) {
      return;
    } else {
      if (IS_MICRO_FRONT_IFRAME && !getUserToken()) {
        update();
        return;
      }
      acknowledgeUserSession().subscribe((res) => {
        if (res.isForbidden()) {
          IS_MICRO_FRONT_IFRAME || navigate(Routes.LoginScreen);
        }
        setAppAvailability(true);
      });
    }
  }, []);
  return isAppAvailable;
};

export const dealPathDynaMatch = (lPath: string, rPath: string) => {
  const locationPathArray = lPath.replace('/', '').split('/');
  const routersPathArray = rPath.replace('/', '').split('/');
  if (locationPathArray.length !== routersPathArray.length) {
    return false;
  }
  let mark = true;
  routersPathArray.map((t, key) => {
    if (t.includes(':')) {
      return t;
    }
    t !== locationPathArray[key] && (mark = false);
    return t;
  });
  return mark;
};
export default function LayoutComponent(props: IProps) {
  const { hideMenu } = props;
  const isAppAvailable = useAppAvailability();
  const { cycleChangePwdDay, setCycleChangePwdDay } = useContext(GlobalContext);
  let [header, setHeader] = useState<any>(false);
  let [pageFooterDom, setPageFooterDom] = useState<any>(false);
  let [menuWidth, setMenuWidth] = useState(220);
  const activatedRoute = useActivatedRoute();
  let location = useLocation();
  let width = 1280;
  const r = useRoutes(routers);
  const route = r?.props?.match?.route;
  const access = useMemo(() => hasPathAuth(route), [route]);

  const layoutMainContentRef = useRef<HTMLDivElement | null>(null);
  const bodySize = useSize(document.querySelector('body'));
  const outlet = useOutlet();
  const action = useNavigationType();

  const res = useActivity({ action: action, location, outlet, layoutId: 'layoutMain' });
  let socket = webSocket();
  useEffect(() => {
    const _bodySize = bodySize?.width || 0;
    let num = hideMenu || activatedRoute?.hideMenu ? 0 : _bodySize < width ? 80 : 220;
    setMenuWidth(num);
    Store.menuWidth.next(num);
  }, [bodySize?.width, activatedRoute?.hideMenu, hideMenu]);

  useEffect(() => {
    setHeader(false);
    setPageFooterDom(false);
    setHeader(activatedRoute);
  }, [activatedRoute]);
  let storeClusterList = useCallback(() => {
    getListClusters({ offset: 0, limit: 9999 }).subscribe((res) => {
      let items = res.getItems().map((item: any) => {
        return {
          label: item.name,
          value: item.key,
        };
      });
      window.localStorage.setItem('clusterList', JSON.stringify(items));
    });
  }, []);
  useMount(() => {
    storeClusterList();
  });
  useEffect(() => {
    let timer1: any, timer2: any;
    Store.breadcrumb.subscribe((val: any) => {
      clearTimeout(timer1);
      timer1 = setTimeout(() => {
        setHeader((pre: any) => {
          return merge({}, pre, { breadcrumb: [...val] });
        });
      }, 0);
    });
    Store.header.subscribe((val: any) => {
      clearTimeout(timer2);
      timer2 = setTimeout(() => {
        setHeader((pre: any) => ({ ...pre, ...val, extra: val?.extra }));
      }, 0);
    });
    Store.pageFooter.subscribe((val: any) => {
      setTimeout(() => {
        setPageFooterDom(val);
      }, 0);
    });
  }, []);

  let pageHeaderClass = useMemo(() => {
    return `header-content ${header?.className || ''}`;
  }, [header]);

  const showToast = useMemo(() => {
    if (activatedRoute && activatedRoute?.hideMenu) return false;
    return true;
  }, [activatedRoute]);

  const size = useSize(layoutMainContentRef);

  useEffect(() => {
    Store.layoutMainContentSize.next(size);
  }, [size]);
  let ssoInit = useCallback((src) => {
    let w: any = window;
    let dh = w.DxHeader;
    if (typeof dh !== 'function') {
      let d = document;
      let i: any = function () {
        i.c(arguments);
      };
      i.q = [];
      i.c = function (args: any[]) {
        i.q.push({ type: args[0], ops: args[1] });
      };
      w.DxHeader = i;
      let l = function () {
        let s = d.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = src + '/header/DxHeaderLib.umd.js';
        let x: any = d.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s, x);
      };
      if (document.readyState === 'complete') {
        l();
      } else if (w.attachEvent) {
        w.attachEvent('onload', l);
      } else {
        w.addEventListener('load', l, false);
      }
    }
  }, []);
  useMount(() => {
    let user = getUserInformation();
    let idToken = window.localStorage.getItem('IDToken');
    if (user.platform == 'dx' && idToken) {
      idpDxhost().subscribe((res) => {
        if (res.error) return;
        let { host = 'https://uat-dx-portal.aswatson.net' } = res.getItem();
        ssoInit(host);
        $('#dxHeader').append('<div id="dxHeaderContent"></div>').css('height', '40px');
        setTimeout(() => {
          (window as any).DxHeader('init', {
            containerId: '#dxHeaderContent',
            idToken: idToken,
            logout: loginOut,
          });
        }, 0);
      });
    }
  });
  return (
    <WebSocketContext.Provider value={socket}>
      <div id={'dxHeader'}></div>
      {showToast ? <LicenseToast /> : null}
      {/* 密码周期修改 */}
      {cycleChangePwdDay !== -1 && (
        <RestPwdPopup
          open={cycleChangePwdDay !== -1}
          cycleChangePwdDay={cycleChangePwdDay}
          onSuccessCall={() => setCycleChangePwdDay(-1)}
          onCancel={() => setCycleChangePwdDay(-1)}
        />
      )}
      <OffScreenContext.Provider value={{ ...res }}>
        <div className="flex-r-c" style={{ height: 0, flex: 1 }}>
          {!menuWidth || <SideBar collapsed={$(window).width() < width} width={menuWidth} />}
          <div id={'layoutMain'} className={'layout-main screen' + location.pathname.replace(/\//g, '-')}>
            <div className="flex-c layout-main-container">
              {access ? (
                <>
                  {header ? (
                    <TzPageHeader
                      {...header}
                      className={pageHeaderClass}
                      style={{ position: 'sticky', top: 0, zIndex: 998, width: '100%' }}
                    />
                  ) : null}
                  <div className="layout-content" id="layoutMainContent" ref={layoutMainContentRef}>
                    {isAppAvailable ? (
                      <KeepAliveOutlet />
                    ) : (
                      <div className="with-authentication">
                        <div style={{ width: '100px' }}>
                          <img src={Resources.Loading} alt="loading" style={{ width: '100px', height: '100px' }} />
                          <span style={{ display: 'block', color: '#2177D1', textAlign: 'center' }}>
                            {translations.loading}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {!pageFooterDom || (
                    <TzPageFooter style={{ width: `calc(100% - ${menuWidth}px)` }}>{pageFooterDom}</TzPageFooter>
                  )}
                </>
              ) : (
                <NoAuth />
              )}
            </div>
          </div>
        </div>
      </OffScreenContext.Provider>
      {access ? (
        <>
          <TzFileDownContainer />
          <BackTop target={() => document.getElementById('layoutMain') || document.body}>
            <p className="go-top">
              <span style={{ display: 'inline-block', width: '24px' }}>{translations.back_to_top}</span>
            </p>
          </BackTop>

          <MarkLoading />
          <TzNotification />
        </>
      ) : null}
    </WebSocketContext.Provider>
  );
}
