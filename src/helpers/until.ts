import moment from 'moment';
import { SupportedLangauges, WebResponse } from '../definitions';
import { localLang, translations } from '../translations/translations';
import { TzMessageSuccess, TzMessageWarning } from '../components/tz-mesage';
import {
  cloneDeep,
  debounce,
  groupBy,
  isNull,
  isUndefined,
  keys,
  merge,
  toLower,
  trim,
  upperCase,
  upperFirst,
} from 'lodash';
import React from 'react';
import { showFailedMessage, showSuccessMessage } from './response-handlers';
import { cleanKeepPath, setUserInformation, setUserToken } from '../services/AccountService';
import { loginSuccessRedirect } from '../services/RouterService';
import { IS_MICRO_FRONT_IFRAME } from './config';
import { Observable } from 'rxjs';
export function launchIntoFullscreen(element: any) {
  try {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  } catch (e) {}
}
export function screens() {
  let screens = { zxxxl: false, zxxl: false, zxl: false };
  if (document.body.offsetWidth > 1920) {
    screens.zxxxl = true;
  } else if (document.body.offsetWidth > 1440 && document.body.offsetWidth <= 1920) {
    screens.zxxl = true;
  } else if (document.body.offsetWidth <= 1440) {
    screens.zxl = true;
  }
  let spanCount = 6,
    gutter: any = [32, 20];
  if (screens.zxl) {
    spanCount = 8;
    gutter = [32, 20];
  } else if (screens.zxxxl) {
    gutter = [48, 20];
  }
  return { gutter, spanCount, screens };
}

export const formatDuring = (t: number) => {
  const HOUR = 1000 * 60 * 60;
  const h = Math.floor(t / HOUR);
  const m = Math.floor((t % HOUR) / (1000 * 60));
  const s = Math.floor((t % (1000 * 60)) / 1000);

  let text = '';
  h && (text += `${h}${translations.hour}`);
  m && (text += `${m}${translations.min}`);
  s && (text += `${s}${translations.second}`);
  return text || '-';
};

export function exitFullscreen() {
  const doc = document as any;
  try {
    if (doc.exitFullscreen) {
      doc.exitFullscreen().catch((e: any) => {});
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen();
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen();
    }
  } catch (e) {}
}

export function isFullscreen() {
  const doc = document as any;
  return (
    doc.fullScreenElement || doc.msFullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || false
  );
}
export function downBlobFile(res: any) {
  let blob = res.data;
  let disposition = res.headers.get('Content-Disposition');
  let ele = document.createElement('a');
  let href = window.URL.createObjectURL(blob); //创建下载的链接
  let fileName = disposition ? disposition.split(';')[1].split('=')[1] : new Date().getTime() + '.xlsx';
  ele.href = href;
  ele.download = decodeURIComponent(fileName); //解码
  document.body.appendChild(ele);
  ele.click();
  document.body.removeChild(ele);
  window.URL.revokeObjectURL(href); //释放掉blob对象
}
export function downFile(content: any, filename?: string) {
  const ele = document.createElement('a');
  ele.download = content?.headers?.get('Content-Disposition')
    ? content?.headers.get('Content-Disposition').split('=')[1]
    : filename || '';
  //ele.download = filename;
  ele.style.display = 'none';
  ele.href = URL.createObjectURL(content);
  document.body.appendChild(ele);
  ele.click();
  document.body.removeChild(ele);
}

export function getFileName(filePath: string) {
  const cindex = filePath.lastIndexOf('/');
  if (cindex === -1) {
    return filePath;
  } else {
    return filePath.slice(cindex + 1);
  }
}

export const preTarget = [
  {
    en: 'Attack Vector',
    cn: translations.difficult_to_attack_the_position,
    abb: 'AV',
    vals: [
      {
        en: 'Network',
        cn: translations.network_access,
        abb: 'N',
      },
      {
        en: 'Adjacent',
        cn: translations.adjacent_network_access,
        abb: 'A',
      },
      {
        en: 'Local',
        cn: translations.local_access,
        abb: 'L',
      },
      {
        en: 'Physical',
        cn: translations.physical_access,
        abb: 'P',
      },
    ],
  },
  {
    en: 'User Interaction',
    cn: translations.whether_to_trigger_automatically,
    abb: 'UI',
    vals: [
      {
        en: 'None',
        cn: translations.automatic,
        abb: 'N',
      },
      {
        en: 'Required',
        cn: translations.not_automatic,
        abb: 'R',
      },
    ],
  },
  {
    en: 'Privileges Required',
    cn: translations.pequired_permission_level,
    abb: 'PR',
    vals: [
      {
        en: 'None',
        cn: translations.nothing,
        abb: 'N',
      },
      {
        en: 'Low',
        cn: translations.severity_Low,
        abb: 'L',
      },
      {
        en: 'High',
        cn: translations.severity_High,
        abb: 'H',
      },
    ],
  },
  {
    en: 'Attack Complexity',
    cn: translations.attack_complexity,
    abb: 'AC',
    vals: [
      {
        en: 'Low',
        cn: translations.severity_Low,
        abb: 'L',
      },
      {
        en: 'High',
        cn: translations.severity_High,
        abb: 'H',
      },
    ],
  },
];

export const effectTarget = [
  {
    en: 'Confidentiality Impact',
    cn: translations.risk_of_information_leakage,
    abb: 'C',
    vals: [
      {
        en: 'High',
        cn: translations.severity_High,
        abb: 'H',
      },
      {
        en: 'Low',
        cn: translations.severity_Low,
        abb: 'L',
      },
      {
        en: 'None',
        cn: translations.nothing,
        abb: 'N',
      },
    ],
  },
  {
    en: 'Availability Impact',
    cn: translations.information_system_tampering_risk,
    abb: 'A',
    vals: [
      {
        en: 'High',
        cn: translations.severity_High,
        abb: 'H',
      },
      {
        en: 'Low',
        cn: translations.severity_Low,
        abb: 'L',
      },
      {
        en: 'None',
        cn: translations.nothing,
        abb: 'N',
      },
    ],
  },
  {
    en: 'Privileges Required',
    cn: translations.cause_doS_risk,
    abb: 'I',
    vals: [
      {
        en: 'High',
        cn: translations.severity_High,
        abb: 'H',
      },
      {
        en: 'Low',
        cn: translations.severity_Low,
        abb: 'L',
      },
      {
        en: 'None',
        cn: translations.nothing,
        abb: 'N',
      },
    ],
  },
  {
    en: 'Scope',
    cn: translations.scope_of_authority_expanded,
    abb: 'S',
    vals: [
      {
        en: 'Changed',
        cn: translations.expand,
        abb: 'C',
      },
      {
        en: 'Unchanged',
        cn: translations.unchanged,
        abb: 'U',
      },
    ],
  },
];

export function vectorSplit(cvssVector: string) {
  const aa = cvssVector.split('/');
  const bb = {} as any;
  aa.forEach((item) => {
    const cc = item.split(':');
    bb[cc[0]] = cc[1];
  });

  const lang = localLang;

  const getCoordData = (item: any, f = 'desc') => {
    const val = bb[item.abb || item.en];
    const aindex = item.vals.slice(0).findIndex((v: any) => v.abb === val || v.en === val);
    const a = aindex !== -1 ? aindex / (item.vals.length - 1) : 0;
    const txt = aindex === -1 ? '' : item.vals[aindex][lang === SupportedLangauges.Chinese ? 'cn' : 'en'];
    return {
      item: lang === SupportedLangauges.Chinese ? item.cn : item.en,
      val,
      a: 1 - a,
      txt,
    };
  };
  const preList = preTarget.slice(0).map((item) => {
    return getCoordData(item);
  });

  const effectList = effectTarget.slice(0).map((item) => {
    return getCoordData(item);
  });

  return { preList, effectList };
}
export function bytesToSize(bytes: number) {
  if (bytes === 0) return '0 B';
  let k = 1024, // or 1024
    sizes = ['B', 'KB', 'M', 'G', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

export function formatDataToGet(data: any): string {
  let str = '';
  Object.getOwnPropertyNames(data).forEach(function (val, idx, array) {
    str = `${str}${val}=${data[val]}&`;
  });
  return str ? '?' + str.substring(0, str.length - 1) : str;
}

export function toCaseObjKeys(obj: any, up = false) {
  const _obj: any = { ...obj };
  return Object.keys(obj).reduce((v: any, k) => {
    let key = up ? k.toUpperCase() : k.toLowerCase();
    v[key] = _obj[k];
    return v;
  }, {}) as any;
}

interface callBack {
  (arg0: any): any;
}

export function recursionFormatData<obj>(
  arr: obj[],
  children: string,
  props: string,
  copyProps: string,
  callBack?: callBack,
): obj[] {
  if (arr.length && arr.length === 0) return arr;
  const re = (data: obj[]) => {
    for (let i = 0; i < data.length; i++) {
      let item: any = data[i];
      if (!item[copyProps]) {
        item[copyProps] = item[props] || '';
        if (callBack) {
          item = callBack(item);
        }
      }
      if (item[children] && item[children].length !== 0) {
        re(item[children]);
      }
    }
  };
  re(arr);
  return arr;
}

export function deepClone(target: any) {
  return cloneDeep(target);
}

export function copyTextTwo(text: string) {
  const el = document.createElement('input');
  el.setAttribute('value', text);
  document.body.appendChild(el);
  el.select();
  let flag: boolean;
  try {
    flag = document.execCommand('copy');
    document.body.removeChild(el);
  } catch (eo) {
    flag = false;
  }
  if (flag) {
    TzMessageSuccess(translations.scanner_detail_toast_copy_succ);
  } else {
    TzMessageWarning(translations.scanner_detail_toast_copy_fail);
  }
}

// isUrl:是否是复制url, iframe禁用url copy方法
export function copyText(text: string, isUrl?: boolean) {
  if (isUrl && IS_MICRO_FRONT_IFRAME) {
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.style.position = 'fixed';
  textarea.style.left = '-1000px';
  textarea.style.top = '0px';
  textarea.style.opacity = '0';
  const currentFocus = document.activeElement as any;
  const toolBoxwrap = document.body;
  toolBoxwrap.appendChild(textarea);
  textarea.defaultValue = text;
  textarea.focus();
  if (textarea.setSelectionRange) {
    textarea.setSelectionRange(0, textarea.value.length);
  } else {
    textarea.select();
  }
  let flag: boolean;
  try {
    flag = document.execCommand('copy');
  } catch (eo) {
    flag = false;
  }
  toolBoxwrap.removeChild(textarea);
  currentFocus && currentFocus.focus({ preventScroll: true });
  if (flag) {
    TzMessageSuccess(translations.scanner_detail_toast_copy_succ);
  } else {
    TzMessageWarning(translations.scanner_detail_toast_copy_fail);
  }
  return flag;
}

export function onLoginSuccessed(item: any) {
  if (!item?.token) {
    showFailedMessage(translations.loginScreen_missingToken);
    return;
  }
  setUserToken(item.token);
  setUserInformation({
    username: item.username,
    account: item.account,
    type: item.type,
    role: item.role,
    platform: item.platform,
    module_id: item.module_id,
  });
  cleanKeepPath();
  showSuccessMessage(translations.loginScreen_successAlert);
  loginSuccessRedirect();
}
// useNewSearchParams/useSearchParams替代，此方法加入遗弃中
export function getUrlQuery(key?: string, u?: string): any {
  const url = u || window.GLOBAL_WINDOW.location.href;
  if (url.indexOf('?') === -1) {
    return '';
  }
  const temp1 = url.split('?');
  const pram = temp1.slice(-1)[0];
  const keyValue = pram.split('&');
  const obj: any = {};
  for (let i = 0; i < keyValue.length; i++) {
    const item = keyValue[i].split('=');
    const key = item[0];
    const value = item[1];
    obj[key] = value;
  }
  return key ? obj[key] || '' : obj;
}

// useNewSearchParams/useSearchParams替代，此方法加入遗弃中
export function tabChange(activeKey: any, d: string = '') {
  let href = window.GLOBAL_WINDOW.location.href;
  if (!!href.match(/tab=.*?&/gi)) {
    href = href.replace(/tab=.*?&/gi, `tab=${activeKey}&`);
  } else {
    let index = href.indexOf('tab=');
    if (index === -1) {
      if (href.indexOf('?') != -1) {
        href = href + `&tab=${activeKey}`;
      } else {
        href = href + `?tab=${activeKey}`;
      }
    } else {
      href = href.slice(0, index) + `tab=${activeKey}`;
    }
  }
  window.GLOBAL_WINDOW.location.href = href + d;
}
export function formatGetMethodParams(params: { [key: string]: any } = {}, encryption = false) {
  const _params = Object.keys(params).reduce((v, keyname) => {
    const val = trim(params[keyname]);
    v += encryption ? `&${keyname}=${encodeURIComponent(val)}` : `&${keyname}=${val}`;
    return v;
  }, '');
  return `?${_params.slice(1)}`;
}
export function parseGetMethodParams(params: { [key: string]: any }, encryption = true) {
  if (!params) return '';
  const _params = Object.keys(params).reduce((v, keyname) => {
    const val = trim(params[keyname]);
    if (val === '' || isNull(val) || isUndefined(val)) {
      v;
    } else {
      v += `${keyname}=${encryption ? encodeURIComponent(val) : val}&`;
    }
    return v;
  }, '');
  return `?${_params.slice(0, _params.length - 1)}`;
}

export function isChinese(temp: string) {
  const re = /[^\u4E00-\u9FA5]/;
  if (re.test(temp)) return false;
  return true;
}

export function fixedWidthOrPrecentage(precentage: string) {
  if (window.innerWidth < 800) {
    return precentage;
  }
  return '800px';
}

export function utc2beijing(utc_datetime: string) {
  const T_pos = utc_datetime.indexOf('T');
  const Z_pos = utc_datetime.indexOf('Z');
  const year_month_day = utc_datetime.substr(0, T_pos);
  const hour_minute_second = utc_datetime.substr(T_pos + 1, Z_pos - T_pos - 1);
  const new_datetime = year_month_day + ' ' + hour_minute_second; // 2017-03-31 08:02:06

  const timestamp = new Date(Date.parse(new_datetime)).getTime() / 1000;

  const _timestamp = timestamp + 8 * 60 * 60;

  const beijing_datetime = new Date(parseInt(_timestamp.toString()) * 1000)
    .toLocaleString('chinese', { hour12: false })
    .replace(/年|月|\//g, '-')
    .replace(/日/g, ' ');
  return beijing_datetime;
}
Array.prototype.remove = function (val: string) {
  const index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
  return this;
};
Array.prototype.findOne = function (val: any, key: string) {
  let newArr = [...this];
  let index = newArr.findIndex((item) => {
    if (Object.prototype.toString.call(item) === '[object Object]' && item[key]) {
      return item[key] === val;
    } else {
      return item === val;
    }
  });
  if (index > -1) {
    return newArr.splice(index, 1).pop() || null;
  } else {
    return '';
  }
};

Array.prototype.pushEvery = function (node: React.ReactNode) {
  let newArr = [...this];
  return newArr
    .reduce((pre, item) => {
      return pre.concat([item, node]);
    }, [])
    .slice(0, -1);
};

export function getUid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
function isObject(obj: { [x: string]: any } | null) {
  return typeof obj === 'object' && obj !== null;
}
export function isEqual(obj1: { [x: string]: any }, obj2: { [x: string]: any }) {
  // 如果其中没有对象
  if (!isObject(obj1) || !isObject(obj2)) {
    //值类型
    return obj1 === obj2;
  }
  // 如果特意传的就是两个指向同一地址的对象
  if (obj1 === obj2) {
    return true;
  }
  // 两个都是对象或者数组，而且不相等
  // 拿到对象key
  let obj1Keys = Object.keys(obj1);
  let obj2Keys = Object.keys(obj2);
  // 先判断长度就可以过滤一些
  if (obj1Keys.length !== obj2Keys.length) {
    return false;
  }
  // 以obj1为基准 和 obj2 一次递归比较
  for (let key in obj1) {
    // 递归比较当前每一项
    const res = isEqual(obj1[key], obj2[key]);
    // 如果碰到一个不一样的就返回 false
    if (!res) {
      // 跳出for循环
      return false;
    }
  }
  // 否则全相等
  return true;
}
export function addFiletToDown(e: any) {
  return new Promise<void>((resolve, reject) => {
    if (!$('#fixedWidgets').length) {
      return;
    }
    let { top, left } = $('#fixedWidgets')[0].getBoundingClientRect();
    let el = e?.target ? $(e.target)[0].getBoundingClientRect() : $('body')[0].getBoundingClientRect();
    let p = $('<p></P>').css({
      position: 'fixed',
      left: e?.target ? el.left : el.width / 2 + 'px',
      top: e?.target ? el.top : el.height / 2 + 'px',
      width: '24px',
      height: '24px',
      'border-radius': '50%',
      'background-color': '#2177D1',
      'z-index': '1009',
    });
    $('body').append(p);
    setTimeout(() => {
      $(p).animate(
        {
          left: left + 'px',
          top: top + 'px',
          opacity: '0',
          width: '8px',
          height: '8px',
        },
        1000,
        'swing',
        () => {
          p.remove();
        },
      );
    }, 0);
    resolve();
  });
}

export function onDropdownVisibleChange(open: any) {
  if (!open) {
    $('body').css({ overflow: 'auto', overflowY: 'overlay' });
  } else {
    setTimeout(() => {
      $('body').css({ overflow: 'hidden' });
    }, 0);
  }
}

export const createAudio = () => {
  let audio;
  if (!document.querySelector('#audio')) {
    const body = document.querySelector('body');
    audio = document.createElement('audio');
    audio.className = 'audio-tag';
    audio.setAttribute('src', '/media/a.mp3');
    audio.setAttribute('id', 'audio');
    (body as HTMLBodyElement).appendChild(audio);
  } else {
    audio = document.querySelector('#audio');
  }
  return audio;
};
export const mergeWithId = (arr1: any, arr2: any, key: any) => {
  if (
    Object.prototype.toString.call(arr1) === '[object Array]' &&
    Object.prototype.toString.call(arr2) === '[object Array]'
  ) {
    let result = [...arr1, ...arr2].reduce((pre, item) => {
      if (pre[item.key]) {
        pre[item.key] = merge(pre[item.key], item);
      } else {
        pre[item.key] = item;
      }
      return pre;
    }, {});
    return Object.values(result).reverse();
  } else {
    return merge({}, arr1, arr2);
  }
};

export const langGap = localLang === 'zh' ? '' : ' ';
export const lowerUpperFirst = (str: string) => (localLang === 'zh' ? str : upperFirst(toLower(str)));

export const fitlerStr = (str: string | undefined, search: string | undefined) =>
  upperCase(str ?? '')?.indexOf(upperCase(search)) > -1;

export const getContainer = (el?: any) => el ?? document.querySelector('#layoutMain') ?? document.body;

export const layoutScrollToTop = (el?: any) => (getContainer(el).scrollTop = 0);

// iframe: sessionTimeOut
export const sessionTimeOut = debounce(() => {
  window.TOP_WINDOW.postMessage(JSON.stringify({ name: 'session_time_out' }), '*');
}, 1000);

// iframe:菜单跳转
export const navigateByMenu = (path: string) => {
  window.TOP_WINDOW.postMessage(
    JSON.stringify({
      name: 'go-portal-menu',
      data: { path: path, params: { key1: 1, key2: 'test' } },
    }),
    '*',
  );
};
// iframe:返回
export const goBack = () => {
  window.TOP_WINDOW.postMessage(JSON.stringify({ name: 'go-back', data: {} }), '*');
};
export const getTime = (time: any, format?: string) => {
  return time ? moment(time).format(format || 'YYYY-MM-DD HH:mm:ss') : '-';
};
export let downloadFile = (
  parameter: { [x: string]: any; downloadFilename: string },
  filePath: (data?: any) => Observable<WebResponse<any>>,
  event?: React.MouseEvent<HTMLElement, MouseEvent>,
) => {
  filePath(parameter).subscribe((result: any) => {
    if (result.error) return;
    let elink = document.createElement('a');
    elink.download = parameter?.downloadFilename?.replace('.txt', '.zip');
    elink.style.display = 'none';
    elink.href = URL.createObjectURL(result);
    document.body.appendChild(elink);
    elink.click();
    document.body.removeChild(elink);
  });
};
export function latestDuring(type: 'hour' | 'day', count: number) {
  const now = moment();
  const arr = [];
  for (let i = 0; i < count; i++) {
    const ntime = now.clone().subtract(i, type);
    arr.unshift(ntime.format(type === 'hour' ? 'HH' : 'MM-DD'));
  }
  return arr;
}
export function objectKeyPath(object: any): string[] {
  for (let key in object) {
    if (isObject(object[key])) {
      let temp: any = objectKeyPath(object[key]);
      if (temp) return [key, temp].flat();
    } else {
      return [key];
    }
  }
  return [];
}

export interface ArrayToTreeProps {
  id: string;
  label: string;
  value: string | number;
  idPath: string;
  isLeaf: boolean;
  children: ArrayToTreeProps[];
}
export function arrayToTree(arr: any[], keyList: string[], formatName?: any): ArrayToTreeProps[] {
  let result: ArrayToTreeProps[];
  let getTreeItem = (arr: any[], deep: number, idPath: any): ArrayToTreeProps[] => {
    if (isUndefined(keyList[deep]) || arr.length == 0) {
      return [];
    }
    let obj = groupBy(arr, keyList[deep]);
    return keys(obj).map((item) => {
      let children = getTreeItem(obj[item], deep + 1, `${idPath}/${item}`);
      return {
        id: item,
        label: formatName?.[item] || item,
        value: keyList[deep] == 'id' ? Number(item) : item,
        idPath: idPath,
        isLeaf: children.length == 0,
        children,
      };
    });
  };
  result = getTreeItem(arr, 0, null);
  return result;
}
