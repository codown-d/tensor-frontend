import { useMemoizedFn } from 'ahooks';
import Anchor from 'antd/lib/anchor';
import Form from 'antd/lib/form';
import hljs from 'highlight.js';
import { cloneDeep, find, isArray, isEqual, keys, merge, random, set } from 'lodash';
import moment from 'moment';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Link, useLocation, useSearchParams } from 'react-router-dom';
import { postExportTaskIacSecurity } from '..';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { TzButton } from '../../../components/tz-button';
import { TzCard } from '../../../components/tz-card';
import { dockerfileResultsDetail, yamlTemplates } from '../../../services/DataService';
import { Store } from '../../../services/StoreService';
import { translations } from '../../../translations/translations';
import { DealData } from '../../AlertCenter/AlertRulersScreens';
import { SeverityIconTag } from '../../ImagesScanner/components/Image-scanner-detail/ImagesScannerDetail';
import { useAssetsClusterList } from '../../../helpers/use_fun';
import { templateSnapshotsDetailDrawer } from '../ScanConfig';
import YamlIacRisk from '../YamlIacRisk';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { TzConfirm } from '../../../components/tz-modal';
import { TzSelect } from '../../../components/tz-select';
import { RenderTag } from '../../../components/tz-tag';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
const IaCSecurityInfo = (props: any) => {
  const [result] = useSearchParams();
  let [query] = useState<any>({ id: result.get('id') || '' });
  let [iaCSecurityInfo, setIaCSecurityInfo] = useState<any>({});
  let getRecordsDetail = useCallback(() => {
    dockerfileResultsDetail(query).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setIaCSecurityInfo(item);
    });
  }, []);

  useEffect(() => {
    getRecordsDetail();
  }, [query]);
  const HeaderExtra = useMemo(() => {
    if (iaCSecurityInfo.id) return null;
    return (
      <>
        <TzButton
          className={'mr20'}
          onClick={(e) => {
            postExportTaskIacSecurity(e, { result_id: iaCSecurityInfo.result_id });
          }}
        >
          {translations.scanner_report_download}
        </TzButton>
      </>
    );
  }, [iaCSecurityInfo]);
  let setHeader = useMemoizedFn(() => {
    Store.header.next({
      title: iaCSecurityInfo?.pipeline_name,
      extra: HeaderExtra,
    });
  });
  let l = useLocation();
  useEffect(setHeader, [iaCSecurityInfo, l]);
  let iaCSecurityInfoList: DealData[] = useMemo(() => {
    let dataInfo: DealData[] = [];
    let str: any = {
      dockerfile_path: translations.scanner_detail_file_path + '：',
      pipeline_name: translations.pipeline_name + '：',
      template_snapshot_name: translations.scan_baseline + '：',
      status: translations.compliances_breakdown_dotstatus + '：',
      created_at: translations.last_scan_time_C + '：',
    };
    if (!keys(iaCSecurityInfo).length) return [];
    Object.keys(str).map((item) => {
      let obj: DealData = {
        title: str[item] || item,
        content: iaCSecurityInfo[item] || '-',
      };
      if ('template_snapshot_name' === item) {
        obj['render'] = (row: any) => {
          return (
            <TzButton
              type={'text'}
              style={{ maxWidth: '100%' }}
              onClick={() => {
                templateSnapshotsDetailDrawer(
                  merge(
                    {
                      template_name: iaCSecurityInfo.template_snapshot_name,
                      template_id: iaCSecurityInfo.template_snapshot_id,
                    },
                    iaCSecurityInfo,
                  ),
                );
              }}
            >
              <EllipsisPopover>{iaCSecurityInfo[item]}</EllipsisPopover>
            </TzButton>
          );
        };
      }
      if ('status' === item) {
        obj['render'] = (row: any) => {
          return <RenderTag type={iaCSecurityInfo[item]} />;
        };
      }
      if ('created_at' === item) {
        obj['render'] = (row: any) => {
          return moment(iaCSecurityInfo[item]).format('YYYY-MM-DD HH:mm:ss');
        };
      }
      dataInfo.push(obj);
    });
    return dataInfo;
  }, [iaCSecurityInfo]);
  return (
    <div className={'dockerfile-scan-info mlr32 mt4'}>
      <TzCard
        title={translations.compliances_breakdown_taskbaseinfo}
        bodyStyle={{ paddingBottom: 4 }}
        className={'mb20'}
        headStyle={{ paddingBottom: 4 }}
      >
        <ArtTemplateDataInfo className="mt4" rowProps={{ gutter: [0, 0] }} data={iaCSecurityInfoList} span={2} />
      </TzCard>
      <YamlIacRisk
        option={{
          mode: 'dockerfile',
          value: iaCSecurityInfo.dockerfile,
          readOnly: true,
        }}
        result={iaCSecurityInfo.result}
        result_count={iaCSecurityInfo.result_count}
      />
      {iaCSecurityInfo.parse_error ? (
        <TzCard title={translations.parsing_error} className="mt20 mb40">
          <pre
            style={{
              background: '#F4F6FA',
              color: '#3E4653',
              padding: '12px 24px',
              maxHeight: '214px',
              overflow: 'auto',
              whiteSpace: 'break-spaces',
            }}
          >
            {`${iaCSecurityInfo.parse_error}`}
          </pre>
        </TzCard>
      ) : null}
    </div>
  );
};

export default IaCSecurityInfo;
