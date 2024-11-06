import React, { useCallback, useMemo, useRef, useState, useEffect, ReactNode } from 'react';
import { TablePaginationConfig } from 'antd/lib/table';
import { map, tap } from 'rxjs/operators';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../components/tz-button';
import { TzInput } from '../../components/tz-input';
import { TzCol, TzRow } from '../../components/tz-row-col';
import { TzSelect } from '../../components/tz-select';
import { TzTableServerPage } from '../../components/tz-table';
import { TzTooltip } from '../../components/tz-tooltip';
import { BaseChartDataType, Overview, ScoreType, SelectItem, WebResponse } from '../../definitions';
import { downFile } from '../../helpers/until';
import {
  getPolicies,
  postJob,
  exportComplianceFile,
  getComplianceFile,
  breakdown,
  scanNode,
  suggest,
  getHistory,
  getListClusters,
  clusterGraphNodes,
} from '../../services/DataService';
import { localLang, translations } from '../../translations/translations';
import { PageTitle } from '../ImagesScanner/ImagesCI/CI';
import './CompliancwContainer.less';
import { TzCard } from '../../components/tz-card';
import { Store } from '../../services/StoreService';
import { getUserInformation } from '../../services/AccountService';
import Form, { FormInstance } from 'antd/lib/form';
import { TzForm, TzFormItem } from '../../components/tz-form';
import { TzConfirm } from '../../components/tz-modal';
import { TzCascader, TzFilter, TzFilterForm } from '../../components/ComponentsLibrary';
import { TzMessageSuccess } from '../../components/tz-mesage';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Routes } from '../../Routes';
import { getStatusStr, useAssetsClusterList, useAssetsClusterNode } from '../../helpers/use_fun';
import { showFailedMessage } from '../../helpers/response-handlers';
import ComplianceChart from './ComplianceChart';
import ComplianceNodeChart from './ComplianceChart/NodeChart';
import moment from 'moment';
import { flattenDeep, isEqual } from 'lodash';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import useTzFilter, { FilterContext } from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { useMemoizedFn, useUnmount, useUpdateEffect } from 'ahooks';
import { TzDrawer } from '../../components/tz-drawer';
import ComplianceInfo, { TComplianceInfo } from './ComplianceInfo';
// import KeepAlive, { useActivate, useAliveController, useUnactivate } from 'react-activation';
import { RenderTag } from '../../components/tz-tag';
import { StrategyAction } from '../../components/ComponentsLibrary/TzStrategyAction';
export enum ComplianceEnum {
  compliance = 'compliance',
  nodeName = 'nodeName',
}
export const baseChartData: any = {
  error: {
    text: translations.statusChartLegends_error,
    color: '#E66061',
    bgColor: 'rgba(233, 84, 84, 0.1)',
  },
  waiting: {
    text: translations.statusChartLegends_waiting,
    color: '#999EAD',
    bgColor: 'rgba(233, 84, 84, 0.1)',
  },
  success: {
    text: translations.statusChartLegends_success,
    color: '#62D078',
    bgColor: 'rgba(98, 208, 120, 0.1)',
  },
  failed: {
    text: translations.statusChartLegends_failed,
    color: '#E95454',
    bgColor: 'rgba(233, 84, 84, 0.1)',
  },
  warn: {
    text: translations.statusChartLegends_warn,
    color: '#F5983B',
    bgColor: 'rgba(233, 84, 84, 0.1)',
  },
  info: {
    text: translations.statusChartLegends_info,
    color: '#55B6F7',
    bgColor: 'rgba(233, 84, 84, 0.1)',
  },
  [BaseChartDataType.typeOther]: {
    text: translations.statusChartLegends_typeOther,
    color: '#999EAD',
  },
  [BaseChartDataType.typeFailed]: {
    text: translations.statusChartLegends_typeFailed,
    color: '#ED494A',
  },
  [BaseChartDataType.typeSuccess]: {
    text: translations.statusChartLegends_typeSuccess,
    color: '#69C57B',
  },
  [BaseChartDataType.typeWarn]: {
    text: translations.statusChartLegends_typeWarn,
    color: '#F5983B',
  },
  [Overview.typeOnline]: {
    text: translations.scanner_overview_typeOnline,
    color: '#2177D1',
  },
  [Overview.typeNotline]: {
    text: translations.scanner_overview_typeNotline,
    color: '#E7E9ED',
  },
  [Overview.typeWarnline]: {
    text: translations.scanner_overview_typeWarnline,
    color: '#F5983B',
  },
  [Overview.typeNull]: {
    text: translations.scanner_overview_typeNull,
    color: '#f2f2f2',
  },
  [ScoreType.suc]: {
    text: '',
    color: '#3BC456',
  },
  [ScoreType.mid]: {
    text: '',
    color: '#F8BF23',
  },
  [ScoreType.low]: {
    text: '',
    color: 'F58531',
  },
  [ScoreType.err]: {
    text: '',
    color: '#E05E5F',
  },
  project: {
    text: translations.project,
    color: '#69C57B',
  },
};
export const statusSelectEnum: any = {
  compliance: {
    label: translations.compliances_breakdown_text,
    style: {
      color: 'rgba(255, 196, 35, 1)',
      background: 'rgba(255, 196, 35, 0.1000)',
    },
  },
  unCompliance: {
    label: translations.compliances_policyDetails_Fail,
    style: {
      color: 'rgba(255, 196, 35, 1)',
      background: 'rgba(255, 196, 35, 0.1000)',
    },
  },
};
export const actionList = [
  {
    label: translations.compliance,
    value: ComplianceEnum.compliance,
  },
  {
    label: translations.vulnerabilityDetails_nodeName,
    value: ComplianceEnum.nodeName,
  },
];
export const getStatusFile = (checkType: any, taskID: any) => {
  exportComplianceFile(checkType, taskID).subscribe((res) => {
    const status = res.status;
    if (status === 0) {
      getComplianceFile(taskID).subscribe((res) => {
        downFile(res, `${checkType}_${localLang}_${new Date().getTime()}.xlsx`);
      });
    } else if (status === 1) {
      setTimeout(() => getStatusFile(checkType, taskID), 1000);
    } else if (status === 2) {
      showFailedMessage(translations.compliances_breakdown_runfail, '400');
    }
  });
};

const initiateScan = (type: any) => {
  let data = Object.assign(
    {},
    {
      updater: getUserInformation().username,
      type,
    },
  );
  let refDom: FormInstance<any>;
  let ContentModal = (props: any) => {
    let { data } = props;
    let [scanningStrategyList, setScanningStrategyList] = useState<SelectItem[] | undefined>();
    const [form] = Form.useForm();
    const [options, setOptions] = useState<any[]>([]);
    useEffect(() => {
      refDom = form;
      getPolicies({ scapType: data.type, name: '', offset: 0, limit: 10000 })
        .pipe(
          tap((res: WebResponse<any>) => {
            if (!res['error']) {
              let items = res.getItems();
              let arr = items.map((item: any) => {
                return {
                  label: item.name,
                  value: item.id,
                };
              });
              form.setFieldsValue({
                clusterInfos: [['all']],
                policyId: arr[0].value,
              });
              setScanningStrategyList(arr);
            }
          }),
        )
        .subscribe();
      getListClusters({ offset: 0, limit: 100 }).subscribe((res) => {
        let items = res.getItems();
        setOptions(
          items.map((item: any) => {
            return {
              label: item.name,
              value: item.key,
              isLeaf: false,
            };
          }),
        );
      });
    }, []);

    const clusterListNode = useAssetsClusterNode();
    const clusterInfos = Form.useWatch('clusterInfos', form);
    let newclusterListNode = useMemo(() => {
      let arr = flattenDeep(clusterInfos);
      const nextOpt = setOptNodeDisabled(clusterListNode, arr.includes('all'));
      if (arr.includes('all')) {
        form.setFieldsValue({ clusterInfos: [['all']] });
      }
      return [
        {
          value: 'all',
          label: translations.all_clusters,
          isLeaf: true,
        },
        ...nextOpt,
      ].map((v) => ({ ...v, notShowStatus: true }));
    }, [clusterListNode, clusterInfos]);

    return (
      <TzForm
        form={form}
        initialValues={Object.assign({}, data, { scapType: data.type })}
        autoComplete="off"
        onFinish={(res) => {
          let obj = res.clusterInfos.reduce((pre: any, item: any) => {
            if (item[0] === 'all') {
              return clusterListNode.reduce((pre: any, item: any) => {
                pre[item.value] = [];
                return pre;
              }, {});
            }
            if (pre[item[0]]) {
              pre[item[0]].push(item[1]);
            } else {
              item[1] ? (pre[item[0]] = [item[1]]) : (pre[item[0]] = []);
            }
            return pre;
          }, {});
          let clusterInfos = Object.keys(obj).map((item) => {
            return {
              clusterKey: item,
              isAllNodes: !obj[item].length,
              nodes: obj[item],
            };
          });
          postJob(Object.assign({}, res, { clusterInfos })).subscribe((res) => {
            if (!res['error']) {
              TzMessageSuccess(translations.unStandard.str33);
            }
          });
        }}
      >
        <TzFormItem name="scapType" hidden>
          <TzInput />
        </TzFormItem>
        <TzFormItem
          name="policyId"
          label={`${translations.scan_baseline}：`}
          rules={[
            {
              required: true,
              message: translations.please_select_scanning_baseline,
            },
          ]}
        >
          <TzSelect placeholder={translations.please_select_scanning_baseline} options={scanningStrategyList} />
        </TzFormItem>
        <TzFormItem label={`${translations.scanning_object}：`} name="clusterInfos" style={{ marginBottom: 0 }}>
          <TzCascader
            className={'compliance-custom-scan'}
            options={newclusterListNode}
            placeholder={translations.please_select_the_scanning_object}
            multiple
            labelFormat={(node: ReactNode, row: any) => {
              return !row?.notShowStatus
                ? row?.Ready === 1
                  ? node
                  : React.createElement(TzTooltip, { title: getStatusStr(row) }, node)
                : node;
            }}
            query={{
              loadOptions: (clusterID: string, call: any) => {
                clusterGraphNodes({ clusterID }).subscribe(call);
              },
              cacheUrl: '/api/v2/platform/assets/nodes',
              fieldNames: {
                value: 'ID',
                label: 'HostName',
              },
              nodeRender: (node) => ({
                disabled: flattenDeep(clusterInfos).includes('all')
                  ? true
                  : getStatusStr(node) !== translations.clusterGraphList_on,
              }),
              leaf: true,
            }}
          />
        </TzFormItem>
      </TzForm>
    );
  };
  TzConfirm({
    title: translations.customScan,
    content: <ContentModal data={data} />,
    width: '520px',
    okText: translations.scanner_images_scann,
    cancelText: translations.cancel,
    onOk() {
      return new Promise(function (resolve, reject) {
        refDom
          .validateFields()
          .then((res) => {
            resolve(res);
            refDom.submit();
          })
          .catch(() => {
            refDom.submit();
            reject();
          });
      });
    },
  });
};

// 递归设置节点的disabled属性
const setOptNodeDisabled = (treeNode: any, disabled: boolean) => {
  function loop(treeNode: any, disabled: boolean) {
    return treeNode.map((v: any) => {
      if (v.children?.length) {
        return {
          ...v,
          disabled,
          children: loop(v.children, disabled),
        };
      }
      return { ...v, disabled, isLeaf: false };
    });
  }
  if (!treeNode?.length) {
    return [];
  }
  return loop(treeNode, disabled);
};
export let RateDom = (props: any) => {
  let { per = '0%', style } = props;
  return (
    <div className={'flex-r-c'} style={style}>
      <div
        className={'t-c mr8'}
        style={{
          flex: 1,
          height: '10px',
          background: '#F4F6FA',
          position: 'relative',
          borderRadius: '3px',
        }}
      >
        <p
          style={{
            width: per,
            background: 'linear-gradient(90deg, #2177D1 0%, #2D94FF 100%)',
            height: '10px',
            borderRadius: '3px',
          }}
        ></p>
        <img
          alt=""
          src="/images/tdbg.png"
          style={{
            width: '100%',
            height: '10px',
            position: 'absolute',
            top: '0',
            left: '0',
          }}
        />
      </div>
      <span
        style={{
          top: '0',
          right: '-20px',
          color: '#2177D1',
          width: '38px',
        }}
      >
        {per}
      </span>
    </div>
  );
};
const CompliancwContainer = (props: any) => {
  const navigate = useNavigate();
  // const { refreshScope } = useAliveController();
  const l = useLocation();
  const { pathname } = l;
  const [result] = useSearchParams();
  let [checkType] = useState(result.get('checkType') || props.type || 'kube');
  let [clusterKey, setClusterKey] = useState(
    result.get('clusterKey') || window.localStorage.getItem('clusterID') || '',
  );
  const [optionsMap, setOptionsMap] = useState<Record<string, any>>({});
  let [taskID, setTaskID] = useState<any>(result.get('taskID'));
  let [taskFinishedAt, setTaskFinishedAt] = useState<any>(moment());
  let [filters, setFilters] = useState<any>({});
  let [action, setAction] = useState<ComplianceEnum.compliance | ComplianceEnum.nodeName>(ComplianceEnum.compliance);
  const [complianceInfo, setComplianceInfo] = useState<TComplianceInfo['obj']>();
  const cacheDrawerData = useRef<TComplianceInfo['obj']>();
  const listComp = useRef(undefined as any);
  const filterCacheRef = useRef({
    [ComplianceEnum.compliance]: undefined,
    [ComplianceEnum.nodeName]: undefined,
  });
  const columns = useMemo(() => {
    const _col: any = [
      {
        title: translations.compliances_breakdown_policyNumber,
        key: 'policyNumber',
        dataIndex: 'policyNumber',
        width: checkType === 'host' ? '20%' : '10%',

        render: (policyNumber: any, row: any) => {
          return <EllipsisPopover lineClamp={2}>{policyNumber}</EllipsisPopover>;
        },
      },
      {
        title: translations.compliances_breakdown_section,
        key: 'section',
        dataIndex: 'section',
        width: '20%',
        ellipsis: {
          showTitle: false,
        },
        render: (section: any, row: any) => {
          return <EllipsisPopover lineClamp={2}>{section}</EllipsisPopover>;
        },
      },
      {
        title: translations.compliances_breakdown_dengbao,
        key: 'udbcp',
        dataIndex: 'udbcp',
        width: '20%',
      },
      {
        title: translations.rule_requirements,
        key: 'description',
        dataIndex: 'description',
      },
      {
        title: translations.compliance_passing_rate,
        key: 'numFailed',
        dataIndex: 'numFailed',
        width: 250,
        render: (numFailed: any, row: any) => {
          let { fail, info, pass, warn } = row;
          let p = ((1 - (fail + 0.001) / (fail + info + pass + warn + 0.001)) * 100).toFixed(0) + '%';
          return <RateDom per={p} />;
        },
      },
    ];
    const _colNode = [
      {
        title: translations.compliances_breakdown_dotname,
        key: 'nodeName',
        dataIndex: 'nodeName',
        ellipsis: {
          showTitle: false,
        },
        render: (nodeName: any, row: any) => {
          return nodeName;
        },
      },
      {
        title: translations.scanner_images_scanStatus,
        key: 'state',
        dataIndex: 'state',
        width: '20%',
        ellipsis: {
          showTitle: false,
        },
        render: (state: any, row: any) => {
          return <RenderTag type={state == 2 ? 'fail' : 'finish'} />;
        },
      },
      {
        title: translations.last_scan_time,
        key: 'finishedAt',
        dataIndex: 'finishedAt',
        width: '14%',
        render: (time: any, row: any) => moment(time * 1000).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: translations.compliance_passing_rate,
        key: 'numFailed',
        dataIndex: 'numFailed',
        width: 250,
        render: (numFailed: any, row: any) => {
          let { fail, info, pass, warn } = row;
          let p = ((1 - (fail + 0.001) / (fail + info + pass + warn + 0.001)) * 100).toFixed(0) + '%';
          return <RateDom per={p} />;
        },
      },
    ];
    let arr = [..._col];
    checkType === 'host' ? arr.splice(1, 2) : null;
    checkType === 'docker'
      ? _col.splice(1, 0, {
          title: translations.runtime_type,
          dataIndex: 'runtime',
          width: '10%',
        })
      : null;

    return action === ComplianceEnum.compliance ? (checkType === 'host' ? arr : _col) : _colNode;
  }, [checkType, action]);
  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      if (action !== ComplianceEnum.compliance) {
        let o = Object.assign({}, { checkType, clusterKey }, filters, {
          taskID,
          checkStatus: filters.checkStatusNode,
        });
        delete o.checkStatusNode;
        return scanNode(o).pipe(
          map((res: any) => {
            let items = res.getItems().map((item: any) => {
              item['taskID'] = res.data ? res.data.taskID : null;
              return item;
            });
            setTaskID(res.data ? res.data.taskID : null);
            return {
              data: items,
              total: res.totalItems,
            };
          }),
        );
      } else {
        if (!clusterKey) {
          return getHistory().pipe(
            map(() => {
              return {
                data: [],
                total: 0,
              };
            }),
          );
        }
        return breakdown({ checkType, clusterKey, ...filters, taskID }).pipe(
          map((res: any) => {
            let items = res.getItems().map((item: any) => {
              item['taskID'] = res.data ? res.data.taskID : null;
              return item;
            });
            setTaskID(res.data ? res.data.taskID : null);
            setTaskFinishedAt(res.data ? res.data.taskFinishedAt * 1000 : moment().valueOf());
            return {
              data: items,
              total: res.totalItems,
            };
          }),
        );
      }
    },
    [filters, clusterKey, action],
  );
  let { checkStatusOp, statusOp } = useMemo(() => {
    let statusOp = [
      {
        label: translations.compliances_historyColumns_finishedAt,
        value: 1,
      },
      {
        label: translations.compliances_historyColumns_numFailed,
        value: 2,
      },
    ];
    let checkStatusOp = Object.keys(statusSelectEnum).map((item) => {
      return {
        label: statusSelectEnum[item].label,
        value: item,
      };
    });
    return { checkStatusOp, statusOp };
  }, []);
  let fetchUserList = useCallback(
    (suggestType): any => {
      if (!clusterKey || !taskID) {
        return getHistory().pipe(
          map(() => {
            return { getItems: () => [] };
          }),
        );
      }
      return suggest({
        checkType,
        clusterKey,
        suggestType,
        taskID,
      });
    },
    [checkType, clusterKey, taskID],
  );
  useEffect(() => {
    ['complianceItem', 'section', 'udbcp', 'hostname'].map((key) => {
      fetchUserList(key)?.subscribe((res: any) => setOptionsMap((prev) => ({ ...prev, [key]: res.getItems() })));
    });
  }, [fetchUserList]);

  let historyDetail = useMemo(() => {
    return pathname === Routes.ComplianceHistoryInfo;
  }, [pathname]);
  let clusterList = useAssetsClusterList();
  let clusterName = useMemo(() => {
    let obj = clusterList.find((item: any) => {
      return clusterKey === item.value;
    });
    return obj ? obj.label : '';
  }, [clusterKey, clusterList]);
  useEffect(() => {
    if (historyDetail) return;
    const fetchGetclusterID = Store.clusterID
      .pipe(
        tap((clusterID: any) => {
          setTaskID(null);
          setClusterKey(clusterID);
        }),
      )
      .subscribe();
    return () => fetchGetclusterID.unsubscribe();
  }, [historyDetail]);

  useEffect(() => {
    if (historyDetail) {
      Store.header.next({
        title: (
          <div className={'flex-r-c'} style={{ justifyContent: 'flex-start' }}>
            {moment(taskFinishedAt).format('YYYY-MM-DD HH:mm:ss')} {translations.compliances_breakdown_title}{' '}
            <span style={{ fontSize: '16px', color: '#3E4653', fontWeight: 400 }} className={'ml16'}>
              {translations.compliances_cronjobs_selectCluster}：{clusterName}
            </span>
          </div>
        ),
        onBack: () => {
          navigate(-1);
        },
      });
    }
  }, [clusterName, historyDetail, taskFinishedAt, l]);
  const compliancwContainerFilter: FilterFormParam[] = useMemo(() => {
    let _filters: FilterFormParam[];
    if (action !== ComplianceEnum.compliance) {
      _filters = [
        {
          label: translations.compliances_breakdown_dotname,
          name: 'name',
          type: 'select',
          icon: 'icon-bianhao',
          props: {
            options: optionsMap['hostname'],
            // fetchOptions: (val: string) => fetchUserList(val, 'hostname'),
          },
        },
        {
          label: translations.scanner_images_scanStatus,
          name: 'status',
          type: 'select',
          icon: 'icon-celveguanli',
          props: {
            options: statusOp,
          },
        },
        {
          label: translations.compliance_results,
          name: 'checkStatusNode',
          type: 'select',
          icon: 'icon-baimingdan',
          props: {
            mode: 'multiple',
            options: checkStatusOp,
          },
        },
      ];
    } else {
      _filters = [
        {
          label: translations.compliance_ID,
          name: 'policyID',
          type: 'select',
          icon: 'icon-bianhao',
          props: {
            options: optionsMap['complianceItem'],
            // fetchOptions: (val: string) => fetchUserList(val, 'complianceItem'),
          },
        },
        {
          label: translations.compliances_breakdown_section,
          name: 'section',
          type: 'select',
          icon: 'icon-heguitiaomu',
          props: {
            options: optionsMap['section'],
            // fetchOptions: (val: string) => fetchUserList(val, 'section'),
          },
        },
        {
          label: translations.compliance_results,
          name: 'checkStatus',
          type: 'select',
          icon: 'icon-baimingdan',
          props: {
            mode: 'multiple',
            options: checkStatusOp,
          },
        },
      ];
      if (checkType !== 'host') {
        _filters.splice(2, 0, {
          label: translations.compliances_breakdown_dengbao,
          name: 'udbcp',
          type: 'select',
          icon: 'icon-dengbaoduiqi',
          props: {
            options: optionsMap['udbcp'],
            // fetchOptions: (val) => fetchUserList(val, 'udbcp'),
          },
        });
      }
    }
    const initData = filterCacheRef.current[action];
    return initData
      ? _filters.map((item) => ({
          ...item,
          value: initData[item.name],
        }))
      : _filters;
  }, [checkStatusOp, statusOp, optionsMap, checkType, action]);

  const filterData = useTzFilter({ initial: compliancwContainerFilter });

  useUpdateEffect(() => {
    filterData.updateFilter(compliancwContainerFilter);
  }, [action, compliancwContainerFilter, optionsMap]);
  const closeDrawer = useMemoizedFn(() => {
    setComplianceInfo(undefined);
  });
  // useActivate(() => {
  //   if (Store.menuCacheItem.value === 'complianceInfo') {
  //     Store.menuCacheItem.next('');
  //     refreshScope('complianceInfo');
  //   } else {
  //     setComplianceInfo(cacheDrawerData.current);
  //   }
  // });
  useUnmount(() => {
    // refreshScope('complianceInfo');
    closeDrawer();
  });
  // useUnactivate(closeDrawer);

  const handleChange = useCallback(
    (values: any) => {
      filterCacheRef.current[action] = values;
      setFilters((prev: any) => (isEqual(values, prev) ? prev : values));
    },
    [action],
  );

  return (
    <div className="mlr32 compliancw-container" style={{ margin: '0 32px' }}>
      <TzRow style={{ minHeight: '288px' }}>
        <TzCol span={12}>
          <TzCard
            title={translations.compliance}
            bodyStyle={{ padding: '0' }}
            bordered={false}
            headStyle={{ paddingLeft: '0' }}
          >
            <ComplianceChart checkType={checkType} clusterKey={clusterKey} taskID={taskID} />
          </TzCard>
        </TzCol>
        <TzCol span={12}>
          <TzCard
            title={translations.vulnerabilityDetails_nodeName}
            bodyStyle={{ padding: '0' }}
            bordered={false}
            headStyle={{ paddingLeft: '0' }}
          >
            <ComplianceNodeChart checkType={checkType} clusterKey={clusterKey} taskID={taskID} />
          </TzCard>
        </TzCol>
      </TzRow>
      <PageTitle
        title={
          <div className="f16">
            {translations.compliances_breakdown_title}{' '}
            <StrategyAction
              className="ml12 compliance-strategy-action"
              style={{
                float: 'initial',
                display: 'inline-block',
                fontWeight: 400,
              }}
              data={actionList}
              value={action}
              onChange={(item: any) => {
                setAction(item);
              }}
            />
          </div>
        }
      />
      <div className="compliancw-container-filter">
        <FilterContext.Provider value={{ ...filterData }}>
          <div className="compliancw-container-toolbar">
            <div>
              {historyDetail ? null : (
                <TzButton
                  className="mr16"
                  onClick={() => {
                    initiateScan(checkType);
                  }}
                >
                  {translations.customScan}
                </TzButton>
              )}
              <TzButton
                onClick={() => {
                  getStatusFile(checkType, taskID);
                }}
              >
                {translations.export}
              </TzButton>
            </div>
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      <TzTableServerPage
        columns={columns}
        reqFun={reqFun}
        ref={listComp}
        onRow={(record) => {
          return {
            onClick: (event) => {
              let policyID = action === ComplianceEnum.compliance ? record.policyNumber : record.nodeName;

              if (!historyDetail) {
                navigate(
                  `${Routes.ComplianceInfo}?policyID=${policyID}&checkType=${checkType}&clusterKey=${clusterKey}&action=${action}&taskID=${record.taskID}`,
                );
              } else {
                // refreshScope('complianceInfo');
                const d = {
                  policyID,
                  checkType,
                  clusterKey,
                  action,
                  taskID: record.taskID,
                };
                cacheDrawerData.current = d;
                setComplianceInfo(d);
              }
              // navigate(
              //   `${
              //     historyDetail ? Routes.ComplianceHistoryDetail : Routes.ComplianceInfo
              //   }?policyId=${policyId}&checkType=${checkType}&clusterKey=${clusterKey}&action=${action}&taskID=${
              //     record.taskID
              //   }`,
              // );
            },
          };
        }}
        rowKey={'policyNumber'}
      />
      {!!complianceInfo && (
        <TzDrawer
          visible={!!complianceInfo}
          onClose={closeDrawer}
          className="drawer-body0"
          width="80%"
          title={translations.compliance_details}
        >
          {/* <KeepAlive id="complianceInfo" name="complianceInfo" saveScrollPosition="screen"> */}
          <ComplianceInfo contentType="popUp" obj={complianceInfo} />
          {/* </KeepAlive> */}
        </TzDrawer>
      )}
    </div>
  );
};
export default CompliancwContainer;
