import {
  OnlineVulnerabilitiesFilterOptions,
  RiskExplorerOverall,
  RiskExplorerService,
  ScanSeverity,
  ScanSeverityToNum,
} from '../../../definitions';
import {
  eventTypes,
  EventTypesDef,
  levelTypes,
  nodeTypes,
} from '../OnlineVulnerabilitiesFilters/OnlineVulnerabilitiesFilters';

export const correspondence = (
  filterName: string,
  service: RiskExplorerService
) => {
  const { finalSeverity, tag } = service;
  switch (filterName) {
    // 风险等级
    case 'criticalLevel':
      return finalSeverity === ScanSeverity.Critical;
    case 'highLevel':
      return finalSeverity === ScanSeverity.High;
    case 'mediumLevel':
      return finalSeverity === ScanSeverity.Medium;
    case 'lowLevel':
      return finalSeverity === ScanSeverity.Low;
    case 'negligibleLevel':
      return finalSeverity === ScanSeverity.Negligible;
    case 'unknownLevel':
      return !finalSeverity || finalSeverity === ScanSeverity.Unknown;

    // 风险类型
    // case 'imageVulnerabilities':
    //   return (tag.ImageVulnerabilities || 0) > 0;
    // case 'applicationVulnerabilities':
    //   return (tag.ExploitRisk || 0) > 0;
    // case 'runtimeThreats':
    //   return (tag.RuntimeDetection || 0) > 0;
    case 'noThreats':
      return !tag || Object.keys(tag || {}).length === 0;

    // 节点类型（内部、外部）
    case 'edgeService':
      return true;
    case 'internalService':
      return true;
    default:
      if (tag[filterName]) {
        return true;
      }
      return false;
  }
};

export function vulnerabilitiesFilter(
  items: RiskExplorerOverall[],
  searchKeyword: string,
  filters?: OnlineVulnerabilitiesFilterOptions,
  eventTypesFilter?: EventTypesDef
) {
  if (searchKeyword) {
    items = items
      .map((item) => {
        let resourcesList = item.resourcesList.map((service) => {
          return {
            ...service,
            fade: !service.resourceName.includes(searchKeyword),
          };
        });

        const nameMatches = item.namespaceName.includes(searchKeyword);

        return {
          ...item,
          resourcesList: nameMatches ? item.resourcesList : resourcesList,
        };
      })
      .filter((item) => item.resourcesList.length);
  }

  if (filters) {
    const _filters = filters as any;
    const levelTypeFilters = Object.keys(levelTypes).reduce((a, b) => {
      a[b] = !!_filters[b];
      return a;
    }, {} as any);
    const levelTypeMinExistOne = Object.keys(levelTypeFilters).some(
      (k) => levelTypeFilters[k]
    );
    const nodeTypeFilters = Object.keys(nodeTypes).reduce((a, b) => {
      a[b] = !!_filters[b];
      return a;
    }, {} as any);
    const nodeTypeMinExistOne = Object.keys(nodeTypeFilters).some(
      (k) => nodeTypeFilters[k]
    );
    const eventTypeFilters = Object.keys(eventTypes).reduce((a, b) => {
      a[b] = !!_filters[b];
      return a;
    }, {} as any);
    const eventTypeMinExistOne = Object.keys(eventTypeFilters).some(
      (k) => eventTypeFilters[k]
    );

    items = items.map((item) => {
      const resourcesList = item.resourcesList.filter((service) => {
        const satisfyLevel = Object.keys(levelTypeFilters).some((k) => {
          return levelTypeFilters[k] && correspondence(k, service);
        });
        const satisfyNodeType = Object.keys(nodeTypeFilters).some((k) => {
          return nodeTypeFilters[k] && correspondence(k, service);
        });
        const satisfyEventType = Object.keys(eventTypeFilters).some((k) => {
          return eventTypeFilters[k] && correspondence(k, service);
        });

        return (
          (levelTypeMinExistOne ? satisfyLevel : true) &&
          (nodeTypeMinExistOne ? satisfyNodeType : true) &&
          (eventTypeMinExistOne ? satisfyEventType : true)
        );
      });
      return {
        ...item,
        resourcesList,
      };
    });
  }

  items = items.filter((item) =>
    item['resourcesList'] ? item.resourcesList.length : 0
  );

  return items;
}

export function vulnerabilitiesSearch(items: any[], searchKeyword: string) {
  let resources: any[] = [];
  if (searchKeyword) {
    items = items.map((item) => {
      let resourcesList = item.children.filter((service: any) => {
        return service.original.resourceName.includes(searchKeyword);
      });

      const nameMatches = item.name.includes(searchKeyword);
      let res = nameMatches ? item.children : resourcesList;

      resources.push(...res);
      return item;
    });
  }
  resources = resources.sort((a: any, b: any) => {
    let severityNumA: any =
      ScanSeverityToNum[a.original.finalSeverity || 'Unknown'];
    let severityNumB: any =
      ScanSeverityToNum[b.original.finalSeverity || 'Unknown'];
    if (severityNumB === severityNumA) {
      if (a.original.namespace === b.original.namespace) {
        return a.original.resourceName.localeCompare(b.original.resourceName);
      }
      return a.original.namespace.localeCompare(b.original.namespace);
    }
    return severityNumB - severityNumA;
  });
  return resources;
}

export function vulnerabilitiesImageNum(
  items: RiskExplorerService[],
  obj: any
) {
  let numData: any = {};
  items.map((item) => {
    let k = item.resourceName;
    if (obj?.[k]) {
      numData[k] = obj[k];
    }
    return item;
  });
  return numData;
}
