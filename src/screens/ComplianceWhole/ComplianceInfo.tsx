import React, { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  breakdownDetailList,
  breakdownDetails,
  nodeDetailList,
  nodeNameTaskIDDetails,
} from '../../services/DataService';
import { map } from 'rxjs/operators';
import { DynamicObject } from '../../definitions';
import { DealData } from '../AlertCenter/AlertRulersScreens';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { TzButton } from '../../components/tz-button';
import './complianceInfo.scss';
import { TzTableServerPage } from '../../components/tz-table';
import { TzCard } from '../../components/tz-card';
import { TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import TzInputSearch from '../../components/tz-input-search';
import { Store } from '../../services/StoreService';
import TzTagNum from '../../components/ComponentsLibrary/TzTagNum';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { translations } from '../../translations/translations';
import { PageTitle } from '../ImagesScanner/ImagesCI/CI';
import { Routes } from '../../Routes';
import { useAssetsClusterList } from '../../helpers/use_fun';
import NoData from '../../components/noData/noData';
import { ComplianceEnum } from './CompliancwContainer';
import { getCurrentLanguage } from '../../services/LanguageService';
import ArtTemplateDataInfo from '../../components/ComponentsLibrary/ArtTemplateDataInfo';
import classNames from 'classnames';
// import { useAliveController } from 'react-activation';
import { RenderTag } from '../../components/tz-tag';
import { Tittle } from '../../components/ComponentsLibrary/Tittle';

export type TComplianceInfo = {
  contentType?: 'popUp';
  obj?: {
    policyID?: string;
    checkType?: string;
    action: string;
    clusterKey?: string;
    taskID?: string;
  };
};
let ComplianceInfo = (props?: TComplianceInfo) => {
  const { obj, contentType } = props || {};
  const navigate = useNavigate();
  // const { refreshScope } = useAliveController();
  const [result] = useSearchParams();
  const l = useLocation();
  const isPopup = contentType === 'popUp';
  let [query] = useState<any>(() => {
    if (isPopup) {
      return {
        ...obj,
        hostname: obj?.policyID,
      };
    }
    return {
      policyID: result.get('policyID'),
      hostname: result.get('policyID'),
      checkType: result.get('checkType'),
      action: result.get('action'),
      clusterKey: result.get('clusterKey'),
      taskID: result.get('taskID'),
    };
  });
  let [data, setData] = useState<any>({});
  let [keyword, onSearch] = useState<any>('');
  let [tagNumList, setTagNumList] = useState<any>(null);
  const listComp = useRef(undefined as any);
  let clusterList = useAssetsClusterList();
  let getDataInfo = (action: string, data: any) => {
    const translationStr: DynamicObject =
      action === ComplianceEnum.compliance
        ? {
            policyNumber: translations.compliance_ID + '：',
            section: translations.compliances_breakdown_section + '：',
            udbcp: translations.compliances_breakdown_dengbao + '：',
            description: translations.notificationCenter_columns_description + '：',
            defaultValue: translations.default + '：',
            rationale: translations.explain + '：',
            impact: translations.influence + '：',
            audit: translations.verification_method + '：',
            remediation: translations.scanner_report_fixAdvise + '：',
            references: translations.scanner_detail_side_link + '：',
          }
        : {
            nodeName: translations.vulnerabilityDetails_nodeName + '：',
            clusterKey: translations.notificationCenter_placeEvent_cluster + '：',
            scanStatus: translations.scanner_images_scanStatus + '：',
            nodeStatus: `${translations.compliances_node_status}：`,
          };
    let arr: DealData[] = [];
    let lang = getCurrentLanguage();
    Object.keys(translationStr).map((item: string) => {
      let obj: DealData = {
        title: translationStr[item] || item,
        content: data[item] || '-',
        className: lang === 'en' ? 'w125' : '',
      };
      if ('section' === item) {
        obj['className'] = lang === 'en' ? 'w150' : '';
        obj['render'] = () => {
          return <EllipsisPopover>{data[item]}</EllipsisPopover>;
        };
      }
      if ('udbcp' === item) {
        obj['className'] = lang === 'en' ? 'w80' : '';
        obj['render'] = () => {
          return data[item];
        };
      }
      if ('audit' === item || 'rationale' === item || 'remediation' === item) {
        obj['className'] = 'item-flex-start';
        obj['render'] = () => {
          return data[item];
        };
      }
      if ('references' === item && data[item]) {
        obj['render'] = () => {
          return (
            <div>
              {data[item].length
                ? data[item].map((item: string | undefined) => {
                    return (
                      <>
                        <a href={item} target="_blank" rel="noreferrer">
                          {item}
                        </a>
                        <br />
                      </>
                    );
                  })
                : '-'}
            </div>
          );
        };
      }
      if ('nodeName' === item) {
        obj['render'] = () => {
          return (
            <TzButton
              type={'text'}
              className={'f-l'}
              style={{ maxWidth: '100%', marginTop: '2px' }}
              onClick={(event) => {
                // refreshScope('ClustersOnlineVulnerabilitiesDetails');
                // 暂时解决同名资源位置缓存问题，正常应该用refreshScope
                // Store.menuCacheItem.next('ClustersOnlineVulnerabilitiesDetails');
                navigate(
                  `${Routes.ClustersOnlineVulnerabilitiesDetails}?type=node&NSName=${data[item]}&ClusterID=${data['clusterKey']}`,
                );
                // window.open
              }}
            >
              <EllipsisPopover>{data[item]}</EllipsisPopover>
            </TzButton>
          );
        };
      }
      if ('clusterKey' === item) {
        obj['render'] = () => {
          let obj = clusterList.find((ite: any) => {
            return data[item] === ite.value;
          });
          return !obj || obj['label'];
        };
      }
      if ('nodeStatus' === item) {
        obj['render'] = () => {
          return data[item] === 0 ? translations.onLine : translations.offLine;
        };
      }
      if ('scanStatus' === item) {
        obj['render'] = () => {
          return <RenderTag type={data[item] == 2 ? 'fail' : 'finish'} />;
        };
      }
      arr.push(obj);
    });
    return arr;
  };
  let dataInfo = useMemo(() => {
    return getDataInfo(query.action, data);
  }, [query.action, data, clusterList]);
  useEffect(() => {
    if (query.action === ComplianceEnum.compliance) {
      breakdownDetails(Object.assign({}, query, { policyNumber: query.policyID })).subscribe((res) => {
        if (res.getItem()) {
          setData(Object.assign({}, res.getItem(), res.getItem().extraDetail));
        }
      });
    } else {
      nodeNameTaskIDDetails(Object.assign({}, query, { nodeName: query.policyID })).subscribe((res) => {
        let item = res.getItem();
        setData(item);
      });
    }
  }, [query.action]);

  useEffect(() => {
    Store.header.next({
      title:
        query.action === ComplianceEnum.compliance
          ? translations.compliance_details
          : translations.compliances_breakdown_statusNameDetail,
      onBack: () => {
        navigate(-1);
      },
    });
  }, [query.action, l]);

  const reqFun = useCallback(
    (pagination: TablePaginationConfig, filters: any) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = {
        offset,
        limit: pageSize,
        keyword,
        ...filters,
        ...query,
      };
      delete pageParams.action;
      let fn: any = query.action === ComplianceEnum.compliance ? breakdownDetailList : nodeDetailList;
      return fn(pageParams).pipe(
        map((res: any) => {
          let items = res.getItems().filter((ite: any) => {
            return filters['testStatus'] ? filters['testStatus'].includes(ite.testStatus) : true;
          });
          let o: any = {
            fail: translations.compliances_breakdown_numFailed + '：',
            warn: translations.compliances_policyDetails_Warn + '：',
            pass: translations.compliances_breakdown_numSuccessful + '：',
            info: translations.imageReject_reject_type_ignore + '：',
          };
          let obj = Object.keys(o).reduce((pre: any, item) => {
            if (res.data[item]) {
              pre[item] = {
                title: res.data[item],
                tooltip: `${o[item]}${res.data[item]}`,
              };
            }
            return pre;
          }, {});
          setTagNumList(obj);
          return {
            data: items,
            total: items.length,
          };
        }),
      );
    },
    [keyword, query],
  );
  let columns = useMemo(() => {
    const col: any = [
      {
        title: translations.vulnerabilityDetails_nodeName,
        width: '50%',
        dataIndex: 'hostname',
        render(hostname: any, row: any) {
          return hostname;
        },
      },
      {
        title: translations.last_scan_time,
        dataIndex: 'createAt',
        width: '14%',
        render: (attack_time: any, row: any) => {
          return moment(attack_time * 1000).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: translations.compliance_results,
        className: 'th-center',
        align: 'center',
        width: 150,
        dataIndex: 'testStatus',
        filters: [
          {
            text: translations.compliances_breakdown_numSuccessful,
            value: 'PASS',
          },
          {
            text: translations.compliances_breakdown_numFailed,
            value: 'FAIL',
          },
          {
            text: translations.ignored,
            value: 'INFO',
          },
          {
            text: translations.statusChartLegends_warn,
            value: 'WARN',
          },
        ],
        render(testStatus: any, row: any) {
          return <RenderTag type={'compliance' + testStatus.toLowerCase()} />;
        },
      },
    ];
    const colNode: any = [
      {
        title: translations.compliances_breakdown_policyNumber,
        key: 'policyNumber',
        dataIndex: 'policyNumber',
        width: 120,
      },
      {
        title: translations.compliances_breakdown_section,
        key: 'section',
        dataIndex: 'section',
        width: '18%',
      },
      {
        title: translations.compliances_breakdown_dengbao,
        key: 'udbcp',
        dataIndex: 'udbcp',
        width: '10%',
      },
      {
        title: translations.notificationCenter_columns_description,
        key: 'description',
        dataIndex: 'description',
        ellipsis: {
          showTitle: false,
        },
        render: (description: any, row: any) => {
          return <EllipsisPopover>{description}</EllipsisPopover>;
        },
      },
      {
        title: translations.compliance_results,
        key: 'testStatus',
        filters: [
          {
            text: translations.compliances_breakdown_numSuccessful,
            value: 'PASS',
          },
          {
            text: translations.compliances_breakdown_numFailed,
            value: 'FAIL',
          },
          {
            text: translations.ignored,
            value: 'INFO',
          },
          {
            text: translations.statusChartLegends_warn,
            value: 'WARN',
          },
        ],
        width: 150,
        dataIndex: 'testStatus',
        render(testStatus: any, row: any) {
          return <RenderTag type={'compliance' + testStatus.toLowerCase()} />;
        },
      },
    ];
    query.checkType === 'docker'
      ? colNode.splice(1, 0, {
          title: translations.runtime_type,
          dataIndex: 'runtime',
          width: '10%',
        })
      : null;
    return query.action === ComplianceEnum.compliance ? col : colNode;
  }, [query.action, query.checkType]);
  let ExceptRecord = (props: any) => {
    let [data] = useState<any>(Object.assign({}, props, props.extraDetail));
    return (
      <div>
        {query.action !== ComplianceEnum.compliance ? (
          <>
            <PageTitle title={translations.compliance_infor} className={'f14 mb12'} />
            <p style={{ background: '#F4F6FA', padding: '12px 0 0 0' }} className={'mb20'}>
              <ArtTemplateDataInfo
                className={'compliance-info-table-td'}
                data={getDataInfo(ComplianceEnum.compliance, data).splice(4)}
                span={1}
              />
            </p>
          </>
        ) : null}
        {query.checkType !== 'docker' ? (
          <>
            <PageTitle title={translations.detection_result} className={'f14 mb12'} />
            {props.testResult ? (
              <p style={{ background: '#F4F6FA', padding: '12px 24px' }}>{props.testResult}</p>
            ) : (
              <NoData />
            )}
          </>
        ) : null}
      </div>
    );
  };
  const rowKey = useCallback(
    (item) => {
      return query.action === ComplianceEnum.compliance ? item.hostname : item.policyNumber;
    },
    [query.action],
  );
  return (
    <div className={classNames('compliance-info', { 'is-page': !isPopup })}>
      <TzCard
        title={<Tittle title={translations.compliances_breakdown_taskbaseinfo} />}
        bodyStyle={{ padding: '4px 0 0 0' }}
        bordered={!isPopup}
      >
        <ArtTemplateDataInfo data={dataInfo.slice(0, 3)} span={3} />
        <ArtTemplateDataInfo data={dataInfo.slice(3)} span={1} />
      </TzCard>
      <TzCard
        bordered={!isPopup}
        title={
          <Tittle
            title={translations.compliances_breakdown_taskbaseinfo}
            extra={
              <div className={'f-r flex-r-c'}>
                <TzTagNum list={tagNumList} />
                <TzInputSearch
                  className={'ml20'}
                  placeholder={`${
                    query.action === ComplianceEnum.compliance
                      ? translations.unStandard.str48
                      : translations.unStandard.str47
                  }`}
                  onSearch={onSearch}
                  style={{ width: 360 }}
                />
              </div>
            }
          />
        }
        // title={
        //   <>
        //     <span style={{ verticalAlign: '-webkit-baseline-middle' }}>
        //       {query.action === ComplianceEnum.compliance
        //         ? translations.vulnerabilityDetails_nodeName
        //         : translations.compliance}{' '}
        //     </span>
        //     <div className={'f-r flex-r-c'}>
        //       <TzTagNum list={tagNumList} />
        //       <TzInputSearch
        //         className={'ml20'}
        //         placeholder={`${
        //           query.action === ComplianceEnum.compliance
        //             ? translations.unStandard.str48
        //             : translations.unStandard.str47
        //         }`}
        //         onSearch={onSearch}
        //         style={{ width: 360 }}
        //       />
        //     </div>
        //   </>
        // }
        bodyStyle={{ paddingTop: '0px', paddingBottom: '0px' }}
      >
        <TzTableServerPage
          columns={columns}
          rowKey={rowKey}
          reqFun={reqFun}
          ref={listComp}
          expandable={
            query.checkType === 'kube' || (query.checkType === 'docker' && query.action !== ComplianceEnum.compliance)
              ? {
                  expandRowByClick: true,
                  columnWidth: 24,
                  expandedRowRender: (item: any) => {
                    return <ExceptRecord {...item} />;
                  },
                }
              : undefined
          }
        />
      </TzCard>
    </div>
  );
};

export default ComplianceInfo;
