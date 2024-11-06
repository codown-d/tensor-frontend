import { cloneDeep, find, isArray, isEqual, keys, merge, random, set } from 'lodash';
import moment from 'moment';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { HashRouter, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ArtTemplateDataInfo from '../../components/ComponentsLibrary/ArtTemplateDataInfo';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../components/tz-button';
import { TzCard } from '../../components/tz-card';
import { Routes } from '../../Routes';
import { recordsDetail, yamlScan } from '../../services/DataService';
import { translations } from '../../translations/translations';
import { DealData } from '../AlertCenter/AlertRulersScreens';
import { useAssetsClusterList } from '../../helpers/use_fun';
import { templateSnapshotsDetailDrawer } from './ScanConfig';
import { useMemoizedFn } from 'ahooks';
import { Store } from '../../services/StoreService';
import { TzConfirm } from '../../components/tz-modal';
import { ContentModal, postExportTaskYaml, promiseYamlScan } from '.';
import Form from 'antd/lib/form';
import { RenderTag, TzTag } from '../../components/tz-tag';
import YamlIacRisk from '../IaCSecurity/YamlIacRisk';
import { useJumpResourceFn } from '../../screens/MultiClusterRiskExplorer/components';
export let yamlOptionsKind = [
  {
    label: translations.onlineVulnerability_filters_criticalLevel,
    value: 'CRITICAL',
  },
  {
    label: translations.onlineVulnerability_filters_highLevel,
    value: 'HIGH',
  },
  {
    label: translations.onlineVulnerability_filters_mediumLevel,
    value: 'MEDIUM',
  },
  {
    label: translations.onlineVulnerability_filters_lowLevel,
    value: 'LOW',
  },
];
const YamlScanInfo = (props: any) => {
  const [result] = useSearchParams();
  let [query] = useState<any>({ id: result.get('id') || '', t: result.get('t') });
  const navigate = useNavigate();
  let [yamlInfo, setYamlInfo] = useState<any>({});
  const [formIns] = Form.useForm();
  let getRecordsDetail = useCallback(() => {
    recordsDetail(query).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setYamlInfo(item);
    });
  }, []);

  useEffect(() => {
    getRecordsDetail();
  }, [query]);
  const clusterList = useAssetsClusterList();
  const HeaderExtra = useMemo(() => {
    if (yamlInfo.id) return null;
    return (
      <>
        {query.t ? null : (
          <TzButton
            className={'mr20'}
            onClick={() => {
              TzConfirm({
                title: translations.customScan,
                content: <ContentModal formIns={formIns} />,
                width: '520px',
                okText: translations.scanner_images_scann,
                cancelText: translations.cancel,
                onOk() {
                  return promiseYamlScan({ record_ids: [yamlInfo.record_id] }, formIns);
                },
              });
            }}
          >
            {translations.scanner_images_scann}
          </TzButton>
        )}
        <TzButton
          onClick={(e) => {
            postExportTaskYaml(e, [yamlInfo.record_id]);
          }}
        >
          {translations.scanner_report_download}
        </TzButton>
      </>
    );
  }, [yamlInfo, query.t]);
  let setHeader = useMemoizedFn(() => {
    let breadcrumb = [
      {
        children: translations.yaml_security_detection,
        href: Routes.YamlScan,
      },
      {
        children: query.t ? translations.scan_record_details : translations.details_test_results,
      },
    ];
    if (query.t) {
      breadcrumb.splice(1, 0, {
        children: translations.scanConfiguration,
        href: Routes.ScanConfig,
      });
    }
    Store.breadcrumb.next(breadcrumb);
    Store.header.next({
      title: (
        <span className="flex-r-c">
          {!query.t ? (
            <>
              {yamlInfo?.resource_name}
              <TzTag className={'ml12 ant-tag-gray'}>{yamlInfo?.resource_kind}</TzTag>
            </>
          ) : (
            translations.scan_record_details
          )}
        </span>
      ),
      extra: HeaderExtra,
    });
  });
  const l = useLocation();
  useEffect(setHeader, [yamlInfo, query.t, l]);

  let { jumpResourceFn } = useJumpResourceFn();
  let yamlScanInfoList: DealData[] = useMemo(() => {
    let dataInfo: DealData[] = [];
    let str: any = {
      resource_cluster_key: translations.clusterManage_key + '：',
      resource_namespace: translations.onlineVulnerability_outerShapeMeaning + '：',
      resource_name: translations.resources + '：',
      resource_kind: translations.microseg_resources_res_kind + '：',
      template_snapshot_name: translations.scan_baseline + '：',
      rate_status: translations.compliances_breakdown_dotstatus + '：',
      created_at: translations.last_scan_time_C + '：',
    };
    if (!yamlInfo) return [];
    Object.keys(str).map((item) => {
      let obj: DealData = {
        title: str[item] || item,
        content: yamlInfo[item] || '-',
      };
      if ('resource_cluster_key' === item) {
        obj['render'] = (row: any) => {
          let node: any =
            find(clusterList, (ite: { value: any }) => yamlInfo[item] === ite.value)?.label || yamlInfo[item];
          return node;
        };
      }
      if ('resource_name' === item || 'resource_namespace' === item) {
        obj['render'] = (row: any) => {
          const dropInitials: any = {
            resource_namespace: 'namespace',
            resource_name: 'resource',
          };
          return (
            <TzButton
              style={{ maxWidth: '100%' }}
              type={'text'}
              onClick={() => {
                if ('resource' === dropInitials[item]) {
                  let data = {
                    kind: yamlInfo.resource_kind,
                    name: yamlInfo['resource_name'],
                    namespace: yamlInfo['resource_namespace'],
                    clusterKey: yamlInfo['resource_cluster_key'],
                  };
                  jumpResourceFn(data);
                } else {
                  navigate(
                    `${Routes.ClustersOnlineVulnerabilitiesDetails}?type=${dropInitials[item]}&NSName=${yamlInfo['resource_namespace']}&name=${yamlInfo['resource_name']}&kind=${yamlInfo.resource_kind}&ClusterID=${yamlInfo['resource_cluster_key']}`,
                  );
                }
              }}
            >
              <EllipsisPopover>{yamlInfo[item]}</EllipsisPopover>
            </TzButton>
          );
        };
      }
      if ('template_snapshot_name' === item) {
        obj['render'] = (row: any) => {
          return (
            <TzButton
              type={'text'}
              onClick={() => {
                templateSnapshotsDetailDrawer(
                  merge(
                    {
                      template_name: yamlInfo.template_snapshot_name,
                      template_id: yamlInfo.template_snapshot_id,
                    },
                    yamlInfo,
                  ),
                );
              }}
            >
              {yamlInfo[item]}
            </TzButton>
          );
        };
      }
      if ('rate_status' === item) {
        obj['render'] = (row: any) => {
          return <RenderTag type={yamlInfo[item]} />;
        };
      }
      if ('created_at' === item) {
        obj['render'] = (row: any) => {
          return moment(yamlInfo[item]).format('YYYY-MM-DD HH:mm:ss');
        };
      }
      dataInfo.push(obj);
    });
    return dataInfo;
  }, [yamlInfo, clusterList]);
  return (
    <div className={'yaml-scan-info mlr32'}>
      <TzCard
        title={translations.compliances_breakdown_taskbaseinfo}
        bodyStyle={{ paddingBottom: 4 }}
        className={'mb20'}
        headStyle={{ paddingBottom: 4 }}
      >
        <ArtTemplateDataInfo className="mt4" rowProps={{ gutter: [0, 0] }} data={yamlScanInfoList} span={2} />
      </TzCard>
      <div className="mb40">
        <YamlIacRisk
          option={{
            mode: 'yaml',
            value: yamlInfo.yaml,
            readOnly: true,
          }}
          result={yamlInfo.result}
          result_count={yamlInfo.result_count}
        />
      </div>
    </div>
  );
};

export default YamlScanInfo;
