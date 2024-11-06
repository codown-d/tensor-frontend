import Form from 'antd/lib/form';
import { find, merge } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { TzButton } from '../../../components/tz-button';
import { TzCard } from '../../../components/tz-card';
import { TzConfirm } from '../../../components/tz-modal';
import { RenderTag } from '../../../components/tz-tag';
import { recordsDetail } from '../../../services/DataService';
import { translations } from '../../../translations/translations';
import { DealData } from '../../AlertCenter/AlertRulersScreens';
import YamlIacRisk from '../../IaCSecurity/YamlIacRisk';
import { SeverityIconTag } from '../../ImagesScanner/components/Image-scanner-detail/ImagesScannerDetail';
import { useAssetsClusterList } from '../../../helpers/use_fun';
import { ContentModal, postExportTaskYaml, promiseYamlScan } from '../../YamlScan';
import { templateSnapshotsDetailDrawer } from '../../YamlScan/ScanConfig';
import { CardProps } from 'antd/lib/card';

const ResourceYamlRisk = (props: { cardProps?: CardProps }) => {
  let { cardProps } = props;
  const [result] = useSearchParams();
  let [query] = useState<any>({
    resource_cluster_key: result.get('ClusterID'),
    resource_namespace: result.get('NSName'),
    resource_kind: result.get('kind'),
    resource_name: result.get('name'),
  });
  let [yamlInfo, setYamlInfo] = useState<any>({});
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
  let yamlScanInfoList: DealData[] = useMemo(() => {
    let dataInfo: DealData[] = [];
    let str: any = {
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
        obj['className'] = 'mb16';
        obj['render'] = (row: any) => {
          return moment(yamlInfo[item]).format('YYYY-MM-DD HH:mm:ss');
        };
      }
      dataInfo.push(obj);
    });
    return dataInfo;
  }, [yamlInfo]);
  const [formIns] = Form.useForm();
  return (
    <div className="resource-yaml-risk">
      <TzCard
        title={translations.compliances_breakdown_taskbaseinfo}
        className={'mt20'}
        extra={
          <>
            <TzButton
              className={'mr8'}
              size={'small'}
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
            <TzButton
              size={'small'}
              onClick={(e) => {
                postExportTaskYaml(e, [yamlInfo.record_id]);
              }}
            >
              {translations.scanner_report_download}
            </TzButton>
          </>
        }
        bodyStyle={{ padding: 0 }}
      >
        <p style={{ padding: '0 24px' }}>
          <ArtTemplateDataInfo className="mt4" rowProps={{ gutter: [0, 0] }} data={yamlScanInfoList} span={2} />
        </p>

        <YamlIacRisk
          option={{
            mode: 'yaml',
            value: yamlInfo.yaml,
            readOnly: true,
          }}
          result={yamlInfo.result}
          result_count={yamlInfo.result_count}
        />
      </TzCard>
    </div>
  );
};

export default ResourceYamlRisk;
