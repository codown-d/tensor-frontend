import { useEffect, useMemo, useState } from 'react';
import { Store } from '../services/StoreService';

type TUseLayoutMainSearchWid =
  | undefined
  | {
      max?: number;
      min?: number;
      pagePadding?: number;
    };
const useLayoutMainSearchWid = (param?: TUseLayoutMainSearchWid) => {
  const { max = 480, min = 280, pagePadding = 64 } = param || {};
  const [containerWid, setContainerWid] = useState<number>();
  useEffect(() => {
    Store.layoutMainContentSize.subscribe((val) => {
      setContainerWid(val?.width);
    });
  }, [Store.layoutMainContentSize]);

  const wid = useMemo(() => {
    const _wid = containerWid ? (containerWid - pagePadding) * 0.33 : min;
    if (_wid > max) {
      return max;
    }
    if (_wid > min) {
      return _wid;
    }
    return min;
  }, [containerWid]);

  return wid;
};

export default useLayoutMainSearchWid;
