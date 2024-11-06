import React, { useCallback, useEffect, useMemo, useState } from 'react';
import NoData from '../../components/noData/noData';
import { Store } from '../../services/StoreService';
import './MultiClusterRiskExplorerGraphDetails.scss';
import DetailTabImage from './MultiDetailsTab/DetailTabImage';
import DetailTabInfo from './MultiDetailsTab/DetailTabInfo';
import AssetTopAction from '../../components/AssetModule/TopActionBar';
import DetailTabNSInfo from './MultiDetailsTabNamespace/DetailTabInfo';
import { DetailTabNodeInfo } from './MultiDetailsTabNode/DetailTabInfo';
import { clusterAssetsNamespaces, getGraphOverall, nodesWithCountDetail } from '../../services/DataService';
import { tap } from 'rxjs/operators';
import { RiskExplorerOverall, WebResponse } from '../../definitions';
import { filterItemsGraph, getNSInfo, SearchObj } from './GraphResFilterHelper';
import { useLocation, useNavigate } from 'react-router-dom';
import { TzTabs } from '../../components/tz-tabs';
import { translations } from '../../translations/translations';
import { Routes } from '../../Routes';
import { TabsProps } from 'antd';
import { deepClone } from '../../helpers/until';
import { useMemoizedFn } from 'ahooks';
import useNewSearchParams from '../../helpers/useNewSearchParams';
import EventDataList from '../AlertCenter/EventDataList';
import ResourceYamlRisk from './ResourceYamlRisk';
import ImmuneDefense from './ImmuneDefense';

interface IProps {
  children?: any;
  history: any;
  location: any;
}

const breadPrevName: Record<string, string> = {
  resource: translations.resources,
  web: translations.clusterGraphList_web,
  database: translations.clusterGraphList_database,
  namespace: translations.activeDefense_ns,
  node: translations.host_name,
};
type TabType = 'namespace' | 'resource' | 'web' | 'database' | 'node';
// 数据库和web服务 相当于资源
const detailName: Record<string, string> = {
  resource: translations.runtimePolicy_resourceDetail,
  web: translations.runtimePolicy_resourceDetail,
  database: translations.runtimePolicy_resourceDetail,
  namespace: translations.clusterGraphList_namespace_detail,
  node: translations.compliances_breakdown_statusNameDetail,
};
const type2Prev: Record<TabType, string> = {
  namespace: 'namespaces',
  resource: 'resources',
  web: 'web',
  database: 'database',
  node: 'nodes',
};
const getBread = (type: TabType) => [
  {
    children: translations.sidebar_listView,
    href: Routes.ClustersOnlineVulnerabilitiesGraphList,
  },
  {
    children: breadPrevName[type],
    href: `${Routes.ClustersOnlineVulnerabilitiesGraphList}?tab=${type2Prev[type]}`,
  },
  {
    children: detailName[type],
  },
];
const ClustersGraphListScreens = (props: IProps) => {
  // 默认是基本信息
  const [paramData, setParamData] = useState<any>(undefined);
  const [paramObj, setParamObj] = useState<SearchObj>();
  const [nsList, setNSList] = useState<any[] | null>(null);
  const [navbarType, setNavbarType] = useState<string>();
  const navigate = useNavigate();
  const { allSearchParams } = useNewSearchParams();

  const {
    type: searchUrlType,
    NSName: searchUrlNSName,
    tab: searchUrlTab,
    ClusterID: searchClusterID,
    name: searchName,
  } = allSearchParams;
  useEffect(() => {
    setNavbarType(searchUrlTab ?? 'info');
  }, [searchUrlTab]);
  useEffect(() => {
    setParamData(undefined);
    setParamObj(undefined);
  }, [JSON.stringify(allSearchParams)]);

  const fatchNSList = useCallback((clusterId) => {
    clusterAssetsNamespaces({ clusterID: searchClusterID })
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.getItems();
          setNSList(items);
        }),
      )
      .subscribe();
  }, []);

  const initFatch = useCallback(() => {
    let autInfo = deepClone(allSearchParams);
    if (!searchClusterID) return;
    // const { type, NSName, tab } = autInfo;
    if (searchUrlType === 'container' || searchUrlType === 'pod') {
      // 新接口，特殊处理，页面内获取
      setParamData({});
      setParamObj(autInfo);
      return;
    }
    if (!searchUrlType || !searchUrlNSName) return;
    if (searchUrlType === 'namespace') {
      !nsList && fatchNSList(searchClusterID);
      if (!nsList || !nsList.length) return;
      const newAutInfo = getNSInfo(autInfo, nsList);
      autInfo = Object.assign(autInfo, newAutInfo);
    }
    if (searchUrlType === 'node') {
      nodesWithCountDetail({
        cluster_key: searchClusterID,
        name: searchUrlNSName,
      }).subscribe((res) => {
        if (res.error) return;
        const item = res.getItem();
        setParamData(item);
        setParamObj({ type: searchUrlType, ClusterID: searchClusterID });
      });
      return;
    }
    // 如果有其他tab项（如：关联事件等）
    getGraphOverall({
      clusterID: searchClusterID || '',
      apptype: searchUrlType === 'resource' ? '' : searchUrlType,
      namespace: allSearchParams.NSName,
      resource_kind: allSearchParams.kind,
      resource_name: allSearchParams.name,
    })
      .pipe(
        tap((res: WebResponse<RiskExplorerOverall>) => {
          const items = res.getItems();
          const { data, searchObj } = filterItemsGraph(items, autInfo);
          setParamData(data);
          setParamObj(searchObj);
        }),
      )
      .subscribe();
  }, [nsList, JSON.stringify(allSearchParams)]);

  const setHeader = useMemoizedFn(() => {
    setTimeout(() => {
      Store.breadcrumb.next(getBread(searchUrlType as TabType));
      Store.header.next({
        title: <AssetTopAction tagTitle={searchUrlType} {...getAssetTopActionProps(paramData || {})} />,
        footer: (
          <TzTabs
            key={searchUrlType}
            activeKey={navbarType}
            onChange={(key) => {
              setTimeout(() => {
                $('#layoutMain').scrollTop(0);
              }, 0);
              setNavbarType(key);
            }}
            items={getTab() as TabsProps['items']}
          />
        ),
        onBack: () => {
          navigate(-1);
        },
      });
    }, 0);
  });
  useEffect(() => {
    initFatch();
  }, [initFatch]);
  const getTabDetailInfo = useCallback(
    ({ node: Dom, customeParam, ...rest }: any) => {
      const validate = customeParam ? false : !paramObj || !paramData;
      return validate ? (
        <NoData />
      ) : (
        // <KeepAlive
        //   when
        //   id={`${searchName}Info`}
        //   name={`${searchName}Info`}
        //   cacheKey={`${searchName}Info`}
        //   saveScrollPosition="screen"
        // >
        <Dom
          // setHeader={setHeader}
          key={searchName}
          initFatch={initFatch}
          paramData={paramData}
          paramObj={paramObj}
          {...rest}
        />
        // </KeepAlive>
      );
    },
    [paramObj, paramData, searchName],
  );

  const getTab = useCallback(() => {
    const defaultTab: TabsProps['items'] = [
      {
        label: translations.clusterGraphList_navInfo,
        key: 'info',
        children: null,
      },
    ];
    if (['resource', 'web', 'database'].includes(searchUrlType)) {
      defaultTab.push({
        label: translations.clusterGraphList_navImage,
        key: 'image',
        children: null,
      });
    }
    if (['namespace', 'resource', 'Pod', 'container', 'node', 'web', 'database'].includes(searchUrlType)) {
      defaultTab.push({
        label: translations.security_events,
        key: 'security_events',
        children: null,
      });
    }
    if (['resource'].includes(searchUrlType)) {
      defaultTab.push(
        {
          label: translations.yaml_risk,
          key: 'yaml_risk',
          children: null,
        },
        {
          label: translations.immune_defense,
          key: 'immune_defense',
          children: null,
        },
      );
    }
    return defaultTab;
  }, [searchUrlType]);
  const TabPanel = useMemo(() => {
    const notCommonInfo: Record<string, any> = {
      node: { node: DetailTabNodeInfo, initFatch: fatchNSList },
      namespace: { node: DetailTabNSInfo, initFatch: fatchNSList },
    };
    if (navbarType === 'info') {
      return getTabDetailInfo(notCommonInfo[searchUrlType] ?? { node: DetailTabInfo });
    }
    if (navbarType === 'image') {
      return getTabDetailInfo({ node: DetailTabImage });
    }
    if (navbarType === 'security_events') {
      return getTabDetailInfo({
        node: EventDataList,
        customeParam: true,
        ...paramData,
        ...allSearchParams,
        className: 'mt20',
      });
    }
    if (navbarType === 'yaml_risk') {
      return <ResourceYamlRisk {...allSearchParams} />;
    }
    if (navbarType === 'immune_defense') {
      return <ImmuneDefense {...allSearchParams} />;
    }
    return <NoData />;
  }, [navbarType, getTabDetailInfo, fatchNSList, allSearchParams, searchUrlType]);

  const getAssetTopActionProps = useMemoizedFn((data) => {
    switch (searchUrlType) {
      case 'web':
      case 'database':
      case 'resource':
        return {
          nsTxt: data?.resourceName,
          replicaSet: data?.resourceKind,
        };
      case 'node':
        return {
          nsTxt: data?.HostName,
          activated: data?.nodeStatus,
        };

      case 'namespace':
        return {
          nsTxt: data?.namespaceName || searchUrlNSName,
        };

      default:
        return {};
    }
  });

  const l = useLocation();

  useEffect(setHeader, [navbarType, paramData, getTab, searchUrlType, l]);

  return <div className="detail-image-case mlr32">{TabPanel}</div>;
};

export default ClustersGraphListScreens;
