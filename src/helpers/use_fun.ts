import { find, merge } from 'lodash';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { tap } from 'rxjs/operators';
import { AssetsCluster, AssetsNameSpace, AssetsNameSpaceResource, WebResponse } from '../definitions';
import {
  clusterAssetsNamespaces,
  getAssetsClustersList,
  clusterAssetsNamespaceResourcess,
  resourcesTypes,
  scannerInfoList,
  getListClusters,
  vulnConstView,
  viewConst,
  attackClasses,
} from '../services/DataService';
import { Store } from '../services/StoreService';
import { translations } from '../translations/translations';
import { useDebounceFn, useLocalStorageState, useMemoizedFn, useSetState, useUnmount } from 'ahooks';
import { TzConfirm } from '../components/tz-modal';
import { useNavigate } from 'react-router-dom';
export const useAssetsClusters = () => {
  const [clusters, setcluster] = useState(undefined as undefined | { key: string });
  useEffect(() => {
    const sub = Store.clusterID
      .pipe(
        tap((clusterID: string) => {
          setcluster({ key: clusterID });
        }),
      )
      .subscribe();
    return () => {
      sub.unsubscribe();
    };
  }, []);
  return clusters;
};

export const useClusterAssetsNameSpace = (cluster_key?: string) => {
  const [res, setRes] = useState(undefined as undefined | AssetsNameSpace[]);
  useEffect(() => {
    if (!cluster_key) {
      return;
    }
    const sub = clusterAssetsNamespaces(cluster_key).subscribe((res) => {
      const data = res.data?.items;
      setRes(data);
    });
    return () => {
      sub.unsubscribe();
    };
  }, [cluster_key]);
  return res;
};

export const useClusterNameSpaceAssetsResource = (cluster_key?: string, namespace?: string) => {
  const [res, setRes] = useState(undefined as undefined | AssetsNameSpaceResource[]);
  useEffect(() => {
    if (!cluster_key || !namespace) {
      return;
    }
    const sub = clusterAssetsNamespaceResourcess(cluster_key, namespace).subscribe((res) => {
      const data = res.data?.items;

      setRes(data);
    });
    return () => {
      sub.unsubscribe();
    };
  }, [cluster_key, namespace]);
  return res;
};
export type ClusterListProps = {
  label: string;
  value: string;
  platForm: string;
};
export const useAssetsClusterList = (): ClusterListProps[] => {
  const [clusterList, setClusterList] = useLocalStorageState<any>('cluster', {
    defaultValue: [],
  });
  useEffect(() => {
    getAssetsClustersList().subscribe((result) => {
      setClusterList(
        result.map((item: AssetsCluster) => {
          return {
            label: item.name,
            value: item.key,
            platForm: item.platForm,
          };
        }),
      );
    });
  }, []);
  return clusterList;
};
export const useAssetsClusterNode = () => {
  const [clusterList, setClusterList] = useState<any>([]);
  useEffect(() => {
    getListClusters({ offset: 0, limit: 10000 }).subscribe((res) => {
      const items = res.getItems();
      let data = items.map((item: any) => {
        return { value: item.key, label: item.name, isLeaf: item.nodeNumber === 0 };
      });
      setClusterList(data);
    });
  }, []);
  return clusterList;
};
export const useRresourcesTypes = () => {
  const [resourcesTypesData, setResourcesTypes] = useState<any>([]);
  useEffect(() => {
    resourcesTypes().subscribe((res: { getItems: () => any }) => {
      let items = res.getItems();
      setResourcesTypes(
        items.map((item: any) => {
          return {
            label: item,
            value: item,
          };
        }),
      );
    });
  }, []);
  return resourcesTypesData;
};
export const useClusterList = () => {
  const [clusterList, setClusterList] = useState<any>([]);
  useEffect(() => {
    getListClusters({ offset: 0, limit: 100 })
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.getItems().map((item) => {
            return merge(item, { value: item.key, label: item.name });
          });
          setClusterList(items);
        }),
      )
      .subscribe();
  }, []);
  return clusterList;
};
export const useScannerInfoList = () => {
  const [clusterList, setClusterList] = useState<any>([]);
  useEffect(() => {
    scannerInfoList().subscribe((result) => {
      let items = result.getItems();
      setClusterList(
        items.map((item: any) => {
          return {
            label: item.scannerInstanceName,
            value: item.scannerInstance,
          };
        }),
      );
    });
  }, []);
  return clusterList;
};
export const useVulnConstView = (): any[] => {
  const [constView, setConstView] = useState<any[]>([]);
  useEffect(() => {
    vulnConstView().subscribe((result: any) => {
      let item = result.getItem();
      let attackPath = item.attackPath;
      setConstView(
        attackPath.map((ite: any) => {
          return merge({}, ite, { text: ite.label });
        }),
      );
    });
  }, []);
  return constView;
};
export const useViewConst = (parm: any) => {
  const [data, setViewConst] = useState<any[]>([]);
  useEffect(() => {
    viewConst(parm).subscribe((result) => {
      let items = result.getItems().map((item) => {
        item['text'] = item.label;
        return item;
      });
      setViewConst(items);
    });
  }, []);
  return data;
};
export const useAttackClasses = () => {
  const [list, setList] = useState<any>([]);
  useEffect(() => {
    attackClasses().subscribe((res) => {
      if (res.error) return;
      let items: any = res.getItems();
      setList(
        items.map((item: any) => {
          return { label: item.describe, value: item.type };
        }),
      );
    });
  }, []);

  return list;
};

export const getStatusStr = (item: any): string => {
  let str = '';
  if (item?.Status === 1) {
    str = translations.clusterGraphList_off;
  } else {
    str =
      item?.Ready === 1 && item?.Status === 0
        ? translations.clusterGraphList_on
        : translations.clusterGraphList_noReady;
  }
  return str;
};
export const getClusterName = (key: string) => {
  let clusterList = JSON.parse(window.localStorage.getItem('clusterList') || '[]');
  return key ? find(clusterList, (item) => item.value === key)?.label || key : '-';
};
type Data = { list: any[]; [key: string]: any };
interface TData extends Data {}
export type Service<TData extends Data> = (currentData?: TData) => Promise<TData>;
export const useInfiniteScroll = (
  service: (arg: { nextId?: string }, pageSize?: number) => Promise<TData>,
  options: {
    target: any;
    isNoMore?: (data?: TData) => boolean;
    threshold?: number | undefined;
    reloadDeps?: any[] | undefined;
    manual?: boolean | undefined;
    onBefore?: any;
    onSuccess?: any;
    onError?: any;
    onFinally?: any;
  },
) => {
  let {
    target,
    isNoMore,
    threshold = 100,
    reloadDeps = [],
    manual = false,
    onBefore,
    onSuccess,
    onError,
    onFinally,
  } = options;
  const [data, setData] = useSetState<Data>({
    list: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [noMore, setNoMore] = useState<boolean>(false);
  const [params, setParams] = useSetState({ nextId: undefined });
  const [pageSize, setPageSize] = useState(10);
  let timer = useRef<any>();

  let getServiceData = useMemoizedFn(() => {
    setLoadingMore(true);
    service(params, pageSize).then((res) => {
      let { list, nextId } = res;
      setNoMore(!nextId);
      setParams({ nextId });
      setData({ list: [...data.list, ...list] });
      setLoadingMore(false);
      setLoading(false);
    });
  });
  let reload = useMemoizedFn(() => {
    setLoading(true);
    setData({ list: [] });
    setParams({ nextId: undefined });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      getServiceData();
    }, 0);
  });
  const { run } = useDebounceFn(
    () => {
      const { scrollTop, clientHeight, scrollHeight } = $(target)[0];
      const isBottom = scrollTop + clientHeight + threshold >= scrollHeight;
      if (isBottom && scrollTop) {
        getServiceData();
      }
    },
    {
      wait: 500,
    },
  );
  useUnmount(() => {
    $(target).off('mousewheel DOMMouseScroll');
  });
  useEffect(() => {
    $(target).off('mousewheel DOMMouseScroll').on('mousewheel DOMMouseScroll', run);
  }, [options.target]);
  useEffect(() => {
    manual || reload();
  }, reloadDeps);
  return { data, loading, loadingMore, noMore, reload };
};
export const useFromValueChange = (props?: any) => {
  const navigate = useNavigate();
  let valueChangeFn = useMemoizedFn((fieldsChange, callback?: () => void) => {
    if (fieldsChange) {
      TzConfirm({
        content: translations.deflectDefense_cancelTip,
        okText: translations.superAdmin_confirm,
        cancelText: translations.breadcrumb_back,
        onOk() {
          navigate(-1);
        },
      });
    } else {
      navigate(-1);
    }
  });
  return { valueChangeFn };
};
