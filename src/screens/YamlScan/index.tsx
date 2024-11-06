import { useMemoizedFn } from 'ahooks';
import Form, { FormInstance } from 'antd/lib/form';
import { TablePaginationConfig } from 'antd/lib/table';
import { cloneDeep, find, isEqual, keys, merge, set } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { map, tap } from 'rxjs/operators';
import TzFilter from '../../components/ComponentsLibrary/TzFilter';
import useTzFilter, { FilterContext } from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import TzFilterForm from '../../components/ComponentsLibrary/TzFilterForm';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import TzSelect from '../../components/ComponentsLibrary/tzSelect';
import { EllipsisPopover } from '../../components/ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../components/tz-button';
import { TzForm, TzFormItem } from '../../components/tz-form';
import { TzMessageSuccess } from '../../components/tz-mesage';
import { TzConfirm } from '../../components/tz-modal';
import { TzTableServerPage } from '../../components/tz-table';
import { RenderTag, TzTag } from '../../components/tz-tag';
import { WebResponse } from '../../definitions';
import { addFiletToDown } from '../../helpers/until';
import { Routes } from '../../Routes';
import { getUserInformation } from '../../services/AccountService';
import { exportTaskYaml, yamlResources, yamlResourcesTypes, yamlScan, yamlTemplates } from '../../services/DataService';
import { Store } from '../../services/StoreService';
import { translations } from '../../translations/translations';
import { TextHoverCopy } from '../AlertCenter/AlertCenterScreen';
import { addSignMark } from '../AlertCenter/EventData';
import { RateDom } from '../ComplianceWhole/CompliancwContainer';
import { useAssetsClusterList } from '../../helpers/use_fun';
import './index.scss';
// import { useActivate } from 'react-activation';
let yamlStatus = [
  {
    label: translations.severity_Unknown,
    value: `unknown`,
  },
  {
    label: translations.risk,
    value: `inThreat`,
  },
  {
    label: translations.security,
    value: `secure`,
  },
];
export let postExportTaskYaml = (
  e: React.MouseEvent<HTMLElement, MouseEvent>,
  record_ids?: number[],
  filter?: any,
  task_id?: string,
) => {
  e.stopPropagation();
  const { username = '' } = getUserInformation();
  exportTaskYaml({
    record_ids,
    taskCreateAt: String(Date.now()),
    creator: username,
    filter,
    task_id,
  }).subscribe((res) => {
    if (res.error) return;
    addFiletToDown(e);
    TzMessageSuccess(translations.created_successfully);
  });
};
export let ContentModal = (props: any) => {
  let { formIns } = props;
  let [strategyList, setStrategyList] = useState<any>([]);
  useEffect(() => {
    yamlTemplates({ name: '', offset: 0, limit: 10000 }).subscribe((res) => {
      if (!res['error']) {
        let items = res.getItems().map((item: any) => {
          return {
            label: item.name,
            value: item.id,
          };
        });
        setStrategyList(items);
      }
    });
    return () => {
      formIns.resetFields();
    };
  }, []);
  return (
    <TzForm form={formIns} autoComplete="off">
      <TzFormItem
        name="template_id"
        label={`${translations.scan_baseline}：`}
        rules={[
          {
            required: true,
            message: translations.please_select_scanning_baseline,
          },
        ]}
      >
        <TzSelect placeholder={translations.please_select_scanning_baseline} options={strategyList} />
      </TzFormItem>
    </TzForm>
  );
};
export let promiseYamlScan = (data: any, formIns: FormInstance, callback?: () => void) => {
  return new Promise(async function (resolve, reject) {
    formIns
      .validateFields()
      .then((values) => {
        yamlScan(merge({}, data, values)).subscribe((res) => {
          if (res.error) {
            reject();
            return;
          }
          resolve(res);
          TzMessageSuccess(translations.scanner_images_success);
        });
      })
      .catch(reject);
  });
};

const YamlScan = (props: any) => {
  let [showPageFooter, setShowPageFooter] = useState(false);
  let [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  let [resourcesKind, setResourcesKind] = useState<any>([]);
  const l = useLocation();

  const [filters, setFilters] = useState<any>({});
  const listComp = useRef(undefined as any);
  const navigate = useNavigate();

  let setHeader = useMemoizedFn(() => {
    Store.header.next({
      title: translations.yaml_security_detection,
      extra: (
        <>
          <TzButton
            className="mr16"
            icon={<i className="icon iconfont icon-jingxiangsaomiao-peizhi f16"></i>}
            onClick={() => {
              navigate(Routes.YamlScanBaselineManagement);
            }}
          >
            {translations.baseline_management}
          </TzButton>
          <TzButton
            icon={<i className="icon iconfont icon-jingxiangsaomiao-peizhi f16"></i>}
            onClick={() => {
              navigate(Routes.ScanConfig);
            }}
          >
            {translations.scanConfiguration}
          </TzButton>
        </>
      ),
    });
  });
  useEffect(setHeader, [l]);
  // useActivate(() => {
  //   setHeader();
  // });
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
        label: translations.microseg_resources_res_name,
        name: 'name',
        type: 'input',
        icon: 'icon-ziyuan',
      },
      {
        label: translations.onlineVulnerability_outerShapeMeaning,
        name: 'namespace',
        type: 'input',
        icon: 'icon-mingmingkongjian',
      },
      {
        label: translations.scan_baseline,
        name: 'template_name',
        type: 'input',
        icon: 'icon-dengbaoduiqi',
      },
      {
        label: translations.clusterManage_key,
        name: 'cluster_key',
        type: 'select',
        icon: 'icon-jiqun',
        props: {
          mode: 'multiple',
          options: clusterList,
        },
      },

      {
        label: translations.compliances_node_status,
        name: 'status',
        type: 'select',
        icon: 'icon-celveguanli',
        props: {
          mode: 'multiple',
          options: yamlStatus,
        },
      },

      {
        label: translations.microseg_resources_res_kind,
        name: 'kind',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          mode: 'multiple',
          options: resourcesKind,
        },
      },

      {
        label: translations.last_scan_time_C,
        name: 'scan_time',
        type: 'rangePickerCt',
        icon: 'icon-shijian',
        props: {
          showTime: true,
          format: 'YYYY/MM/DD HH:mm:ss',
        },
      },
    ],
    [clusterList, resourcesKind],
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
  let handleRowSelection = (selected: boolean, selectedRows: any[]) => {
    setSelectedRowKeys((pre: any) => {
      selectedRows.forEach(({ id }: any) => {
        if (selected) {
          pre.push(id);
        } else {
          pre.remove(id);
        }
      });
      return [...pre];
    });
  };
  const rowSelection = useMemo(() => {
    if (!showPageFooter) return undefined;
    return {
      columnWidth: '32px',
      selectedRowKeys,
      onSelect: (record: any, selected: any, selectedRows: any, nativeEvent: any) => {
        nativeEvent.stopPropagation();
        handleRowSelection(selected, [record]);
      },
      onSelectAll: (selected: any, selectedRows: any, changeRows: any) => {
        handleRowSelection(selected, changeRows);
      },
    };
  }, [showPageFooter, selectedRowKeys]);

  const imageColumns: any = [
    {
      title: translations.resource_information,
      dataIndex: 'resource_name',
      ellipsis: true,
      width: '30%',
      render: (resource_name: any, row: any) => {
        let { resource_namespace, resource_cluster_key, resource_kind } = row;

        let node = find(clusterList, (item) => item.value === resource_cluster_key) || resource_cluster_key;
        return (
          <>
            <p className={'flex-r'}>
              <span style={{ display: 'inline-block', maxWidth: 'calc(100% - 96px)', fontSize: 16 }}>
                <TextHoverCopy text={resource_name} lineClamp={2} />
              </span>
              <TzTag className={'middle ml12 ant-tag-gray'}>{resource_kind}</TzTag>
            </p>

            <p className={'flex-r-c mt8'} style={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}>
              <TzTag className={'small mr4 ant-tag-gray mb4'}>
                {translations.clusterManage_key}：{node.label}
              </TzTag>
              <TzTag className={'small mb4 ant-tag-gray'}>
                {translations.onlineVulnerability_outerShapeMeaning}：{resource_namespace}
              </TzTag>
            </p>
          </>
        );
      },
    },
    {
      title: translations.scan_baseline,
      dataIndex: 'template_name',
      render: (template_name: any, row: any) => {
        return <EllipsisPopover lineClamp={2}>{template_name}</EllipsisPopover>;
      },
    },
    {
      title: translations.detection_pass_rate,
      dataIndex: 'success_rate',
      key: 'numFailed',
      width: 250,
      render: (success_rate: any, row: any) => {
        let p = (success_rate * 100).toFixed(0) + '%';
        return <RateDom per={p} />;
      },
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
      title: translations.last_scan_time_C,
      dataIndex: 'created_at',
      render: (created_at: any, row: any) => {
        return <>{moment(created_at).format('YYYY-MM-DD HH:mm:ss')}</>;
      },
    },
    {
      title: translations.clusterManage_operate,
      width: '11%',
      dataIndex: 'status',
      className: 'td-center',
      render: (status: any, row: any) => {
        return (
          <>
            <TzButton
              type={'text'}
              onClick={(e) => {
                e.stopPropagation();
                TzConfirm({
                  title: translations.customScan,
                  content: <ContentModal formIns={formIns} />,
                  width: '520px',
                  okText: translations.scanner_images_scann,
                  cancelText: translations.cancel,
                  onOk() {
                    return promiseYamlScan({ record_ids: [row.id] }, formIns);
                  },
                });
              }}
            >
              {translations.scanner_images_scann}
            </TzButton>
            {row.status !== 'unknown' ? (
              <TzButton
                type={'text'}
                className={'ml4'}
                onClick={(e) => {
                  e.stopPropagation();
                  postExportTaskYaml(e, [row.id]);
                }}
              >
                {translations.scanner_report_download}
              </TzButton>
            ) : null}
          </>
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
      return yamlResources(pageParams).pipe(
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
  const [formIns] = Form.useForm();
  let setFooter = useCallback(() => {
    Store.pageFooter.next(
      showPageFooter ? (
        <div>
          <span className="mr16 ml16">{`${translations.selected} ${selectedRowKeys.length} ${translations.items}`}</span>
          <TzButton
            className={'mr20'}
            disabled={!selectedRowKeys.length}
            onClick={() => {
              TzConfirm({
                title: translations.customScan,
                content: <ContentModal formIns={formIns} />,
                width: '520px',
                okText: translations.scanner_images_scann,
                cancelText: translations.cancel,
                onOk() {
                  return promiseYamlScan({ record_ids: selectedRowKeys }, formIns);
                },
              });
            }}
          >
            {translations.customScan}
          </TzButton>
          <TzButton
            className={'mr20'}
            disabled={!selectedRowKeys.length}
            onClick={(e) => {
              postExportTaskYaml(e, selectedRowKeys);
            }}
          >
            {translations.scanner_report_download}
          </TzButton>
        </div>
      ) : null,
    );
  }, [showPageFooter, selectedRowKeys, l]);
  useEffect(() => {
    setFooter();
  }, [setFooter]);

  return (
    <div className={'yaml-scan mlr32 mt4'}>
      <div className="mb12">
        <FilterContext.Provider value={{ ...data }}>
          <div className={'flex-r-c'}>
            <div>
              <TzButton
                onClick={() => {
                  setShowPageFooter((pre) => {
                    if (!pre) {
                      setSelectedRowKeys([]);
                    }
                    return !pre;
                  });
                }}
              >
                {showPageFooter ? translations.cancel_batch_operation : translations.batch_operation}
              </TzButton>
              {!showPageFooter ? (
                <>
                  <TzButton
                    className={'ml16'}
                    onClick={() => {
                      TzConfirm({
                        title: translations.customScan,
                        content: <ContentModal formIns={formIns} />,
                        width: '520px',
                        okText: translations.scanner_images_scann,
                        cancelText: translations.cancel,
                        onOk() {
                          return promiseYamlScan({ filter: filters }, formIns);
                        },
                      });
                    }}
                  >
                    {translations.customScan}
                  </TzButton>
                  <TzButton
                    className={'ml16'}
                    onClick={(e) => {
                      postExportTaskYaml(e, undefined, filters);
                    }}
                  >
                    {translations.scanner_report_download}
                  </TzButton>
                </>
              ) : null}
            </div>

            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>

      <TzTableServerPage
        rowSelection={rowSelection}
        columns={imageColumns}
        tableLayout={'fixed'}
        rowKey="id"
        reqFun={reqFun}
        onRow={(record) => {
          return {
            onClick: () => {
              navigate(Routes.YamlScanInfo + `?id=${record.id}`);
            },
          };
        }}
        ref={listComp}
      />
    </div>
  );
};

export default YamlScan;
