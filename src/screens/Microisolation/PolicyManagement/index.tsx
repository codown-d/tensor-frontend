import React, { useCallback, useMemo, useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './index.scss';
import { useMemoizedFn, useSetState } from 'ahooks';
import { Spin, TablePaginationConfig, Upload, UploadFile } from 'antd';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { TzButton } from '../../../components/tz-button';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { TzConfirm, TzConfirmDelete } from '../../../components/tz-modal';
import { TzTableServerPage } from '../../../components/tz-table';
import { WebResponse } from '../../../definitions';
import { showFailedMessage, showSuccessMessage } from '../../../helpers/response-handlers';
import { merge, sortBy, findIndex, divide, find, throttle, debounce, ceil } from 'lodash';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  deleteMicrosegPolicy,
  microsegPolicies,
  policiesEnable,
  policyimporting,
  policyrecreate,
  policytemplate,
  postPolicyimporting,
} from '../../../services/DataService';
import { translations } from '../../../translations';
import { columnsList } from '../lib';
import { Store } from '../../../services/StoreService';
import { map } from 'rxjs/operators';
import Form, { FormInstance } from 'antd/lib/form';
import { Routes } from '../../../Routes';
import { TzMessageError } from '../../../components/tz-mesage';
import { TzUpload, UploadItemRender } from '../../../components/tz-upload';
import { useAssetsClusterList } from '../../../helpers/use_fun';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { TzSwitch } from '../../../components/tz-switch';
import { TzTag } from '../../../components/tz-tag';
import { TzTooltip } from '../../../components/tz-tooltip';
import { LoadingOutlined } from '@ant-design/icons';
import { TzSelect } from '../../../components/tz-select';
import { UploadFileStatus } from 'antd/lib/upload/interface';
import axios from 'axios';
let enableStatus = [
  {
    label: translations.microseg_tenants_enabled,
    value: 'true',
  },
  {
    label: translations.deactivateC,
    value: 'false',
  },
];
export let micrPriorityEnum = [
  {
    label: translations.effective,
    value: '0',
    style: {
      color: 'rgba(33, 119, 209, 1)',
      background: 'rgba(33, 119, 209, 0.05)',
    },
  },
  {
    label: translations.not_effective,
    value: '1',
    style: {
      color: 'rgba(142, 151, 163, 1)',
      background: 'rgba(142, 151, 163, 0.1)',
    },
  },
  {
    label: translations.deflectDefense_ready,
    value: '2',
    style: {
      color: 'rgba(33, 119, 209, 1)',
      background: '#fff',
    },
  },
  {
    label: translations.preparation_failed,
    value: '3',
    style: {
      color: 'rgba(233, 84, 84, 1)',
      background: 'rgba(233, 84, 84, 0.1000)',
    },
  },
  {
    label: translations.abnormal,
    value: '4',
    style: {
      color: 'rgba(255, 138, 52, 1)',
      background: 'rgba(255, 138, 52, 0.1000)',
    },
  },
];
let UploadPolicyFile = forwardRef((props: { formIns: FormInstance<any> }, ref?: any) => {
  let { formIns } = props;
  let policies = Form.useWatch('policies', formIns);
  let clusterList = useAssetsClusterList();
  let [fileList, setFileList] = useState<UploadFile<any>[]>();
  let [isUpload, setIsUpload] = useState(false);

  useImperativeHandle(ref, () => {
    return {
      onProgress({ percent, status }: { percent: number; status: UploadFileStatus }) {
        setFileList((pre) => {
          let node = pre?.[0] || {};
          return [merge(node, { percent, status })];
        });
      },
      isUpload: setIsUpload,
    };
  }, [fileList]);

  return (
    <>
      <div
        className="mb24"
        style={{
          background: 'rgba(33,119,209,0.05)',
          borderRadius: '8px',
          padding: '8px  16px 8px 16px',
          color: '#2177D1',
        }}
      >
        <i className="icon iconfont icon-banben mr8"> </i>
        {translations.import_policy_actions}
      </div>
      <TzForm form={formIns} style={{ position: 'relative' }} wrapperCol={{ flex: 1 }}>
        <TzFormItem
          name={'cluster'}
          label={translations.clusterManage_key}
          rules={[{ required: true, message: translations.activeDefense_clusterPla }]}
        >
          <TzSelect placeholder={translations.activeDefense_clusterPla} options={clusterList} disabled={isUpload} />
        </TzFormItem>
        <div className="p-r">
          <TzFormItem
            name={'policies'}
            label={translations.upload_file}
            style={{ marginBottom: 0 }}
            rules={[{ required: true, message: translations.unStandard.requireSelectTip(translations.upload_file) }]}
          >
            <TzFormItem noStyle>
              <TzUpload
                maxCount={1}
                className="db"
                accept=".xlsx"
                disabled={isUpload}
                beforeUpload={(file: any) => {
                  setFileList([file]);
                  formIns.setFieldsValue({ policies: file });
                  return false;
                }}
                fileList={fileList}
                itemRender={(originNode, file: UploadFile, fileList: object[], actions) => {
                  const { status, name, size = 0, percent } = file;
                  return (
                    <UploadItemRender
                      key={file.uid}
                      name={name}
                      size={size}
                      status={status}
                      percent={percent}
                      actions={actions}
                    />
                  );
                }}
                onRemove={() => {
                  setFileList(undefined);
                  formIns.setFieldsValue({ policies: undefined });
                  return true;
                }}
              >
                <div className="mb4 flex-r-c">
                  <TzButton type="text" className="mr4" disabled={isUpload}>
                    {translations.select_file}
                  </TzButton>
                  <div className="f12" style={{ color: '#B3BAC6', display: 'inline-block' }}>
                    {translations.xlsx_files_5M}
                  </div>
                </div>
              </TzUpload>
            </TzFormItem>
          </TzFormItem>
        </div>
      </TzForm>
    </>
  );
});
let sorterRef: any = {};
export const deletePolicy = (row: string[], title: string, callback?: Function) => {
  TzConfirmDelete({
    content: translations.unStandard.str57(title),
    onOk() {
      return new Promise((resolve, reject) => {
        deleteMicrosegPolicy({ ids: row.join(',') }).subscribe((res) => {
          if (res.error) {
            reject();
            return;
          }
          showSuccessMessage(translations.activeDefense_delSuccessTip);
          callback?.();
          resolve(res);
        });
      });
    },
  });
};
export let enablePolicyStatus = debounce((row, enable, callback?: Function) => {
  let parmas: any = { ids: row, enable };
  policiesEnable(parmas).subscribe((res) => {
    if (res.error) {
      return;
    }
    showSuccessMessage(enable ? translations.enabled_successfully : translations.disable_successfully);
    callback?.();
  });
}, 1000);
const PolicyManagement = (props: any) => {
  const [filters, setFilters] = useState<any>({});
  const listComp = useRef(undefined as any);
  let [showPageFooter, setShowPageFooter] = useState(false);
  let [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  let clusters = useAssetsClusterList();
  let dealWithRes = () => {
    listComp && listComp.current.refresh();
    setSelectedRowKeys([]);
    setShowPageFooter(false);
  };
  let enablePolicy = useMemoizedFn((row, enable) => {
    let parmas: any = { ids: row, enable };
    if (!row.length) {
      parmas['all'] = true;
    }
    policiesEnable(parmas).subscribe((res) => {
      if (res.error) {
        return;
      }
      showSuccessMessage(enable ? translations.enabled_successfully : translations.disable_successfully);
      dealWithRes();
    });
  });

  let columns = useMemo(() => {
    let a = ['source_object', 'target_audience', 'matchTime'];
    let arr = columnsList
      .filter((item: any) => a.includes(item.dataIndex))
      .map((item: any) => {
        if (item.dataIndex === 'matchTime') {
          item['sorter'] = true;
        }
        return item;
      });
    let newArr = sortBy(arr, (x) => findIndex(a, (y) => x.dataIndex === y));
    return [
      {
        title: 'ID',
        dataIndex: 'id',
        width: '50px',
      },
      ...newArr,
      {
        title: translations.active_status,
        dataIndex: 'status',
        width: '12%',
        render: (item: any, row: any) => {
          let { statusDetail, status } = row;
          let node = find(micrPriorityEnum, (item) => item.value == status);
          return node ? (
            <div>
              <div className="flex-r-c" style={merge({ justifyContent: 'flex-start' })}>
                {status === 2 ? <LoadingOutlined spin style={merge(node?.style)} /> : null}
                <TzTag className="flex-r-c" style={merge({ maxWidth: '100%' }, node?.style)}>
                  <EllipsisPopover>{node?.label}</EllipsisPopover>
                </TzTag>
                {status === 3 ? (
                  <TzTooltip title={statusDetail}>
                    <i
                      className={'iocn iconfont icon-banben mr8'}
                      style={merge(node?.style, { background: '#fff' })}
                    ></i>
                  </TzTooltip>
                ) : null}
              </div>
              {status === 3 || status === 4 ? (
                <TzButton
                  type={'text'}
                  className="mt8 ml0"
                  onClick={() => {
                    policyrecreate({ id: row.id }).subscribe((res) => {
                      if (res.error) {
                        return;
                      }
                      listComp && listComp.current.refresh();
                    });
                  }}
                >
                  {translations.make_afresh}
                </TzButton>
              ) : null}
            </div>
          ) : null;
        },
      },
      {
        title: translations.scanner_report_operate,
        dataIndex: 'ip_name',
        width: '148px',
        render: (ip_name: any, row: any, index: string | number) => {
          let { id, name, enable } = row;
          return (
            <div
              className="flex-r-c"
              style={{ justifyContent: 'flex-start' }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <TzSwitch
                checked={enable}
                className="mr4"
                size={'small'}
                onChange={(val) =>
                  enablePolicyStatus([id], val, () => {
                    dealWithRes();
                  })
                }
              />
              <TzButton
                type="text"
                className="ml0 mr4"
                onClick={() => {
                  navigate(`${Routes.MicroisolationPolicyManagementEdit.replace(':id', id)}`);
                }}
              >
                {translations.edit}
              </TzButton>
              <TzButton
                type="text"
                danger
                onClick={() => {
                  deletePolicy([row.id], name, () => {
                    listComp && listComp.current.refresh();
                    setSelectedRowKeys([]);
                    setShowPageFooter(false);
                  });
                }}
              >
                {translations.delete}
              </TzButton>
            </div>
          );
        },
      },
    ];
  }, []);
  const reqFun = useCallback(
    (pagination: TablePaginationConfig, filter, sorter) => {
      if (sorter) {
        let { field, order } = sorter;
        sorterRef[field] = order;
      }

      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const params = {
        offset,
        limit: pageSize,
        ...filters,
        ...sorterRef,
      };
      return microsegPolicies(params).pipe(
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
  const screenFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: 'ID',
        name: 'id',
        type: 'input',
        icon: 'icon-bianhao',
      },
      {
        label: translations.microseg_segments_policy_src_obj,
        name: 'srcName',
        type: 'input',
        icon: 'icon-lujing',
      },
      {
        label: translations.microseg_segments_policy_dst_obj,
        name: 'dstName',
        type: 'input',
        icon: 'icon-chakanxiangqing',
      },

      {
        label: translations.active_status,
        name: 'status',
        icon: 'icon-celveguanli',
        type: 'select',
        props: {
          options: micrPriorityEnum.map(({ label, value }) => ({ label, value })),
        },
      },
      {
        label: translations.enabled_state,
        name: 'enable',
        icon: 'icon-dengbaoduiqi',
        type: 'select',
        props: {
          options: enableStatus,
        },
      },
      {
        label: translations.clusterManage_key,
        name: 'cluster',
        type: 'select',
        props: {
          options: clusters,
        },
        icon: 'icon-jiqun',
      },
    ],
    [clusters],
  );
  const data = useTzFilter({ initial: screenFilter });
  const handleChange = useCallback((values: any) => {
    setFilters((pre: any) => merge({}, values));
  }, []);
  const l = useLocation();
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
  let setFooter = useCallback(() => {
    Store.pageFooter.next(
      showPageFooter ? (
        <div>
          <span className="mr16">{`${translations.selected} ${selectedRowKeys.length} ${translations.items}`}</span>
          <TzButton className={'mr16'} onClick={() => enablePolicy(selectedRowKeys, true)}>
            {selectedRowKeys.length ? translations.enable : translations.enable_all}
          </TzButton>
          <TzButton className={'mr16'} onClick={() => enablePolicy(selectedRowKeys, false)}>
            {selectedRowKeys.length ? translations.deactivate : translations.deactivate_all}
          </TzButton>
          {selectedRowKeys.length == 0 ? (
            <TzButton
              className={'mr16'}
              onClick={() => {
                policyimporting({ ids: [], ...filters }).subscribe((res) => {});
              }}
            >
              {translations.export_all}
            </TzButton>
          ) : (
            <TzButton
              className={'mr16'}
              disabled={!selectedRowKeys.length}
              onClick={() => {
                policyimporting({ ids: selectedRowKeys }).subscribe((res) => {});
              }}
            >
              {translations.export}
            </TzButton>
          )}
          <TzButton
            className={'mr16'}
            disabled={!selectedRowKeys.length}
            danger
            onClick={() =>
              deletePolicy(selectedRowKeys, '', () => {
                listComp && listComp.current.refresh();
                setSelectedRowKeys([]);
                setShowPageFooter(false);
              })
            }
          >
            {translations.delete}
          </TzButton>
        </div>
      ) : null,
    );
  }, [showPageFooter, selectedRowKeys, filters]);
  useEffect(() => {
    setFooter();
  }, [setFooter, l]);

  let setHeader = useMemoizedFn(() => {
    Store.header.next({
      title: translations.policy_management,
      extra: (
        <TzButton
          onClick={() => {
            navigate(`${Routes.MicroisolationConfig}`);
          }}
          icon={<i className="icon iconfont icon-jingxiangsaomiao-peizhi f16"></i>}
        >
          {translations.scanner_images_setting}
        </TzButton>
      ),
    });
  });
  useEffect(() => {
    setHeader();
  }, [l]);
  useEffect(() => {
    listComp && listComp.current.refresh();
  }, [l]);
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
  let navigate = useNavigate();
  let [formInsTable] = Form.useForm();
  let [formIns] = Form.useForm();
  let uploadPolicyFileRef = useRef();
  return (
    <div className="microisolation-policy-management mlr32 pb20">
      <div className="mb12 mt4">
        <FilterContext.Provider value={{ ...data }}>
          <div className={'flex-r-c'}>
            <div>
              {showPageFooter ? null : (
                <TzButton
                  className="mr16"
                  type={'primary'}
                  onClick={() => navigate(Routes.MicroisolationPolicyManagementAdd)}
                >
                  {translations.newAdd}
                </TzButton>
              )}
              <TzButton
                className="mr16"
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
              {showPageFooter ? null : (
                <TzButton
                  className="mr16"
                  onClick={() => {
                    const CancelToken = axios.CancelToken;
                    const source = CancelToken.source();
                    let loading = false;
                    let modal = TzConfirm({
                      width: '560px',
                      title: translations.import_policies,
                      content: <UploadPolicyFile formIns={formIns} ref={uploadPolicyFileRef} />,
                      okText: translations.import_file,
                      closeIcon: (
                        <i
                          className={'icon iconfont icon-lansexiaocuohao f24'}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (loading) {
                              TzConfirm({
                                title: null,
                                width: '420px',
                                content: translations.unStandard.importing_policy_close,
                                okButtonProps: { danger: true },
                                okText: translations.confirm_modal_close,
                                onOk: () => {
                                  modal.destroy();
                                  source.cancel();
                                  formIns.resetFields();
                                },
                              });
                            } else {
                              modal.destroy();
                              formIns.resetFields();
                            }
                          }}
                        ></i>
                      ),
                      cancelButtonProps: { style: { display: 'none' } },
                      onOk: () => {
                        return new Promise((resolve, reject) => {
                          formIns
                            .validateFields()
                            .then((value) => {
                              const formData = new FormData();
                              formData.append('cluster', value.cluster);
                              formData.append('policies', value.policies);
                              uploadPolicyFileRef.current?.isUpload(true);
                              postPolicyimporting(
                                formData,
                                value.cluster,
                                (event) => {
                                  let percent = (event.loaded / event.total) * 100;
                                  let status = percent < 100 ? 'uploading' : 'done';
                                  loading = percent < 100;
                                  uploadPolicyFileRef.current?.onProgress({ percent, status });
                                },
                                source,
                              )
                                .then((res) => {
                                  uploadPolicyFileRef.current?.isUpload(false);
                                  formIns.resetFields();
                                  listComp && listComp.current.refresh();
                                  resolve(res);
                                  let result = res.data.data.item;
                                  let isError =
                                    result.rule_filed != 0 || result.seg_failed != 0 || result.ipgroup_filed != 0;
                                  TzConfirm({
                                    width: '560px',
                                    title: translations.import_results,
                                    content: (
                                      <>
                                        <div
                                          className="flex-r-c f16"
                                          style={{ color: '#3E4653', justifyContent: 'center' }}
                                          dangerouslySetInnerHTML={{
                                            __html: translations.unStandard.successfully_imported(result.success),
                                          }}
                                        ></div>
                                        {isError ? (
                                          <div
                                            className="flex-r-c mt16"
                                            style={{ color: '#6C7480', justifyContent: 'center' }}
                                            dangerouslySetInnerHTML={{
                                              __html: translations.unStandard.successfully_imported_info(
                                                result.rule_filed,
                                                result.seg_failed,
                                                result.ipgroup_filed,
                                              ),
                                            }}
                                          ></div>
                                        ) : null}
                                      </>
                                    ),
                                    okText: isError ? translations.download_error_details : translations.sure,
                                    onOk() {
                                      return new Promise((resolve, reject) => {
                                        if (result.rule_filed || result.seg_failed || result.ipgroup_filed) {
                                          policytemplate(result.link).subscribe((res) => {
                                            if (res.error) {
                                              reject();
                                            }
                                            resolve(res);
                                          });
                                        } else {
                                          resolve('');
                                        }
                                      });
                                    },
                                    cancelButtonProps: { style: { display: 'none' } },
                                  });
                                })
                                .catch((res) => {
                                  uploadPolicyFileRef.current?.isUpload(false);
                                  if (res.status === 500) {
                                    TzMessageError(res.message);
                                  } else {
                                    TzMessageError(translations.cancel_upload);
                                  }
                                  reject();
                                });
                            })
                            .catch(reject);
                        });
                      },
                    });
                  }}
                >
                  {translations.import_file}
                </TzButton>
              )}
            </div>
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      <TzForm form={formInsTable}>
        <TzTableServerPage
          rowSelection={rowSelection}
          columns={columns}
          defaultPagination={{ hideOnSinglePage: false }}
          tableLayout={'fixed'}
          rowKey="id"
          onRow={(record) => {
            return {
              onClick: (event) => {
                navigate(`${Routes.MicroisolationPolicyDetail}?policyId=${record.id}`);
              },
            };
          }}
          reqFun={reqFun}
          ref={listComp}
        />
      </TzForm>
    </div>
  );
};
export default PolicyManagement;
