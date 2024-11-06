import Form from 'antd/lib/form';
import { TablePaginationConfig } from 'antd/lib/table';
import { find, isEqual, merge } from 'lodash';
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { map } from 'rxjs/operators';
import TzFilter from '../../components/ComponentsLibrary/TzFilter';
import useTzFilter, { FilterContext } from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import TzFilterForm from '../../components/ComponentsLibrary/TzFilterForm';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import TzSelect, { filterOption } from '../../components/ComponentsLibrary/tzSelect';
import TzSelectTag from '../../components/ComponentsLibrary/TzSelectTag';
import TzTextArea from '../../components/ComponentsLibrary/TzTextArea';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../components/tz-button';
import { TzCheckbox } from '../../components/tz-checkbox';
import { MyFormItem, TzForm, TzFormItem } from '../../components/tz-form';
import { TzInput } from '../../components/tz-input';
import { TzMessageSuccess } from '../../components/tz-mesage';
import { TzConfirm } from '../../components/tz-modal';
import { TzRadioGroup } from '../../components/tz-radio';
import { TzCol, TzRow } from '../../components/tz-row-col';
import { TzSwitch } from '../../components/tz-switch';
import { TzTableServerPage } from '../../components/tz-table';
import { RenderTag } from '../../components/tz-tag';
import { TzTooltip } from '../../components/tz-tooltip';
import { showSuccessMessage } from '../../helpers/response-handlers';
import {
  blackwhitelist,
  blackwhitelistEnabling,
  blackwhitelists,
  deleteBlackwhitelist,
  putBlackwhitelist,
  wafServices,
} from '../../services/DataService';
import { translations } from '../../translations/translations';
import './Blackwhitelists.scss';

let modeOp = [
  {
    label: translations.blacklist,
    value: 'black',
  },
  {
    label: translations.white_list,
    value: 'white',
  },
  { label: translations.strong_whitelist, value: 'strong-white' },
];
let Whitelists = (props: { formInstance: any; param?: any }) => {
  let { formInstance, param = undefined } = props;
  let [form] = Form.useForm();
  const key1 = Form.useWatch('key1', form);
  const key2 = Form.useWatch('key2', form);
  const global = Form.useWatch('global', formInstance);
  const mode = Form.useWatch('mode', formInstance);

  let [scopeOptions, setScopeOptions] = useState([]);
  let optionsKey1 = [
    {
      label: translations.source_ip,
      value: 'ip',
    },
    {
      label: translations.runtimePolicy_container_path,
      value: 'path',
    },
  ];
  let optionsKey2 = useMemo(() => {
    form.setFieldsValue({
      key2: '==',
    });
    return key1 === 'ip'
      ? [
          {
            label: translations.equal_to,
            value: '==',
          },
          {
            label: 'CIDR',
            value: 'CIDR',
          },
        ]
      : [
          {
            label: translations.equal_to,
            value: '==',
          },
          {
            label: translations.regular_matching,
            value: 'matches',
          },
        ];
  }, [key1]);
  let getPlaceholder = useMemo(() => {
    let obj: any = {
      'ip==': translations.unStandard.str267,
      ipCIDR: translations.unStandard.str268,
      'path==': translations.unStandard.str269,
      pathmatches: translations.unStandard.str269,
    };
    return translations.unStandard.str252(obj[key1 + '' + key2]);
  }, [key1, key2]);

  let getErrorMessage = useMemo(() => {
    let item = optionsKey1.find((item: { value: any }) => item.value == key1) || {
      label: undefined,
    };
    return item.label + translations.notEmpty;
  }, [key1, optionsKey1]);
  let getScopeOptions = useCallback(() => {
    wafServices({ limit: 10000, offset: 0 }).subscribe((res) => {
      let items: any = res.getItems() || [];
      setScopeOptions(
        items.map((item: any) => {
          return {
            label: item.name,
            value: item.id,
          };
        }),
      );
    });
  }, []);
  useEffect(() => {
    getScopeOptions();
    formInstance.resetFields();
    return () => {
      formInstance.resetFields();
    };
  }, []);
  return (
    <TzForm
      form={props.formInstance}
      validateTrigger={'onChange'}
      initialValues={merge({ mode: 'black' }, param, {
        status: param ? param.status === 0 : 1,
        global: param?.global === true ? true : false,
        expr: param?.mode === 'strong-white' ? param?.expr?.split(',') || [] : param?.expr,
      })}
    >
      <TzFormItem name="id" hidden>
        <TzInput />
      </TzFormItem>
      <TzFormItem
        name="status"
        valuePropName="checked"
        label={translations.compliances_breakdown_dotstatus}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <TzSwitch
          checkedChildren={translations.confirm_modal_isopen}
          unCheckedChildren={translations.confirm_modal_isclose}
        />
      </TzFormItem>
      <TzFormItem
        name="mode"
        label={translations.list_type}
        tooltip={translations.unStandard.str265}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <TzRadioGroup
          options={modeOp}
          onChange={(e) => {
            if (e.target.value === 'strong-white') {
              formInstance.setFieldsValue({
                expr: [],
              });
            } else {
              formInstance.setFieldsValue({
                expr: '',
              });
            }
          }}
        />
      </TzFormItem>
      <TzFormItem
        name="name"
        label={translations.list_name}
        rules={[
          {
            required: true,
            message: translations.clusterManage_placeholder + translations.list_name,
          },
        ]}
      >
        <TzInput placeholder={translations.clusterManage_placeholder + translations.list_name} />
      </TzFormItem>
      <TzFormItem hidden name="global" valuePropName="checked">
        <TzCheckbox>{translations.all_apps}</TzCheckbox>
      </TzFormItem>
      <MyFormItem
        label={translations.effectiveness_scope}
        name="scope"
        rules={[
          {
            required: true,
            message: translations.unStandard.str255,
            validator: (_) => {
              let { scope } = formInstance.getFieldsValue();
              return global || (!global && scope && scope?.length !== 0) ? Promise.resolve() : Promise.reject();
            },
          },
        ]}
        render={(children) => (
          <>
            <div>
              <TzCheckbox
                className={'mb4'}
                defaultChecked={global}
                onChange={(e) => {
                  let checked = e.target.checked;
                  if (checked) {
                    formInstance.setFieldsValue({ global: checked, scope: [] });
                  } else {
                    formInstance.setFieldsValue({ global: checked, scope: undefined });
                  }
                }}
              >
                {translations.all_apps}
              </TzCheckbox>
              {global && (
                <TzSelect
                  placeholder={translations.unStandard.str254}
                  value={['global']}
                  options={[
                    {
                      label: translations.all_apps,
                      value: 'global',
                    },
                  ]}
                  disabled={global}
                  mode={'multiple'}
                />
              )}
            </div>

            {children}
          </>
        )}
      >
        {global ? (
          <></>
        ) : (
          <TzSelect placeholder={translations.unStandard.str254} options={scopeOptions} mode={'multiple'} />
        )}
      </MyFormItem>
      {mode !== 'strong-white' ? (
        <>
          <TzForm
            form={form}
            validateTrigger={'onChange'}
            initialValues={{ key1: 'ip', key2: '==', key3: undefined }}
            onFinish={(values: any) => {
              let { key1, key2, key3 } = values;
              let str = `${key1} ${key2} "${key3}"`;
              let { expr } = formInstance.getFieldsValue();
              formInstance.setFieldsValue({
                expr: [expr, str].filter((item) => !!item).join('&&'),
              });
              form.resetFields();
            }}
          >
            <TzRow gutter={8}>
              <TzCol flex={1}>
                <TzFormItem label={translations.matching_criteria} name={'key1'}>
                  <TzSelect options={optionsKey1} showSearch filterOption={filterOption} />
                </TzFormItem>
              </TzCol>
              <TzCol flex={1}>
                <TzFormItem label={' '} name={'key2'}>
                  <TzSelect options={optionsKey2} />
                </TzFormItem>
              </TzCol>
              <TzCol flex={3}>
                <TzFormItem
                  label={' '}
                  rules={[
                    {
                      validator: (val, value) => {
                        return !value ? Promise.reject() : Promise.resolve();
                      },
                      message: getErrorMessage,
                    },
                  ]}
                  name={'key3'}
                >
                  <TzInput placeholder={getPlaceholder} />
                </TzFormItem>
              </TzCol>
              <TzCol style={{ width: '44px' }}>
                <TzFormItem label={' '}>
                  <TzButton type={'text'} style={{ marginTop: '6px' }} onClick={form.submit}>
                    {translations.add}
                  </TzButton>
                </TzFormItem>
              </TzCol>
            </TzRow>
          </TzForm>
          <TzFormItem
            name="expr"
            label={translations.conditional_content}
            style={{ marginBottom: 0 }}
            extra={translations.unStandard.str253}
          >
            <TzTextArea />
          </TzFormItem>
        </>
      ) : (
        <TzFormItem name="expr" label={translations.source_ip} style={{ marginBottom: 0 }}>
          <TzSelectTag placeholder={translations.unStandard.str266} />
        </TzFormItem>
      )}
    </TzForm>
  );
};
let listTypeOp = [
  {
    label: translations.superAdmin_loginLdapConfig_enable,
    opText: translations.disable,
    value: 0,
  },
  {
    label: translations.confirm_modal_isdisable,
    opText: translations.enable,
    value: 1,
  },
];
const Blackwhitelists = () => {
  const [filters, setFilters] = useState<any>();
  const tableRef = useRef(undefined as any);
  const [formInstance] = Form.useForm();
  let setBlackwhitelistFn = (type = 'add') => {
    return new Promise((resolve, reject) => {
      let fn = type === 'add' ? blackwhitelist : putBlackwhitelist;
      formInstance?.validateFields().then((res: any) => {
        let value = formInstance.getFieldsValue();
        let obj = {
          ...value,
          status: value.status ? 0 : 1,
          expr: value.mode === 'strong-white' ? value.expr.join(',') : value.expr,
        };
        fn(obj).subscribe((res) => {
          if (res.error) {
            reject();
            return;
          }
          showSuccessMessage(
            type === 'add' ? translations.black_white_successfully_added : translations.activeDefense_updateSuccessTip,
          );
          resolve(res);
          tableRef.current.refresh();
        });
      }, reject);
    });
  };
  const columns: any = [
    {
      title: translations.list_name,
      dataIndex: 'name',
      ellipsis: { showTitle: false },
      render: (description: any, row: any) => {
        return <>{description}</>;
      },
    },
    {
      title: translations.effectiveness_scope,
      dataIndex: 'scope_name',
      ellipsis: { showTitle: false },
      render: (scope_name: any, row: any) => {
        return <>{scope_name?.join(',') || translations.all_apps}</>;
      },
    },
    {
      title: (
        <>
          {translations.list_type}
          <TzTooltip title={translations.unStandard.str265}>
            <i className="icon iconfont icon-wenti ml4 request"></i>
          </TzTooltip>
        </>
      ),
      dataIndex: 'mode',
      ellipsis: { showTitle: false },
      width: '12%',
      render: (mode: any, row: any) => {
        let label = find(modeOp, (item) => item.value === mode)?.label || mode;
        return <>{label}</>;
      },
    },

    {
      title: translations.matching_criteria,
      dataIndex: 'expr',
      ellipsis: true,
      render: (expr: any, row: any) => {
        return expr ? <EllipsisPopover lineClamp={2}>{expr}</EllipsisPopover> : '-';
      },
    },
    {
      title: translations.compliances_node_status,
      dataIndex: 'status',
      width: '10%',
      align: 'center',
      ellipsis: { showTitle: false },
      render: (status: any, row: any) => {
        return <RenderTag type={status === 0 ? 'not_disable' : 'disable'} />;
      },
    },
    {
      title: translations.clusterManage_operate,
      dataIndex: 'status',
      width: '190px',
      ellipsis: { showTitle: false },
      render: (status: any, row: any) => {
        return (
          <>
            <TzButton
              type={'text'}
              onClick={() => {
                blackwhitelistEnabling(merge({}, row, { status: status === 1 ? 0 : 1 })).subscribe((res) => {
                  if (res.error) return;
                  TzMessageSuccess(
                    status === 1 ? translations.enabled_successfully : translations.disable_successfully,
                  );
                  tableRef.current.refresh();
                });
              }}
            >
              {find(listTypeOp, (item) => item.value === status)?.opText || status === 1}
            </TzButton>
            <TzButton
              type={'text'}
              className={'ml4'}
              onClick={() => {
                TzConfirm({
                  width: '800px',
                  title: translations.edit_list,
                  okText: translations.save,
                  content: <Whitelists formInstance={formInstance} param={row} />,
                  onOk() {
                    return setBlackwhitelistFn('edit');
                  },
                });
              }}
            >
              {translations.edit}
            </TzButton>
            <TzButton
              type={'text'}
              className={'ml4'}
              danger
              onClick={() => {
                TzConfirm({
                  content: translations.unStandard.str275(row.value),
                  onOk: () => {
                    deleteBlackwhitelist(row).subscribe((res) => {
                      if (res.error) {
                        return;
                      }
                      TzMessageSuccess(translations.delete_success_tip);
                      tableRef.current.refresh();
                    });
                  },
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
        );
      },
    },
  ];

  const screenFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.list_name,
        name: 'name',
        type: 'input',
        icon: 'icon-jianceguize',
      },
      {
        label: translations.matching_criteria,
        name: 'expr',
        type: 'input',
        icon: 'icon-dengbaoduiqi',
      },
      {
        label: translations.list_type,
        name: 'mode',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          mode: 'multiple',
          options: modeOp,
        },
      },
      {
        label: translations.compliances_breakdown_dotstatus,
        name: 'status',
        type: 'select',
        icon: 'icon-celveguanli',
        props: {
          mode: 'multiple',
          options: listTypeOp,
        },
      },
    ],
    [],
  );
  const data = useTzFilter({ initial: screenFilter });
  const handleChange = useCallback((values: any) => {
    setFilters((pre: any) => merge({}, values));
  }, []);

  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let pageParams = Object.assign({ limit: pageSize, offset }, filters);
      return blackwhitelists(pageParams).pipe(
        map((res: any) => {
          let items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems,
          };
        }),
      );
    },
    [filters],
  );

  return (
    <div className="black-white-lists mlr32">
      <div className="mb12 mt4">
        <FilterContext.Provider value={{ ...data }}>
          <div className={'flex-r-c'}>
            <TzButton
              type={'primary'}
              onClick={() => {
                TzConfirm({
                  width: '800px',
                  title: translations.add_new_list,
                  okText: translations.newAdd,
                  content: <Whitelists formInstance={formInstance} />,
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
      <TzTableServerPage
        columns={columns}
        className={'nohoverTable'}
        tableLayout={'fixed'}
        rowKey="id"
        reqFun={reqFun}
        onRow={(record) => {
          return {
            onClick: () => {},
          };
        }}
        ref={tableRef}
      />
    </div>
  );
};
export default Blackwhitelists;
