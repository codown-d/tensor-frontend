import { find, keys, random } from 'lodash';
import { TreeNode } from '../../components/ComponentsLibrary/TzCascader/interface';
import { RiskExplorerContainer, RiskExplorerOverall, RiskExplorerService } from '../../definitions';

export interface SearchObj {
  NSName?: string;
  name?: string;
  Alias?: string;
  Managers?: any[];
  Authority?: string;
  type?: string;
  ClusterID?: string;
  clusterId?: string;
  tab?: string;
}

export function graphItemsFilter(items: RiskExplorerOverall[], searchKeyword: string) {
  if (searchKeyword) {
    items = items.map((item) => {
      const resourcesList = item.resourcesList.filter((service: any) => {
        return service.resourceName.includes(searchKeyword);
      });

      const nameMatches = item.namespaceName.includes(searchKeyword);
      return {
        ...item,
        resourcesList: nameMatches ? item.resourcesList : resourcesList,
      };
    });
  }

  items = items
    .filter((item) => item.resourcesList.length)
    .sort((a, b) => {
      return b.resourcesList.length - a.resourcesList.length;
    });
  return items;
}

export function graphFilterCluster(
  items: RiskExplorerOverall[],
  searchKeyword: string,
  sorter?: { order: 'ascend' | 'descend'; columnKey: string } | undefined,
) {
  if (searchKeyword) {
    items = items
      .map((item: any) => {
        const resourcesList = item.resourcesList.filter((service: any) => {
          return service.resourceName.includes(searchKeyword);
        });

        const nameMatches =
          item.namespaceName.includes(searchKeyword) ||
          (item.Managers || []).join('').replaceAll(' ', '').includes(searchKeyword) ||
          item.Alias.includes(searchKeyword);

        return {
          ...item,
          resourcesList: nameMatches ? item.resourcesList : resourcesList,
        };
      })
      .filter((item) => item.resourcesList.length);
    // .filter((service: any) => {
    //   return (
    //     service.namespaceName.includes(searchKeyword) ||
    //     (service.Managers || [])
    //       .join('')
    //       .replaceAll(' ', '')
    //       .includes(searchKeyword) ||
    //     service.Alias.includes(searchKeyword)
    //   );
    // });
  }

  items = items.sort((a, b) => {
    return b.resourcesList.length - a.resourcesList.length;
  });

  if (sorter?.order) {
    const otherItems = items.filter((item: any) => !item[sorter.columnKey]);
    items = items
      .filter((item: any) => item[sorter.columnKey])
      .sort((a: any, b: any) => {
        const keyA = a[sorter.columnKey].toUpperCase();
        const keyB = b[sorter.columnKey].toUpperCase();
        if (sorter.order === 'ascend') {
          return keyA > keyB ? 1 : -1;
        }
        if (sorter.order === 'descend') {
          return keyB > keyA ? 1 : -1;
        }
        return 0;
      });
    items.push(...otherItems);
  }
  return items;
}

export function addEditAlias(items: RiskExplorerOverall[], nsList: any[]) {
  const nsObj: { [t: string]: any } = {};
  nsList.map((t) => {
    nsObj[t.Name] = t;
    return t;
  });
  items = items.map((item) => {
    const newNSValue = nsObj[item.namespaceName];
    if (newNSValue) {
      item = Object.assign(item, {
        Alias: newNSValue.Alias,
        Managers: newNSValue.Managers,
        Authority: newNSValue.Authority,
      });
    }
    return item;
  });
  return items;
}

export const getNSInfo = (autInfo: SearchObj, nsList: any[]) => {
  const { NSName } = autInfo;
  let objInfo: SearchObj = {};
  nsList.map((t) => {
    if (t.Name === NSName) {
      objInfo = Object.assign(objInfo, {
        Alias: t.Alias || '',
        Managers: t.Managers || [],
        Authority: t.Authority || '',
      });
    }
    return t;
  });
  return objInfo;
};

export function dealSearch(search: string) {
  let param: SearchObj = {};
  if (!search.length) {
    return param;
  }
  const paramItems = search.replace('?', '').split('&');
  paramItems.forEach((t) => {
    const objEntries = t.split('=');
    if (objEntries.length === 2) {
      param = Object.assign(param, {
        [objEntries[0]]: objEntries[1],
      });
    }
  });
  param['clusterId'] = param['clusterId'] || param['ClusterID'] || '';
  return param;
}

export function filterItemsGraph(items: RiskExplorerOverall[], searchObj: SearchObj) {
  const { NSName, type, name } = searchObj;
  let data: any = {};
  let searchItem = { ...searchObj };
  // namespace 的情况在外部处理了
  if (['resource', 'database', 'web'].includes(type + '')) {
    items.forEach(({ resourcesList }) => {
      if (keys(data).length == 0) {
        let node = find(resourcesList, (item) => {
          return item.resourceName === name && item.namespace === NSName;
        });
        data = node || {};
        searchItem = Object.assign(searchItem, {
          Alias: node?.alias || '',
          Managers: node?.managers || [],
          Authority: node?.authority || '',
        });
      }
    });
  } else {
    data = find(items, (item) => item.namespaceName === NSName) || {};
  }
  return { data, searchObj: searchItem };
}

export const randomNum = (n: number) => Math.floor(Math.random() * n);

export const randomAddStr = (t: string[], n: number, s: string) => {
  let i = 0;
  let o = '';
  while (i < n) {
    o = o + t[randomNum(4)];
    i++;
  }
  const ol = o.length;
  const sk = randomNum(ol);
  o = o.slice(0, sk) + s + o.slice(ol - sk);
  return o;
};

export function escapeString(str: string) {
  return str;
}

export function unescapeString(escapeStr: string) {
  // 解密: 去除所有添加字符
  return escapeStr
    .split('-')[0]
    .replace('escape', '')
    .replace('strAt', '')
    .replaceAll('%', '')
    .replaceAll('$', '')
    .replaceAll('*', '');
}

export const unfoldGraph = (items: RiskExplorerOverall[]) => {
  let item: RiskExplorerService[] = [];
  if (items.length) {
    items
      .sort((a, b) => {
        return b.resourcesList.length - a.resourcesList.length;
      })
      .map((t: any) => {
        t.resourcesList.map((p: any) => {
          p['clusterKey'] = t.clusterKey;
          item.push(p);
          return p;
        });
        return t;
      });
  }
  return item;
};

export const getTypeVersion = (items: RiskExplorerOverall[]) => {
  if (!items.length) {
    return [];
  }
  const res = items.reduce((t: TreeNode[], v) => {
    v.resourcesList.forEach((resource: RiskExplorerService) => {
      const { appTargetName, appTargetVersion } = resource;
      const item = t.find((item) => item.label === appTargetName);
      if (item) {
        !item.children.some((childrenItem: TreeNode) => childrenItem.label === appTargetVersion) &&
          item.children.push({ label: appTargetVersion, value: appTargetVersion });
      } else {
        t.push({
          label: appTargetName,
          value: appTargetName,
          children: [{ label: appTargetVersion, value: appTargetVersion }],
        });
      }
    });
    return t;
  }, []);
  return res;
};

export function filterResourceItem(
  items: RiskExplorerService[],
  searchKeyword: string,
  sorter?: { order: 'ascend' | 'descend'; columnKey: string } | undefined,
) {
  items = items.filter((service: any) => {
    return service.appTargetVersion || service.appType;
  });
  if (searchKeyword) {
    items = items.filter((service: any) => {
      return (
        service.webFrameVersion.includes(searchKeyword) || service.webType.includes(searchKeyword)
      );
    });
  }

  if (sorter?.order) {
    const otherItems = items.filter((item: any) => !item[sorter.columnKey]);
    items = items
      .filter((item: any) => item[sorter.columnKey])
      .sort((a: any, b: any) => {
        const keyA = a[sorter.columnKey];
        const keyB = b[sorter.columnKey];
        if (sorter.order === 'ascend') {
          return keyA.localeCompare(keyB);
        }
        if (sorter.order === 'descend') {
          return keyB.localeCompare(keyA);
        }
        return 0;
      });
    items.push(...otherItems);
  }
  return items;
}

export function filterDataBaseItem(
  items: RiskExplorerService[],
  searchKeyword: string,
  sorter?: { order: 'ascend' | 'descend'; columnKey: string } | undefined,
) {
  items = items.filter((service: any) => {
    if (service.appType === 'web') {
      return false;
    }
    return service.appType || service.appTargetVersion;
  });
  if (searchKeyword) {
    items = items.filter((service: any) => {
      return (
        service.appTargetName.includes(searchKeyword) ||
        service.resourceName.includes(searchKeyword)
      );
    });
  }

  if (sorter?.order) {
    const otherItems = items.filter((item: any) => !item[sorter.columnKey]);
    items = items
      .filter((item: any) => item[sorter.columnKey])
      .sort((a: any, b: any) => {
        const keyA = a[sorter.columnKey];
        const keyB = b[sorter.columnKey];
        if (sorter.order === 'ascend') {
          return keyA.localeCompare(keyB);
        }
        if (sorter.order === 'descend') {
          return keyB.localeCompare(keyA);
        }
        return 0;
      });
    items.push(...otherItems);
  }
  return items;
}
