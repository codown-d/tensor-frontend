import Form from 'antd/lib/form';
import { merge } from 'lodash';
import moment from 'moment';
import React, {
  forwardRef,
  PureComponent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { deleteStrategy } from '.';
import AddInfoBtn from '../../../../components/ComponentsLibrary/AddInfoBtn';
import ArtTemplateDataInfo from '../../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import TzAnchor, { useAnchorItem } from '../../../../components/ComponentsLibrary/TzAnchor';
import TzPopconfirm from '../../../../components/ComponentsLibrary/TzPopconfirm';
import { StrategyAction } from '../../../../components/ComponentsLibrary/TzStrategyAction';
import TzTextArea from '../../../../components/ComponentsLibrary/TzTextArea';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../../../components/tz-button';
import { TzCard } from '../../../../components/tz-card';
import { TzCheckbox } from '../../../../components/tz-checkbox';
import { TzForm, TzFormItem, MyFormItem } from '../../../../components/tz-form';
import { TzInput } from '../../../../components/tz-input';
import { TzMessageSuccess } from '../../../../components/tz-mesage';
import { TzConfirm, TzModal } from '../../../../components/tz-modal';
import { TzRadioGroup, TzRadio } from '../../../../components/tz-radio';
import { TzSwitch } from '../../../../components/tz-switch';
import { TzTable } from '../../../../components/tz-table';
import { RenderTag, TzTag } from '../../../../components/tz-tag';
import { TzInfoTooltip } from '../../../../components/tz-tooltip';
import { MaliciousRejectType } from '../../../../definitions';
import { onSubmitFailed } from '../../../../helpers/response-handlers';
import { getUid } from '../../../../helpers/until';
import { Routes } from '../../../../Routes';
import { getUserInformation } from '../../../../services/AccountService';
import { getCiPolicy, putCiPolicy, postCiPolicy } from '../../../../services/DataService';
import { getCurrentLanguage } from '../../../../services/LanguageService';
import { Store } from '../../../../services/StoreService';
import { translations } from '../../../../translations/translations';
import { initTypes } from '../../../ImageReject/ImageNewStrategy';
import { PageTitle } from '../../ImagesCI/CI';
import './index.scss';
import { useGetSensitiveRuleList } from '../../../../services/ServiceHook';
import TzSelect from '../../../../components/ComponentsLibrary/tzSelect';

interface CollectionCreateFormProps {
  open: boolean;
  onCreate: (values: any) => void;
  onCancel: () => void;
  initialValues?: any;
  modalTitle?: string;
}
export const newActiongDataList = [
  {
    label: translations.imageReject_reject_type_alarm,
    title: translations.imageReject_reject_type_alarm,
    value: MaliciousRejectType.alert,
  },
  {
    label: translations.imageReject_reject_type_reject,
    title: translations.imageReject_reject_type_reject,
    value: MaliciousRejectType.block,
  },
];

const StrategicManagementInfo = (props: any) => {
  const navigate = useNavigate();
  const [result] = useSearchParams();
  let [type, setType] = useState(result.get('type') || 'info');
  let [initialValues, setInitialValues] = useState(undefined);

  let [validate, setValidate] = useState({ vuln: false, sensitive: false });
  const [open, setOpen] = useState(false);
  let [dataInfo, setDataInfo] = useState<any>({
    id: result.get('id'),
    vuln_rule_mode: 'alert',
    vuln_level: '',
    vuln_policy: [],
    vuln_whitelist: [],
    ignore_irreparable: true,
    ignore_langaue: true,
    sensitive_file_policy: [],
    sensitive_whitelist: [],
    sensitive_rule_mode: 'alert',
  });
  const [formSecretKey] = Form.useForm();
  let getData = useCallback(() => {
    getCiPolicy(dataInfo).subscribe((res: { getItem: () => any }) => {
      let item: any = res.getItem();
      item['sensitive_file_policy'] = item?.sensitive_file_policy.split(',').filter((item: any) => item);
      item['sensitive_whitelist'] = item?.sensitive_whitelist.split(',').filter((item: any) => item);
      item['vuln_policy'] = item?.vuln_policy.split(',').filter((item: any) => item);
      item['vuln_whitelist'] = item?.vuln_whitelist
        ? item?.vuln_whitelist.map((item: any) => {
            return {
              id: getUid(),
              name: item.name,
              object: item.object === 'all' ? 'all' : 'notAll',
              modifier: item.object === 'all' ? null : item.object.split(','),
            };
          })
        : [];
      setDataInfo((pre: any) => {
        let obj = Object.assign({}, pre, item);
        formSecretKey.setFieldsValue(obj);
        return obj;
      });
    });
  }, [dataInfo]);
  useEffect(() => {
    if (dataInfo.id) {
      getData();
    }
  }, [type]);
  let objTitle: any = useMemo(() => {
    return {
      edit: translations.imageReject_edit_rule_title,
      info: translations.strategyDetails,
      add: translations.imageReject_create_rule_title,
    };
  }, [dataInfo]);
  let breadcrumb = useMemo(() => {
    return [
      {
        children: translations.mirror_lifecycle,
        href: Routes.ImagesCILifeCycle,
      },
      {
        children: 'CI',
        href: Routes.ImagesCILifeCycle + '?tab=ci',
      },
      {
        children: translations.policy_management,
        href: Routes.StrategicManagement,
      },
      {
        children: objTitle[type],
      },
    ];
  }, [objTitle, type]);
  useEffect(() => {
    Store.breadcrumb.next(breadcrumb);
  }, [breadcrumb]);
  const items = [
    {
      href: '#base',
      title: <EllipsisPopover>{translations.microseg_namespace_baseInfo}</EllipsisPopover>,
    },
    {
      href: '#Vuln',
      title: <EllipsisPopover>{translations.imageReject_vulnerabilityRules_tab_title}</EllipsisPopover>,
    },
    {
      href: '#file',
      title: <EllipsisPopover>{translations.imageReject_sensitiveRules_tab_title}</EllipsisPopover>,
    },
  ];

  let deleteData = useCallback(() => {
    let id = formSecretKey.getFieldValue('id');
    let name = formSecretKey.getFieldValue('name');
    deleteStrategy({ id, name }, () => {
      TzMessageSuccess(translations.activeDefense_delSuccessTip);
      navigate(`${Routes.StrategicManagement}`);
    });
  }, [formSecretKey]);
  const dataInfoList = useMemo(() => {
    const obj: any = {
      operator: translations.runtimePolicy_policy_author + '：',
      created_at: translations.runtimePolicy_policy_created + '：',
      Updater: translations.updated_by + '：',
      updated_at: translations.notificationCenter_placeEvent_updateTime + '：',
      comment: translations.imageReject_comment_title + '：',
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: dataInfo[item],
      };
      if ('updated_at' === item || 'created_at' === item) {
        o['render'] = () => {
          return moment(dataInfo[item]).format('YYYY-MM-DD HH:mm:ss');
        };
      }
      return o;
    });
  }, [dataInfo]);
  let getTags = useCallback(
    (f: boolean | string, className?: string) => {
      if (type !== 'info') return null;
      return <RenderTag type={f + ''} className={className} />;
    },
    [type],
  );
  let vuln_level_title = useMemo(() => {
    let node = initTypes.find((item) => item.value == dataInfo['vuln_level']);
    return node ? node.label : '-';
  }, [dataInfo]);

  const l = useLocation();
  useEffect(() => {
    Store.header.next({
      title: 'info' !== type ? objTitle[type] : dataInfo.name,
      onBack: () => {
        navigate(-1);
      },
      extra:
        type === 'info' ? (
          <>
            <TzButton
              onClick={() => {
                setType('edit');
              }}
              className={'mr16'}
            >
              {translations.edit}
            </TzButton>
            <TzButton
              danger
              onClick={() => {
                deleteData();
              }}
            >
              {translations.delete}
            </TzButton>
          </>
        ) : null,
    });
  }, [type, dataInfo, l]);
  useEffect(() => {
    Store.pageFooter.next(
      type !== 'info' ? (
        <div className={'flex-r-c'} style={{ justifyContent: 'flex-end', height: '100%', width: '100%' }}>
          <TzButton
            onClick={() => {
              TzConfirm({
                content: translations.unStandard.str74,
                cancelText: translations.breadcrumb_back,
                onOk: () => {
                  if (dataInfo.id) {
                    setType('info');
                  } else {
                    navigate(`${Routes.StrategicManagement}`);
                  }
                },
              });
            }}
          >
            {translations.cancel}
          </TzButton>
          <TzButton
            className={'ml16'}
            type={'primary'}
            onClick={() => {
              formSecretKey.submit();
            }}
          >
            {type === 'edit' ? translations.save : translations.scanner_config_confirm}
          </TzButton>
        </div>
      ) : null,
    );
  }, [type, l]);

  let localLang = getCurrentLanguage();
  let newInitTypes = useMemo(() => {
    return [...initTypes].map((item: any) => {
      return merge({}, item, {
        label: localLang === 'zh' ? item.label + translations.and_above : translations.and_above + item.label,
      });
    });
  }, [initTypes]);
  let vulnWhitelistList = Form.useWatch('vuln_whitelist', formSecretKey);

  let vulnWhitelistColumns: any = [
    {
      title: translations.scanner_detail_container_name,
      dataIndex: 'name',
    },
    {
      title: translations.imageReject_used_for_obj,
      dataIndex: 'object',
      align: 'center',
      render: (name: any, row: any) => {
        return name === 'all' ? (
          <TzTag>{translations.all_packages}</TzTag>
        ) : (
          <>
            {row.modifier.map((item: any) => {
              return <TzTag className="mr8">{item}</TzTag>;
            })}
          </>
        );
      },
    },
    {
      title: translations.operation,
      dataIndex: 'name',
      render: (name: any, row: any) => {
        return (
          <>
            <TzButton
              type={'text'}
              onClick={() => {
                setInitialValues(row);
                setOpen(true);
              }}
            >
              {translations.edit}
            </TzButton>
            <TzPopconfirm
              title={translations.unStandard.str39}
              okText={translations.delete}
              okButtonProps={{ danger: true }}
              cancelButtonProps={{ type: 'text', danger: true }}
              cancelText={translations.confirm_modal_cancel}
              onConfirm={() => {
                let arr = formSecretKey.getFieldValue('vuln_whitelist');
                let index = arr.findIndex((item: any) => {
                  return row.id === item.id;
                });
                if (-1 !== index) {
                  arr.splice(index, 1);
                  formSecretKey.setFieldsValue({ vuln_whitelist: arr });
                }
              }}
            >
              <TzButton type={'text'} danger>
                {translations.delete}
              </TzButton>
            </TzPopconfirm>
          </>
        );
      },
    },
  ];
  const onCreate = (values: any) => {
    setOpen(false);
    let arr = formSecretKey.getFieldValue('vuln_whitelist');
    let index = arr.findIndex((item: any) => {
      return values.id === item.id;
    });
    if (-1 === index) {
      formSecretKey.setFieldsValue({ vuln_whitelist: [...arr, values] });
    } else {
      arr.splice(index, 1, values);
      formSecretKey.setFieldsValue({ vuln_whitelist: arr });
    }
  };
  const CollectionCreateForm: React.FC<CollectionCreateFormProps> = ({
    open,
    onCreate,
    onCancel,
    initialValues = {
      name: undefined,
      object: 'all',
      modifier: [],
      id: getUid(),
    },
    modalTitle = translations.new_vulnerabilities,
  }) => {
    const [form] = Form.useForm();
    let object = Form.useWatch('object', form);
    return (
      <TzModal
        open={open}
        width={560}
        title={modalTitle}
        okText={translations.scanner_config_confirm}
        onCancel={onCancel}
        onOk={() => {
          form.validateFields().then((values) => {
            form.resetFields();
            onCreate(values);
          });
        }}
      >
        <TzForm form={form} initialValues={initialValues}>
          <TzFormItem name="id" hidden>
            <TzInput />
          </TzFormItem>
          <TzFormItem
            name="name"
            label={translations.scanner_detail_container_name}
            rules={[
              {
                required: true,
                message: translations.number_cannot_be_empty,
              },
            ]}
          >
            <TzInput placeholder={translations.imagesDiscover_search_placeholder} />
          </TzFormItem>
          <TzFormItem name="object" label={translations.imageReject_used_for_obj} style={{ marginBottom: 0 }}>
            <TzRadioGroup>
              <TzRadio value="all">{translations.all_packages}</TzRadio>
              <TzRadio value="notAll">{translations.specify_packages}</TzRadio>
            </TzRadioGroup>
          </TzFormItem>
          {object === 'all' ? null : (
            <>
              <TzFormItem
                name="modifier"
                style={{ marginTop: '8px', marginBottom: 0 }}
                hidden={object === 'all'}
                rules={[
                  {
                    validator: (rule, value) => {
                      return new Promise((resolve, reject) => {
                        if (value.length == 0) {
                          return reject(translations.cannot_be_empty);
                        }
                        let item =
                          !!value.find((item: string | string[]) => {
                            return item.indexOf('@') == -1;
                          }) || !value.length;
                        if (item) {
                          reject(translations.package_format);
                        } else {
                          resolve(value);
                        }
                      });
                    },
                  },
                ]}
                extra={translations.unStandard.str88}
              >
                <TzSelect
                  placeholder={translations.unStandard.str95}
                  mode="tags"
                  showArrow={false}
                  dropdownStyle={{ display: 'none' }}
                />
              </TzFormItem>
            </>
          )}
        </TzForm>
      </TzModal>
    );
  };
  let sensitiveRuleList = useGetSensitiveRuleList();
  let { getPageKey } = useAnchorItem();
  return (
    <>
      <div className="ml32 mr32 mb20 pt4">
        <div className="flex-r">
          <div className="flex-c" style={{ flex: 1, width: 0 }}>
            <TzForm
              form={formSecretKey}
              className={'form-item-mb20'}
              initialValues={dataInfo}
              onValuesChange={(changedValues, values: any) => {
                let obj = { ...values };
                obj['sensitive_file_policy'] = obj?.sensitive_file_policy.join(',');
                obj['vuln_policy'] = obj?.vuln_policy.join(',');
                obj['vuln_whitelist'] = obj?.vuln_whitelist.map((item: any) => {
                  return {
                    id: getUid(),
                    name: item.name,
                    object: item.object === 'all' ? 'all' : 'notAll',
                    modifier: item.object === 'all' ? null : item.object.split(','),
                  };
                });
              }}
              onFinish={(values) => {
                let obj = { ...values };
                obj['sensitive_file_policy'] = obj?.sensitive_file_policy.join(',');
                obj['vuln_policy'] = obj?.vuln_policy.join(',');
                obj['vuln_whitelist'] = obj?.vuln_whitelist.map((item: any) => {
                  return {
                    name: item.name,
                    object: item.object === 'all' ? 'all' : item.modifier.join(','),
                  };
                });
                let sendData: any = Object.assign({}, obj, {
                  Updater: getUserInformation().username,
                });
                if (
                  (obj.vuln_enable && !obj.vuln_level && !obj.vuln_policy.length) ||
                  (obj.sensitive_enable && !obj.sensitive_file_policy.length)
                ) {
                  return;
                }
                if (obj.id) {
                  putCiPolicy(sendData).subscribe((res: any) => {
                    if (res.error) {
                      onSubmitFailed(res);
                    } else {
                      setType('info');
                      TzMessageSuccess(translations.activeDefense_updateSuccessTip);
                    }
                  });
                } else {
                  sendData['operator'] = getUserInformation().username;
                  postCiPolicy(sendData).subscribe((res: any) => {
                    if (res.error) {
                      onSubmitFailed(res);
                    } else {
                      TzMessageSuccess(translations.activeDefense_successTip);
                      navigate(`${Routes.StrategicManagement}`);
                    }
                  });
                }
              }}
              autoComplete="off"
            >
              <TzFormItem name="id" hidden>
                <TzInput />
              </TzFormItem>
              <TzCard
                title={translations.compliances_breakdown_taskbaseinfo}
                id={getPageKey('base')}
                bodyStyle={{
                  padding: '4px 0 0',
                  paddingBottom: type === 'info' ? '0px' : '20px',
                }}
              >
                {type === 'info' ? (
                  <ArtTemplateDataInfo data={dataInfoList} span={2} />
                ) : (
                  <div className="plr24">
                    <TzFormItem
                      label={translations.policyName + '：'}
                      name="name"
                      rules={[
                        {
                          required: true,
                          message: translations.unStandard.str75,
                        },
                        {
                          pattern: /^[0-9a-zA-Z\-_]+$/gi,
                          message: translations.unStandard.str75,
                        },
                        {
                          type: 'string',
                          max: 50,
                          message: translations.unStandard.str76,
                        },
                      ]}
                    >
                      <TzInput placeholder={translations.unStandard.str75} />
                    </TzFormItem>
                    <TzFormItem
                      label={translations.imageReject_comment_title + '：'}
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
                      <TzTextArea placeholder={translations.unStandard.str77} showCount allowClear />
                    </TzFormItem>
                  </div>
                )}
              </TzCard>
              <TzCard
                className={`mt20 mb20 ${validate.vuln ? 'border-red' : ''}`}
                title={
                  <>
                    {translations.imageReject_vulnerabilityRules_tab_title}
                    {getTags(dataInfo.vuln_enable, 'ml12')}
                  </>
                }
                id={getPageKey('Vuln')}
                bodyStyle={{
                  paddingTop: '0px',
                }}
              >
                {' '}
                {type === 'info' ? (
                  <>
                    <>
                      <p className={'strategy-item'}>
                        <span>{translations.imageReject_strategy_action_title}：</span>
                        {getTags(dataInfo.vuln_rule_mode)}
                      </p>
                      <PageTitle
                        title={translations.rule_conditions}
                        className={'f14 mt20 mb12'}
                        style={{ color: '#3E4653' }}
                      />
                      <p className={'strategy-item'}>
                        <span>{translations.scanner_detail_severity}：</span>
                        <p>
                          {vuln_level_title === '-'
                            ? '-'
                            : localLang === 'zh'
                              ? vuln_level_title + translations.and_above
                              : translations.and_above + vuln_level_title}
                        </p>
                      </p>
                      <p className={'strategy-item'}>
                        <span>{translations.imageReject_self_leak_name}：</span>
                        <p>
                          {!dataInfo.vuln_policy ||
                            dataInfo.vuln_policy.map(
                              (
                                item:
                                  | boolean
                                  | React.ReactChild
                                  | React.ReactFragment
                                  | React.ReactPortal
                                  | null
                                  | undefined,
                              ) => {
                                return item ? <TzTag className={'t-c mt3 mb3'}>{item}</TzTag> : null;
                              },
                            )}
                        </p>
                      </p>
                      <PageTitle
                        title={translations.rule_white_list}
                        className={'f14 mt20 mb12'}
                        style={{ color: '#3E4653' }}
                      />
                      <p className={'strategy-item'}>
                        <TzCheckbox disabled={true} checked={dataInfo.ignore_irreparable} />
                        &nbsp;&nbsp;
                        {translations.ignore_unrepairable_vulnerabilities}
                      </p>
                      <p className={'strategy-item'}>
                        <TzCheckbox disabled={true} checked={dataInfo.ignore_langaue} />
                        &nbsp;&nbsp;
                        {translations.ignore_application_vulnerabilities}
                      </p>
                      <p className={'strategy-item mb0'}>
                        <span>{translations.imageReject_self_leak_name}：</span>
                        <p></p>
                      </p>
                      {dataInfo.vuln_whitelist.length ? (
                        <TzTable
                          dataSource={dataInfo.vuln_whitelist}
                          columns={[...vulnWhitelistColumns].slice(0, 2)}
                          pagination={{
                            defaultPageSize: 5,
                            hideOnSinglePage: true,
                          }}
                        />
                      ) : null}
                    </>
                  </>
                ) : (
                  <>
                    <TzFormItem label={`${translations.functionSwitch}：`} name="vuln_enable" valuePropName="checked">
                      <TzSwitch
                        checkedChildren={translations.confirm_modal_isopen}
                        unCheckedChildren={translations.confirm_modal_isclose}
                      />
                    </TzFormItem>
                    <TzFormItem label={translations.imageReject_strategy_action_title + '：'} name="vuln_rule_mode">
                      <StrategyAction data={newActiongDataList} type={'rule'} />
                    </TzFormItem>
                    <PageTitle
                      title={
                        validate.vuln ? (
                          <span className={'color-r'}>
                            {translations.rule_conditions}
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 400,
                                marginLeft: '8px',
                              }}
                            >
                              *{translations.unStandard.str294}
                            </span>
                          </span>
                        ) : (
                          translations.rule_conditions
                        )
                      }
                      style={{ color: '#3E4653' }}
                      className={'f14 mt20 mb12'}
                    />
                    <MyFormItem
                      label={`${translations.scanner_detail_severity}:`}
                      style={{
                        marginBottom: '12px',
                      }}
                      name="vuln_level"
                      rules={[
                        {
                          validator: (rule, value) => {
                            return new Promise((resolve, reject) => {
                              let vuln_enable = formSecretKey.getFieldValue('vuln_enable');
                              let vuln_policy = formSecretKey.getFieldValue('vuln_policy').length;
                              let vuln_level = formSecretKey.getFieldValue('vuln_level');
                              setValidate((pre) => {
                                return Object.assign({}, pre, {
                                  vuln: vuln_enable && !vuln_level && !vuln_policy.length,
                                  //sensitive: obj.sensitive_enable && !obj.sensitive_file_policy.length,
                                });
                              });
                              resolve(value);
                            });
                          },
                          message: translations.package_format,
                        },
                      ]}
                      render={(children) => <div style={{ width: '180px', position: 'relative' }}>{children}</div>}
                    >
                      <TzSelect
                        options={newInitTypes}
                        placeholder={translations.originalWarning_pleaseSelect}
                        allowClear
                        className={`${validate.vuln ? 'ant-select-status-error' : ''}`}
                      />
                    </MyFormItem>
                    <TzFormItem
                      label={translations.custom_risk_vulnerability + '：'}
                      name="vuln_policy"
                      rules={[
                        {
                          validator: (rule, value) => {
                            return new Promise((resolve, reject) => {
                              let vuln_enable = formSecretKey.getFieldValue('vuln_enable');
                              let vuln_policy = formSecretKey.getFieldValue('vuln_policy').length;
                              let vuln_level = formSecretKey.getFieldValue('vuln_level');
                              setValidate((pre) => {
                                return Object.assign({}, pre, {
                                  vuln: vuln_enable && !vuln_level && !vuln_policy.length,
                                  //sensitive: obj.sensitive_enable && !obj.sensitive_file_policy.length,
                                });
                              });
                              resolve(value);
                            });
                          },
                          message: translations.package_format,
                        },
                      ]}
                    >
                      <TzSelect
                        placeholder={translations.unStandard.str78}
                        mode="tags"
                        showArrow={false}
                        className={`${validate.vuln ? 'ant-select-status-error' : ''}`}
                        dropdownStyle={{ display: 'none' }}
                      />
                    </TzFormItem>
                    <PageTitle
                      title={translations.rule_white_list}
                      className={'f14 mt20 mb12'}
                      style={{ color: '#3E4653' }}
                    />
                    <TzFormItem
                      name="ignore_irreparable"
                      valuePropName="checked"
                      style={{
                        marginBottom: '12px',
                      }}
                    >
                      <TzCheckbox>{translations.ignore_unrepairable_vulnerabilities}</TzCheckbox>
                    </TzFormItem>
                    <TzFormItem
                      name="ignore_langaue"
                      valuePropName="checked"
                      style={{
                        marginBottom: '12px',
                      }}
                    >
                      <TzCheckbox>
                        {translations.ignore_application_vulnerabilities}
                        <TzInfoTooltip title={translations.unStandard.str87} icon={'icon-wenhao'} />
                      </TzCheckbox>
                    </TzFormItem>
                    <TzFormItem
                      label={translations.custom_whitelist_vulnerability + '：'}
                      name="vuln_whitelist"
                      style={{ marginBottom: '0px' }}
                    ></TzFormItem>
                    {vulnWhitelistList && vulnWhitelistList.length ? (
                      <TzTable dataSource={vulnWhitelistList} columns={vulnWhitelistColumns} pagination={false} />
                    ) : null}
                    <AddInfoBtn
                      className={'mt16'}
                      onClick={() => {
                        setInitialValues(undefined);
                        setOpen(true);
                      }}
                    />
                  </>
                )}
              </TzCard>
              <TzCard
                className={`${validate.sensitive ? 'border-red' : ''}`}
                title={
                  <>
                    {translations.imageReject_sensitiveRules_tab_title}
                    {getTags(dataInfo.sensitive_enable, 'ml12')}
                  </>
                }
                id={getPageKey('file')}
                bodyStyle={{
                  paddingTop: '0px',
                }}
              >
                {type === 'info' ? (
                  <>
                    <p className={'strategy-item'}>
                      <span>{translations.imageReject_strategy_action_title}：</span>
                      {getTags(dataInfo.sensitive_rule_mode)}
                    </p>
                    <PageTitle
                      title={translations.rule_conditions}
                      className={'f14 mt20 mb12'}
                      style={{ color: '#3E4653' }}
                    />
                    <p className={'strategy-item mb0'}>
                      <span>{translations.customize_sensitive_file_types}：</span>
                      <p>
                        {!dataInfo.sensitive_file_policy ||
                          dataInfo.sensitive_file_policy.map(
                            (
                              item:
                                | boolean
                                | React.ReactChild
                                | React.ReactFragment
                                | React.ReactPortal
                                | null
                                | undefined,
                            ) => {
                              return item ? <TzTag className={'t-c mt3 mb3'}>{item}</TzTag> : null;
                            },
                          )}
                      </p>
                    </p>
                  </>
                ) : (
                  <>
                    <TzFormItem
                      label={translations.functionSwitch + '：'}
                      name="sensitive_enable"
                      valuePropName="checked"
                    >
                      <TzSwitch
                        checkedChildren={translations.confirm_modal_isopen}
                        unCheckedChildren={translations.confirm_modal_isclose}
                      />
                    </TzFormItem>
                    <TzFormItem
                      label={translations.imageReject_strategy_action_title + '：'}
                      name="sensitive_rule_mode"
                    >
                      <StrategyAction data={newActiongDataList} type={'rule'} />
                    </TzFormItem>
                    <PageTitle
                      title={
                        validate.sensitive ? (
                          <span className={'color-r'}>
                            {translations.rule_conditions}
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 400,
                                marginLeft: '8px',
                              }}
                            >
                              *{translations.unStandard.str199}
                            </span>
                          </span>
                        ) : (
                          translations.rule_conditions
                        )
                      }
                      style={{ color: '#3E4653' }}
                      className={'f14 mt20 mb12'}
                    />
                    <TzFormItem
                      label={translations.customize_sensitive_file_types + '：'}
                      name="sensitive_file_policy"
                      style={{ marginBottom: '0px' }}
                      rules={[
                        {
                          validator: (rule, value) => {
                            return new Promise((resolve, reject) => {
                              let sensitive_enable = formSecretKey.getFieldValue('sensitive_enable');
                              let sensitive_file_policy = formSecretKey.getFieldValue('sensitive_file_policy');
                              setValidate((pre) => {
                                return Object.assign({}, pre, {
                                  //vuln: vuln_enable && !vuln_level && !vuln_policy.length,
                                  sensitive: sensitive_enable && !sensitive_file_policy.length,
                                });
                              });
                              resolve(value);
                            });
                          },
                          message: translations.package_format,
                        },
                      ]}
                    >
                      <TzSelect
                        isShowAll
                        mode="multiple"
                        placeholder={translations.select_sensitive_files_rule}
                        options={sensitiveRuleList}
                      />
                    </TzFormItem>
                  </>
                )}
              </TzCard>
            </TzForm>
          </div>
          <TzAnchor items={items} />
        </div>
        <CollectionCreateForm
          open={open}
          initialValues={initialValues}
          onCreate={onCreate}
          onCancel={() => {
            setOpen(false);
          }}
        />
      </div>
    </>
  );
};
export default StrategicManagementInfo;
