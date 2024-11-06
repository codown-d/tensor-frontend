import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TzCard } from '../../../components/tz-card';
import { TzButton } from '../../../components/tz-button';
import { translations } from '../../../translations/translations';
import { useAssetsClusterList } from '../../../helpers/use_fun';
import './PodDetail.scss';
import { WebResponse } from '../../../definitions';
import { tap } from 'rxjs/operators';
import { clusterGraphPods, getContainerGraphList } from '../../../services/DataService';
import { Routes } from '../../../Routes';
import { RenderTableContianerTemp } from '../MultiDetailsTab/DetailTabInfo';
import moment from 'moment';
import GridDetailsV3 from '../../MultiClusterGridMap/GridChartMapV3';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import TzAnchor from '../../../components/ComponentsLibrary/TzAnchor';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { BackIcon } from '../../../components/ComponentsLibrary/TzPageHeader';
import { TzDrawerFullScreenFn } from '../../../components/tz-drawer';
import { JumpResource } from '../components';
interface IProps {
  children?: any;
  history?: any;
  paramData?: any;
  paramObj?: any;
  initFatch?: (clusterID: string) => void;
  closeDrawer?: (data: any, k: string) => void;
  linkObj?: any;
  ikname: string;
}

const dropInitials: any = {
  Namespace: 'namespace',
  ResourceName: 'resource',
};

const items = [
  {
    href: '#base-p',
    title: (
      <div style={{ maxWidth: '100%', display: 'inline-flex' }} className="ofh">
        {translations.clusterGraphList_detail_info}
      </div>
    ),
  },
  {
    href: '#container-p',
    title: <>{translations.clusterGraphList_container}</>,
  },
  {
    href: '#topology-p',
    title: (
      <>
        <>{translations.clusterGraphList_detail_topology}</>
      </>
    ),
  },
];

const PodDetail = (props: IProps) => {
  const [baseInfo, setInfo] = useState<any>(null);
  const [containerListNew, setContainerListNew] = useState<any[]>([]);
  const [cw, setCw] = useState<null | number | undefined>(null);
  const {
    paramData: { podUID, podName },
    closeDrawer,
    linkObj,
    ikname,
  } = props;
  const clusterList = useAssetsClusterList();
  const getPodInfoFn = useCallback(() => {
    const param: any = {
      offset: 0,
      limit: 1000,
    };
    clusterGraphPods(param, { name: podName, updatedAt: {} })
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.getItems();
          const objs = items.filter((f) => {
            if (!podUID) return !podUID;
            return podUID && String(f.PodUID) === podUID;
          });
          if (objs?.length && objs?.length === 1) {
            setInfo(objs[0]);
          }
        }),
      )
      .subscribe();
  }, [podName, podUID]);
  useEffect(() => {
    getPodInfoFn();
  }, [getPodInfoFn]);

  const HeaderTit = useMemo(() => {
    return (
      <div
        className="df dfac pod-detail-head-case"
        style={{
          paddingTop: '20px',
          paddingBottom: '16px',
          position: 'sticky',
          top: '0px',
          minHeight: '72px',
        }}
      >
        <BackIcon className={'ml-8 mr8'} onClick={() => closeDrawer && closeDrawer(null, ikname)} />
        <span className="ofh dib">{podName}</span>
      </div>
    );
  }, [podName, closeDrawer, ikname]);

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
        o['render'] = (row: any) => {
          let { Namespace, ResourceName, ClusterKey, ResourceKind } = baseInfo;
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
        o['render'] = (row: any) => {
          return (
            <Link
              style={{ width: '100%' }}
              // target="_blank"
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
        o['render'] = (row: any) => {
          return (
            <Link
              style={{ width: '100%' }}
              // target="_blank"
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
        o['render'] = (row: any) => {
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
  }, [baseInfo, closeDrawer]);

  useEffect(() => {
    // 计算宽度
    const bw = $('#base-p').width();
    if (bw) {
      setCw(bw);
    }
  }, []);

  useEffect(() => {
    if (!baseInfo) return;
    const { ClusterKey, Namespace, PodName, ResourceName } = baseInfo;
    const param: any = {
      clusterKey: ClusterKey,
      offset: 0,
      limit: 1000,
      namespace: Namespace,
      pod_name: PodName,
      resource_name: ResourceName,
      status: '0&status=1',
    };
    getContainerGraphList(param)
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.getItems().map((t) => {
            return {
              name: t.name,
              id: t.id,
              container_time: moment(t.createdAt).format('x'),
            };
          });
          setContainerListNew(items);
        }),
      )
      .subscribe();
  }, [baseInfo]);

  const detailParams = useMemo(() => {
    if (!baseInfo) return null;

    const { ClusterKey, Namespace, PodName, ResourceName, ResourceKind } = baseInfo;
    const obj: any = {
      Cluster: ClusterKey,
      Namespace: Namespace,
      Kind: ResourceKind,
      Resource: ResourceName,
      containerList: containerListNew,
      podList: [baseInfo],
    };
    return obj;
  }, [baseInfo, containerListNew]);

  const V2Dom = useMemo(() => {
    if (!cw || !detailParams) return null;
    const wn = Math.floor(cw);
    // second:处理资产发现详情问题,当一级页面有拓扑图，同时在二级页面使用会有状态问题
    return (
      <GridDetailsV3
        width={wn}
        detailParams={detailParams}
        type={'pod'}
        objKey={ikname}
        setDrawer={closeDrawer}
        linkObj={linkObj}
      />
    );
  }, [cw, detailParams, podName, closeDrawer, linkObj, ikname]);

  return (
    <div className="graph-pod-detail">
      {HeaderTit}
      <div className="flex-r">
        <div className="flex-c" style={{ flex: 1, width: 0, paddingBottom: '24px' }}>
          <TzCard title={translations.clusterGraphList_detail_info} id="base-p" bodyStyle={{ padding: '4px 0 0' }}>
            <ArtTemplateDataInfo data={dataInfo} span={2} />
          </TzCard>
          <TzCard
            title={translations.clusterGraphList_container}
            id="container-p"
            className={'mt20'}
            bodyStyle={{ paddingTop: '0px' }}
          >
            {ContainerDom}
          </TzCard>
          <TzCard
            title={translations.clusterGraphList_detail_topology}
            style={{ marginTop: '20px' }}
            id="topology-p"
            bordered
            bodyStyle={{ paddingTop: '0px', paddingRight: '0px' }}
          >
            <div>{V2Dom}</div>
          </TzCard>
        </div>
        <TzAnchor items={items} offsetTop={138} />
      </div>
    </div>
  );
};

export const podDrawerFullScreen = async (data: any = {}, ikname: string) => {
  let { paramObj, paramData } = data[ikname] || {};
  let dw: any = await TzDrawerFullScreenFn({
    className: 'anchorTag',
    children: (
      <PodDetail
        paramObj={paramObj}
        paramData={paramData}
        closeDrawer={() => {
          dw.hiden();
        }}
        linkObj={data}
        ikname={ikname}
      />
    ),
    onCloseCallBack() {},
  });
  dw.show();
};
export default PodDetail;
