import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { TzCard } from '../../../components/tz-card';
import { TzButton } from '../../../components/tz-button';
import { translations } from '../../../translations/translations';
import { useAssetsClusterList } from '../../../helpers/use_fun';
import { Store } from '../../../services/StoreService';
import { SearchObj } from '../GraphResFilterHelper';
import './PodDetail.scss';
import { WebResponse } from '../../../definitions';
import { tap } from 'rxjs/operators';
import { clusterGraphPods, getPods } from '../../../services/DataService';
import { Routes } from '../../../Routes';
import { RenderTableContianerTemp } from '../MultiDetailsTab/DetailTabInfo';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import TzAnchor, { useAnchorItem } from '../../../components/ComponentsLibrary/TzAnchor';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import EventDataList from '../../AlertCenter/EventDataList';
import GridDetailsV3 from '../../MultiClusterGridMap/GridChartMapV3';
import useNewSearchParams from '../../../helpers/useNewSearchParams';
import { useMemoizedFn } from 'ahooks';
import { merge } from 'lodash';
import { JumpResource } from '../components';

interface IProps {
  children?: any;
  history?: any;
  location: any;
  paramData?: any;
  paramObj: SearchObj;
  initFatch?: (clusterID: string) => void;
}

const dropInitials: any = {
  Namespace: 'namespace',
  ResourceName: 'resource',
};

const items = [
  {
    href: '#base',
    title: <>{translations.clusterGraphList_detail_info}</>,
  },
  {
    href: '#container',
    title: <>{translations.clusterGraphList_container}</>,
  },
  {
    href: '#topology',
    title: <>{translations.clusterGraphList_detail_topology}</>,
  },
  {
    href: '#securityEvents',
    title: <>{translations.security_events}</>,
  },
];

const PodDetail = (props: IProps) => {
  const navigate = useNavigate();
  const [result] = useSearchParams();
  const [baseInfo, setInfo] = useState<any>(null);
  let [sendData, setSendData] = useState({
    podUID: result.get('PodUID'),
    podName: result.get('PodName'),
    namespace: result.get('namespace'),
    cluster_key: result.get('ClusterID'),
  });
  const baseRef = useRef<HTMLDivElement>(null);
  const clusterList = useAssetsClusterList();
  const getPodInfoFn = useCallback(() => {
    let { podName, podUID, namespace } = sendData;
    const param: any = {
      offset: 0,
      limit: 1000,
    };
    if (namespace) {
      getPods(
        merge({}, sendData, {
          name: podName,
        }),
      ).subscribe((res) => {
        if (res.error) return;
        let item = res.getItem();
        setInfo(item);
      });
    } else {
      clusterGraphPods(param, { name: podName, updatedAt: {} })
        .pipe(
          tap((res: WebResponse<any>) => {
            const items = res.getItems();
            const objs = items.filter((f) => {
              if (!podUID) return !podUID;
              return (podUID && String(f.id) === podUID) || String(f.PodUID) === podUID;
            });
            if (objs?.length && objs?.length === 1) {
              setInfo((_pre: any) => objs[0]);
            }
          }),
        )
        .subscribe();
    }
  }, [sendData]);
  const HeaderTit = useMemo(() => {
    let { PodName } = baseInfo || {};
    return (
      <div className="df dfac pod-detail-head-case">
        <span className="ofh dib">{PodName}</span>
      </div>
    );
  }, [baseInfo]);

  let dataInfo = useMemo(() => {
    if (!baseInfo) return [];
    const obj: any = {
      PodUID: 'PodUID' + '：',
      ClusterKey: translations.compliances_cronjobs_selectCluster + '：',
      Namespace: translations.calico_cluster_namespace + '：',
      ResourceName: `${translations.resources}：`,
      ResourceKind: `${translations.microseg_resources_res_kind}：`,
      NodeName: `${translations.clusterGraphList_node}：`,
      HostIP: `${translations.clusterGraphList_node} IP：`,
      PodIP: `${'Pod IP'}：`,
    };
    let arr = Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: baseInfo[item],
      };
      if ('ResourceName' === item) {
        let { Namespace, ResourceName, ClusterKey, ResourceKind } = baseInfo;
        o['render'] = (_row: any) => {
          return (
            <JumpResource
              name={ResourceName}
              kind={ResourceKind}
              namespace={Namespace}
              clusterKey={ClusterKey}
              title={ResourceName}
            />
          );
        };
      }
      if ('Namespace' === item) {
        o['render'] = (_row: any) => {
          return (
            <Link
              style={{ width: '100%', display: 'inherit' }}
              to={`${Routes.ClustersOnlineVulnerabilitiesDetails}?type=${dropInitials[item]}&NSName=${baseInfo['Namespace']}&name=${baseInfo['ResourceName']}&ClusterID=${baseInfo['ClusterKey']}`}
            >
              <TzButton style={{ maxWidth: '100%' }} type={'text'}>
                <EllipsisPopover>{baseInfo[item]}</EllipsisPopover>
              </TzButton>
            </Link>
          );
        };
      }
      if ('NodeName' === item) {
        o['render'] = (_row: any) => {
          return (
            <Link
              style={{ width: '100%', display: 'inherit' }}
              to={`${Routes.ClustersOnlineVulnerabilitiesDetails}?type=node&NSName=${baseInfo['NodeName']}&ClusterID=${baseInfo['ClusterKey']}`}
            >
              <TzButton style={{ maxWidth: '100%' }} type={'text'}>
                <EllipsisPopover>{baseInfo[item]}</EllipsisPopover>
              </TzButton>
            </Link>
          );
        };
      }
      if ('ClusterKey' === item) {
        o['render'] = (_row: any) => {
          let o: any = clusterList.find((ite: { value: any }) => baseInfo[item] === ite.value) || {};
          return o['label'];
        };
      }
      return o;
    });
    return arr;
  }, [baseInfo, clusterList]);

  const ContainerDom = useMemo(() => {
    if (!baseInfo) return null;
    const { ClusterKey, Namespace, PodName, ResourceName } = baseInfo;
    const paramData = {
      cluster_key: ClusterKey,
      namespace: Namespace,
      pod_name: PodName,
      resource_name: ResourceName,
    };

    return <RenderTableContianerTemp paramData={paramData} />;
  }, [baseInfo]);
  const detailParams = useMemo(() => {
    if (!baseInfo) return null;
    const { ClusterKey, Namespace, PodName, ResourceName, ResourceKind } = baseInfo;
    return {
      Cluster: ClusterKey,
      Namespace: Namespace,
      Kind: ResourceKind,
      Resource: ResourceName,
      pod_name: PodName,
    };
  }, [baseInfo]);

  const { allSearchParams } = useNewSearchParams();
  let setHeader = useMemoizedFn(() => {
    Store.header.next({
      title: <>{HeaderTit}</>,
      extra: null,
      onBack: () => {
        navigate(-1);
      },
    });
  });
  const l = useLocation();
  useEffect(() => {
    setHeader();
  }, [HeaderTit, l]);

  useEffect(() => {
    getPodInfoFn();
  }, [getPodInfoFn]);

  let { getPageKey } = useAnchorItem();
  return (
    <div className="graph-pod-detail mlr32 mt4">
      <div className="flex-r">
        <div className="flex-c" style={{ flex: 1, paddingBottom: '24px', width: 0 }}>
          <TzCard
            title={translations.clusterGraphList_detail_info}
            ref={baseRef}
            id={getPageKey('base')}
            bodyStyle={{ padding: '4px 0 0' }}
          >
            <ArtTemplateDataInfo data={dataInfo} span={2} />
          </TzCard>
          <TzCard
            title={translations.clusterGraphList_container}
            id={getPageKey('container')}
            className={'mt20'}
            bodyStyle={{ paddingTop: '0px' }}
          >
            {ContainerDom}
          </TzCard>
          <TzCard
            title={translations.clusterGraphList_detail_topology}
            style={{ marginTop: '20px' }}
            id={getPageKey('topology')}
            bordered
            bodyStyle={{ paddingTop: '0px', paddingRight: '0px' }}
          >
            {detailParams && <GridDetailsV3 detailParams={detailParams} type={'pod'} />}
          </TzCard>
          <TzCard
            title={translations.security_events}
            style={{ marginTop: '20px' }}
            id={getPageKey('securityEvents')}
            bordered
            bodyStyle={{ paddingTop: '0px' }}
          >
            <EventDataList {...baseInfo} {...allSearchParams} type="pod" />
          </TzCard>
        </div>
        <TzAnchor items={items} />
      </div>
    </div>
  );
};

export default PodDetail;
