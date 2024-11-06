import { useMemoizedFn } from 'ahooks';
import Form from 'antd/lib/form';
import { TablePaginationConfig } from 'antd/lib/table';
import { find, isEqual, merge } from 'lodash';
import moment from 'moment';
import './ScanConfig.scss';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { map, tap } from 'rxjs/operators';
import { postExportTaskYaml } from '.';
import ArtTemplateDataInfo from '../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { Tittle } from '../../components/ComponentsLibrary/Tittle';
import TzFilter from '../../components/ComponentsLibrary/TzFilter';
import useTzFilter, { FilterContext } from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import TzFilterForm from '../../components/ComponentsLibrary/TzFilterForm';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { TzSpinLoadingOutlined } from '../../components/ComponentsLibrary/TzSpin';
import TzTextArea from '../../components/ComponentsLibrary/TzTextArea';
import TzTimePicker from '../../components/ComponentsLibrary/TzTimePicker';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../components/tz-button';
import { TzCard } from '../../components/tz-card';
import { TzCheckbox } from '../../components/tz-checkbox';
import { TzDrawerFn } from '../../components/tz-drawer';
import { TzForm, TzFormItem, TzFormItemLabelTip } from '../../components/tz-form';
import { TzInput } from '../../components/tz-input';
import { TzMessageError, TzMessageSuccess } from '../../components/tz-mesage';
import { TzCol, TzRow } from '../../components/tz-row-col';
import { TzSelect } from '../../components/tz-select';
import { TzSwitch } from '../../components/tz-switch';
import { TzTable, TzTableServerPage } from '../../components/tz-table';
import { RenderTag, TzTag } from '../../components/tz-tag';
import { WebResponse } from '../../definitions';
import { deepClone } from '../../helpers/until';
import { Routes } from '../../Routes';
import {
  putYamlConfigs,
  templateSnapshotsDetail,
  yamlConfigs,
  yamlRecords,
  yamlTasks,
  yamlTemplates,
} from '../../services/DataService';
import { Store } from '../../services/StoreService';
import { translations } from '../../translations/translations';
import { TextHoverCopy } from '../AlertCenter/AlertCenterScreen';
import { DealData } from '../AlertCenter/AlertRulersScreens';
import { addSignMark } from '../AlertCenter/EventData';
import { RateDom } from '../ComplianceWhole/CompliancwContainer';
import { initTypesFilters, yamlInitTypesFilters } from '../ImageReject/ImageNewStrategy';
import { monthDay, week, yearDay } from '../MultiClusterRiskExplorer/ListComponent/NodeMirroringConfig';
import { useAssetsClusterList } from '../../helpers/use_fun';
const yamlScanType = [
  {
    label: translations.periodic_scanning,
    text: translations.periodic_scanning,
    value: 'period',
  },
  {
    label: translations.yaml_updates,
    text: translations.yaml_updates,
    value: 'update',
  },
  {
    label: translations.manual_scanning,
    text: translations.manual_scanning,
    value: 'manual',
  },
];
let yamlTaskSannStatus: any = {
  preparing: {
    title: translations.deflectDefense_ready,
    type: 'disable',
  },
  waiting: {
    title: translations.waiting,
    type: 'disable',
  },
  scanning: {
    title: translations.execution,
    type: 'finish',
  },
  complete: {
    title: translations.completed,
    type: 'pass',
  },
  failed: {
    title: translations.terminated,
    type: 'reject',
  },
};
let yamlTaskSannStatusFilter = Object.keys(yamlTaskSannStatus).map((item) => {
  return {
    text: yamlTaskSannStatus[item].title,
    value: item,
  };
});
let yamlnodeStatus: any = {
  waiting: {
    title: translations.waiting,
    style: {
      background: 'rgba(255, 196, 35, 1)',
    },
  },
  scanning: {
    title: translations.kubeScan_scanning,
    style: {
      background: 'rgba(33, 119, 209, 1)',
    },
  },
  complete: {
    title: translations.scanner_images_success,
    style: {
      background: 'rgba(82, 196, 26, 1)',
    },
  },
  failed: {
    title: translations.scanner_images_failed,
    style: {
      background: 'rgba(233, 84, 84, 1)',
    },
  },
};
let yamlnodeSannStatus = Object.keys(yamlnodeStatus).map((item) => {
  return {
    text: yamlnodeStatus[item].title,
    value: item,
  };
});
let ExceptRecord = (props: any) => {
  const [search, setSearch] = useState<any>('');
  const tablelistRef = useRef<any>(undefined);
  const navigate = useNavigate();
  let reqFun = useCallback(
    (pagination, filter) => {
      const { current = 1, pageSize = 5 } = pagination;
      const offset = (current - 1) * pageSize;
      const params = {
        offset,
        limit: pageSize,
        ...filter,
        ...props,
      };
      return yamlRecords(params).pipe(
        map((res: WebResponse<any>) => {
          const items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems || 0,
          };
        }),
      );
    },
    [search],
  );
  let recordDetailcolumns = [
    {
      title: translations.resources,
      dataIndex: 'resource_name',
      width: '40%',
      render: (imageName: any, row: any) => {
        return <EllipsisPopover lineClamp={2}>{imageName}</EllipsisPopover>;
      },
    },
    {
      title: translations.scanner_images_scanStatus,
      dataIndex: 'status',
      filters: yamlnodeSannStatus,
      render: (status: any, row: any) => {
        return (
          <p className={'node-marker'}>
            {'inprogress' === status ? (
              <p style={{ color: 'rgba(82, 196, 26, 1)' }}>
                <TzSpinLoadingOutlined title={yamlnodeStatus[status].title} />
              </p>
            ) : (
              <>
                <span className="mr6" style={yamlnodeStatus[status].style}></span>
                {yamlnodeStatus[status].title}
              </>
            )}
          </p>
        );
      },
    },
    {
      title: translations.scanStartTime,
      dataIndex: 'created_at',
      render: (created_at: any, row: any) => {
        return created_at ? moment(created_at).format('YYYY-MM-DD HH:mm:ss') : '-';
      },
    },
    {
      title: translations.error_message,
      dataIndex: 'fail_reason',
      render: (fail_reason: any, row: any) => {
        return fail_reason || '-';
      },
    },
    {
      title: translations.operation,
      width: '9%',
      render: (item: any, row: any) => {
        return row.status === 'complete' ? (
          <TzButton
            type={'text'}
            onClick={(e) => {
              postExportTaskYaml(e, [row.id]);
            }}
          >
            {translations.scanner_report_download}
          </TzButton>
        ) : (
          '-'
        );
      },
    },
  ];
  return (
    <TzTableServerPage
      tableLayout={'fixed'}
      columns={recordDetailcolumns}
      defaultPagination={{
        current: 1,
        pageSize: 5,
        hideOnSinglePage: true,
        pageSizeOptions: [5, 10, 20, 50, 100],
      }}
      rowKey={'id'}
      reqFun={reqFun}
      onRow={(record) => {
        return {
          onClick: () => {
            navigate(Routes.YamlScanInfo + `?id=${record.id}&t=${'history'}`);
          },
        };
      }}
      ref={tablelistRef}
    />
  );
};
export let templateSnapshotsDetailDrawer = async (props: any) => {
  let { template_name = '' } = props;
  let TemplateSnapshotsDetail = (props: any) => {
    let [dataSource, setDataSource] = useState([]);
    let getTemplateSnapshotsDetail = useCallback(() => {
      templateSnapshotsDetail({ id: props.template_id }).subscribe((res) => {
        if (res.error) return;
        let item = res.getItem();
        setDataSource(item.rules);
      });
    }, []);
    useEffect(() => {
      getTemplateSnapshotsDetail();
    }, []);
    const imageColumns: any = useMemo(() => {
      return [
        {
          title: 'ID',
          dataIndex: 'builtin_id',
          ellipsis: true,
          width: '20%',
        },
        {
          title: translations.notificationCenter_details_name,
          dataIndex: 'name',
          width: '30%',
        },
        {
          title: translations.notificationCenter_columns_description,
          dataIndex: 'description',
        },
        {
          title: translations.scanner_detail_severity,
          dataIndex: 'severity',
          className: 'th-center',
          width: 100,
          align: 'center',
          filters: yamlInitTypesFilters,
          onFilter: (value: string, record: any) => {
            return value.indexOf(record.severity) != -1;
          },
          render(item: string) {
            return <RenderTag type={item.toLocaleUpperCase() || 'CRITICAL'} className={'t-c'} />;
          },
        },
      ];
    }, []);
    return (
      <>
        <Tittle title={translations.detection_item} />
        <TzTable className="nohoverTable" dataSource={dataSource} pagination={false} columns={imageColumns}></TzTable>
      </>
    );
  };
  let dw: any = await TzDrawerFn({
    width: '80%',
    title: template_name,
    children: <TemplateSnapshotsDetail {...props} />,
  });
  dw.show();
};
const YamlScanInfo = (props: any) => {
  let [configInfo, setConfigInfo] = useState<any>({});
  const [editBaseInfo, setEditbaseInfo] = useState<any>(false);
  const [editScanCycle, setEditScanCycle] = useState<any>(false);
  const [scanningStrategyList, setScanningStrategyList] = useState<any>([]);
  const listComp = useRef(undefined as any);
  const [formIns] = Form.useForm();
  const [formScanCycle] = Form.useForm();

  let clusterList = useAssetsClusterList();

  const reqFun = useCallback((pagination?: TablePaginationConfig, filters?: any) => {
    const { current = 1, pageSize = 10 } = pagination || {};
    const offset = (current - 1) * pageSize;
    const pageParams = {
      offset,
      limit: pageSize,
      ...filters,
    };
    return yamlTasks(pageParams).pipe(
      map((res: any) => {
        let items = res.getItems();
        return {
          data: items,
          total: res.data?.totalItems,
        };
      }),
    );
  }, []);
  const imageColumns = [
    {
      title: translations.taskCreationTime,
      dataIndex: 'created_at',
      ellipsis: {
        showTitle: true,
      },
      render(created_at: any, row: any) {
        return (
          (
            <>
              {moment(created_at).format('YYYY-MM-DD')}
              <br />
              {moment(created_at).format('HH:mm:ss')}
            </>
          ) || '-'
        );
      },
    },
    {
      title: translations.scanType,
      dataIndex: 'scan_type',
      filters: yamlScanType,
      render: (scan_type: any, row: any) => {
        let node = find(yamlScanType, (item) => scan_type === item.value);
        return node?.label || scan_type;
      },
    },
    {
      title: translations.scan_baseline,
      dataIndex: 'template_name',
      ellipsis: {
        showTitle: true,
      },
      render: (template_name: any, row: any) => {
        return (
          <TzButton
            style={{ maxWidth: '100%' }}
            type={'text'}
            onClick={() => {
              templateSnapshotsDetailDrawer(row);
            }}
          >
            <EllipsisPopover>{template_name} </EllipsisPopover>
          </TzButton>
        );
      },
    },
    {
      title: translations.scanSuccessRate,
      dataIndex: 'success',
      render: (success: any, row: any) => {
        return `${success}/${row.total}`;
      },
    },
    {
      title: translations.imageReject_operator,
      dataIndex: 'creator',
    },
    {
      title: translations.taskStatus,
      dataIndex: 'status',
      filters: yamlTaskSannStatusFilter,
      render: (statusStr: any, row: any) => {
        return statusStr === 'preparing' ? (
          <TzSpinLoadingOutlined title={yamlTaskSannStatus[statusStr].title} />
        ) : (
          <RenderTag
            type={yamlTaskSannStatus[statusStr].type || 'reject'}
            title={yamlTaskSannStatus[statusStr].title || '-'}
          />
        );
      },
    },
    {
      title: translations.clusterManage_operate,
      dataIndex: 'status',
      width: '80px',
      render: (status: any, row: any) => {
        return status === 'complete' ? (
          <TzButton
            type={'text'}
            className={'mr4'}
            onClick={(e) => {
              postExportTaskYaml(e, undefined, undefined, row.id);
              e.stopPropagation();
            }}
          >
            {translations.scanner_report_download}
          </TzButton>
        ) : (
          '-'
        );
      },
    },
  ];
  let [strategyList, setStrategyList] = useState<any>([]);
  let getYamlTemplates = () => {
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
  };
  let getYamlConfigs = () => {
    yamlConfigs().subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      let newItem = merge({}, item, {
        period_schedule: { time: moment(item.period_schedule.time, 'HH:mm:ss') },
      });
      setConfigInfo(newItem);
      formIns.setFieldsValue(deepClone(newItem));
      formScanCycle.setFieldsValue(deepClone(newItem));
    });
  };
  useEffect(() => {
    getYamlTemplates();
    getYamlConfigs();
  }, []);
  const type = Form.useWatch(['period_schedule', 'type'], formScanCycle);
  let [dateList, optionList] = useMemo(() => {
    let dateList = [
      { label: translations.compliances_cronjobs_presets_daily, value: 'day' },
      { label: translations.compliances_cronjobs_presets_weekly, value: 'week' },
      { label: translations.compliances_cronjobs_presets_monthly, value: 'month' },
    ];
    let optionList: any = [];
    switch (type) {
      case 'day':
        optionList = [];
        break;
      case 'week':
        optionList = week.map((item, index) => {
          return {
            value: index,
            label: item,
          };
        });
        break;
      case 'month':
        optionList = monthDay;
        break;
      case 'year':
        optionList = yearDay;
        break;
    }
    return [dateList, optionList];
  }, [type]);
  const allCluster = Form.useWatch(['period_objects', 'all'], formScanCycle);
  let scanCycleInfo: DealData[] = useMemo(() => {
    let dataInfo: DealData[] = [];
    let str: any = {
      scanCycle: translations.scanningCycle + '：',
      scan_baseline: translations.scan_baseline + '：',
      scanObjects: translations.scanning_object + '：',
    };
    if (!configInfo.period_schedule) return [];
    Object.keys(str).map((item) => {
      let obj: DealData = {
        title: str[item] || item,
        content: configInfo[item] || '-',
      };
      let { type, time, weekday, days } = configInfo.period_schedule;
      let { name } = configInfo.period_template;
      let { all, clusters } = configInfo.period_objects;
      let newTime = moment(time).format('HH:mm:ss');
      if ('scanCycle' === item) {
        obj['render'] = (row: any) => {
          let format = '';
          switch (type) {
            case 'day':
              format = `${translations.every_day} ${newTime}`;
              break;
            case 'week':
              format = `${translations.compliances_cronjobs_presets_weekly} ${weekday
                .map((item: any) => {
                  return week[item];
                })
                .join('，')} (${newTime})`;
              break;
            case 'month':
              format = `${translations.compliances_cronjobs_presets_monthly} ${days
                .map((item: any) => {
                  return monthDay?.[item - 1]?.label;
                })
                .join('，')} (${newTime})`;
              break;
            default:
              format = newTime;
              break;
          }
          return <p>{format}</p>;
        };
      }
      if ('scan_baseline' === item) {
        obj['render'] = (row: any) => {
          return <p>{name}</p>;
        };
      }
      if ('scanObjects' === item) {
        obj['render'] = (row: any) => {
          return (
            <p>
              {all
                ? translations.all_clusters
                : clusterList
                    .filter((item) => {
                      return clusters?.includes(item.value);
                    })
                    .map((item) => item.label)
                    .join(' , ') || '-'}
            </p>
          );
        };
      }
      dataInfo.push(obj);
    });
    return dataInfo;
  }, [configInfo, clusterList, optionList]);
  let putYamlConfigsFn = useCallback(
    (val, callback?: () => void) => {
      let p = merge({}, configInfo, val);
      p['period_schedule'] &&
        (p['period_schedule']['time'] = moment(p?.['period_schedule']?.['time']).format('HH:mm:ss'));
      if (!p.update_template?.id) {
        TzMessageError(translations.originalWarning_pleaseSelect + translations.scan_baseline);
        return;
      }
      putYamlConfigs(p).subscribe((res) => {
        if (res.error) {
          return;
        }
        TzMessageSuccess(translations.configuration_update_successful);
        getYamlConfigs();
        callback && callback();
      });
    },
    [configInfo],
  );
  useEffect(() => {
    yamlTemplates({ offset: 0, limit: 10000 })
      .pipe(
        tap((res: WebResponse<any>) => {
          if (!res['error']) {
            let items = res.getItems().map((item: any) => {
              return {
                label: item.name,
                value: item.id,
              };
            });
            setScanningStrategyList(items);
          }
        }),
      )
      .subscribe();
  }, []);
  return (
    <div className={'scan-config mlr32'}>
      <TzCard
        title={translations.scan_settings}
        extra={
          editBaseInfo ? (
            <>
              <TzButton
                size={'small'}
                type={'primary'}
                onClick={async () => {
                  let val = await formIns?.validateFields();
                  putYamlConfigsFn(val, () => {
                    setEditbaseInfo(false);
                  });
                }}
              >
                {translations.save}
              </TzButton>
              <TzButton
                size={'small'}
                className={'ml8'}
                onClick={() => {
                  setEditbaseInfo(false);
                }}
              >
                {translations.cancel}
              </TzButton>
            </>
          ) : (
            <TzButton
              size={'small'}
              onClick={() => {
                setEditbaseInfo(true);
              }}
            >
              {translations.edit}
            </TzButton>
          )
        }
        className={'mb20'}
        bodyStyle={{ paddingLeft: '25px', paddingRight: '25px', paddingBottom: '0px' }}
      >
        <TzForm form={formIns} layout={'horizontal'} labelCol={{ flex: 1 }} wrapperCol={{ flex: 'none' }}>
          <TzFormItem
            className="form-item-dashed"
            colon={false}
            name={'update_toggle'}
            valuePropName="checked"
            style={{ marginBottom: '0px' }}
            label={<TzFormItemLabelTip label={translations.unStandard.str260} tip={translations.unStandard.str261} />}
          >
            {editBaseInfo ? (
              <TzSwitch
                checkedChildren={translations.confirm_modal_isopen}
                unCheckedChildren={translations.confirm_modal_isclose}
              />
            ) : (
              <RenderTag type={configInfo?.update_toggle + ''} className={'mr0'} />
            )}
          </TzFormItem>
          <TzFormItem
            className="form-item-dashed"
            colon={false}
            label={<TzFormItemLabelTip label={translations.unStandard.str262} tip={translations.unStandard.str263} />}
            name={['update_template', 'id']}
            style={{ marginBottom: '0px' }}
          >
            {editBaseInfo ? (
              <TzSelect placeholder={translations.please_select_scanning_baseline} options={strategyList} />
            ) : (
              <span style={{ color: '#3e4653' }}>
                {find(strategyList, (item) => item.value === configInfo?.update_template?.id)?.label || '-'}
              </span>
            )}
          </TzFormItem>
        </TzForm>
      </TzCard>
      <TzCard
        title={
          <>
            <span className={'f-l mr8'}>{translations.periodic_scan_configuration}</span>{' '}
            {editScanCycle ? null : <RenderTag type={configInfo?.period_toggle + ''} />}
            <span className={'f-r'}>
              {editScanCycle ? (
                <>
                  <TzButton
                    size={'small'}
                    type={'primary'}
                    onClick={async () => {
                      let val = await formScanCycle?.validateFields();
                      putYamlConfigsFn(val, () => {
                        setEditScanCycle(false);
                      });
                    }}
                  >
                    {translations.save}
                  </TzButton>
                  <TzButton
                    size={'small'}
                    className={'ml8'}
                    onClick={() => {
                      setEditScanCycle(false);
                    }}
                  >
                    {translations.cancel}
                  </TzButton>
                </>
              ) : (
                <TzButton
                  size={'small'}
                  onClick={() => {
                    setEditScanCycle(true);
                  }}
                >
                  {translations.edit}
                </TzButton>
              )}
            </span>
          </>
        }
        className={'mt20 mb20'}
        bodyStyle={{ paddingBottom: 0 }}
      >
        {editScanCycle ? (
          <TzForm form={formScanCycle}>
            <TzFormItem label={translations.functionSwitch} name="period_toggle" valuePropName="checked">
              <TzSwitch
                checkedChildren={translations.confirm_modal_isopen}
                unCheckedChildren={translations.confirm_modal_isclose}
              />
            </TzFormItem>
            <TzRow>
              <TzCol flex={'144px'}>
                <TzFormItem label={translations.compliances_breakdown_runduring} name={['period_schedule', 'type']}>
                  <TzSelect options={dateList} placeholder={translations.unStandard.str218} />
                </TzFormItem>
              </TzCol>
              {type === 'week' ? (
                <TzCol flex={'438px'} style={{ marginLeft: '12px', paddingTop: '26px' }}>
                  <TzFormItem name={['period_schedule', 'days']} noStyle={true}>
                    <TzSelect
                      allowClear
                      options={optionList}
                      mode={'multiple'}
                      maxTagCount="responsive"
                      placeholder={translations.originalWarning_pleaseSelect + translations.weekly}
                    />
                  </TzFormItem>
                </TzCol>
              ) : type === 'month' ? (
                <TzCol flex={'438px'} style={{ marginLeft: '12px', paddingTop: '26px' }}>
                  <TzFormItem name={['period_schedule', 'days']} noStyle={true}>
                    <TzSelect
                      allowClear
                      options={optionList}
                      mode={'multiple'}
                      maxTagCount="responsive"
                      placeholder={translations.originalWarning_pleaseSelect + translations.monthly}
                    />
                  </TzFormItem>
                </TzCol>
              ) : null}
              <TzCol flex={'144px'} style={{ marginLeft: '12px', paddingTop: '26px' }}>
                <TzFormItem name={['period_schedule', 'time']} noStyle={true}>
                  <TzTimePicker />
                </TzFormItem>
              </TzCol>
            </TzRow>

            <TzFormItem label={translations.scan_baseline} name={['period_template', 'id']}>
              <TzSelect
                placeholder={translations.please_select_scanning_baseline}
                options={scanningStrategyList}
                style={{ width: '456px' }}
              />
            </TzFormItem>
            <TzFormItem
              label={translations.scanning_object}
              name={['period_objects', 'all']}
              valuePropName="checked"
              style={{ marginBottom: '4px' }}
            >
              <TzCheckbox>{translations.all_clusters}</TzCheckbox>
            </TzFormItem>

            <TzFormItem noStyle={true} name={['period_objects', 'clusters']}>
              <TzSelect
                disabled={allCluster}
                style={{ marginBottom: '20px', width: '100%' }}
                isSelection={false}
                allowClear
                options={clusterList}
                mode={'multiple'}
                maxTagCount="responsive"
                placeholder={translations.activeDefense_clusterPla}
              />
            </TzFormItem>
          </TzForm>
        ) : (
          <ArtTemplateDataInfo className="mt4" rowProps={{ gutter: [0, 0] }} data={scanCycleInfo} span={1} />
        )}
      </TzCard>
      <TzCard title={<>{translations.scanRecord}</>}>
        <TzTableServerPage
          columns={imageColumns}
          tableLayout={'fixed'}
          rowKey="id"
          reqFun={reqFun}
          ref={listComp}
          expandable={{
            expandedRowRender: (item: any) => {
              return <ExceptRecord task_id={item.id} />;
            },
          }}
        />
      </TzCard>
    </div>
  );
};

export default YamlScanInfo;
