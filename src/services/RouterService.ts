import { Routes } from '../Routes';
import { IS_MICRO_FRONT_IFRAME, URL } from '../helpers/config';
import { Store } from '../services/StoreService';
import { postLoginOut } from './DataService';
import { getUserInformation } from './AccountService';
import { sessionTimeOut } from '../helpers/until';
import { RouteTypes } from '../definitions';
import { TMenuDataDefault, menuDataDefault } from '../components/sidebar/SidebarItems';
import routers from '../Router';
import { ROLES } from '../access';
import { cloneDeep, hasIn, intersection, isArray, isBoolean, remove } from 'lodash';

export const loginPreRoute = 'loginPreRoute';
const getHrefPrev = () => {
  const prev = window.GLOBAL_WINDOW.location.href.split(`${URL}/#`)?.[0];
  return `${prev}${URL}`;
};

export function loginOut(isError?: boolean) {
  let rt = window.GLOBAL_WINDOW.location.hash.replace('#', '');
  window.sessionStorage.setItem(loginPreRoute, rt);
  Store.header.next(null);
  Store.breadcrumb.next([]);
  Store.pageFooter.next(null);
  const prev = getHrefPrev();

  if (IS_MICRO_FRONT_IFRAME) {
    // 不能清除token不然会导致中移postmessage监听循环处理;
    sessionTimeOut();
    return;
  }
  if (!isBoolean(isError)) {
    postLoginOut().subscribe();
  }
  if (rt !== Routes.LoginScreen) {
    window.GLOBAL_WINDOW.location.replace(`${prev}#${Routes.LoginScreen}`);
  }
}
export function loginSuccessRedirect() {
  const { homePath = '/' } = getMenuData();

  const redirectURL = window.sessionStorage.getItem(loginPreRoute) || homePath;
  let redirectTo = redirectURL;
  if (
    [Routes.LoginScreen, Routes.SSOLogin].find((item) => {
      return redirectURL.indexOf(item) != -1;
    })
  ) {
    redirectTo = homePath;
  }
  const prev = getHrefPrev();
  window.GLOBAL_WINDOW.location.replace(`${prev}#${redirectTo}`);
}

// 是否拥有权限
export const hasPathAuth = (route?: Pick<RouteTypes, 'roles' | 'access'>) => {
  const { roles, access } = route || {};
  // TODO
  const { module_id, role } = getUserInformation() || {};
  // const { module_id, role } = {
  //   ...getUserInformation(),
  //   module_id: ['2', '3', '4'],
  //   role: 'super-admin',
  // };
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return true;
    case ROLES.PLATFORM_ADMIN:
    case ROLES.AUDIT:
      return roles?.includes(role);
    case ROLES.ADMIN:
    case ROLES.NORMAL:
      if (!roles?.includes(role)) {
        return false;
      }
      if (!access) {
        return true;
      }
      return isArray(access) ? intersection(access, module_id).length > 0 : access && module_id?.includes(access);

    default:
      return false;
  }
};
const getFirMenuItem = (data: TMenuDataDefault[]) => {
  if (!data?.length) {
    return undefined;
  }
  let fir = '';
  const getFirstMemuItem = (items: TMenuDataDefault[]) => {
    const _fir: TMenuDataDefault = items?.[0];
    if (_fir?.children?.length) {
      getFirstMemuItem(_fir.children);
    } else {
      fir = _fir.key;
    }
  };
  getFirstMemuItem(data);
  return fir;
};
export const getMenuData = () => {
  const setItemAuth = (items: TMenuDataDefault[], parent?: TMenuDataDefault) => {
    items.forEach((v, index) => {
      if (v?.children?.length) {
        setItemAuth(v?.children, v);
      } else {
        const item = routers.find((i) => i.path === v?.key);
        if (hasPathAuth(item as RouteTypes)) {
          parent && (parent.hidden = false);
        } else {
          v.hidden = true;
          index === items.length - 1 && !hasIn(parent, 'hidden') && parent && (parent.hidden = true);
        }
      }
    });
  };

  let newData: TMenuDataDefault[] = cloneDeep(menuDataDefault);
  setItemAuth(newData);
  const removeHidden = (items: TMenuDataDefault[]) => {
    items.forEach((element) => {
      if (element.children?.length) {
        removeHidden(element.children);
      }
    });
    remove(items, (v) => v.hidden);
  };
  removeHidden(newData);
  const fir = getFirMenuItem(newData);
  return { menu: newData, homePath: fir };
};
