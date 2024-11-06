import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { TzCard } from '../../../components/tz-card';
import { TzButton } from '../../../components/tz-button';
import { translations } from '../../../translations/translations';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { useAssetsClusterList } from '../../../helpers/use_fun';
import { Store } from '../../../services/StoreService';

import { SearchObj } from '../GraphResFilterHelper';
import '../ListDetailsScreens/PodDetail.scss';
import { DynamicObject, WebResponse } from '../../../definitions';
import { tap } from 'rxjs/operators';
import {
  getClustersId,
  getClustersIdReport,
  getClustersIdScanstatus,
  postClustersIdScan,
} from '../../../services/DataService';
import { Routes } from '../../../Routes';
import { DealData } from '../../AlertCenter/AlertRulersScreens';
import NoData from '../../../components/noData/noData';
import './index.scss';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import TzAnchor, { useAnchorItem } from '../../../components/ComponentsLibrary/TzAnchor';
import { JumpResource } from '../components';

interface IProps {
  children?: any;
  history?: any;
  paramData?: any;
  paramObj: SearchObj;
  initFatch?: (clusterID: string) => void;
}

const dropInitials: any = {
  namespace: 'namespace',
  resourceName: 'resource',
};

const items = [
  {
    href: '#base',
    title: <EllipsisPopover>{translations.clusterGraphList_detail_info}</EllipsisPopover>,
  },
  {
    href: '#scanResult',
    title: <EllipsisPopover>{translations.scanningResults}</EllipsisPopover>,
  },
];

const ApiDetail = (props: IProps) => {
  const [baseInfo, setInfo] = useState<any>(null);
  const [flag, setFlag] = useState<any>(true);
  const navigate = useNavigate();
  const [result] = useSearchParams();
  const [apiID, clusterId, type] = useMemo(() => {
    return [result.get('apiID'), result.get('clusterId'), result.get('type')];
  }, []);
  const clusterList = useAssetsClusterList();

  const updataInfoFn = useCallback((data: any) => {
    setInfo((pre: any) => {
      return Object.assign({}, pre, data);
    });
  }, []);

  const getClusterIDReportFn = useCallback(() => {
    getClustersIdReport({ id: apiID, clusterId: clusterId })
      .pipe(
        tap((res: WebResponse<any>) => {
          const node = res.getItem();
          updataInfoFn(node);
        }),
      )
      .subscribe();
  }, [apiID, clusterId, updataInfoFn]);

  const getClusterScanStatusFn = useCallback(() => {
    getClustersIdScanstatus({ id: apiID, clusterId: clusterId })
      .pipe(
        tap((res: WebResponse<any>) => {
          const node = res.getItem();
          setFlag(!!node.status);
          if (node.status) {
            setTimeout(() => {
              getClusterScanStatusFn();
            }, 1000);
          } else {
            getClusterIDReportFn();
          }
        }),
      )
      .subscribe();
  }, [apiID, clusterId, updataInfoFn, getClusterIDReportFn]);

  const getClusterIDFn = useCallback(() => {
    getClustersId({ id: apiID, clusterId: clusterId })
      .pipe(
        tap((res: WebResponse<any>) => {
          const node = res.getItem();
          updataInfoFn(node);
        }),
      )
      .subscribe();
  }, [apiID, clusterId, updataInfoFn]);

  useEffect(() => {
    getClusterIDFn();
    getClusterIDReportFn();
    getClusterScanStatusFn();
  }, [getClusterIDFn, getClusterIDReportFn, getClusterScanStatusFn]);

  const HeaderTit = useMemo(() => {
    return (
      <div className="df dfac pod-detail-head-case">
        <span className="ofh dib">{baseInfo?.url}</span>
      </div>
    );
  }, [baseInfo]);

  const ScanExtra = useMemo(() => {
    return baseInfo?.method === 'POST' ? null : (
      <TzButton
        disabled={flag}
        className={'f-r color-b'}
        onClick={() => {
          postClustersIdScan({ id: apiID, clusterId: clusterId })
            .pipe(
              tap((res: WebResponse<any>) => {
                let node = res.getItem();
                if (!node) {
                  setFlag(true);
                  getClusterScanStatusFn();
                }
              }),
            )
            .subscribe();
        }}
      >
        {flag ? translations.scanner_scanning : translations.kubeScan_scann}
      </TzButton>
    );
  }, [baseInfo, getClusterScanStatusFn, apiID, clusterId, flag]);

  const l = useLocation();
  useEffect(() => {
    Store.header.next({
      title: <>{HeaderTit}</>,
      extra: <>{ScanExtra}</>,
      onBack: () => {
        navigate(-1);
      },
    });
  }, [HeaderTit, ScanExtra, l]);

  const dataInfo = useMemo(() => {
    if (!baseInfo || !baseInfo?.method) return [];
    const obj: any = {
      cluster: translations.compliances_kubernetes_cluster + '：',
      contentType: translations.contentType + '：',
      method: translations.operationMode + '：',
      podName: translations.scanner_detail_pod_name + '：',
      namespace: translations.onlineVulnerability_columns_namespace + '：',
      kind: translations.clusterGraphList_resourceType + '：',
      resource: translations.resources + '：',
    };
    const arr = Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: baseInfo[item],
      };
      if ('resource' === item) {
        o['render'] = (row: any) => {
          let { namespace, resource, cluster, kind } = baseInfo;
          return (
            <JumpResource name={resource} kind={kind} namespace={namespace} clusterKey={cluster} title={resource} />
          );
        };
      }
      if ('namespace' === item) {
        o['render'] = (row: any) => {
          return baseInfo[item] ? (
            <Link
              style={{ width: '100%' }}
              // target="_blank"
              to={`${Routes.ClustersOnlineVulnerabilitiesDetails}?type=${item}&NSName=${baseInfo['namespace']}&name=${baseInfo['resource']}&ClusterID=${baseInfo['cluster']}`}
            >
              <TzButton style={{ maxWidth: '100%' }} type={'text'}>
                <EllipsisPopover>{baseInfo[item]}</EllipsisPopover>
              </TzButton>
            </Link>
          ) : (
            '-'
          );
        };
      }
      if (item === 'podName') {
        o['render'] = () => {
          return (
            <Link
              style={{ width: '100%' }}
              to={`${Routes.RiskGraphListPodDetail}?type=pod&PodUID=&PodName=${baseInfo[item]}&ClusterID=${baseInfo['cluster']}`}
            >
              <TzButton style={{ maxWidth: '100%' }} type={'text'}>
                <EllipsisPopover>{baseInfo[item]}</EllipsisPopover>
              </TzButton>
            </Link>
          );
        };
      }
      if ('cluster' === item) {
        o['render'] = (row: any) => {
          let o: any =
            clusterList.find((ite: { value: any }) => baseInfo[item].toUpperCase() === ite.value.toUpperCase()) || {};
          return o['label'];
        };
      }
      return o;
    });
    return arr;
  }, [baseInfo, clusterList]);

  const ScanningResultDom = useMemo(() => {
    if (!baseInfo?.['Report']) return [];
    const resultsList = baseInfo.Report.map((infoDataItem: any) => {
      const data: any = {
        addr: infoDataItem.detail.addr,
        payload: infoDataItem.detail.payload,
        snapshot: infoDataItem.detail.snapshot,
        param: JSON.stringify(infoDataItem.detail.extra.param) === '{}' || '',
        plugin: infoDataItem.plugin,
        target: infoDataItem.target.url,
      };
      const translationStr: DynamicObject = {
        addr: translations.addr, //目标地址
        plugin: translations.plugin, //漏洞类别
        payload: translations.payload, //攻击载荷
        snapshot: translations.snapshot, //请求快照
      };
      const latestWarnInfo: DealData[] = [];
      Object.keys(translationStr).forEach((item: string) => {
        const obj: DealData = {
          title: translationStr[item] || item,
          content: data[item] || '',
        };
        if ('snapshot' === item) {
          obj['render'] = () => {
            return data[item].map((ite: any) => {
              return (
                <div className={'AssetDiscoveryInfo-wrapper-div'} style={{ height: '90px' }}>
                  <div style={{ overflow: 'hidden', height: '100%' }}>
                    <p style={{ whiteSpace: 'normal' }} className={'mb10'}>
                      {ite.map((ie: any) => {
                        return <p>{ie}</p>;
                      })}
                    </p>
                  </div>
                  <i
                    className={'iconfont icon-arrow icon cursor-p'}
                    onClick={function (e) {
                      e.persist();
                      let el = $(e.target);
                      if (el.parent('.AssetDiscoveryInfo-wrapper-div').height() > 60) {
                        el.parent('.AssetDiscoveryInfo-wrapper-div').height(60);
                        el.css('transform', 'rotate(0deg)');
                      } else {
                        el.parent('.AssetDiscoveryInfo-wrapper-div').css('height', 'auto');
                        el.css('transform', 'rotate(180deg)');
                      }
                    }}
                  ></i>
                </div>
              );
            });
          };
        }
        latestWarnInfo.push(obj);
      });
      return latestWarnInfo;
    });

    if (!resultsList.length) return <NoData />;
    return resultsList.map((item: any) => {
      return (
        <>
          <ArtTemplateDataInfo data={item.slice(0, -1)} span={2} />
          <ArtTemplateDataInfo data={item.slice(-1)} span={1} />
        </>
      );
    });
  }, [baseInfo]);
  let { getPageKey } = useAnchorItem();
  return (
    <div className="graph-api-detail mlr32 mt4">
      <div className="flex-r">
        <div className="flex-c" style={{ flex: 1, paddingBottom: '24px', width: 0 }}>
          <TzCard
            title={translations.clusterGraphList_detail_info}
            id={getPageKey('base')}
            bodyStyle={{ padding: '4px 0 0' }}
          >
            <ArtTemplateDataInfo data={dataInfo} span={2} />
          </TzCard>
          <TzCard
            title={translations.scanningResults}
            id={getPageKey('scanResult')}
            className={'mt20'}
            bodyStyle={{ padding: 0 }}
          >
            {ScanningResultDom}
          </TzCard>
        </div>
        <TzAnchor items={items} />
      </div>
    </div>
  );
};

export default ApiDetail;
