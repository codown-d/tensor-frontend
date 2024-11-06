import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './index.scss';
import { localLang, translations } from '../../../translations/translations';
import { DealData, renderTableDomTemplate } from '../../AlertCenter/AlertRulersScreens';
import {
  getClustersId,
  getClustersIdReport,
  getClustersIdScanstatus,
  postClustersIdScan,
} from '../../../services/DataService';
import { getUrlQuery } from '../../../helpers/until';
import { tap } from 'rxjs/operators';
import { DynamicObject, WebResponse } from '../../../definitions';
import { Routes } from '../../../Routes';
import { escapeString } from '../GraphResFilterHelper';
import { Link } from 'react-router-dom';
import { TzButton } from '../../../components/tz-button';
import NoData from '../../../components/noData/noData';
import { Tittle } from '../../../components/ComponentsLibrary/Tittle';
import { JumpResource } from '../components';

interface IProps {}

const AssetDiscoveryInfo = (props: IProps) => {
  const [infoData, setInfoData] = useState<any>({});
  const [flag, setFlag] = useState<any>(true);
  let { id, clusterId }: any = getUrlQuery();
  let changeGetClustersIdScanstatus = () => {
    setTimeout(() => {
      getClustersIdScanstatus({ id, clusterId })
        .pipe(
          tap((res: WebResponse<any>) => {
            let node = res.getItem();
            setFlag(!!node.status);
            if (node.status) {
              changeGetClustersIdScanstatus();
            } else {
              getClustersIdReportFn();
            }
          }),
        )
        .subscribe();
    }, 800);
  };
  let getClustersIdReportFn = () => {
    getClustersIdReport({ id, clusterId })
      .pipe(
        tap((res: WebResponse<any>) => {
          let node = res.getItem();
          setInfoData((pre: any) => {
            return Object.assign({}, pre, node);
          });
        }),
      )
      .subscribe();
  };
  useEffect(() => {
    getClustersId({ id, clusterId })
      .pipe(
        tap((res: WebResponse<any>) => {
          let node = res.getItem();
          setInfoData((pre: any) => {
            return Object.assign({}, pre, node);
          });
        }),
      )
      .subscribe();
    getClustersIdReportFn();
    changeGetClustersIdScanstatus();
  }, []);
  let discoveryInfo = useMemo(() => {
    let filter: string[] = [];
    let translationStr: DynamicObject = {
      cluster: translations.compliances_kubernetes_cluster,
      contentType: translations.contentType,
      method: translations.operationMode,
      podName: translations.scanner_detail_pod_name,
      namespace: translations.onlineVulnerability_columns_namespace,
      kind: translations.calico_dock_resourceType,
      resource: translations.resources,
    };
    const latestWarnInfo: DealData[] = [];
    Object.keys(translationStr).forEach((item: string) => {
      const obj: DealData = {
        title: translationStr[item] || item,
        content: infoData[item] || '',
      };
      if ('namespace' === item) {
        obj['render'] = () => {
          return (
            <Link
              // target="_blank"
              to={
                Routes.ClustersOnlineVulnerabilitiesDetails.replace(':type', 'namespace') +
                `?type=namespace&NSName=${infoData[item]}&ClusterID=${clusterId}`
              }
            >
              {infoData[item]}
            </Link>
          );
        };
      }
      if ('resource' === item) {
        obj['render'] = () => {
          let { namespace, resource, cluster, kind } = infoData;
          return (
            <JumpResource
              name={resource}
              kind={kind}
              namespace={namespace}
              clusterKey={cluster || clusterId}
              title={resource}
            />
          );
        };
      }
      filter.includes(item) || latestWarnInfo.push(obj);
    });
    return latestWarnInfo;
  }, [infoData]);
  let scanningResultsList = useMemo(() => {
    if (!infoData['Report']) return [];
    return infoData.Report.map((infoDataItem: any) => {
      let data: any = {
        addr: infoDataItem.detail.addr,
        payload: infoDataItem.detail.payload,
        snapshot: infoDataItem.detail.snapshot,
        param: JSON.stringify(infoDataItem.detail.extra.param) === '{}' || '',
        plugin: infoDataItem.plugin,
        target: infoDataItem.target.url,
      };
      let translationStr: DynamicObject = {
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
                    <p style={{ whiteSpace: 'normal' }} className={'mb20'}>
                      {ite.map((ie: any) => {
                        return <p>{ie}</p>;
                      })}
                    </p>
                  </div>
                  <i
                    className={'iconfont icon-zuocedaohangjiantou_shang1 icon'}
                    style={{ transform: 'rotate(180deg)' }}
                    onClick={function (e) {
                      e.persist();
                      let el = $(e.target);
                      if (el.parent('.AssetDiscoveryInfo-wrapper-div').height() === 60) {
                        el.parent('.AssetDiscoveryInfo-wrapper-div').css('height', 'auto');
                        el.css('transform', 'rotate(0deg)');
                      } else {
                        el.parent('.AssetDiscoveryInfo-wrapper-div').height(60);
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
  }, [infoData]);
  return (
    <div className={'asset-discovery-info graph-details-case'}>
      <div className={'top-action-case light'}>
        <div className={'left-tit-case noScrollbar'}>
          <span className={'nstext'}>{infoData['url']}</span>
        </div>
        {infoData.method === 'POST' ? null : (
          <TzButton
            shape={'round'}
            disabled={flag}
            className={'f-r color-b'}
            onClick={() => {
              postClustersIdScan({ id, clusterId })
                .pipe(
                  tap((res: WebResponse<any>) => {
                    let node = res.getItem();
                    if (!node) {
                      setFlag(true);
                      changeGetClustersIdScanstatus();
                    }
                  }),
                )
                .subscribe();
            }}
          >
            {flag ? translations.scanner_scanning : translations.kubeScan_scann}
          </TzButton>
        )}
      </div>
      <div className={'details-info-case mt16 discovery-info'}>
        <Tittle title={translations.compliances_breakdown_taskbaseinfo} className={'mb20'} />
        {renderTableDomTemplate(discoveryInfo)}
        <Tittle title={translations.scanningResults} className={'mb20 mt40'} />
        {scanningResultsList.length ? (
          scanningResultsList.map((item: any) => {
            return (
              <div className={'mt20'}>{renderTableDomTemplate(item, 'details-content-large')}</div>
            );
          })
        ) : (
          <NoData />
        )}
      </div>
    </div>
  );
};
export default AssetDiscoveryInfo;
