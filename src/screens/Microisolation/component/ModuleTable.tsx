import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { translations } from '../../../translations';
import { TzCard } from '../../../components/tz-card';
import { TzButton } from '../../../components/tz-button';
import {
  addresources,
  gatewayallowing,
  microsegNamespaces,
  microsegNsgrps,
  microsegResources,
  microsegSegments,
  movenamespaces,
  moveresources,
  putAddnamespaces,
} from '../../../services/DataService';
import { useMemoizedFn, useSetState } from 'ahooks';
import { allowGateway, columnsList } from '../lib';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { Form, FormInstance, FormProps, TablePaginationConfig } from 'antd';
import { TzTableServerPage } from '../../../components/tz-table';
import { map } from 'rxjs/operators';
import { SelectItem, WebResponse } from '../../../definitions';
import TzInputSearch from '../../../components/tz-input-search';
import { find, findIndex, merge, sortBy, uniq } from 'lodash';
import { TzConfirm } from '../../../components/tz-modal';
import { TzSelect } from '../../../components/tz-select';
import { Store } from '../../../services/StoreService';
import { useLocation } from 'react-router-dom';
import { showSuccessMessage } from '../../../helpers/response-handlers';
import { TzMessageSuccess, TzMessageWarning } from '../../../components/tz-mesage';
interface ModuleTableProps {
  cluster?: string;
  namespace?: string;
  type: 'resourceGroup' | 'namespaceGroup';
  groupId?: string;
  ungrouped: boolean | undefined;
  onChange: () => void;
  groupInfo: any;
  activeKey: string;
}
const ContentModalResources = (props: { [x: string]: any; type: 'resourceGroup' | 'namespaceGroup' }) => {
  let { cluster, groupId, namespace, type, form, groupInfo, ...otherProps } = props;
  let [selectOp, setSelectOp] = useState<SelectItem[]>([]);
  let getSelectOp = useMemoizedFn(() => {
    let fn, prams;
    if (type === 'resourceGroup') {
      prams = {
        excludeSegment: groupId,
        cluster: cluster || groupInfo.cluster,
        namespace: namespace || groupInfo.namespace,
      };
      fn = microsegResources;
    } else {
      prams = { excludeNsgroup: groupId, cluster: cluster || groupInfo.cluster }; //nsgroupID: groupId
      fn = microsegNamespaces;
    }
    fn(prams).subscribe((res) => {
      if (res.error) return;
      let items = res.getItems().map((item) => ({
        label: type === 'resourceGroup' ? `${item.name}(${item.kind})` : item.name,
        value: item.id,
      }));
      setSelectOp(items);
    });
  });
  useEffect(() => {
    getSelectOp();
    return () => {
      form.resetFields();
    };
  }, []);
  let getTitle = useMemo(() => {
    return type === 'resourceGroup'
      ? {
          label: translations.select_resources_move,
          placeholder: translations.select_resource_move,
          message: translations.unStandard.notEmptyTip(translations.resources),
        }
      : {
          label: translations.select_move,
          placeholder: translations.select_namespace_move,
          message: translations.unStandard.notEmptyTip(translations.onlineVulnerability_outerShapeMeaning),
        };
  }, [type]);
  return (
    <TzForm {...otherProps} form={form}>
      <TzFormItem
        name="ids"
        label={getTitle.label}
        rules={[
          {
            required: true,
            message: translations.activeDefense_containBaitPla,
          },
        ]}
      >
        <TzSelect
          filterOption={(input, option: any) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          showSearch
          options={selectOp}
          placeholder={getTitle.placeholder}
          mode={'multiple'}
        />
      </TzFormItem>
    </TzForm>
  );
};
const ContentModalGroup = (props: {
  form: FormInstance<any>;
  cluster?: string;
  namespace?: string;
  exclude_ids?: string;
  type: 'resourceGroup' | 'namespaceGroup';
}) => {
  let { cluster, namespace, exclude_ids, form, type } = props;
  let [selectOp, setSelectOp] = useState<SelectItem[]>();
  let getSelectOp = useMemoizedFn(() => {
    let fn, prams;
    if (type === 'resourceGroup') {
      prams = { cluster, namespace, exclude_ids };
      fn = microsegSegments;
    } else {
      prams = { cluster, exclude_ids };
      fn = microsegNsgrps;
    }
    fn(prams).subscribe((res) => {
      if (res.error) return;
      let items = res.getItems().map((item) => ({ label: item.name, value: item.id }));
      items.unshift({ label: translations.not_grouped, value: 0 });
      setSelectOp(items);
    });
  });
  useEffect(() => {
    getSelectOp();
    return () => {
      form?.resetFields();
    };
  }, []);

  let getTitle = useMemo(() => {
    return type === 'resourceGroup'
      ? {
          label: translations.resource_group_move,
          placeholder: translations.unStandard.requireSelectTip(translations.microseg_segments_segment_title),
          message: translations.unStandard.notEmptyTip(translations.microseg_segments_segment),
        }
      : {
          label: translations.namespace_group_move,
          placeholder: translations.unStandard.requireSelectTip(translations.microseg_namespace_sidetitle),
          message: translations.unStandard.notEmptyTip(translations.microseg_namespace_sidetitle),
        };
  }, [props.type]);
  return (
    <TzForm form={form}>
      <TzFormItem
        name="id"
        label={getTitle.label}
        rules={[
          {
            required: true,
            message: translations.activeDefense_containBaitPla,
          },
        ]}
      >
        <TzSelect options={selectOp} placeholder={getTitle.placeholder} />
      </TzFormItem>
    </TzForm>
  );
};
const ModuleTable = (props: ModuleTableProps) => {
  let { cluster, namespace, groupId, type, onChange, activeKey } = props;
  const [filters, setFilters] = useState<any>('');
  let [showPageFooter, setShowPageFooter] = useState(false);
  const [sorterable, setSorterable] = useSetState<any>({ allowGateway: null });
  let [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  let flag = useRef<any>([]);
  const listComp = useRef(undefined as any);
  let [resourcesFormIns] = Form.useForm();
  let [groupFormIns] = Form.useForm();
  let addResourcesToGroup = useMemoizedFn(() => {
    TzConfirm({
      title: translations.add_group,
      content: <ContentModalResources form={resourcesFormIns} {...props} />,
      width: '520px',
      onOk() {
        return resourcesFormIns.validateFields().then((value) => {
          let fn = type === 'resourceGroup' ? addresources : putAddnamespaces;
          let prams: any = {
            segmentID: groupId,
            cluster,
            namespace,
          };
          if (type === 'namespaceGroup') {
            prams = {
              nsgroupID: groupId,
              cluster,
            };
          }
          fn({ ...prams, ...value }).subscribe((res) => {
            if (res.error) return;
            showSuccessMessage(type === 'resourceGroup' ? '添加资源成功' : '添加命名空间成功');
            listComp.current.refresh();
            onChange();
          });
        });
      },
    });
  });
  let moveGroupings = useMemoizedFn((row: { ids: string[]; re_namespace: string; re_cluster: string }) => {
    let { ids, re_namespace, re_cluster } = row;
    TzConfirm({
      title: translations.move_to,
      content: (
        <ContentModalGroup
          form={groupFormIns}
          cluster={cluster || re_cluster}
          namespace={namespace || re_namespace}
          exclude_ids={groupId}
          type={type}
        />
      ),
      width: '520px',
      onOk() {
        return groupFormIns.validateFields().then((value) => {
          let fn = type === 'resourceGroup' ? moveresources : movenamespaces;
          let prams: any = {
            segmentID: groupId,
            cluster,
            namespace,
            ids,
            destSegment: value.id,
          };
          if (type === 'namespaceGroup') {
            prams = {
              nsgroupID: groupId,
              cluster,
              ids,
              destNsgroup: value.id,
            };
          }
          fn(prams).subscribe((res) => {
            if (res.error) return;
            showSuccessMessage(
              type === 'resourceGroup' ? translations.move_resource_success : translations.move_namespace_success,
            );
            setShowPageFooter(false);
            listComp.current.refresh();
            onChange();
          });
        });
      },
    });
  });
  let columns = useMemo(() => {
    let a =
      type === 'resourceGroup'
        ? ['resource_group_name', 'kind', 'allowGateway']
        : ['namespace_group_name', 'cluster', 'resourceNumber'];
    if (!groupId) {
      a.push(type === 'resourceGroup' ? 'segmentName' : 'nsgroupName');
    }
    let arr = columnsList
      .filter((item: any) => a.includes(item.dataIndex))
      .map((item: any) => {
        if (item.dataIndex === 'allowGateway') {
          item['sorter'] = true;
        }
        return item;
      });
    let newArr = sortBy(arr, (x) => findIndex(a, (y) => x.dataIndex === y));
    return [
      ...newArr,
      {
        title: translations.clusterManage_operate,
        dataIndex: 'operate',
        width: '100px',
        render: (status: any, row: any) => {
          return (
            <TzButton
              type="text"
              onClick={() => {
                let obj: any = { re_cluster: row.cluster };
                if (type === 'resourceGroup') {
                  obj['re_namespace'] = row.namespace;
                }
                moveGroupings({ ids: [row.id], ...obj });
              }}
            >
              {translations.move_groupings}
            </TzButton>
          );
        },
      },
    ];
  }, [type, groupId]);
  const reqFun = useCallback(
    (pagination: TablePaginationConfig, filter, sorter) => {
      let { field, order } = sorter;
      setSorterable({ [field]: order });
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const params: any = {
        limit: pageSize,
        offset,
        ...props,
        ...sorterable,
        [field]: order,
      };
      delete params.type;
      delete params.onChange;
      delete params.groupInfo;
      let fn = microsegResources;
      if (type === 'namespaceGroup') {
        params['name'] = filters;
        params['nsgroup_id'] = groupId;
        fn = microsegNamespaces;
      } else {
        params['resourceName'] = filters;
        params['segmentID'] = groupId;
        fn = microsegResources;
      }
      return fn(params).pipe(
        map((res: WebResponse<any>) => {
          const items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems || 0,
          };
        }),
      );
    },
    [props, filters],
  );
  let putGatewayallowing = useMemoizedFn((data) => {
    let { type, ...otherData } = data;
    let node = find(allowGateway, (item) => item.type === type);
    gatewayallowing(merge(otherData, { allowGateway: node?.value })).subscribe((res) => {
      if (res.error) return;
      TzMessageSuccess(data.allowGateway);
      setShowPageFooter(false);
      listComp.current.refresh();
    });
  });
  let handleRowSelection = (selected: boolean, selectedRows: any[]) => {
    setSelectedRowKeys((pre: any) => {
      selectedRows.forEach(({ id, namespace, cluster }: any) => {
        if (selected) {
          flag.current.push(`${cluster}_${namespace}`);
          pre.push(id);
        } else {
          flag.current.remove(`${cluster}_${namespace}`);
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
  }, [showPageFooter, selectedRowKeys, type]);
  let l = useLocation();

  let setFooter = useMemoizedFn(() => {
    Store.pageFooter.next(
      showPageFooter ? (
        <div>
          <span className="mr16 ml16">{`${translations.selected} ${selectedRowKeys.length} ${translations.items}`}</span>
          <TzButton
            disabled={!selectedRowKeys.length}
            onClick={() => {
              if (uniq(flag.current).length > 1) {
                TzMessageWarning(
                  type === 'resourceGroup'
                    ? translations.unStandard.different_namespaces_moved
                    : translations.unStandard.different_clusters_moved,
                );
                return;
              }
              let [cluster, namespace] = [...flag.current].pop().split('_');
              let obj: any = { re_cluster: cluster };
              if (type === 'resourceGroup') {
                obj['re_namespace'] = namespace;
              }
              moveGroupings({ ids: selectedRowKeys, ...obj });
            }}
          >
            {translations.move_groupings}
          </TzButton>
          {type === 'resourceGroup' ? (
            <>
              <TzButton
                className={'mr20 ml20'}
                disabled={!selectedRowKeys.length}
                onClick={() => {
                  putGatewayallowing({ ids: selectedRowKeys, type: 'allow' });
                }}
              >
                {translations.allow_gateway_access_c}
              </TzButton>
              <TzButton
                className={'mr20'}
                disabled={!selectedRowKeys.length}
                onClick={() => {
                  putGatewayallowing({ ids: selectedRowKeys, type: 'refuse' });
                }}
              >
                {translations.denial_gateway_access}
              </TzButton>
            </>
          ) : null}
        </div>
      ) : null,
    );
  });
  useEffect(() => {
    if (activeKey === type) {
      setFooter();
    }
  }, [l, activeKey, showPageFooter, selectedRowKeys]);
  let getPlaceholder = useMemo(() => {
    return type === 'resourceGroup'
      ? translations.microseg_resources_res_name_place
      : translations.unStandard.str252(translations.namespace_name);
  }, [type]);
  return (
    <TzCard
      title={type === 'resourceGroup' ? translations.resources : translations.onlineVulnerability_outerShapeMeaning}
      bodyStyle={{ padding: '4px 24px 8px' }}
    >
      <div className="flex-r-c mb12">
        <div>
          <TzButton
            className="mr20"
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
          {groupId && !showPageFooter ? (
            <TzButton
              onClick={() => {
                addResourcesToGroup();
              }}
            >
              {translations.add_group}
            </TzButton>
          ) : null}
        </div>
        <TzInputSearch placeholder={getPlaceholder} onChange={setFilters} />
      </div>
      <TzTableServerPage
        className="nohoverTable"
        rowSelection={rowSelection}
        columns={columns}
        tableLayout={'fixed'}
        rowKey={(item) => item.id}
        reqFun={reqFun}
        ref={listComp}
      />
    </TzCard>
  );
};
export default ModuleTable;
