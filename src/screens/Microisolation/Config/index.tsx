import React, { useMemo, useState, useEffect } from 'react';
import { translations } from '../../../translations';
import { onSubmitFailed, showSuccessMessage } from '../../../helpers/response-handlers';
import { microsegReset, microsegResources, microsegSettings, putMicrosegSettings } from '../../../services/DataService';
import Form from 'antd/lib/form';
import { TzButton } from '../../../components/tz-button';
import { useDynamicList, useMemoizedFn, useSetState } from 'ahooks';
import { TzConfirm } from '../../../components/tz-modal';
import { TzMessageSuccess } from '../../../components/tz-mesage';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { TzCard } from '../../../components/tz-card';
import { find, findIndex, flatten, sortBy, values } from 'lodash';
import { useGetClusterResources } from '../lib/use_fun';
import { TzSelect } from '../../../components/tz-select';
import { useAssetsClusterList } from '../../../helpers/use_fun';
import { TzCascader } from '../../../components/ComponentsLibrary';
import { TzTag } from '../../../components/tz-tag';
import { useJumpResourceFn } from '../../../screens/MultiClusterRiskExplorer/components';
import AddInfoBtn from '../../../components/ComponentsLibrary/AddInfoBtn';
import { TzTable } from '../../../components/tz-table';
import { columnsList } from '../lib';
import { GetRowKey } from 'antd/lib/table/interface';
import NoData from '../../../components/noData/noData';
import Cascader from 'antd/lib/cascader';

export let micrMarrkOptions = [
  {
    label: translations.protection_mode,
    value: 'protect',
    tips: translations.traffic_protect,
  },
  {
    label: translations.simulation_mode,
    value: 'alert',
    tips: translations.traffic_alert,
  },
];
export default () => {
  const [info, setInfo] = useState<any>({});
  const [edit, setEdit] = useSetState<any>({ modeEdit: false, infrasEdit: false, gatewaysEdit: false });
  let clusterList = useAssetsClusterList();
  const [resourcesList, setResourcesList] = useSetState<any>({});
  const [formIns] = Form.useForm();

  const [formInsTable] = Form.useForm();
  let clusterResources = useGetClusterResources(true);
  const { list, remove, getKey, push, resetList, replace } = useDynamicList<any>([]);
  let getResourcesOp = useMemoizedFn((cluster) => {
    let node = find(clusterResources, (item) => item.value === cluster);
    return node?.children;
  });
  let getResourcesList = useMemoizedFn((cluster) => {
    microsegResources({ cluster, includeSensitiveNs: true }).subscribe((res) => {
      if (res.error) return;
      let items = res.getItems().map((item) => ({
        label: `${item.name}(${item.kind})`,
        value: item.id,
        namespace: item.namespace,
        name: item.name,
        kind: item.kind,
        cluster: item.cluster,
      }));

      setResourcesList({ [cluster]: items });
    });
  });
  let getMicrosegSettings = useMemoizedFn(() => {
    microsegSettings().subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setInfo(item);
      let arr: any[] = [];
      [...item.infras].map((item) => {
        if (!arr.includes(item.cluster)) {
          arr.push(item.cluster);
          getResourcesList(item.cluster);
        }
      });
      resetList(item.infras);
      formIns.setFieldsValue(item);
    });
  });
  useEffect(() => {
    getMicrosegSettings();
  }, []);
  let postMicrosegSettings = useMemoizedFn((callback) => {
    formInsTable.validateFields().then((val: { [x: string]: any; id: any }) => {
      let infras = values(val).map((item) => {
        let cluster = item.cluster;
        item['workloads'] = flatten(
          item['workloads'].map((ite) => {
            if (ite.length == 2) {
              return [ite];
            } else {
              let arr = getResourcesOp(cluster);
              let node = find(arr, (item) => item.value == ite[0])?.children.map((it) => [ite[0], it.id]);
              return node;
            }
          }),
        );
        return item;
      });
      putMicrosegSettings({ infras: infras }).subscribe((res) => {
        if (res.error && res.error.message) {
          onSubmitFailed(res.error);
        } else {
          TzMessageSuccess(translations.saveSuccess);
          callback();
          getMicrosegSettings();
        }
      });
    });
  });
  let { jumpResourceFn } = useJumpResourceFn();
  let jumpResourceDetails = useMemoizedFn((node) => {
    let data = {
      kind: node.kind,
      name: node.name,
      namespace: node.namespace,
      clusterKey: node.cluster,
    };
    jumpResourceFn(data);
  });
  let columns = useMemo(() => {
    let a = ['cluster'];
    let arr = columnsList.filter((item: any) => a.includes(item.dataIndex));
    let newArr = sortBy(arr, (x) => findIndex(a, (y) => x.dataIndex === y));
    newArr = [
      ...newArr,
      {
        title: translations.resources,
        dataIndex: 'workloads',
        width: '85%',
        editable: true,
        render: (workloads: any, row: any) => {
          let selectOp = resourcesList[row.cluster];
          let arr = workloads?.map((ite: any[], index: React.Key | null | undefined) => {
            let node = find(selectOp, (item) => item.value == ite[1]);
            let { namespace, label, ...otherNode } = node || { namespace: ite[0], label: ite[1] };
            return [
              <span>,</span>,
              <TzButton
                key={index}
                type="text"
                className="mb4 ml0 mr0"
                onClick={() => {
                  node && jumpResourceDetails(node);
                }}
              >
                {`${namespace}/${label}`}
              </TzButton>,
            ];
          });
          return <div className="ml-8">{flatten(arr).slice(1)}</div>;
        },
      },
    ].map((col) => {
      let { editable, dataIndex, title, placeholder } = col;
      if (!editable) {
        return col;
      }
      return {
        ...col,
        render: (text: any, row: any, index: number) => {
          let resourceKey = row['cluster'];
          return edit.infrasEdit ? (
            <TzFormItem
              name={[getKey(index), dataIndex]}
              initialValue={text}
              style={{ margin: 0 }}
              rules={[
                {
                  required: true,
                  message: `${translations.unStandard.requireSelectTip(title)}!`,
                },
              ]}
            >
              {'cluster' == dataIndex ? (
                <TzSelect
                  placeholder={placeholder || translations.unStandard.requireSelectTip(title)}
                  options={clusterList}
                  onChange={(val) => {
                    replace(index, { cluster: val, workloads: undefined });
                  }}
                />
              ) : (
                <TzCascader
                  placeholder={translations.select_infrastructure_resources}
                  options={getResourcesOp(resourceKey)}
                  maxTagCount="responsive"
                  showCheckedStrategy={Cascader.SHOW_CHILD}
                  allowClear
                  multiple
                />
              )}
            </TzFormItem>
          ) : (
            col.render(text, row, index)
          );
        },
      };
    });
    if (edit.infrasEdit) {
      newArr.push({
        title: translations.operation,
        dataIndex: 'operation',
        width: '10%',
        render: (_: any, record: any, index: number) => {
          return (
            <TzButton
              danger
              type="text"
              onClick={(e) => {
                remove(index);
              }}
            >
              {translations.delete}
            </TzButton>
          );
        },
      });
    }
    return newArr;
  }, [edit.infrasEdit, resourcesList, clusterList]);

  return (
    <div className="microisolation-config mlr32">
      <TzForm form={formIns}>
        <TzFormItem hidden name={'infras'}></TzFormItem>
      </TzForm>
      <TzCard
        className="mt4"
        title={translations.microseg_resources_rescfg_infirs}
        extra={
          <>
            {!edit.infrasEdit ? (
              <TzButton
                size={'small'}
                onClick={() => {
                  setEdit({ infrasEdit: true });
                }}
              >
                {translations.edit}
              </TzButton>
            ) : (
              <>
                <TzButton
                  className={'mr8'}
                  type={'primary'}
                  size={'small'}
                  onClick={() =>
                    postMicrosegSettings(() => {
                      setEdit({ infrasEdit: false });
                    })
                  }
                >
                  {translations.save}
                </TzButton>
                <TzButton
                  size={'small'}
                  onClick={() => {
                    setEdit({ infrasEdit: false });
                  }}
                >
                  {translations.cancel}
                </TzButton>
              </>
            )}
          </>
        }
        bodyStyle={{ marginTop: '-4px' }}
      >
        <span className="f12 fw400 mb16" style={{ color: 'rgb(179, 186, 198)', display: 'inline-block' }}>
          {translations.infrastructure_communicate_resources}
        </span>
        <TzForm form={formInsTable}>
          <TzTable
            rowKey={((r: any, index: number) => getKey(index)) as GetRowKey<string>}
            dataSource={list}
            columns={columns}
            locale={{ emptyText: edit.infrasEdit ? <></> : <NoData /> }}
            pagination={false}
          />
        </TzForm>
        {edit.infrasEdit ? (
          <AddInfoBtn
            className={'mt6'}
            onClick={() => {
              push({
                cluster: undefined,
                workloads: undefined,
              });
            }}
          />
        ) : null}
      </TzCard>
      <TzCard title={translations.service_downgrade} className="mt20" bodyStyle={{ marginTop: '-4px' }}>
        <p className="mb12 f12" style={{ color: 'rgb(179, 186, 198)' }}>
          {translations.release_traffic}
        </p>
        <TzButton
          onClick={() => {
            TzConfirm({
              okText: translations.sure,
              content: translations.action_clear,
              okButtonProps: { danger: true },
              onOk() {
                return new Promise((resolve, reject) => {
                  microsegReset().subscribe((res) => {
                    if (res.error) {
                      reject();
                      return;
                    }
                    resolve('');
                    showSuccessMessage(translations.successful_relegation);
                  });
                });
              },
            });
          }}
        >
          {translations.downgrade}
        </TzButton>
      </TzCard>
    </div>
  );
};
