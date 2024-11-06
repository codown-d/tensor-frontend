import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { TzTableServerPage } from '../../../../components/tz-table';
import { TablePaginationConfig } from 'antd/lib/table';
import { columnsList, testIP } from '../../lib';
import {
  delWhiteList,
  deleteIpgroups,
  ipgroups,
  ipgroupsId,
  postIpgroups,
  putIpgroups,
  vulnsList,
} from '../../../../services/DataService';
import { map } from 'rxjs/operators';
import { WebResponse } from '../../../../definitions';
import useTzFilter, { FilterContext } from '../../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { translations } from '../../../../translations';
import { FilterFormParam } from '../../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { findIndex, merge, sortBy } from 'lodash';
import { TzButton } from '../../../../components/tz-button';
import { TzForm, TzFormItem } from '../../../../components/tz-form';
import TzTextArea from '../../../../components/ComponentsLibrary/TzTextArea';
import { TzInput } from '../../../../components/tz-input';
import { TzConfirm, TzConfirmDelete } from '../../../../components/tz-modal';
import { useMemoizedFn } from 'ahooks';
import { TzFilter, TzFilterForm } from '../../../../components/ComponentsLibrary';
import Form, { FormInstance } from 'antd/lib/form';
import { useLocation } from 'react-router-dom';
import { Store } from '../../../../services/StoreService';
import { showSuccessMessage } from '../../../../helpers/response-handlers';
import { TzTooltip } from '../../../../components/tz-tooltip';
import './index.scss';
import { TzSelect } from '../../../../components/tz-select';
import { useAssetsClusterList } from '../../../../helpers/use_fun';
import TzSelectTag from '../../../../components/ComponentsLibrary/TzSelectTag';
let IPGroupDom = (props: { formInstance: any; param?: any }) => {
  let { formInstance, param = {} } = props;
  useEffect(() => {
    if (!param.cluster) {
      param['cluster'] = undefined;
    }
    formInstance.setFieldsValue(merge({}, param, { ipSet: param['ipSet']?.split(',') }));
    return () => {
      formInstance.resetFields();
    };
  }, []);

  let clusterList = useAssetsClusterList();
  return (
    <TzForm form={formInstance}>
      <TzFormItem name="id" hidden>
        <TzInput />
      </TzFormItem>
      <TzFormItem
        name="ipSet"
        className="form-item-label-w100"
        label={
          <div className="flex-r-c" style={{ width: '100%', justifyContent: 'space-between' }}>
            <span>{translations.ip_ranges}：</span>
            <TzTooltip
              title={
                <div className="microisolation-tooltip">
                  <p className="ip-group-modal-title">{translations.filling_instructions}</p>
                  <p className="ip-group-modal-item mt16">{translations.unStandard.enter_ip_address_formats}:</p>
                  <p className="f12 mt8" style={{ color: '#6C7480', paddingLeft: '16px' }}>
                    {translations.unStandard.CIDR_format}
                    <br />
                    {translations.unStandard.ip_address_range}
                    <br />
                    {translations.unStandard.ip_address}
                  </p>
                  <p className="ip-group-modal-item mt16">{translations.unStandard.indicates_addresses}</p>
                  <p className="ip-group-modal-item mt16">{translations.unStandard.multiple_line}</p>
                </div>
              }
              color={'#fff'}
              overlayInnerStyle={{ color: '#000', padding: '16px 20px' }}
            >
              <i className={'iconfont icon-wenhao icon-wenti'}></i>
            </TzTooltip>
          </div>
        }
        rules={[
          {
            required: true,
            message: translations.unStandard.notEmptyTip(translations.ip_ranges),
          },
          {
            whitespace: true,
            validator: (val, value: string[]) => {
              return testIP(value);
            },
          },
        ]}
      >
        <TzSelectTag placeholder={translations.unStandard.iP_ranges} />
      </TzFormItem>
      <TzFormItem
        name="name"
        label={translations.compliances_policyDetails_name}
        rules={[
          {
            required: true,
            message: translations.unStandard.notEmptyTip(translations.compliances_policyDetails_name),
          },
          {
            pattern: /^[\u4e00-\u9fa5\w\-]+$/,
            message: translations.unStandard.label_name_illegal,
          },
        ]}
      >
        <TzInput
          placeholder={translations.unStandard.requireTip(translations.compliances_policyDetails_name)}
          maxLength={50}
        />
      </TzFormItem>
      <TzFormItem
        name="cluster"
        label={translations.clusterManage_key}
        rules={[
          {
            required: true,
            message: translations.unStandard.notEmptyTip(translations.clusterManage_key),
          },
        ]}
      >
        <TzSelect
          disabled={param.id}
          placeholder={translations.clusterManage_key}
          options={clusterList}
          filterOption={(input, option: any) => (option?.label ?? '').includes(input)}
        />
      </TzFormItem>
      <TzFormItem name="comment" label={translations.imageReject_comment_title}>
        <TzTextArea placeholder={translations.unStandard.comment_c_100} maxLength={100} autoSize={{ minRows: 4 }} />
      </TzFormItem>
    </TzForm>
  );
};

export let addIPGroup = (props: { item?: any; callback?: any; formInstance: FormInstance<any> }) => {
  let { item = {}, callback, formInstance } = props;
  let { id } = item;
  TzConfirm({
    width: '800px',
    title: id ? translations.edit_IP_group : translations.add_IP_group,
    okText: id ? translations.save : translations.newAdd,
    content: <IPGroupDom formInstance={formInstance} param={item} />,
    onOk() {
      return new Promise((resolve, reject) => {
        formInstance?.validateFields().then((value: any) => {
          let fn = id ? putIpgroups : postIpgroups;
          fn(merge({}, item, value, { ipSet: value['ipSet'].join(',') })).subscribe((res) => {
            if (res.error) {
              reject();
              return;
            }
            showSuccessMessage(id ? translations.edit_succeeded : translations.activeDefense_successTip);
            resolve(res);
            callback(res.getItem());
          });
        }, reject);
      });
    },
  });
};
const IPGroup = (props: any) => {
  const [filters, setFilters] = useState<any>({});
  const listComp = useRef(undefined as any);
  let [showPageFooter, setShowPageFooter] = useState(false);
  let [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [formInstance] = Form.useForm();
  const deleteIPGroup = useMemoizedFn((row: string[], title: string) => {
    TzConfirmDelete({
      content: translations.unStandard.deletion_policy,
      onOk() {
        return new Promise((resolve, reject) => {
          deleteIpgroups({ ids: row.join(',') }).subscribe((res) => {
            if (res.error) {
              reject();
              return;
            }
            listComp && listComp.current.refresh();
            showSuccessMessage(translations.activeDefense_delSuccessTip);
            resolve(res);
            setSelectedRowKeys([]);
            setShowPageFooter(false);
          });
        });
      },
    });
  });
  let columns = useMemo(() => {
    let a = ['ip_name', 'ipSet', 'comment', 'cluster'];
    let arr = columnsList.filter((item: any) => a.includes(item.dataIndex));
    let newArr = sortBy(arr, (x) => findIndex(a, (y) => x.dataIndex === y));
    return [
      ...newArr,
      {
        title: translations.scanner_report_operate,
        dataIndex: 'ip_name',
        width: '120px',
        render: (status: any, row: any) => {
          let { id, name } = row;
          return (
            <>
              <TzButton
                type="text"
                className="ml8"
                onClick={() => {
                  addIPGroup({
                    item: row,
                    formInstance,
                    callback: () => {
                      listComp && listComp.current.refresh();
                      setSelectedRowKeys([]);
                      setShowPageFooter(false);
                    },
                  });
                }}
              >
                {translations.edit}
              </TzButton>
              <TzButton
                type="text"
                danger
                onClick={() => {
                  deleteIPGroup([id], name);
                }}
              >
                {translations.delete}
              </TzButton>
            </>
          );
        },
      },
    ];
  }, []);
  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const params = {
        offset,
        limit: pageSize,
        ...filters,
      };
      return ipgroups(params).pipe(
        map((res: WebResponse<any>) => {
          const items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems || 0,
          };
        }),
      );
    },
    [filters],
  );
  let clusterList = useAssetsClusterList();
  const screenFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.compliances_policyDetails_name,
        name: 'name',
        type: 'input',
        icon: 'icon-mingmingkongjian',
      },
      {
        label: translations.ip_ranges,
        name: 'ipSet',
        type: 'input',
        icon: 'icon-ip',
      },
      {
        label: translations.clusterManage_key,
        name: 'cluster',
        type: 'select',
        icon: 'icon-pod',
        props: {
          options: clusterList,
        },
      },
    ],
    [clusterList],
  );
  const data = useTzFilter({ initial: screenFilter });
  const handleChange = useCallback((values: any) => {
    setFilters((pre: any) => merge({}, values));
  }, []);
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
  useCallback(() => {
    setShowPageFooter(props.activeKey === 'ip');
  }, [props.activeKey]);
  let setFooter = useCallback(() => {
    Store.pageFooter.next(
      showPageFooter ? (
        <div>
          <span className="mr16 ml16">{`${translations.selected} ${selectedRowKeys.length} ${translations.items}`}</span>
          <TzButton
            className={'mr20'}
            disabled={!selectedRowKeys.length}
            danger
            onClick={() => deleteIPGroup(selectedRowKeys, '')}
          >
            {translations.delete}
          </TzButton>
        </div>
      ) : null,
    );
  }, [showPageFooter, selectedRowKeys]);
  const l = useLocation();
  useEffect(() => {
    setFooter();
  }, [setFooter, l]);
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
  return (
    <div className="ip-group">
      <div className="mb12">
        <FilterContext.Provider value={{ ...data }}>
          <div className={'flex-r-c'}>
            <div>
              {showPageFooter ? null : (
                <TzButton
                  className="mr16"
                  type={'primary'}
                  onClick={() =>
                    addIPGroup({
                      item: {},
                      formInstance,
                      callback: () => {
                        listComp && listComp.current.refresh();
                      },
                    })
                  }
                >
                  {translations.newAdd}
                </TzButton>
              )}
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
            </div>

            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      <TzTableServerPage
        rowSelection={rowSelection}
        columns={columns}
        tableLayout={'fixed'}
        rowKey="id"
        reqFun={reqFun}
        ref={listComp}
      />
    </div>
  );
};

export default IPGroup;
