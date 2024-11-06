import { useEffect, useState } from 'react';
import { SupportedLangauges } from '../definitions';
import {
  clusterAssetsNamespaces,
  clusterGraphResources,
  detectPolicyList,
  getRegistrieLibrary,
  palaceRules,
  registryProject,
  sensitiveRuleList,
} from './DataService';
import { tabType } from '../screens/ImagesScanner/ImagesScannerScreen';
import { configTypeEnum } from '../screens/ImagesScanner/ImageConfig/ImageScanConfig';
import { TzCascaderOptionProps } from '../components/ComponentsLibrary/TzCascader/interface';
import { useAssetsClusterList } from '../helpers/use_fun';
import { translations } from '../translations';

export function useRegistryProject(imageFromType?: tabType) {
  let [registryProjectList, setRegistryProject] = useState<any>([]);
  useEffect(() => {
    registryProject({ imageFromType: imageFromType || tabType.registry }).subscribe((res) => {
      let items = res.getItems();
      setRegistryProject(items);
    });
  }, []);
  return registryProjectList;
}
export function useDetectPolicyList(policyType?: configTypeEnum) {
  let [detectPolicyListArr, setDetectPolicyList] = useState<any>([]);
  useEffect(() => {
    const params = {
      offset: 0,
      limit: 1000000,
      policyType: policyType,
    };
    detectPolicyList(params).subscribe((res) => {
      let items = res.getItems().map((item) => {
        return {
          label: item.name,
          value: item.uniqueID,
        };
      });
      setDetectPolicyList(items);
    });
  }, []);
  return detectPolicyListArr;
}
export function getCurrentLanguage(): SupportedLangauges {
  return (localStorage.getItem('language') as SupportedLangauges.Chinese) || 'zh';
}
export const useGetLibrary = (key?: string) => {
  const [res, setres] = useState<any>([]);
  useEffect(() => {
    getRegistrieLibrary().subscribe((res) => {
      setres(
        res?.map((item: any) => {
          return {
            label: `${item.name}(${item.url})`,
            value: key === 'url' ? item.url : item.id,
          };
        }),
      );
    });
  }, []);
  return res;
};
export const useGetSensitiveRuleList = () => {
  const [dataSourceSensitiveRule, setDataSourceSensitiveRule] = useState<any>([]);
  useEffect(() => {
    sensitiveRuleList({ limit: 10000 }).subscribe((res) => {
      let items = res.getItems();
      setDataSourceSensitiveRule(
        items?.map(({ value, description }) => ({ value, label: `${value}(${description})` })),
      );
    });
  }, []);
  return dataSourceSensitiveRule;
};
export const unAllowWhitelist = ['apparmor', 'seccompProfile', 'imageSecurity', 'kubeMonitor']; //文件访问控制//系统调用异常//镜像安全,集群风险监控

export const useGetPalaceRules = () => {
  const [palaceRulesList, setPalaceRules] = useState<any>([]);
  const [rulesTitle, setRulesTitle] = useState<any>({});
  useEffect(() => {
    palaceRules().subscribe((res: any) => {
      let items = res.getItems();
      let re = (list: any, pTitle: any) => {
        for (let o of list || []) {
          o['value'] = o['key'];
          o['label'] = o['title'];
          o['pTitle'] = pTitle;
          re(o.children, o.title);
        }
      };
      re(items, null);
      setRulesTitle(
        items.reduce((pre: { [x: string]: any }, item: { key: string | number; title: any }) => {
          pre[item.key] = item.title;
          return pre;
        }, {}),
      );
      setPalaceRules(
        items.filter((item: { key: string }) => {
          return !unAllowWhitelist.includes(item.key);
        }),
        // .sort((a: any, b: any) => {
        //   return b.children.length - a.children.length;
        // }),
      );
    });
  }, []);
  return { palaceRulesList, rulesTitle };
};
export const useGetCascaderResources = (p: { showExplain?: boolean }) => {
  let { showExplain = false } = p;
  const [resourceList, setOptions] = useState<TzCascaderOptionProps[]>([]);
  let clusters = useAssetsClusterList();

  useEffect(() => {
    clusters.length &&
      Promise.all(
        clusters.map((item: any) => {
          return new Promise((resolve) => {
            clusterAssetsNamespaces({ clusterID: item.value }).subscribe((res) => {
              let nsList = res.getItems().map((ite) => {
                return {
                  value: ite.Name,
                  label: ite.Name,
                  namespace: ite.Name,
                  clusterID: ite.ClusterKey,
                  isLeaf: false,
                };
              });
              Promise.all(
                nsList.map((ite: any) => {
                  return new Promise((re) => {
                    let { namespace, clusterID } = ite;
                    clusterGraphResources(
                      {
                        offset: 0,
                        limit: 10000,
                      },
                      { namespace, clusterID },
                    ).subscribe((res) => {
                      let items = res.getItems().map((it) => {
                        return {
                          value: `${it.name}(${it.kind})`,
                          label: `${it.name}(${it.kind})`,
                          isLeaf: true,
                        };
                      });
                      ite['children'] = items;
                      ite['isLeaf'] = !items.length;
                      if (!items.length && showExplain) {
                        ite['disabled'] = true;
                        ite['explain'] = translations.no_resources_choose;
                      }
                      re('');
                    });
                  });
                }),
              ).then((res) => {
                item['children'] = nsList;
                item['isLeaf'] = !nsList.length;
                resolve(nsList);
              });
            });
          });
        }),
      ).then((res) => {
        setOptions([...clusters]);
      });
  }, [clusters]);
  return resourceList;
};
