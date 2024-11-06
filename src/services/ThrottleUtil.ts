import CryptoJS from 'crypto-js';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Our hook
export function useDebounce(value: any, delay: number) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value]);

  return debouncedValue;
};

export function useThrottle(fn: any, delay: number, dep = []) {
  const { current } = useRef<{ fn: any; timer: any }>({
    fn,
    timer: null,
  });
  useEffect(
    function () {
      current.fn = fn;
    },
    [fn]
  );
  return useCallback((...args) => {
    if (!current?.timer) {
      current.timer = setTimeout(() => {
        delete current.timer;
      }, delay);
      current.fn.call(...args);
    }
  }, dep);
}

export function encrypt(word: any, keyStr: string) {
  const _key = CryptoJS.enc.Utf8.parse(keyStr);
  const iv = CryptoJS.enc.Utf8.parse(keyStr);
  const srcs = CryptoJS.enc.Utf8.parse(word);
  const encrypted = CryptoJS.AES.encrypt(srcs, _key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

export function decrypt(word: string, keyStr: string) {
  const _key = CryptoJS.enc.Utf8.parse(keyStr);
  const iv = CryptoJS.enc.Utf8.parse(keyStr);
  // const encryptedHexStr = CryptoJS.enc.Hex.parse(word);
  // const srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  const decrypt = CryptoJS.AES.decrypt(word, _key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
}

export function pwdReg(text: string) {
  const reg = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[~!@#$%^&*.]).{8,16}$/;
  const reg1 = /^(?=.*[0-9])(?=.*[~!@#$%^&*.]).{8,16}$/;
  const reg2 = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,16}$/;
  const reg3 = /^(?=.*[a-zA-Z])(?=.*[~!@#$%^&*.]).{8,16}$/;
  return (
    reg.test(text) || reg1.test(text) || reg2.test(text) || reg3.test(text)
  );
}

export function getDomWidth(k: string) {
  let w = 0;
  let fdom = $('#ellipsis');
  if (!fdom.length) {
    fdom = $(`<div id='ellipsis'></div>`).attr('display', 'none');
    $('body').append(fdom);
  }
  const dom = $(`<span>${k}</span>`).attr('display', 'none');
  fdom.append(dom);
  w = dom.width();
  fdom.empty();
  return w;
}
// 仅仅是为了比较白名单策略生效对象的值相等
export const isShallowEqual = (obj: any, oth: any) => {
  let res = true;
  const objEntries: any = Object.entries(obj);
  const othEntries = Object.entries(oth);
  if (objEntries?.length !== othEntries?.length) {
    res = false;
    return res;
  }
  for (const [k, v] of objEntries) {
    if (!oth[k] || v?.length !== oth[k].length) {
      res = false;
    }
    const vVals = v.map((vv: any) => {
      return JSON.stringify(vv);
    });
    oth[k].map((o: any) => {
      const oval = JSON.stringify(o);
      if (!vVals.includes(oval)) {
        res = false;
      }
      return o;
    });
  }
  return res;
};
