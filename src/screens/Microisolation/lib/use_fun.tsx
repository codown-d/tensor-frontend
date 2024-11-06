import { useLocalStorageState, useMemoizedFn } from 'ahooks';
import { SetState } from 'ahooks/lib/useSetState';
import React, { useCallback, useEffect, useState } from 'react';
import {
  microsegNamespaces,
  microsegResources,
  microsegSegments,
  microsegNsgrps,
  ipgroups,
} from '../../../services/DataService';
import { getClusterName, useAssetsClusterList } from '../../../helpers/use_fun';
import { translations } from '../../../translations';
import { TzConfirm } from '../../../components/tz-modal';
import { arrayToTree } from '../../../helpers/until';
import { find } from 'lodash';
export const useGetClusterResources = (includeSensitiveNs?: boolean) => {
  const [value, setValue] = useLocalStorageState<any>('micro-ns-res', {
    defaultValue: [],
  });
  let clusters = useAssetsClusterList();
  let getSegmentOp = useMemoizedFn(() => {
    new Promise((resolve) => {
      microsegResources({ includeSensitiveNs }).subscribe((res) => {
        let items = res.getItems();
        let obj = items.reduce((pre, cur) => {
          pre[cur.id] = `${cur.name}(${cur.kind})`;
          pre[cur.cluster] = getClusterName(cur.cluster);
          return pre;
        }, {});
        let treeData = arrayToTree(items, ['cluster', 'namespace', 'id'], obj);
        treeData.forEach((item: any) => {
          item.children.forEach((ite: any) => {
            ite.children.forEach((it: any) => {
              it['value'] = it['value'] + '';
            });
          });
        });
        resolve(treeData);
      });
    }).then((items: any) => {
      setValue(items);
    });
  });
  useEffect(() => {
    getSegmentOp();
  }, [clusters]);
  return value;
};
export const useGetResourcesGroup = () => {
  let [list, setList] = useState<any>([]);
  useEffect(() => {
    microsegSegments({}).subscribe((res) => {
      let items = res.getItems().map((it) => {
        return {
          ...it,
          value: it.id,
          label: `${it.name}`,
        };
      });
      setList(items);
    });
  }, []);
  return list;
};
export const useGetClusterResourcesGroup = () => {
  const [value, setValue] = useLocalStorageState<any>('micro-ns-res', {
    defaultValue: [],
  });
  let clusters = useAssetsClusterList();
  let getClusterResourcesOp = useMemoizedFn(() => {
    if (!clusters || clusters.length == 0) return;
    Promise.all(
      clusters.map((item: any) => {
        let cluster = item.value;
        return new Promise((resolve) => {
          microsegSegments({ cluster }).subscribe((res) => {
            let items = res.getItems().map((it) => {
              return {
                ...it,
                value: it.id,
                label: `${it.name}`,
                isLeaf: true,
              };
            });
            item['children'] = items;
            item['disabled'] = !items.length;
            resolve('');
          });
        });
      }),
    ).then((res) => {
      setValue([...clusters]);
    });
  });
  useEffect(() => {
    getClusterResourcesOp();
  }, [clusters]);
  return value;
};
export const useMicroFun = (props: { callback: SetState<any> }) => {
  let { callback } = props;
  const [value, setValue] = useLocalStorageState<any>('micro', {
    defaultValue: {},
  });
  let getResourcesOp = useCallback((cluster) => {
    if (!cluster) return;
    let f = false;
    if (false && value['Resource']?.[cluster]) {
      callback(value);
      f = true;
    }
    new Promise((resolve) => {
      microsegNamespaces({ cluster: cluster }).subscribe((res) => {
        let nsList = res.getItems().map((ite) => {
          return {
            value: ite.name,
            label: ite.name,
            isLeaf: false,
          };
        });
        Promise.all(
          nsList.map((ite: any) => {
            return new Promise((re) => {
              let { value } = ite;
              microsegResources({ namespace: value, cluster }).subscribe((res) => {
                let items = res.getItems().map((it) => {
                  return {
                    ...it,
                    value: it.id,
                    label: `${it.name}(${it.kind})`,
                    isLeaf: true,
                    original: {
                      cluster: cluster,
                      kind: it.kind,
                      name: it.name,
                      namespace: value,
                    },
                  };
                });
                ite['children'] = items;
                ite['isLeaf'] = !items.length;
                ite['disabled'] = !items.length;
                re('');
              });
            });
          }),
        ).then((res) => {
          resolve(nsList);
        });
      });
    }).then((items) => {
      setValue((pre: any) => {
        return Object.assign(pre, {
          Resource: {
            [cluster]: items,
          },
        });
      });
      if (!f) {
        callback({
          Resource: {
            [cluster]: items,
          },
        });
      }
    });
  }, []);
  let getSegmentOp = useCallback((cluster) => {
    if (!cluster) return;
    let obj = {
      [cluster]: getClusterName(cluster),
    };
    microsegSegments().subscribe((res) => {
      res.getItems().forEach((it) => {
        obj[it.id] = it.name;
      });
      new Promise((resolve) => {
        microsegSegments().subscribe((res) => {
          let item = res.getItems();
          let treeData = arrayToTree(item, ['cluster', 'namespace', 'id'], obj);
          resolve(treeData);
        });
      }).then((items: any) => {
        let children = find(items, (item) => item.value == cluster)?.children || [];
        setValue((pre: any) => {
          return Object.assign(pre, {
            Segment: {
              [cluster]: children,
            },
          });
        });
        callback({
          Segment: {
            [cluster]: children,
          },
        });
      });
    });
  }, []);
  let getNamespaceOp = useCallback((cluster) => {
    if (!cluster) return;
    let f = false;
    if (false && value['Namespace']?.[cluster]) {
      callback(value);
      f = true;
    }
    microsegNamespaces({ cluster: cluster }).subscribe((res) => {
      let items = res.getItems().map((ite) => {
        return {
          value: ite.id,
          label: ite.name,
          isLeaf: true,
          original: {
            cluster: cluster,
            name: ite.name,
          },
        };
      });
      setValue((pre: any) => {
        return Object.assign(pre, {
          Namespace: {
            [cluster]: items,
          },
        });
      });
      if (!f) {
        callback({
          Namespace: {
            [cluster]: items,
          },
        });
      }
    });
  }, []);
  let getNamespaceGroupOp = useCallback((cluster) => {
    microsegNsgrps({ cluster: cluster }).subscribe((res) => {
      let items = res.getItems().map((ite) => {
        return {
          value: ite.id,
          label: ite.name,
          original: {
            cluster: cluster,
            name: ite.name,
          },
        };
      });
      callback({
        Nsgrp: {
          [cluster]: items,
        },
      });
    });
  }, []);
  let getIpgroups = useMemoizedFn((cluster) => {
    if(!cluster)return[]
    ipgroups({ cluster }).subscribe((res) => {
      let items = res.getItems().map((ite) => {
        return {
          value: ite.id,
          label: ite.name,
          ipSet: ite.ipSet,
          original: {
            cluster: cluster,
            name: ite.name,
          },
        };
      });
      callback({ IPBlock: { [cluster]: items } });
    });
  });
  return {
    getResourcesOp,
    getSegmentOp,
    getNamespaceOp,
    getNamespaceGroupOp,
    getIpgroups,
  };
};

export const deleteData = (type?: any) => {
  return new Promise((resolve, reject) => {
    TzConfirm({
      title: translations.unStandard.deletion_policy,
      okText: translations.confirm_modal_sure,
      cancelText: translations.cancel,
      onOk() {
        resolve(type);
      },
    });
  });
};
