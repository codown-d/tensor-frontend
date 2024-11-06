import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import './index.scss';
import { TzButton } from '../../../components/tz-button';
import { TzCard } from '../../../components/tz-card';
import { getPolicyInfo, getRule, postPolicy } from '../../../services/DataService';
import { Form, TablePaginationConfig } from 'antd';
import { TzFormItem, TzForm } from '../../../components/tz-form';
import { TzInput } from '../../../components/tz-input';
import TzTextArea from '../../../components/ComponentsLibrary/TzTextArea';
import moment from 'moment';
import { onSubmitFailed } from '../../../helpers/response-handlers';
import { Routes } from '../../../Routes';
import { TzMessageSuccess } from '../../../components/tz-mesage';
import { TzConfirm } from '../../../components/tz-modal';
import { translations } from '../../../translations/translations';
import { Store } from '../../../services/StoreService';
import { MaliciousRejectType } from '../../../definitions';
import TzInputSearch from '../../../components/tz-input-search';
import { TzTable, TzTableServerPage } from '../../../components/tz-table';
import { map, tap } from 'rxjs/operators';
import { TableRowSelection } from 'antd/lib/table/interface';
import { deleteStrategy } from '.';
import { TzSelect } from '../../../components/tz-select';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { useMemoizedFn } from 'ahooks';
// import { useAliveController } from 'react-activation';
import { find, get } from 'lodash';
import { flushSync } from 'react-dom';
export const complianceCategory = [
  {
    label: 'containerd',
    value: 'containerd',
  },
  {
    label: 'docker',
    value: 'docker',
  },
  {
    label: 'crio',
    value: 'crio',
  },
];
const StrategicManagementInfo = (props: any) => {
  const [result] = useSearchParams();
  const navigate = useNavigate();
  let [type, setType] = useState(result.get('type') || 'info');
  let [query, setQuery] = useState({
    scapType: result.get('scapType') || 'kube',
    id: result.get('id'),
    type: result.get('type') || 'info',
  });
  let [search, setSearch] = useState<any>();
  const listComp = useRef(undefined as any);
  let [dataInfo, setDataInfo] = useState<any>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [dataSource, setDataSource] = useState<any>([]);
  const [formSecretKey] = Form.useForm();
  const dataInfoList = useMemo(() => {
    const obj: any = {
      creator: translations.imageReject_operator + '：',
      createdAt: translations.runtimePolicy_policy_created + '：',
      operator: translations.updated_by + '：',
      updatedAt: translations.notificationCenter_placeEvent_updateTime + '：',
      comment: translations.imageReject_comment_title + '：',
    };
    return Object.keys(obj).map((item) => {
      const val = get(dataInfo, item);
      let o: any = {
        title: obj[item] || '-',
        content: val || '-',
      };
      if ('updatedAt' === item || 'createdAt' === item) {
        o['render'] = () => {
          return val ? moment(val).format('YYYY-MM-DD HH:mm:ss') : '-';
        };
      }
      if ('creator' === item || 'operator' === item) {
        o['content'] = get(dataInfo, [item, 'account']) || '-';
      }
      return o;
    });
  }, [dataInfo]);
  let breadcrumb = useMemo(() => {
    return [
      {
        children: translations.compliance_testing,
        href: Routes.ComplianceWhole,
      },
      {
        children: translations.baseline_management,
        href: Routes.ComplianceStrategicManagement,
      },
      {
        children: type === 'add' ? translations.new_baseline : translations.baseline_details,
      },
    ];
  }, [type]);
  const name = Form.useWatch('name', formSecretKey);
  const ruleIds = Form.useWatch('ruleIds', formSecretKey);
  let btnDisable = useMemo(() => {
    return !name || ruleIds.length == 0;
  }, [name, ruleIds]);
  useEffect(() => {
    Store.breadcrumb.next(breadcrumb);
  }, [breadcrumb]);

  const toList = useMemoizedFn(() => {
    navigate(-1);
    flushSync(() => {
      navigate(Routes.ComplianceStrategicManagement, {
        replace: true,
        state: { keepAlive: true },
      });
    });
    // refreshScope('ComplianceStrategicManagement');
  });
  // const { refreshScope } = useAliveController();
  const backPrev = useMemoizedFn(() => {
    if (query.type === 'add' || type !== 'add') {
      // navigate(-1);
      toList();
      // refreshScope('ComplianceStrategicManagement');
    } else {
      setType('info');
    }
  });
  const l = useLocation();
  useEffect(() => {
    Store.header.next({
      title: type === 'add' ? translations.new_baseline : dataInfo.name,
      extra:
        type === 'add' ? null : (
          <>
            <TzButton
              className={'mr16'}
              onClick={() => {
                setType('add');
              }}
            >
              {translations.create_a_copy}
            </TzButton>
            {dataInfo.isDefault ? null : (
              <TzButton
                danger
                onClick={() => deleteStrategy(Object.assign({}, dataInfo, { scapType: query.scapType }), toList)}
              >
                {translations.delete}
              </TzButton>
            )}
          </>
        ),
      onBack: backPrev,
    });
  }, [type, dataInfo, l]);
  useEffect(() => {
    Store.pageFooter.next(
      type !== 'info' ? (
        <div className={'flex-r-c'} style={{ justifyContent: 'flex-end', height: '100%', width: '100%' }}>
          <TzButton
            onClick={() => {
              TzConfirm({
                content: translations.unStandard.str44,
                cancelText: translations.confirm_modal_retur,
                onOk: backPrev,
              });
            }}
          >
            {translations.cancel}
          </TzButton>
          <TzButton
            className={'ml16'}
            type={'primary'}
            disabled={btnDisable}
            onClick={() => {
              formSecretKey.submit();
            }}
          >
            {type === 'edit' ? translations.save : translations.scanner_config_confirm}
          </TzButton>
        </div>
      ) : null,
    );
  }, [type, btnDisable, l]);

  let columns = useMemo(() => {
    //20230425调整表格
    const col: any = [
      {
        title: translations.compliances_breakdown_policyNumber,
        dataIndex: 'rawId',
        width: '15%',
      },
      {
        title: translations.compliances_breakdown_dengbao,
        dataIndex: 'classified',
        width: '20%',
      },
      {
        title: translations.compliances_breakdown_section,
        dataIndex: 'title',
        width: '20%',
      },
      {
        title: translations.compliances_breakdown_description,
        dataIndex: 'detail',
      },
    ];
    query.scapType === 'docker'
      ? col.splice(1, 0, {
          title: translations.category,
          dataIndex: 'runtime',
          width: '10%',
          render: (item: any) => {
            return find(complianceCategory, (it) => item === it.value)?.label || item;
          },
        })
      : null;
    return col;
  }, [query.scapType]);
  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = {
        offset,
        query: search,
        limit: pageSize,
        ...query,
      };
      return getPolicyInfo(pageParams).pipe(
        map((res: any) => {
          let item = res.getItem();
          setDataInfo(item);
          formSecretKey.setFieldsValue(item);
          setSelectedRowKeys(
            item.rules.map((ite: { id: any }) => {
              return ite.id;
            }),
          );
          let result = item.rules.filter((ite: any) => {
            return search ? ite.rawId.indexOf(search) !== -1 || ite.title.indexOf(search) !== -1 : true;
          });
          return {
            data: result,
            total: result.length,
          };
        }),
      );
    },
    [search],
  );
  const reqFunRule = useCallback(() => {
    const pageParams = {
      offset: 0,
      keyword: search,
      limit: 10000,
      ...query,
    };
    getRule(pageParams)
      .pipe(
        map((res: any) => {
          let items = res.getItems();
          setDataSource(items);
        }),
      )
      .subscribe();
  }, [search]);
  useEffect(() => {
    reqFunRule();
  }, [reqFunRule]);
  useEffect(() => {
    formSecretKey.setFieldsValue({ ruleIds: selectedRowKeys });
  }, [selectedRowKeys]);
  const handleRowSelection = useCallback((selected: boolean, selectedRows: any[]) => {
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
  }, []);
  const rowSelection: TableRowSelection<any> = useMemo(() => {
    return {
      selectedRowKeys,
      onSelect: (record: any, selected: any, selectedRows: any, nativeEvent: any) => {
        nativeEvent.stopPropagation();
        handleRowSelection(selected, [record]);
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        handleRowSelection(selected, changeRows);
      },
      checkStrictly: false,
    };
  }, [selectedRowKeys, handleRowSelection]);
  return (
    <>
      <div className="compliance-strategic-management mlr32 mb20 pt4">
        <TzForm
          form={formSecretKey}
          initialValues={dataInfo}
          onFinish={(values) => {
            let obj = Object.assign({}, values, query);
            delete obj.id;
            postPolicy(obj).subscribe((res: any) => {
              if (res.error) {
                onSubmitFailed(res);
              } else {
                TzMessageSuccess(translations.activeDefense_successTip);
                toList();
              }
            });
          }}
          autoComplete="off"
        >
          <TzCard
            title={translations.compliances_breakdown_taskbaseinfo}
            id="base"
            bodyStyle={{ padding: '4px 0 0 0' }}
          >
            {type === 'info' ? (
              <ArtTemplateDataInfo data={dataInfoList} span={2} />
            ) : (
              <div className="plr24 pb20">
                <TzFormItem
                  label={`${translations.baseline_name}：`}
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: translations.unStandard.str43,
                    },
                    {
                      type: 'string',
                      max: 50,
                      message: translations.unStandard.str45,
                    },
                  ]}
                >
                  <TzInput placeholder={translations.unStandard.str43} />
                </TzFormItem>
                <TzFormItem
                  label={`${translations.imageReject_comment_title}：`}
                  name="comment"
                  style={{ marginBottom: '0px' }}
                  rules={[
                    {
                      type: 'string',
                      max: 100,
                      message: translations.unStandard.str46,
                    },
                  ]}
                >
                  <TzTextArea placeholder={translations.unStandard.str40} showCount allowClear />
                </TzFormItem>
                <TzFormItem hidden name="ruleIds">
                  <TzSelect options={[]} />
                </TzFormItem>
              </div>
            )}
          </TzCard>
          <TzCard
            className={`mt20 mb20 ${false ? 'border-red' : ''}`}
            title={
              <>
                {translations.detection_item}
                {type === 'info' ? (
                  <></>
                ) : (
                  <span
                    className={'f12 ml8'}
                    style={{ color: '#6C7480' }}
                  >{`${translations.selected} ${selectedRowKeys.length} ${translations.items} / ${translations.total} ${dataSource.length} ${translations.items}`}</span>
                )}
                <TzInputSearch
                  className={'f-r'}
                  placeholder={translations.unStandard.str47}
                  style={{ width: '370px' }}
                  onSearch={setSearch}
                />
              </>
            }
            id="Vuln"
            bodyStyle={{
              paddingTop: '0px',
              marginTop: '-8px',
              paddingBottom: type === 'info' ? '8px' : '0px',
            }}
          >
            {type === 'info' ? (
              <TzTableServerPage columns={columns} tableLayout={'fixed'} rowKey="id" reqFun={reqFun} ref={listComp} />
            ) : (
              <TzTable
                dataSource={dataSource}
                tableLayout={'fixed'}
                pagination={false}
                columns={columns}
                rowSelection={rowSelection}
                rowKey="id"
              />
            )}
          </TzCard>
        </TzForm>
      </div>
    </>
  );
};
export default StrategicManagementInfo;
function navigate(LabelManag: string, arg1: { replace: true; state: { keepAlive: boolean } }) {
  throw new Error('Function not implemented.');
}
