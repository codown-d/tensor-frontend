import Form, { FormInstance } from 'antd/lib/form';
import { TablePaginationConfig } from 'antd/lib/table';
import { cloneDeep, find, isEqual, keys, merge, set } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { map, tap } from 'rxjs/operators';
import TzFilter from '../../components/ComponentsLibrary/TzFilter';
import useTzFilter, { FilterContext } from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import TzFilterForm from '../../components/ComponentsLibrary/TzFilterForm';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { EllipsisPopover } from '../../components/ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../components/tz-button';
import { TzMessageSuccess } from '../../components/tz-mesage';
import { TzTableServerPage } from '../../components/tz-table';
import { WebResponse } from '../../definitions';
import { addFiletToDown } from '../../helpers/until';
import { Routes } from '../../Routes';
import { getUserInformation } from '../../services/AccountService';
import { dockerfileRecords, dockerfileResults, taskDockerfile, yamlResourcesTypes } from '../../services/DataService';
import { Store } from '../../services/StoreService';
import { translations } from '../../translations/translations';
import { TextHoverCopy } from '../AlertCenter/AlertCenterScreen';
import { addSignMark } from '../AlertCenter/EventData';
import { RateDom } from '../ComplianceWhole/CompliancwContainer';
import { WhiteListTag } from '../ImagesScanner/LifeCycle';
import { useAssetsClusterList } from '../../helpers/use_fun';
import './index.scss';
import { PageTitle } from '../ImagesScanner/ImagesCI/CI';
import { TzTooltip } from '../../components/tz-tooltip';
import { RenderTag } from '../../components/tz-tag';
import { useNavigatereFresh } from '../../helpers/useNavigatereFresh';
export let postExportTaskIacSecurity = (e: React.MouseEvent<HTMLElement, MouseEvent>, data: any) => {
  e.stopPropagation();
  const { username = '' } = getUserInformation();
  taskDockerfile({
    ...data,
    taskCreateAt: String(Date.now()),
    creator: username,
  }).subscribe((res) => {
    if (res.error) return;
    addFiletToDown(e);
    TzMessageSuccess(translations.created_successfully);
  });
};

let ExceptRecord = (props: any) => {
  const tablelistRef = useRef<any>(undefined);
  const navigate = useNavigate();
  let reqFun = useCallback((pagination, filter) => {
    const { current = 1, pageSize = 5 } = pagination;
    const offset = (current - 1) * pageSize;
    const params = {
      offset,
      limit: pageSize,
      ...props,
    };
    return dockerfileResults(params).pipe(
      map((res: WebResponse<any>) => {
        const items = res.getItems();
        return {
          data: items,
          total: res?.data?.totalItems || 0,
        };
      }),
    );
  }, []);
  let recordDetailcolumns = [
    {
      title: translations.file_information,
      dataIndex: 'dockerfile_path',
      width: '55%',
      className: 'task-name',
      render: (imageName: any, row: any) => {
        let { hit_whitelist, error } = row;
        return (
          <>
            <WhiteListTag flag={hit_whitelist} />
            {error ? (
              <div
                style={{ color: '#E95454', alignItems: 'flex-start', justifyContent: 'flex-start' }}
                className="flex-r f16"
              >
                <EllipsisPopover style={{ maxWidth: 'calc(100% - 40px)' }} lineClamp={2}>
                  {imageName}
                </EllipsisPopover>
                <TzTooltip title={translations.detect_anomalies + '：' + error}>
                  <i className="icon iconfont icon-banben mt4"></i>
                </TzTooltip>
              </div>
            ) : (
              <TextHoverCopy text={imageName} lineClamp={2} className="f16" />
            )}
            <p style={{ color: '#8e97a3' }} className="mt8">
              {translations.scan_completion_time}:{moment(row.created_at).format('YYYY-MM-DD HH:mm:ss')}
            </p>
          </>
        );
      },
    },
    {
      title: translations.detection_pass_rate,
      dataIndex: 'success_rate',
      render: (success_rate: any, row: any) => {
        let p = (success_rate * 100).toFixed(0) + '%';
        return row.error ? '-' : <RateDom per={p} style={{ width: '247px' }} />;
      },
    },
    {
      title: translations.operation,
      width: '8%',
      render: (item: any, row: any) => {
        return row.error ? (
          '-'
        ) : (
          <TzButton
            type={'text'}
            disabled={!!row.error}
            onClick={(e) => {
              postExportTaskIacSecurity(e, { result_id: row.id });
            }}
          >
            {translations.scanner_report_download}
          </TzButton>
        );
      },
    },
  ];
  let { jump } = useNavigatereFresh();
  return (
    <TzTableServerPage
      tableLayout={'fixed'}
      columns={recordDetailcolumns}
      defaultPagination={{
        current: 1,
        pageSize: 5,
        hideOnSinglePage: true,
      }}
      rowKey={'id'}
      reqFun={reqFun}
      onRow={(record) => {
        return {
          onClick: () => {
            record.error || jump(Routes.IaCSecurityInfo + `?id=${record.id}`);
          },
        };
      }}
      ref={tablelistRef}
    />
  );
};
let iacScanStatus = [
  {
    label: translations.deflectDefense_blockUp,
    value: 'block',
  },
  {
    label: translations.imageReject_reject_type_alarm,
    value: 'alert',
  },
  {
    label: translations.compliances_breakdown_numSuccessful,
    value: 'pass',
  },
  {
    label: translations.abnormal,
    value: 'exception',
  },
];
const IaCSecurity = (props: any) => {
  let [resourcesKind, setResourcesKind] = useState<any>([]);
  const [filters, setFilters] = useState<any>({});
  const listComp = useRef(undefined as any);
  const navigate = useNavigate();

  let clusterList = useAssetsClusterList();
  useEffect(() => {
    yamlResourcesTypes().subscribe((res) => {
      if (res.error) return;
      let items = res.getItems().map((item) => {
        return {
          value: item,
          label: item,
        };
      });
      setResourcesKind(items);
    });
  }, []);
  const imagesScannerScreenFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.scanner_detail_file_path,
        name: 'dockerfile_path',
        type: 'input',
        icon: 'icon-lujing',
      },
      {
        label: translations.pipeline_name,
        name: 'pipeline_name',
        type: 'input',
        icon: 'icon-banben',
      },
      {
        label: translations.scan_baseline,
        name: 'template_name',
        type: 'input',
        icon: 'icon-dengbaoduiqi',
      },
      {
        label: translations.compliances_breakdown_dotstatus,
        name: 'status',
        type: 'select',
        icon: 'icon-celveguanli',
        props: {
          mode: 'multiple',
          options: iacScanStatus,
        },
      },

      {
        label: translations.clusterManage_createtime,
        name: 'scan_time',
        type: 'rangePickerCt',
        icon: 'icon-shijian',
        props: {
          showTime: true,
          format: 'YYYY/MM/DD HH:mm:ss',
        },
      },
    ],
    [clusterList],
  );
  const data = useTzFilter({ initial: imagesScannerScreenFilter });
  const handleChange = useCallback((values: any) => {
    const temp = {};
    keys(values).forEach((key) => {
      let _val = cloneDeep(values[key]);
      if (key === 'scan_time') {
        _val[0] && set(temp, 'updatedAt.start_time', _val[0]);
        _val[1] && set(temp, 'updatedAt.end_time', _val[1]);
        return;
      }
      set(temp, [key], _val);
    });
    setFilters(temp);
  }, []);

  const imageColumns: any = [
    {
      title: translations.pipeline_name,
      dataIndex: 'pipeline_name',
      ellipsis: true,
      width: '30%',
    },
    {
      title: translations.scan_baseline,
      dataIndex: 'template_name',
      render: (template_name: any, row: any) => {
        return <EllipsisPopover lineClamp={2}>{template_name}</EllipsisPopover>;
      },
    },
    {
      title: translations.number_files_scanned,
      dataIndex: 'files_count',
      align: 'right',
    },
    {
      title: translations.compliances_breakdown_dotstatus,
      dataIndex: 'status',
      align: 'center',
      render: (status: any, row: any) => {
        return <RenderTag type={status} />;
      },
    },
    {
      title: translations.clusterManage_createtime,
      dataIndex: 'created_at',
      render: (updated_at: any, row: any) => {
        return <>{moment(updated_at).format('YYYY-MM-DD HH:mm:ss')}</>;
      },
    },
    {
      title: translations.clusterManage_operate,
      width: '10%',
      className: 'td-center',
      render: (status: any, row: any) => {
        //status 流水线扫描状态：alert-告警, block-阻断, pass-通过, exception-异常
        return row.status === 'exception' ? (
          '-'
        ) : (
          <TzButton
            disabled={row.status === 'exception'}
            type={'text'}
            className={'ml4'}
            onClick={(e) => {
              postExportTaskIacSecurity(e, { record_id: row.id });
            }}
          >
            {translations.scanner_report_download}
          </TzButton>
        );
      },
    },
  ];
  const reqFun = useCallback(
    (pagination?: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination || {};
      const offset = (current - 1) * pageSize;
      let { end_time, start_time } = filters?.updatedAt || {};
      const pageParams = {
        offset,
        limit: pageSize,
        ...filters,
        end_time: end_time ? moment(end_time).valueOf() : '',
        start_time: start_time ? moment(start_time).valueOf() : '',
      };
      delete pageParams.updatedAt;
      return dockerfileRecords(pageParams).pipe(
        map((res: any) => {
          let items = res.getItems();
          return {
            data: items,
            total: res.data?.totalItems,
          };
        }),
      );
    },
    [filters],
  );

  return (
    <div className={'dockerfile-scan mlr32 mt4'}>
      <PageTitle
        title={translations.dockerfile_file_security_detection}
        className={'p0'}
        extra={
          <>
            <TzButton
              icon={<i className="icon iconfont icon-jingxiangsaomiao-peizhi f16"></i>}
              onClick={() => {
                navigate(Routes.IaCSecurityScanConfig);
              }}
            >
              {translations.imageReject_rule_ctro}
            </TzButton>
            <TzButton
              className={'ml16'}
              onClick={() => {
                navigate(Routes.ManualScanning);
              }}
            >
              {translations.manual_scanning}
            </TzButton>
            <TzButton
              className="ml16"
              icon={<i className="icon iconfont icon-jingxiangsaomiao-peizhi f16"></i>}
              onClick={() => {
                navigate(Routes.IaCSecurityBaselineManagement);
              }}
            >
              {translations.baseline_management}
            </TzButton>
          </>
        }
      />
      <div className="mb12 mt16">
        <FilterContext.Provider value={{ ...data }}>
          <div className={'flex-r-c'}>
            <div></div>
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>

      <TzTableServerPage
        columns={imageColumns}
        tableLayout={'fixed'}
        rowKey="id"
        reqFun={reqFun}
        expandable={{
          expandedRowRender: (item: any) => {
            return <ExceptRecord record_id={item.id} />;
          },
        }}
        ref={listComp}
      />
    </div>
  );
};

export default IaCSecurity;
