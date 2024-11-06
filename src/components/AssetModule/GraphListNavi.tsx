import React, { useEffect, useState, useMemo } from 'react';
import classNames from 'classnames';
import './GraphListNavi.scss';
import { Resources } from '../../Resources';
import EllipsisPopover from '../ellipsisPopover/ellipsisPopover';
import {
  assetsEndpoints,
  assetsIngresses,
  assetsNamespaceLabels,
  assetsPvcs,
  assetsPvs,
  assetsSecrets,
  assetsServices,
  getApisCount,
  getGraphAllTypeCount,
  getListClusters,
  assetsWebServeList,
  assetsDatabaseList,
  assetsWebsiteList,
  assetsRunAppList,
  getVisibleTags,
  getAssetsInTag,
} from '../../services/DataService';
import { translations } from '../../translations/translations';
import { Routes } from '../../Routes';
import { useLocation, useNavigate } from 'react-router-dom';
import { TzCol, TzRow } from '../tz-row-col';
import useNewSearchParams from '../../helpers/useNewSearchParams';
import { useNavigatereFresh } from '../../helpers/useNavigatereFresh';
import AssetWebServe from '../../screens/MultiClusterRiskExplorer/AssetWebServe';
import useListClusters from '../../screens/MultiClusterRiskExplorer/useListClusters';
import API from '../../screens/MultiClusterRiskExplorer/ListComponent/API';
import ClusterList from '../../screens/MultiClusterRiskExplorer/ListComponent/Cluster';
import ContainerTable from '../../screens/MultiClusterRiskExplorer/ListComponent/Container';
import Database from '../../screens/MultiClusterRiskExplorer/AssetDataBase';
import NodeListTable from '../../screens/MultiClusterRiskExplorer/ListComponent/Node';
import NSListTable from '../../screens/MultiClusterRiskExplorer/ListComponent/NS';
import PodListTable from '../../screens/MultiClusterRiskExplorer/ListComponent/Pod';
import ResourceListTable from '../../screens/MultiClusterRiskExplorer/ListComponent/Resource';
import AssetEndpoints from '../../screens/MultiClusterRiskExplorer/AssetEndpoints';
import AssetIngress from '../../screens/MultiClusterRiskExplorer/AssetIngress';
import AssetLabel from '../../screens/MultiClusterRiskExplorer/AssetLabel';
import AssetPV from '../../screens/MultiClusterRiskExplorer/AssetPV';
import AssetPVC from '../../screens/MultiClusterRiskExplorer/AssetPVC';
import AssetSecret from '../../screens/MultiClusterRiskExplorer/AssetSecret';
import AssetService from '../../screens/MultiClusterRiskExplorer/AssetService';
import AssetWebSite from '../../screens/MultiClusterRiskExplorer/AssetWebSite';
import { useMemoizedFn } from 'ahooks';
import { Store } from '../../services/StoreService';
import AssetRunApp from '../../screens/MultiClusterRiskExplorer/AssetRunApp';
import { TzButton } from '../tz-button';
import { useBatchLabelContext, AllAssetTag, IAssetTopTag, translateBuildInTag } from '../../components/label-col';
import NoData from '../noData/noData';
import TopTags from './TopTags';

export const useAssetsModule = () => {
  const childrenProps = useListClusters();
  const mockDataNew: any = useMemo(() => {
    const AssetMap: Record<string, any> = {
      cluster: {
        fn: getListClusters,
        op: { offset: 0, limit: 1 },
        img: Resources.GraphCluster,
        txt: translations.clusterGraphList_cluster,
        // type: 'k8s_assets',
        children: <ClusterList rowKey="key" />,
        // 服务端的唯一id
        serveId: 'key',
        assetType: 'cluster',
      },
      namespaces: {
        fn: getGraphAllTypeCount,
        op: 'namespaces',
        img: Resources.GraphNamespace,
        txt: translations.clusterGraphList_namespaces,
        // type: 'k8s_assets',
        children: <NSListTable {...childrenProps} rowKey="id" />,
        serveId: 'id',
        assetType: 'namespace',
      },
      resources: {
        fn: getGraphAllTypeCount,
        op: 'resources',
        img: Resources.GraphResource,
        txt: translations.clusterGraphList_resources,
        // type: 'k8s_assets',
        children: <ResourceListTable {...childrenProps} rowKey="id" />,
        serveId: 'id',
        assetType: 'resource',
      },
      pods: {
        fn: getGraphAllTypeCount,
        op: 'pods',
        img: Resources.GraphPod,
        txt: translations.clusterGraphList_pods,
        // type: 'k8s_assets',
        children: <PodListTable {...childrenProps} rowKey="id" />,
        serveId: 'id',
        assetType: 'pod',
      },
      rawContainers: {
        fn: getGraphAllTypeCount,
        op: 'rawContainers',
        img: Resources.GraphContainer,
        txt: translations.clusterGraphList_container,
        // type: 'k8s_assets',
        children: <ContainerTable {...childrenProps} rowKey="id" />,
        serveId: 'id',
        assetType: 'container',
      },
      Service: {
        fn: assetsServices,
        op: {
          cluster_key: '',
          offset: 0,
          limit: 1,
        },
        img: Resources.service,
        txt: 'Service',
        // type: 'k8s_assets',
        children: <AssetService title={'Service'} rowKey="id" />,
        serveId: 'id',
        assetType: 'service',
      },
      Endpoints: {
        fn: assetsEndpoints,
        op: {
          cluster_key: '',
          offset: 0,
          limit: 1,
        },
        img: Resources.endpoints,
        txt: 'Endpoints',
        // type: 'k8s_assets',
        children: <AssetEndpoints title={'Endpoints'} rowKey="id" />,
        serveId: 'id',
        assetType: 'endpoints',
      },
      Ingress: {
        fn: assetsIngresses,
        op: {
          cluster_key: '',
          offset: 0,
          limit: 1,
        },
        img: Resources.ingress,
        txt: 'Ingress',
        // type: 'k8s_assets',
        children: <AssetIngress title={'Ingress'} rowKey="id" />,
        serveId: 'id',
        assetType: 'ingress',
      },
      apis: {
        fn: getApisCount,
        op: '',
        img: Resources.GraphApi,
        txt: 'API',
        // type: 'k8s_assets',
        children: <API {...childrenProps} rowKey="id" />,
        serveId: 'id',
        assetType: 'api',
      },
      Secret: {
        fn: assetsSecrets,
        op: {
          cluster_key: '',
          offset: 0,
          limit: 1,
        },
        img: Resources.secret,
        // type: 'k8s_assets',
        txt: 'Secret',
        children: <AssetSecret title={'Secret'} rowKey="id" />,
        serveId: 'id',
        assetType: 'secret',
      },
      PV: {
        fn: assetsPvs,
        op: {
          cluster_key: '',
          offset: 0,
          limit: 1,
        },
        img: Resources.pv,
        txt: 'PV',
        // type: 'k8s_assets',
        children: <AssetPV title={'PV'} rowKey="id" />,
        serveId: 'id',
        assetType: 'pv',
      },
      PVC: {
        fn: assetsPvcs,
        op: {
          cluster_key: '',
          offset: 0,
          limit: 1,
        },
        img: Resources.pvc,
        txt: 'PVC',
        // type: 'k8s_assets',
        children: <AssetPVC title={'PVC'} rowKey="id" />,
        serveId: 'id',
        assetType: 'pvc',
      },
      label: {
        fn: assetsNamespaceLabels,
        op: {
          cluster_key: '',
          offset: 0,
          limit: 1,
        },
        img: Resources.label,
        txt: translations.asset_discovery_label,
        // type: 'k8s_assets',
        children: <AssetLabel title={translations.asset_discovery_label} rowKey="id" />,
        serveId: 'id',
        assetType: 'label',
      },
      nodes: {
        fn: getGraphAllTypeCount,
        op: 'nodes',
        img: Resources.GraphNode,
        txt: translations.clusterGraphList_nodes,
        // type: 'node_assets',
        children: <NodeListTable {...childrenProps} rowKey="ID" />,
        serveId: 'ID',
        assetType: 'node',
      },
      // nodeImage: {
      //   fn: nodeImageImagesList,
      //   op: { offset: 0, limit: 1, imageFromType: 'node' },
      //   img: Resources.GraphNodeImage,
      //   txt: translations.nodeMirroring,
      //   type: 'node_assets',
      //   children: <NodeImage />,
      // },
      webSite: {
        fn: assetsWebsiteList,
        op: { cluster: '', apptype: 'web', offset: 0, limit: 1 },
        img: Resources.GraphWebSite,
        txt: translations.web_site,
        // type: 'app_assets',
        children: <AssetWebSite title={translations.web_site} rowKey="Host" />,
        serveId: 'Host',
        assetType: 'webSit',
      },
      // 运行应用
      runApp: {
        fn: assetsRunAppList,
        op: { offset: 0, limit: 1 },
        img: Resources.GraphRunAppImage,
        txt: translations.running_applications,
        // type: 'app_assets',
        children: <AssetRunApp rowKey="id" />,
        serveId: 'id',
        assetType: 'app',
      },
      web: {
        fn: assetsWebServeList,
        op: { offset: 0, limit: 1 },
        // fn: assetsApplications,
        // op: { cluster: '', app_type: 'web', offset: 0, limit: 1 },
        img: Resources.GraphWeb,
        txt: translations.clusterGraphList_web,
        // type: 'app_assets',
        children: <AssetWebServe rowKey="id" />,
        serveId: 'id',
        assetType: 'webApp',
      },
      database: {
        fn: assetsDatabaseList,
        op: { offset: 0, limit: 1 },
        // fn: assetsApplications,
        // op: { cluster: '', app_type: 'database', offset: 0, limit: 1 },
        img: Resources.GraphDatabase,
        txt: translations.clusterGraphList_database,
        // type: 'app_assets',
        children: <Database rowKey="id" />,
        serveId: 'id',
        assetType: 'dbApp',
      },
    };
    const keys = Object.keys(AssetMap).filter((k) => !window.REACT_APP_ASSET_MODULE.includes(k));
    return keys.reduce((acc: any, k: string) => {
      acc[k] = AssetMap[k];
      return acc;
    }, {});
  }, [childrenProps.clusterKeyToName, childrenProps.clusterList]);

  return { moduleList: mockDataNew };
};

interface IRelCard {
  ObjType: string;
  Count: number;
  ObjIds: string[];
}

interface IProps {
  moduleList: any;
  children?: any;
  history?: any;
  // onChangeKey?: (val: string) => void;
  isAllowClick?: boolean;
  className?: string;
  isHomePage?: boolean;
  onUpdateCard?: any;
}

const GraphListNavi = (props?: IProps) => {
  const { jump } = useNavigatereFresh();
  const { isHomePage: isFromWelcomePage, moduleList } = props ?? {};
  const { allSearchParams } = useNewSearchParams();
  const navigate = useNavigate();
  const { tab } = allSearchParams;
  const [
    { assetTopTag, assetType: selectAsset, refreshTable },
    { setAssetTopTag, reset, setAssetType, setRowKey, setRefreshCards },
  ] = useBatchLabelContext();

  // 当前top tagId
  const nowTagId = useMemo(() => assetTopTag.id, [assetTopTag]);

  // 获取当前标签下的资产卡片
  const [currentCards, setCurrentCards] = useState<IRelCard[]>([]);
  const onChangeAssetCard = useMemoizedFn((cardKey: string, _jump: boolean) => {
    const card = moduleList[cardKey];
    setAssetType(card.assetType);
    setRowKey(card.serveId);
    if (!_jump) {
      return;
    }
    if (isFromWelcomePage) {
      // 仪表盘页面跳转到资产发现需要记录标签和选中的卡片
      Store.assetsParams.next(
        isFromWelcomePage
          ? {
              assetType: card.assetType,
              assetTopTag,
            }
          : {},
      );
      navigate(`${Routes.ClustersOnlineVulnerabilitiesGraphList}`);
      return;
    }
    reset();
  });

  const getFirInTabAssets = (data: IRelCard[], cardKeys: string[]): string => {
    const RelObjTypes: string[] = data.map((_obj) => _obj.ObjType);
    const _cardIdx = cardKeys.findIndex((_k) => RelObjTypes.includes(moduleList[_k].assetType));
    if (_cardIdx !== -1) {
      return cardKeys[_cardIdx];
    } else {
      return '';
    }
  };

  const getAssetCards = useMemoizedFn((tag: IAssetTopTag, cache: boolean, isRefreashTable?: boolean) => {
    const _tagId = tag.id;
    // 标签下面的资产
    getAssetsInTag(_tagId).subscribe((res) => {
      const RelCounts: IRelCard[] = (res.getItem()?.RelCounts || []).filter((_item: IRelCard) => _item.Count > 0);
      setCurrentCards(RelCounts);
      setAssetTopTag({ ...tag, relateAssets: RelCounts });
      let _cardKeyName = '';
      if (RelCounts.length) {
        const cardKeys = Object.getOwnPropertyNames(moduleList);
        if (cache) {
          const findAssetKey = (_assetType: string) => {
            const _cardIdx = cardKeys.findIndex((_k) => moduleList[_k].assetType === _assetType);
            if (_cardIdx !== -1) {
              _cardKeyName = cardKeys[_cardIdx];
            } else {
              console.error(`${_assetType} 资产类型不存在`);
            }
          };
          if (RelCounts.some((_relObj) => _relObj.ObjType === selectAsset)) {
            findAssetKey(selectAsset);
          } else {
            // 缓存的 selectAsset 不存在，默认取第一个
            _cardKeyName = getFirInTabAssets(RelCounts, cardKeys);
            // findAssetKey(RelCounts[0].ObjType);
          }
        } else if (tab && RelCounts.some((_relObj) => _relObj.ObjType === moduleList[tab].assetType)) {
          _cardKeyName = tab;
        } else {
          _cardKeyName = getFirInTabAssets(RelCounts, cardKeys);
        }
        _cardKeyName && onChangeAssetCard(_cardKeyName, false);
      }
      props?.onUpdateCard && props?.onUpdateCard(RelCounts?.length);
      if (isRefreashTable && selectAsset === moduleList[_cardKeyName]?.assetType) {
        refreshTable.current && refreshTable.current();
      }
    });
  });

  const l = useLocation();

  // 所有可以显示的tag
  const [visibleTags, setVisibleTags] = useState<IAssetTopTag[]>([AllAssetTag]);
  const initTag = (cache: boolean) => {
    setRefreshCards(updateSegment);
    let _tag = cache ? assetTopTag : AllAssetTag;
    setAssetTopTag(_tag);
    getAssetCards(_tag, cache, cache);
    getVisibleTags().subscribe((res) => {
      const list = (res.getItems() || []).map((item) => ({
        label: translateBuildInTag(item.name),
        value: item.id,
        id: item.id,
        type: item.type,
      }));
      setVisibleTags([AllAssetTag, ...list]);
      // 缓存的tag被关闭
      if (cache && _tag.id !== AllAssetTag.id && !list.some((_item) => _item.id === _tag.id)) {
        setAssetTopTag(AllAssetTag);
        getAssetCards(AllAssetTag, cache);
      }
    });
  };

  useEffect(() => {
    initTag(true);
    // 消费后清空记录
    Store.assetsParams.next({});
  }, [l]);
  const updateSegment = useMemoizedFn((id: string, isRefreashTable?: boolean) => {
    const idx = visibleTags.findIndex((item: any) => item.value === id);
    const selectTag = visibleTags[idx];
    getAssetCards(selectTag, false, isRefreashTable);
    reset();
  });

  // 顶部标签
  const SegmentJsx = (
    <TopTags
      isHomePage={!!isFromWelcomePage}
      value={nowTagId}
      style={{ fontWeight: 'normal', color: '#6C7480' }}
      options={visibleTags}
      onChange={updateSegment}
    />
  );

  const setHeader = useMemoizedFn(() => {
    isFromWelcomePage
      ? null
      : Store.header.next({
          title: (
            <div className={'flex-r-c'} style={{ justifyContent: 'flex-start' }}>
              <span className="txt" style={{ whiteSpace: 'nowrap' }}>
                {translations.sidebar_listView}
              </span>
              {SegmentJsx}
            </div>
          ),
          extra: (
            <TzButton
              className="df dfac"
              icon={<i className="icon iconfont icon-jingxiangsaomiao-peizhi f16"></i>}
              onClick={() => {
                jump(Routes.LabelManag, 'LabelManag');
              }}
            >
              {translations.label_management}
            </TzButton>
          ),
        });
  });
  useEffect(() => setHeader(), [nowTagId, visibleTags, l]);

  const SpaceItems = useMemo(() => {
    const keys = Object.keys(moduleList).filter((item) => {
      return (
        nowTagId === AllAssetTag.id || currentCards.some((cardItem) => cardItem.ObjType === moduleList[item].assetType)
      );
    });
    if (!keys.length) {
      return <NoData />;
    }
    return keys.map((t) => {
      const { img, txt, assetType } = moduleList[t];
      const cardIndex = currentCards.findIndex((cardItem) => cardItem.ObjType === assetType);
      // const num = typeNum[t];
      const num = cardIndex === -1 ? 0 : currentCards[cardIndex].Count || 0;
      const selected = assetType === selectAsset;
      return (
        <TzCol flex={100 / 7 + '%'} key={nowTagId + assetType}>
          <div
            className={classNames(`navi-item-case ${t}`, { selected })}
            key={t}
            onClick={() => onChangeAssetCard(t, true)}
          >
            <div className="txt-case">
              <div className="num-txt">{num || 0}</div>
              <EllipsisPopover className="des-txt">{txt}</EllipsisPopover>
            </div>
            <div className="img-case">
              <img src={img} />
            </div>
          </div>
        </TzCol>
      );
    });
  }, [selectAsset, nowTagId, currentCards]);

  return (
    <div className={classNames('graph-navi-case', props?.className)}>
      {isFromWelcomePage ? (
        <div className="flex-r-c mb20" style={{ justifyContent: 'flex-start' }}>
          <span className="f16 fw550" style={{ color: '#1E222A' }}>
            {translations.asset_statistics}
          </span>
          {SegmentJsx}
        </div>
      ) : null}
      <TzRow gutter={[16, 16]}>{SpaceItems}</TzRow>
    </div>
  );
};

export default GraphListNavi;
