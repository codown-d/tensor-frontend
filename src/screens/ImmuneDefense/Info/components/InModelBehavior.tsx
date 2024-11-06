import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TableScrollFooter, TzTable, TzTableServerPage } from '../../../../components/tz-table';
import { useDebounceFn, useInfiniteScroll, useMemoizedFn, useSetState, useThrottleFn, useUpdateEffect } from 'ahooks';
import { TzButton } from '../../../../components/tz-button';
import { translations } from '../../../../translations/translations';
import { TzConfirm } from '../../../../components/tz-modal';
import { TzForm, TzFormItem } from '../../../../components/tz-form';
import { TzInput } from '../../../../components/tz-input';
import Form, { FormInstance, FormItemProps, Rule } from 'antd/lib/form';
import { keys, merge, values } from 'lodash';
import { Result, WebResponse } from '../../../../definitions';
import useData, { LearnStatus, SegmentedType } from '../useData';
import {
  delFileWhitelist,
  delCommandWhitelist,
  delNetworkWhitelist,
  fetchBehavioralLearnModelFile,
  fetchBehavioralLearnModelCommand,
  fetchBehavioralLearnModelNetwork,
  delModelFile,
  delModelCommand,
  delModelNetwork,
  getHistory,
  fetchBehavioralLearnInfo,
} from '../../../../services/DataService';
import { TzTooltip } from '../../../../components/tz-tooltip';
import { showSuccessMessage } from '../../../../helpers/response-handlers';
import { useGetCascaderResources } from '../../../../services/ServiceHook';
import { TzCascader } from '../../../../components/ComponentsLibrary';
import { filter } from '../../../ComplianceWhole/ScanManagement';
import { TreeNode } from '../../../../components/ComponentsLibrary/TzCascader/interface';
import WebSocketContext from './WebSocketContext';
import { map, tap } from 'rxjs/operators';
import getTableColumns from './useTableHook';
import ModelServiceHook from './ModelServiceHook';
import { ImmuneDefenseContext } from '../context';
import { TzRadioGroup } from '../../../../components/tz-radio';
import { segmentedOp } from './ModelData';
import { TzInputNumber } from '../../../../components/tz-input-number';
import TzSelect from '../../../../components/ComponentsLibrary/tzSelect';
export const permissionOp = [
  {
    label: translations.commonpro_readOnly,
    text: translations.commonpro_readOnly,
    value: 1,
  },
  {
    label: translations.commonpro_readWrite,
    text: translations.commonpro_readWrite,
    value: 2,
  },
];
export const fillResourceIdOp = [
  {
    label: translations.microseg_segments_direct_out,
    text: translations.microseg_segments_direct_out,
    value: 1,
  },
  {
    label: translations.microseg_segments_direct_in,
    text: translations.microseg_segments_direct_in,
    value: 2,
  },
];
let TzFormItemRender = (props: { list: FormItemProps[] }) => {
  let { list = [] } = props;
  let getRules = useCallback((rules) => {
    return merge([{ required: true }], rules) as Rule[];
  }, []);
  return (
    <>
      {list.map((item) => {
        let { children, rules = [], required = false, ...otherData } = item;
        return (
          <TzFormItem {...otherData} rules={required ? getRules(rules) : undefined}>
            {children}
          </TzFormItem>
        );
      })}
    </>
  );
};
let ModelBehavior = (props: { form: FormInstance; type: SegmentedType; from: 'info' | 'config' }) => {
  let { type, from, form } = props;
  let resourcesList = useGetCascaderResources({ showExplain: true });
  const [containers, setContainers] = useState<any>([]);
  let resource_id = form.getFieldValue('resource_id');
  let id = form.getFieldValue('id');
  let list = useMemo(() => {
    let obj = {
      [SegmentedType.COMMAND]: [
        {
          label: translations.process_path,
          name: 'path',
          children: (
            <TzInput
              placeholder={
                from == 'info'
                  ? translations.unStandard.requireTip(translations.process_path)
                  : translations.unStandard.requireTip(translations.please_process_path)
              }
            />
          ),
          required: true,
        },
        {
          label: translations.process_command_line,
          required: true,
          name: 'command',
          children: (
            <TzInput
              placeholder={
                from == 'info'
                  ? translations.unStandard.requireTip(translations.process_command_line)
                  : translations.unStandard.requireTip(translations.please_process_command_line)
              }
            />
          ),
        },
        {
          label: translations.superAdmin_userName,
          required: true,
          name: 'user',
          children: <TzInput placeholder={translations.unStandard.requireTip(translations.superAdmin_userName)} />,
        },
      ],
      [SegmentedType.FILE]: [
        {
          label: translations.scanner_detail_file_path,
          required: true,
          name: 'file_path',
          children: (
            <TzInput
              placeholder={
                from == 'info'
                  ? translations.unStandard.requireTip(translations.scanner_detail_file_path)
                  : translations.unStandard.requireTip(translations.please_scanner_detail_file_path)
              }
            />
          ),
        },
        {
          label: translations.read_write_type,
          required: true,
          name: 'permission',
          children: (
            <TzSelect
              placeholder={translations.unStandard.requireSelectTip(translations.read_write_type)}
              options={permissionOp}
            />
          ),
        },
      ],
      [SegmentedType.NETWORK]: [
        {
          label: translations.calico_cluster_type,
          required: true,
          name: 'stream_direction',
          children: (
            <TzSelect
              placeholder={translations.unStandard.requireSelectTip(translations.traffic_type)}
              options={fillResourceIdOp}
            />
          ),
        },
        {
          label: translations.source_target_resources,
          required: true,
          name: 'fill_resource_id',
          children: (
            <TzCascader
              placeholder={translations.unStandard.requireSelectTip(translations.source_target_resources)}
              options={resourcesList}
              showSearch={{ filter }}
              labelFormat={(node: ReactNode, row: TreeNode): ReactNode => {
                const isShowTip = row?.disabled && row?.explain;
                return isShowTip ? (
                  <>
                    <TzTooltip placement="topLeft" className="db" title={row?.explain || row?.label}>
                      {node}
                    </TzTooltip>
                  </>
                ) : (
                  <>{node}</>
                );
              }}
            />
          ),
        },
        {
          label: translations.microseg_segments_policy_port_title,
          required: true,
          name: 'port',
          children: (
            <TzInputNumber
              style={{ width: '100%' }}
              placeholder={translations.unStandard.requireTip(translations.microseg_segments_policy_port_title)}
            />
          ),
        },
      ],
    };
    if (from == 'info' && !id) {
      let arr = obj[type];
      return [
        ...arr,
        {
          label: translations.defense_containers,
          required: true,
          name: 'container_name',
          children: (
            <TzSelect
              options={containers}
              allowClear
              mode="multiple"
              maxTagCount="responsive"
              placeholder={translations.unStandard.requireSelectTip(translations.defense_containers)}
            />
          ),
        },
      ];
    } else {
      return obj[type];
    }
  }, [resourcesList, type, containers]);
  useEffect(() => {
    resource_id &&
      fetchBehavioralLearnInfo({ resource_id }).subscribe((res) => {
        if (res.error) {
          return;
        }
        let baseInfo = res.getItem();
        let arr =
          baseInfo?.containers?.map((item) => {
            return {
              label: item.name,
              value: item.name,
            };
          }) || [];
        setContainers(arr);
      });
  }, [from]);
  return <TzFormItemRender list={list} />;
};
let ModelFormRender = (props: { form: FormInstance; from: 'info' | 'config' }) => {
  let { form, from } = props;
  const type = Form.useWatch('type', form);
  const id = Form.useWatch('id', form);
  return (
    <TzForm form={form}>
      <TzFormItem name={'resource_id'} hidden>
        <TzInput />
      </TzFormItem>
      <TzFormItem name={'id'} hidden>
        <TzInput />
      </TzFormItem>
      <TzFormItem label={translations.type_behavior} name={'type'}>
        <TzRadioGroup options={segmentedOp} disabled={id} />
      </TzFormItem>
      <ModelBehavior type={type || SegmentedType.COMMAND} from={from} form={form} />
    </TzForm>
  );
};
export let addBehavior = (
  form: FormInstance,
  prams: {
    [key: string]: any;
    from: 'info' | 'config';
  },
  callback?: (resolve: (value: unknown) => void, reject: (reason?: any) => void) => void,
) => {
  let { from = 'info', ...otherData } = prams;
  setTimeout(() => {
    form.setFieldsValue(otherData);
  }, 0);
  let getTitle = (from: string) => {
    let title = translations.added_model_behavior;
    if (from === 'info') {
      if (otherData?.id) {
        title = translations.edit_model_behavior;
      }
    } else {
      if (otherData?.id) {
        title = translations.edit_white_list;
      } else {
        title = translations.add_white_list;
      }
    }
    return title;
  };

  TzConfirm({
    title: getTitle(from),
    okText: otherData?.id != undefined ? translations.save : translations.newAdd,
    content: <ModelFormRender form={form} from={from} />,
    afterClose() {
      form.resetFields();
    },
    onOk() {
      return new Promise(function (resolve, reject) {
        form
          .validateFields()
          .then((res) => {
            if (callback) {
              callback(resolve, reject);
            } else {
              resolve(res);
            }
          })
          .catch(reject);
      });
    },
  });
};
export const delBehavior = (
  row: { id: any; path: any; type: any; from: 'info' | 'config'; resource_id: any },
  callback?: (arg0: WebResponse<any>) => void,
) => {
  let { id, path, type, from = 'info', resource_id } = row;
  let o: any = {
    [SegmentedType.COMMAND]: translations.command_execution,
    [SegmentedType.FILE]: translations.file_reads_writes,
    [SegmentedType.NETWORK]: translations.network_events,
  };
  TzConfirm({
    content: from === 'info' ? translations.unStandard.str300(o[type], id) : translations.unStandard.str49(id),
    okText: from === 'info' ? translations.scanner_config_delete : translations.delete,
    okButtonProps: { danger: true },
    cancelButtonProps: {},
    cancelText: translations.cancel,
    onOk() {
      let obj: any = {
        [SegmentedType.FILE]: from === 'config' ? delFileWhitelist : delModelFile,
        [SegmentedType.COMMAND]: from === 'config' ? delCommandWhitelist : delModelCommand,
        [SegmentedType.NETWORK]: from === 'config' ? delNetworkWhitelist : delModelNetwork,
      };
      obj[type]({ id: id + '', resource_id }).subscribe((res: any) => {
        callback && callback(res);
      });
    },
  });
};
export let columnsObj: any = {
  [SegmentedType.COMMAND + '_true']: ['id', 'path', 'command', 'user', 'container_name', 'updated_at'],
  [SegmentedType.FILE + '_true']: ['id', 'name', 'file_path', 'permission', 'container_name', 'updated_at'],
  [SegmentedType.NETWORK + '_true']: [
    'id',
    'stream_direction',
    'resource_name',
    'port',
    'container_name',
    'updated_at',
  ],
  [SegmentedType.COMMAND + '_false']: ['path', 'command', 'user', 'occurTime', 'event_id'],
  [SegmentedType.FILE + '_false']: ['name', 'file_path', 'permission', 'occurTime', 'event_id'],
  [SegmentedType.NETWORK + '_false']: [
    'stream_direction',
    'resource_name',
    'port',
    'process_name',
    'occurTime',
    'event_id',
  ],
};
export default function InModelBehavior(props: {
  [x: string]: any;
  type: SegmentedType;
  search_str?: any;
  cname?: any;
  all_container?: any;
  learn_status: any;
  _nk?: any;
}) {
  if (!props.resource_id) return <></>;
  let { type, _nk, setInType, learn_status, ...otherProps } = props;
  const listComp = useRef(undefined as any);
  const { setRefreshFn, refreshFn } = useContext(ImmuneDefenseContext);
  let [socketdataSource, setSocketdataSource] = useState<any>([]);
  let fetch = ModelServiceHook({ type });
  const [form] = Form.useForm();
  const { subscribe, unSubscribe } = useContext(WebSocketContext);
  const ref = useRef<HTMLDivElement>(null);
  const transRes = useMemoizedFn((res, limit, offset) => {
    let list = res.getItems();
    return {
      list: list,
      total: res.totalItems,
      nextId: res.data?.next_id,
      offset: offset + limit,
      isNoMore: list.length < limit,
    };
  });
  const { data, loading, noMore, reload } = useInfiniteScroll((d) => getFetchData(d?.nextId, d?.offset), {
    target: ref,
    isNoMore: (d) => d?.isNoMore,
    manual: true,
  });
  const { run: runFn } = useThrottleFn(
    (data) => {
      setSocketdataSource((pre: any[]) => {
        if (data.type === props.type.toLocaleLowerCase() && data.resource_id === props.resource_id) {
          pre.unshift(data.item);
        }
        return [...pre];
      });
    },
    { wait: 500 },
  );
  let getFetchData = useCallback(
    (nextId: string | undefined, offset: number = 0): Promise<Result> => {
      let prams = {
        start_id: nextId,
        limit: 10,
        offset,
        ...otherProps,
      };
      return fetch(prams)
        .pipe(map((res) => transRes(res, prams.limit, prams.offset)))
        .toPromise()
        .then((res: { offset: number; list: string | any[] }) => {
          if (res.offset === 10) {
            setSocketdataSource([]);
            let socketData = {
              domain: 'behavioral_learn', // 业务领域domain
              scene: 'learning_in_model_action', // 业务场景scene
              type: 'control', // 消息类型 （目前只有 control）
              command: 'start', // 控制命令
              data: {
                type: type.toLocaleLowerCase(),
                last_action_id: res.list.length === 0 ? 0 : res.list?.[0].id,
                ...prams,
              },
              callback: (data: any) => {
                runFn(data);
              },
            };
            subscribe(socketData);
          }
          return Promise.resolve(res);
        });
    },
    [fetch, JSON.stringify(otherProps), subscribe],
  );
  const { run } = useDebounceFn(reload, {
    wait: 300,
  });
  useEffect(() => {
    return () => {
      let socketData = {
        domain: 'behavioral_learn', // 业务领域domain
        scene: 'learning_in_model_action', // 业务场景scene
        type: 'control', // 消息类型 （目前只有 control）
        command: 'stop', // 控制命令
        data: {
          type: props.type.toLocaleLowerCase(),
          resource_id: props.resource_id,
        },
      };
      unSubscribe && unSubscribe(socketData);
    };
  }, []);
  useEffect(() => {
    if (props.resource_id && learn_status === LearnStatus.learning && otherProps.resource_id) {
      $(ref.current).scrollTop(0);
      run();
    }
    setRefreshFn({
      InModelBehavior: () => {
        listComp.current?.refresh();
      },
    });
  }, [props.type, props.search_str, props.cname, props.all_container, props.learn_status, props.resource_id]);
  let addBehaviorFn = useCallback(
    (row = {}) => {
      addBehavior(form, { type: props.type, ...row }, async (resolve, reject) => {
        let val = await form.validateFields();
        let type = val.type as SegmentedType;
        delete val.type;
        let obj = {
          [SegmentedType.FILE]: fetchBehavioralLearnModelFile,
          [SegmentedType.COMMAND]: fetchBehavioralLearnModelCommand,
          [SegmentedType.NETWORK]: fetchBehavioralLearnModelNetwork,
        };
        if (type === SegmentedType.NETWORK) {
          let { fill_resource_id, port } = val;
          let reg = /(?<=\()(.+?)(?=\))/g;
          val['cluster_key'] = fill_resource_id[0];
          val['namespace'] = fill_resource_id[1];
          val['name'] = fill_resource_id[2].split('(')[0];
          val['kind'] = fill_resource_id[2].match(reg).pop();
          val['port'] = Number(port);
          delete val.fill_resource_id;
        }
        obj[type](val).subscribe((res) => {
          if (res.error) {
            reject();
            return;
          }
          setInType(type);
          keys(refreshFn).map((item) => {
            refreshFn[item]();
          });
          resolve(res);
        });
      });
    },
    [type, otherProps, refreshFn],
  );
  let newColumns = useMemo(() => {
    let columns = getTableColumns(columnsObj[type + '_true'], {
      learn_status,
    });
    if (learn_status > LearnStatus.learning) {
      columns.push({
        title: translations.operation,
        dataIndex: 'operation',
        width: '16%',
        render: (item: any, row: any) => (
          <>
            <TzTooltip
              title={translations.disable_model}
              overlayStyle={learn_status === LearnStatus.validated ? undefined : { display: 'none' }}
            >
              <TzButton
                type="text"
                disabled={learn_status === LearnStatus.validated}
                className="ml-8 mr4"
                onClick={(event) => {
                  let { cluster_key, namespace, resource_name, kind } = row;
                  addBehaviorFn({
                    ...row,
                    resource_id: otherProps.resource_id,
                    fill_resource_id: [cluster_key, namespace, `${resource_name}(${kind})`],
                  });
                }}
              >
                {translations.edit}
              </TzButton>
            </TzTooltip>
            <TzTooltip
              title={translations.disable_model}
              overlayStyle={learn_status === LearnStatus.validated ? undefined : { display: 'none' }}
            >
              <TzButton
                type="text"
                className="ml0"
                disabled={learn_status === LearnStatus.validated}
                danger
                onClick={(event) => {
                  delBehavior({ type, ...row, resource_id: otherProps.resource_id }, (res) => {
                    if (!res.error) {
                      run();
                      keys(refreshFn).map((item) => {
                        refreshFn[item]();
                      });
                      showSuccessMessage(translations.scanner_images_removeSuccess);
                    }
                  });
                }}
              >
                {translations.scanner_config_delete}
              </TzButton>
            </TzTooltip>
          </>
        ),
      });
    }
    return columns;
  }, [type, learn_status, refreshFn]);
  let dataSource = useMemo(() => {
    return socketdataSource.concat(data?.list);
  }, [data?.list, socketdataSource]);

  const reqFun = useCallback(
    (pagination, fliter) => {
      if (!otherProps.resource_id) {
        return getHistory().pipe(
          map(() => {
            return {
              data: [],
              total: 0,
            };
          }),
        );
      }
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let obj = keys(fliter).reduce((pre: any, item) => {
        pre[item] = fliter[item]?.join(',');
        return pre;
      }, {});
      let prams = {
        limit: pageSize,
        offset,
        is_in_model: true,
        ...otherProps,
        ...obj,
      };
      return fetch(prams).pipe(
        map((res: any) => {
          let items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems,
          };
        }),
      );
    },
    [JSON.stringify(otherProps), learn_status],
  );

  return (
    <div>
      {learn_status > LearnStatus.learning ? (
        <TzTooltip
          title={translations.disable_model}
          overlayStyle={learn_status === LearnStatus.validated ? undefined : { display: 'none' }}
        >
          <TzButton
            disabled={learn_status === LearnStatus.validated}
            onClick={(event) => {
              addBehaviorFn({ resource_id: otherProps.resource_id });
            }}
          >
            {translations.newAdd}
          </TzButton>
        </TzTooltip>
      ) : null}
      {learn_status === LearnStatus.learning ? (
        <div ref={ref} style={{ height: 400, overflow: 'auto' }}>
          <TzTable
            loading={loading}
            dataSource={dataSource}
            pagination={false}
            sticky={true}
            rowKey={(record) => values(record).join('_')}
            columns={newColumns}
            footer={() => {
              return <TableScrollFooter isData={!!dataSource?.length} noMore={noMore} />;
            }}
          />
        </div>
      ) : (
        <TzTableServerPage reqFun={reqFun} sticky={true} ref={listComp} rowKey={'id'} columns={newColumns} />
      )}
    </div>
  );
}
