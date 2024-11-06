import {
  CalicoRelation,
  Hierarchy,
  OnlineVulnerabilitiesFilterCount,
  OnlineVulnerability,
  RiskExplorerOverall,
  RiskExplorerService,
  ScanSeverity,
} from '../../../definitions';
import { initialFilters } from '../OnlineVulnerabilitiesFilters/OnlineVulnerabilitiesFilters';
import { correspondence } from '../OnlineVulnerabilitiesGraphList/OnlineFilterHelper';
import { leakProps } from '../../ImagesScanner/components/Image-scanner-detail/ImagesScannerDetail';
import { localLang } from '../../../translations/translations';
import { flatten, groupBy, random } from 'lodash';
import { deepClone } from '../../../helpers/until';

export function randomString(length: number) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function convertVulnerabilityToHireachy(items: OnlineVulnerability[] = []): Hierarchy {
  const data = groupBy(items, 'namespace');
  const namespaces = Object.keys(data);
  const environmentId = randomString(5);

  const result: any = namespaces.map((namespace) => {
    const namespaceId = randomString(5);
    const children = data[namespace].map((resource) => {
      const resourceId = randomString(5);
      const subchild: Hierarchy[] = [];

      let score = 0;
      if (resource.overallSeverity === ScanSeverity.Unknown) {
        score = 0;
      } else if (resource.overallSeverity === ScanSeverity.Negligible) {
        score = 1;
      } else if (resource.overallSeverity === ScanSeverity.Low) {
        score = 2;
      } else if (resource.overallSeverity === ScanSeverity.Medium) {
        score = 3;
      } else if (resource.overallSeverity === ScanSeverity.High) {
        score = 4;
      } else if (resource.overallSeverity === ScanSeverity.Critical) {
        score = 5;
      }

      let name = resource.resourceName || '';
      if (name.length > 15) {
        name = `${name.substr(0, 15)}...`;
      }

      subchild.push({
        name,
        value: random(500, 1000),
        score: score,
        namespace: resource.namespace,
        id: resourceId,
        resourceName: resource.resourceName,
        severity: resource.overallSeverity,
        resourceKind: resource.resourceKind,
        children: resource.runningContainers.map((v) => {
          const container = (v.includes('@') ? v.split('@')[0] : v) || '';
          const containerSha256 = (v.includes('@') ? v.split('@')[1] : v) || '';
          return {
            severity: resource.overallSeverity,
            namespace: resource.namespace,
            resourceName: resource.resourceName,
            resourceKind: resource.resourceKind,
            name: container,
            sha256: containerSha256,
            id: randomString(5),
            value: random(50, 200),
          };
        }),
      });

      return subchild;
    });

    return {
      name: namespace,
      id: namespaceId,
      children: flatten(children),
    };
  });

  return {
    name: 'environment',
    namespace: 'none',
    id: environmentId,
    children: result,
  };
}

export function getThreshold(items: RiskExplorerOverall[] = []): number {
  let threshold = 0;
  items.map((namespace) => {
    threshold += namespace.resourcesList.length;
  });
  return threshold;
}

export function convertRiskExplorerOverallToHireachyGroupZoom2(
  items: RiskExplorerOverall[] = [],
  ratio: number,
  expandObjKey: any = {},
): Hierarchy {
  const limitCount = 30;

  const result: any = items.map((namespace) => {
    const typeData: any = {};
    const oKeys = expandObjKey[namespace.namespaceName];

    const subchild = namespace.resourcesList.map((resource: any) => {
      let scanSeverityNumber = leakProps.findIndex(
        (item) => resource.finalSeverity.toUpperCase() === item.type.toUpperCase(),
      );
      scanSeverityNumber = scanSeverityNumber === -1 ? 0 : scanSeverityNumber;

      const score = 2;
      let name = resource.resourceName || '';
      if (name.length > 15) {
        name = `${name.substr(0, 15)}...`;
      }
      return {
        name,
        value: 1,
        score,
        id: resource.resourceName,
        original: resource,
        severity: resource.finalSeverity,
        scanSeverityNumber,
        children: [],
      };
    });

    const iItems: Hierarchy[] = [];
    let limitArr: any[] = [];
    let otherArr: any[] = [];
    if (ratio <= 0.6) {
      subchild.filter((t) => {
        const skey = t.severity || ScanSeverity.Unknown;
        let open = false;
        if (oKeys && oKeys[skey] === 'open') {
          open = true;
        }
        typeData[skey] ||
          (typeData[skey] = {
            isOpen: open,
            groupTypeData: [],
            num: 0,
          });
        t.scanSeverityNumber && limitArr.push(t);
        !t.scanSeverityNumber && otherArr.push(t);

        typeData[skey].groupTypeData.push(t);
        typeData[skey].num += 1;
        return t.severity;
      });

      if (otherArr.length && limitArr.length < limitCount) {
        const exlist = otherArr.slice(0, limitCount - limitArr.length);
        limitArr.push(...exlist);
      }
      Object.keys(typeData).map((t) => {
        if (typeData[t].num && !typeData[t].isOpen) {
          const val = typeData[t];
          const severityCircle = {
            name: String(val.num),
            value: 1,
            score: 2,
            id: `${t}_${randomString(3)}`,
            original: val.groupTypeData,
            severity: t,
            children: [],
            isOpen: val.isOpen,
            type: 'group',
          };
          iItems.push(severityCircle);
        } else {
          iItems.push(...typeData[t].groupTypeData);
          // iItems.push(...limitArr);
        }
      });
    }

    const children: any = ratio <= 0.6 ? iItems : subchild;

    return {
      name: namespace.namespaceName,
      id: '#',
      children: flatten(children),
    };
  });

  return {
    name: 'environment',
    namespace: 'none',
    id: '#root1',
    children: result,
  };
}

export function convertRiskExplorerOverallToHireachyGroupZoom(
  items: RiskExplorerOverall[] = [],
  // ratio: number,
  expandObjKey: any = {},
): Hierarchy {
  const result: any = items.map((namespace) => {
    const typeData: any = {};
    const oKeys = expandObjKey[namespace.namespaceName];

    const subchild = namespace.resourcesList.map((resource: any) => {
      let name = resource.resourceName || '';
      if (name.length > 15) {
        name = `${name.substr(0, 15)}...`;
      }
      return {
        name,
        value: 1,
        score: 2,
        id: resource.resourceName,
        original: resource,
        severity: resource.finalSeverity,
        children: [],
      };
    });

    const iItems: Hierarchy[] = [];

    // if (ratio <= 0.6) {
    subchild.filter((t) => {
      const skey = t.severity || ScanSeverity.Unknown;
      let open = false;
      if (oKeys && oKeys[skey] === 'open') {
        open = true;
      }
      typeData[skey] ||
        (typeData[skey] = {
          isOpen: open,
          groupTypeData: [],
          num: 0,
        });

      typeData[skey].groupTypeData.push(t);
      typeData[skey].num += 1;
      return t.severity;
    });

    Object.keys(typeData).map((t) => {
      if (typeData[t].num && !typeData[t].isOpen) {
        const val = typeData[t];
        const severityCircle = {
          name: String(val.num),
          value: 1,
          score: 2,
          id: `${t}_${randomString(3)}`,
          original: val.groupTypeData,
          severity: t,
          children: [],
          isOpen: val.isOpen,
          type: 'group',
        };
        iItems.push(severityCircle);
      } else {
        iItems.push(...typeData[t].groupTypeData);
      }
    });
    // }

    const children: any = true ? iItems : subchild;

    let nsn = 12;
    let nsName = namespace.namespaceName;
    if (nsName.length > nsn) {
      nsName = `${nsName.substring(0, nsn)}...`;
    }

    return {
      name: nsName,
      id: namespace.namespaceName,
      children: flatten(children),
    };
  });

  return {
    name: 'environment',
    namespace: 'none',
    id: '#root1',
    children: result,
  };
}

export function convertRiskExplorerOverallToHireachyGroup(
  items: RiskExplorerOverall[] = [],
  expandObjKey: any = {},
): Hierarchy {
  const limitCount = 1;
  const limitSafeCount = 20;

  const result: any = items.map((namespace) => {
    const typeData: any = {};
    const oKeys = expandObjKey[namespace.namespaceName];

    const subchild = namespace.resourcesList.map((resource: any) => {
      const score = 2;
      let name = resource.resourceName || '';
      if (name.length > 15) {
        name = `${name.substr(0, 15)}...`;
      }
      return {
        name,
        value: 1,
        score,
        id: resource.resourceName,
        original: resource,
        severity: resource.finalSeverity,
        children: [],
      };
    });

    const severityArrayList = subchild.filter((t) => {
      const skey = t.severity;
      let open = false;
      if (oKeys && oKeys[skey] === 'open') {
        open = true;
      }
      !!skey &&
        (typeData[skey] ||
          (typeData[skey] = {
            isOpen: open,
            groupTypeData: [],
            num: 0,
          }));
      if (skey) {
        typeData[skey].groupTypeData.push(t);
        typeData[skey].num += 1;
      }
      return t.severity;
    });
    const otherArr = subchild.filter((t) => !t.severity).slice(0, limitSafeCount);

    const iItems: Hierarchy[] = [];
    Object.keys(typeData).map((t) => {
      if (typeData[t].num >= limitCount && !typeData[t].isOpen) {
        const val = typeData[t];
        const severityCircle = {
          name: String(val.num),
          value: 1,
          score: 2,
          id: `${t}_${randomString(3)}`,
          original: val.groupTypeData,
          severity: t,
          children: [],
          isOpen: val.isOpen,
          type: 'group',
        };
        iItems.push(severityCircle);
      } else {
        iItems.push(...typeData[t].groupTypeData);
      }
    });

    const children: any = [...iItems, ...otherArr];

    return {
      name: namespace.namespaceName,
      id: '#',
      children: flatten(children),
    };
  });

  return {
    name: 'environment',
    namespace: 'none',
    id: '#root',
    children: result,
  };
}

export function convertRiskExplorerOverallToHireachy(
  items: RiskExplorerOverall[] = [],
  node: any = { original: {} },
  width: number,
): Hierarchy {
  const limitCount = 30;
  const { resourceName = '', namespace = '' } = node?.original;
  const sID = resourceName && namespace ? `#${namespace}/${resourceName}` : '';

  const result: any = items.map((namespace) => {
    const list = namespace.resourcesList.map((item) => {
      let scanSeverityNumber = leakProps.findIndex(
        (ite) => item.finalSeverity.toUpperCase() === ite.type.toUpperCase(),
      );
      scanSeverityNumber = scanSeverityNumber === -1 ? 0 : scanSeverityNumber;
      return {
        ...item,
        scanSeverityNumber,
      };
    });

    list.sort((a, b) => {
      return b.scanSeverityNumber - a.scanSeverityNumber;
    });

    const limitArr = list.filter((t) => t.scanSeverityNumber);
    const otherArr = list.filter((t) => !t.scanSeverityNumber);

    if (otherArr.length && limitArr.length < limitCount) {
      const exlist = otherArr.slice(0, limitCount - limitArr.length);
      limitArr.push(...exlist);
    }
    const children = limitArr.map((resource: any) => {
      const subchild: Hierarchy[] = [];

      const score = 2;
      // fade:搜索标识，seled弹框选中标识
      // true:隐藏显示，false:正常显示

      let name = resource.resourceName || '';
      let n = width >= 980 ? 12 : 12;
      if (name.length > n) {
        name = `${name.substr(0, n)}...`;
      }

      let rID = `#${resource.namespace}/${resource.resourceName}`;

      subchild.push({
        name,
        value: 1,
        score,
        fade: !!resource?.fade,
        seled: sID ? !(sID === rID) : false,
        id: resource.resourceName,
        original: resource,
        severity: resource.finalSeverity,
        // children: resource.containerList.map((v: any) => {
        //   return {
        //     namespace: v.resourceName,
        //     name: v.resourceName,
        //     id: randomString(5),
        //     value: 100,
        //     original: v,
        //   };
        // }),
        children: [],
      });

      return subchild;
    });

    let nsn = 12;
    let nsName = namespace.namespaceName;
    if (nsName.length > nsn) {
      nsName = `${nsName.substring(0, nsn)}...`;
    }

    return {
      name: nsName,
      id: namespace.namespaceName,
      children: flatten(children),
    };
  });

  return {
    name: 'environment',
    namespace: 'none',
    id: '#root',
    children: result,
  };
}

export function convertMockSegmentsDataToHireachy(items: any[] = []): Hierarchy {
  const result: any = items.map((ns) => {
    const { type, resource } = ns;
    return {
      name: ns.name,
      type: ns.type,
      id: `u${ns.id}`,
      value: 1,
      kind: ns.kind,
      children:
        type === 'segment'
          ? resource.map((t: any) => {
              const { name } = t;
              if (name.length > 15) {
                t.name = `${name.substr(0, 15)}...`;
              }
              t.value || (t.value = 2);
              t.id = `u${t.id}`;
              return t;
            })
          : [],
    };
  });

  return {
    name: 'environment',
    namespace: 'none',
    id: '#root',
    children: result,
  };
}

export function convertNamespaceToHireachy(items: any[] = []): Hierarchy {
  const result: any = items.map((ns) => {
    const segments = ns.segments || [];
    const { id: nsID, name: nsName, namespace: nsNamespace, kind: nsKind } = ns;
    const children = segments.map((segment: any) => {
      const { name: sname, id: sid, type: stype, resource, kind: _skind } = segment;

      const subchild: Hierarchy[] = [];

      let name = sname || '';
      if (name.length > 15) {
        name = `${name.substr(0, 15)}...`;
      }

      subchild.push({
        name,
        value: 1,
        id: 'u' + sid,
        type: stype,
        original: segment,
        kind: _skind,
        children:
          stype === 'segment'
            ? resource.map((v: any) => {
                return {
                  namespace: v.namespace,
                  name: v.name,
                  id: 'u' + v.id,
                  type: v.type,
                  value: 2,
                  original: v,
                };
              })
            : [],
      });

      return subchild;
    });

    return {
      namesapce: nsNamespace,
      name: nsName,
      id: nsID,
      kind: nsKind || '',
      children: flatten(children),
    };
  });

  return {
    name: 'environment',
    namespace: 'none',
    id: '#root',
    children: result,
  };
}

export function convertCalicoRelationToHireachy(items: CalicoRelation[] = []): Hierarchy {
  const result: any = items.map((ns) => {
    const children = ns.segments?.map((segment) => {
      const subchild: Hierarchy[] = [];

      const score = 2;

      let name = segment.name || '';
      if (name.length > 15) {
        name = `${name.substr(0, 15)}...`;
      }

      subchild.push({
        name,
        value: 1,
        score,
        // id: `${ns.name}_${segment.name}`,
        id: `${segment.id}`,
        original: segment,
        severity: '',
        color: 'hsl(' + Math.random() * 360 + ',15%,50%)',
        children:
          segment.resources &&
          segment.resources.map((v: any) => {
            v = Object.assign({}, v, {
              namespace: ns.namespace,
            });
            return {
              name: v.name,
              namespace: ns.namespace,
              value: 2,
              id: v.id,
              type: v.type,
              original: v,
            };
          }),
      });

      return subchild;
    });
    return {
      name: ns.name,
      namespace: ns.namespace,
      original: ns,
      id: ns.id,
      children: flatten(children),
    };
  });

  return {
    name: 'environment',
    namespace: 'none',
    id: '#root',
    children: result,
  };
}

interface typeCount {
  [t: string]: number;
}

export function calculateStatsForFilter(
  items: RiskExplorerOverall[],
): OnlineVulnerabilitiesFilterCount {
  const services: RiskExplorerService[] = [];
  // 接口数据的中额外风险类型
  const newNumCount: typeCount = {};

  !items['length'] ||
    items.forEach((item) => {
      !item['resourcesList'] ||
        item.resourcesList.forEach((service, key) => {
          const { tag } = service;
          Object.keys(tag).map((k) => {
            newNumCount[k] || (newNumCount[k] = 0);
            newNumCount[k] += 1;
            return k;
          });
          services.push(service);
        });
    });
  const res = Object.keys(initialFilters).reduce((a, b) => {
    const len = services.filter((service) => correspondence(b, service)).length;
    a[b] = len;
    return a;
  }, {} as any);

  return Object.assign(res, newNumCount, {
    edgeService: 0,
    internalService: services.length,
  }); // 由于没有筛选条件，所以暂时置为0
}

export function addNewTyprFilter(items: RiskExplorerOverall[]): any {
  let newTypes: {
    [t: string]: { displayZh: string; displayEn: string; key: string };
  } = {};

  !items['length'] ||
    items.forEach((item) => {
      !item['resourcesList'] ||
        item.resourcesList.forEach((service) => {
          const { tag } = service;
          newTypes = Object.assign(newTypes, tag);
        });
    });

  let newEventType: any = {};
  const newEventTypeData = Object.keys(newTypes).map((t) => {
    newEventType = Object.assign(newEventType, {
      [t]: false,
    });
    return {
      field: t,
      label: localLang === 'zh' ? newTypes[t].displayZh : newTypes[t].displayEn,
    };
  });
  return { newEventType, newEventTypeData };
}

export function dealRepeatArray(oldArr: any[], newArr: any[]): any[] {
  let keyObj: any = {};
  const allArray = [...oldArr, ...newArr];
  allArray.map((t) => {
    keyObj = Object.assign(keyObj, {
      [t.field]: t,
    });
    return t;
  });
  return Object.values(keyObj);
}
