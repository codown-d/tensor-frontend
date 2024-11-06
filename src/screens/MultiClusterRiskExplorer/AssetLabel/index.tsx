import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { TzCard } from '../../../components/tz-card';
import { TimeFormat, WebResponse } from '../../../definitions';
import { map, tap } from 'rxjs/operators';
import { Store } from '../../../services/StoreService';
import {
  assetsNamespaceLabels,
  assetsSecrets,
  assetsServices,
  clusterAssetsNamespaces,
  deleteNamespaceLabelId,
  delWhiteList,
  getListClusters,
  namespaceLabel,
  namespaceLabelId,
} from '../../../services/DataService';
import { TzTag } from '../../../components/tz-tag';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { translations } from '../../../translations/translations';
import { TzTableServerPage } from '../../../components/tz-table';
// import { useActivate, useAliveController, useUnactivate } from 'react-activation';
import { useMemoizedFn, useSize, useUnmount } from 'ahooks';
import { getClusterName, useAssetsClusterList } from '../../../helpers/use_fun';
import { getTime } from '../../../helpers/until';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { TzCascader, TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { merge } from 'lodash';
import { useFiltersFn } from '../AssetService';
import { JumpNamespace } from '../components';
import { TzButton } from '../../../components/tz-button';
import { TzConfirm } from '../../../components/tz-modal';
import Form from 'antd/lib/form';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { TzInput } from '../../../components/tz-input';
import { showSuccessMessage } from '../../../helpers/response-handlers';
import { TzCascaderOptionProps } from '../../../components/ComponentsLibrary/TzCascader/interface';
import { filter } from '../../ComplianceWhole/ScanManagement';
import LabelCol from '../../../components/label-col';

let LabelDom = (props: { formInstance: any; param?: any }) => {
  const [resourceList, setOptions] = useState<TzCascaderOptionProps[]>([]);
  let { formInstance, param = undefined } = props;
  useEffect(() => {
    formInstance.resetFields();
    return () => {
      formInstance.resetFields();
    };
  }, []);
  let id = Form.useWatch('id', props.formInstance);
  let clusters = useAssetsClusterList();
  useEffect(() => {
    clusters.length &&
      Promise.all(
        clusters.map((item: any) => {
          return new Promise((resolve) => {
            clusterAssetsNamespaces({ clusterID: item.value }).subscribe((res) => {
              let nsList = res.getItems().map((ite) => {
                return {
                  value: ite.Name,
                  label: ite.Name,
                  isLeaf: true,
                };
              });
              item['children'] = nsList;
              item['isLeaf'] = !nsList.length;
              resolve(nsList);
            });
          });
        }),
      ).then((res) => {
        setOptions([...clusters]);
      });
  }, [clusters]);
  return (
    <TzForm
      form={props.formInstance}
      validateTrigger={'onChange'}
      initialValues={merge(
        {
          id: undefined,
          clusterKey_namespace: undefined,
          label_name: undefined,
          label_value: undefined,
        },
        param,
      )}
    >
      <TzFormItem name="id" hidden>
        <TzInput />
      </TzFormItem>
      <TzFormItem
        name="clusterKey_namespace"
        label={translations.onlineVulnerability_outerShapeMeaning}
        rules={[
          {
            required: true,
            message: `${translations.onlineVulnerability_outerShapeMeaning}${translations.notEmpty}`,
          },
        ]}
      >
        <TzCascader
          placeholder={translations.microseg_segments_select_namespace_palce}
          disabled={id}
          options={resourceList}
          showSearch={{ filter }}
        />
      </TzFormItem>
      <TzFormItem
        name="label_name"
        label={translations.label_name}
        rules={[
          {
            required: true,
            message: translations.unStandard.str293,
          },
        ]}
      >
        <TzInput placeholder={translations.unStandard.str273} allowClear disabled={id} />
      </TzFormItem>
      <TzFormItem name="label_value" label={translations.label_value}>
        <TzInput placeholder={translations.clusterManage_placeholder + translations.label_value} allowClear />
      </TzFormItem>
    </TzForm>
  );
};

const AssetLabel = (props: { title: string; rowKey: string }) => {
  let { title = '', rowKey = 'id' } = props;
  const navigate = useNavigate();
  // 批量操作hook
  // const [{rowSelection, isInLabelPage}] = useBatchLabelContext();

  const [filters, setFilters] = useState<any>({});
  let clusterList = useAssetsClusterList();
  const [formInstance] = Form.useForm();
  const listComp = useRef(undefined as any);
  const reqFun = useCallback(
    (pagination) => {
      const { current = 1, pageSize = 10 } = pagination;
      let { start_time, end_time } = filters?.updatedAt || {};
      const offset = (current - 1) * pageSize;
      let params = {
        offset,
        limit: pageSize,
        ...filters,
        start_time,
        end_time,
      };
      return assetsNamespaceLabels(params).pipe(
        map((res) => {
          const items = res.getItems();
          return {
            data: items,
            total: res.data?.totalItems,
          };
        }),
      );
    },
    [filters],
  );
  let setBlackwhitelistFn = (type = 'add') => {
    return new Promise((resolve, reject) => {
      let fn = type === 'add' ? namespaceLabel : namespaceLabelId;
      formInstance?.validateFields().then((res: any) => {
        let value = formInstance.getFieldsValue();
        let obj =
          type === 'add'
            ? {
                ...value,
                cluster_key: value['clusterKey_namespace'][0],
                namespace: value['clusterKey_namespace'][1],
              }
            : { id: value.id, label_value: value.label_value };
        delete obj.clusterKey_namespace;
        fn(obj).subscribe((res) => {
          if (res.error) {
            reject();
            return;
          }
          showSuccessMessage(type === 'add' ? translations.label_added_successfully : translations.label_modified);
          resolve(res);
          listComp.current.refresh();
        });
      }, reject);
    });
  };
  let delDetail = useCallback(
    (id) => {
      deleteNamespaceLabelId({ label_id: Number(id) }).subscribe((res) => {
        if (!res.error) {
          listComp && listComp.current.refresh();
          showSuccessMessage(translations.activeDefense_delSuccessTip);
        }
      });
    },
    [listComp],
  );
  const columns = useMemo(() => {
    const items = [
      {
        title: translations.label_name,
        dataIndex: 'name',
        render: (item: string, row: any) => {
          return item ? <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover> : '-';
        },
      },
      {
        title: translations.label_value,
        dataIndex: 'value',
        render: (item: string, row: any) => {
          return item ? <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover> : '-';
        },
      },
      {
        title: translations.clusterManage_key,
        dataIndex: 'clusterKey',
        render: (item: string, row: any) => {
          let name = getClusterName(item);
          return name;
        },
      },
      {
        title: translations.onlineVulnerability_outerShapeMeaning,
        dataIndex: 'namespace',
        render: (item: string, row: any) => {
          return <JumpNamespace namespace={row.namespace} clusterKey={row.clusterKey} title={row.namespace} />;
        },
      },
      {
        title: translations.clusterManage_createtime,
        dataIndex: 'CreatedAt',
        render: (CreatedAt: number, row: any) => {
          return getTime(CreatedAt);
        },
      },
      {
        title: translations.asset_label,
        dataIndex: 'tags',
        render: (item: any, row: any) => {
          return <LabelCol labels={item} />;
        },
      },
      {
        title: translations.scanner_report_operate,
        key: 'operate',
        width: '14%',
        render: (_: any, row: any) => {
          return !row.isBlock ? (
            <>
              <TzButton
                type="text"
                onClick={() => {
                  TzConfirm({
                    width: '560px',
                    title: translations.edit_asset_discovery_label,
                    okText: translations.save,
                    content: (
                      <LabelDom
                        formInstance={formInstance}
                        param={merge(row, {
                          label_value: row.value,
                          label_name: row.name,
                          clusterKey_namespace: [row.clusterKey, row.namespace],
                        })}
                      />
                    ),
                    onOk() {
                      return setBlackwhitelistFn('edit');
                    },
                  });
                }}
              >
                {translations.edit}
              </TzButton>
              <TzButton
                type="text"
                className={'ml4'}
                danger
                onClick={() => {
                  TzConfirm({
                    content: translations.unStandard.str295(row?.name),
                    onOk: () => delDetail(row.id),
                    okButtonProps: {
                      type: 'primary',
                      danger: true,
                    },
                    okText: translations.delete,
                  });
                }}
              >
                {translations.delete}
              </TzButton>
            </>
          ) : (
            '-'
          );
        },
      },
    ];
    // if (isInLabelPage) {
    //   return items.filter((col: any) => col.title !== translations.asset_label);
    // }
    return items;
  }, []);
  const screenFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.onlineVulnerability_outerShapeMeaning,
        name: 'namespace',
        type: 'input',
        icon: 'icon-mingmingkongjian',
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
        label: translations.clusterManage_createtime,
        name: 'updatedAt',
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
  const data = useTzFilter({ initial: screenFilter });
  const handleChange = useCallback((values: any) => {
    useFiltersFn(values, setFilters);
  }, []);
  return (
    <div className="asset-label">
      <div className={'mt6'}>
        <span className="headTit">{title}</span>
      </div>
      <div className="mb12 mt16">
        <FilterContext.Provider value={{ ...data }}>
          <div className={'flex-r-c'}>
            <TzButton
              type={'primary'}
              onClick={() => {
                TzConfirm({
                  width: '560px',
                  title: translations.add_label,
                  okText: translations.newAdd,
                  content: <LabelDom formInstance={formInstance} />,
                  onOk: setBlackwhitelistFn,
                });
              }}
            >
              {translations.newAdd}
            </TzButton>
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      {/*<BatchButton />*/}
      <TzTableServerPage
        columns={columns}
        className={'nohoverTable'}
        rowKey={rowKey}
        reqFun={reqFun}
        // rowSelection={rowSelection}
        onRow={(record) => {
          return {
            onClick: () => {
              //navigate(Routes.YamlScanInfo + `?id=${record.id}`);
            },
          };
        }}
        ref={listComp}
      />
    </div>
  );
};

export default AssetLabel;
