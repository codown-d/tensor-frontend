import { Anchor, Form, Popconfirm } from 'antd';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { TzButton } from '../../components/tz-button';
import { TzCard } from '../../components/tz-card';
import { TzInput } from '../../components/tz-input';
import TzInputSearch from '../../components/tz-input-search';
import { TzInputTextArea } from '../../components/tz-input-textarea';
import { TzConfirm } from '../../components/tz-modal';
import { TzSwitch } from '../../components/tz-switch';
import { TzTable } from '../../components/tz-table';
import { TzTag } from '../../components/tz-tag';
import { formatGeneralTime, WebResponse } from '../../definitions';
import { checkExpr, holaRules, palaceRules, submitWhiteList, whitelistContext } from '../../services/DataService';
import { Store } from '../../services/StoreService';
import './WhiteListPolicyDetail.scss';
import { TzDrawerFn } from '../../components/tz-drawer';
import { TzForm, TzFormItem } from '../../components/tz-form';
import { TzSelect, TzSelectNormal } from '../../components/tz-select';
import { getSeverityTag, setTemp, tampTit, TzTableTzTdInfo } from './AlertCenterScreen';
import { showFailedMessage, showSuccessMessage } from '../../helpers/response-handlers';
import classNames from 'classnames';
import { localLang, translations } from '../../translations/translations';
import AddInfoBtn from '../../components/ComponentsLibrary/AddInfoBtn';
import { isArray, isUndefined, merge, remove, trim } from 'lodash';
import { severityFilters } from './EventData';
import TzPopconfirm from '../../components/ComponentsLibrary/TzPopconfirm';
import TzTextArea from '../../components/ComponentsLibrary/TzTextArea';
import { TzCol, TzRow } from '../../components/tz-row-col';
import { mergeWithId } from '../../helpers/until';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { AddEffectiveScopes, allowWhitelist, InfoDetail, RuleListDom } from './WhiteListPolicyDetail';
import TzPageHeader from '../../components/ComponentsLibrary/TzPageHeader';

const labelKeys: any = {
  scene: translations.object_type,
  cluster: translations.compliances_cronjobs_selectCluster,
  hostname: translations.vulnerabilityDetails_nodeName,
  namespace: translations.scanner_listColumns_namespace,
  resource: translations.resources,
  pod: 'Pod',
  container: translations.onlineVulnerability_innerShapeMeaning,
  registry: translations.library,
  repo: translations.scanner_detail_image + 'repo',
  tag: translations.image_tag,
};

let getTitle = (key: any) => {
  let obj: any = {
    'ATT&CK': 'ATT&CK',
    Watson: translations.activeDefense_title,
    DriftPrevention: translations.deflectDefense_title,
    imageSecurity: translations.imageSecurity,
  };
  return obj[key];
};
const WhiteListPolicyModalDetail = (props: any) => {
  const [info, setInfo] = useState<any>({
    id: '',
    name: undefined,
    remark: '',
    status: false,
    creator: '',
    createdAt: null,
    updatedAt: null,
    updater: '',
    scopes: [],
    rules: [],
    isAllRule: false,
  });
  const [keyStatus, setKeyStatus] = useState({
    nameStatus: false,
    scopesStatus: false,
    rulesStatus: false,
  });
  const ruleListRef = useRef<any>(null);
  const conditionDomRef = useRef<any>(null);
  const [rulesRes, setRulesRes] = useState<any>([]);
  const [showRulesRes, setShowRulesRes] = useState<any>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>({});
  const [search, setSearch] = useState('');

  const fnRules = useCallback(() => {
    palaceRules().subscribe((res: any) => {
      const data = res.getItems();
      let items = data
        .filter((item: { key: string }) => {
          return allowWhitelist.includes(item.key);
        })
        .sort((a: any, b: any) => {
          return b.children.length - a.children.length;
        });
      setRulesRes(items);
    });
  }, []);
  useEffect(() => {
    fnRules();
  }, []);
  useEffect(() => {
    let { rules = {}, scopes = [] } = Store.policyDetail.value;
    if (Object.values(rules).length == 0 && Object.values(scopes).length == 0) return;
    let resultRules = rulesRes
      .reduce((pre: any, element: any) => {
        let arrRules = element.children.filter((item: any) => {
          return !rules[element.key] ? false : rules[element.key].indexOf(item.key) != -1;
        });
        pre.push(Object.assign({}, element, { children: arrRules }));
        return pre;
      }, [])
      .filter((item: any) => item.children.length);
    setShowRulesRes(resultRules);
    setInfo((pre: any) => {
      return merge({}, pre, { scopes });
    });
  }, [rulesRes]);
  const [form] = Form.useForm();
  const operateSendDataFn = useCallback(
    (data, key, i?: number) => {
      let items = info.scopes.slice(0);
      if (key === 'del') {
        items.splice(i, 1);
      }
      if (key === 'edit') {
        items.splice(i, 1, data);
      }
      if (key === 'add') {
        items.push(data);
      }
      setInfo((pre: any) => {
        return Object.assign({}, pre, { scopes: items });
      });
    },
    [info.scopes],
  );
  const columns = useMemo(() => {
    let items = [
      {
        title: '',
        key: 'i',
        dataIndex: 'i',
        align: 'right',
        width: '68px',
        render(_: any, row: any, i: number) {
          return <>{i < 10 ? `0${i + 1}` : i + 1}&nbsp;&nbsp;&nbsp;</>;
        },
      },
      {
        title: translations.object_scope,
        key: 'obj',
        dataIndex: 'obj',
        render(_: any, row: any, i: number) {
          const is = Object.keys(row);
          if (!is.length) return '-';
          return (
            <div className="tags-scope-group df dfac dfw">
              {is.map((t) => {
                const ct = row[t].map((c: any) => c.name);
                return (
                  <TzTag style={{ display: 'inline-block' }}>
                    <EllipsisPopover>{`${labelKeys[t]}：${ct.join(' , ')}`}</EllipsisPopover>
                  </TzTag>
                );
              })}
            </div>
          );
        },
      },
      {
        title: translations.operation,
        key: 'operate',
        dataIndex: 'operate',
        width: '120px',
        render: (_: any, row: any, i: number) => {
          return (
            <>
              <TzButton
                type="text"
                className="ml-8"
                onClick={async () => {
                  let dw: any = await TzDrawerFn({
                    className: 'add-scopes-group drawer-body0',
                    title: translations.edit_effective_object,
                    width: '38.9%',
                    children: <AddEffectiveScopes submit={operateSendDataFn} row={row} i={i} />,
                  });
                  dw.show();
                }}
              >
                {translations.edit}
              </TzButton>
              <Popconfirm
                placement="topLeft"
                className="tz-ant-popconfirm configure"
                title={translations.unStandard.str39}
                getPopupContainer={() => document.getElementById('layoutMain') || document.body}
                onConfirm={() => operateSendDataFn(null, 'del', i)}
                cancelButtonProps={{
                  type: 'text',
                  danger: true,
                  className: 'configureCal',
                }}
                okButtonProps={{
                  type: 'primary',
                  danger: true,
                  className: 'configureOk',
                }}
                okText={translations.delete}
                cancelText={translations.cancel}
              >
                <TzButton type="text" danger onClick={(e) => e.stopPropagation()}>
                  {translations.delete}
                </TzButton>
              </Popconfirm>
            </>
          );
        },
      },
    ] as any;
    return items;
  }, [operateSendDataFn, info.scopes]);
  useEffect(() => {
    let keyList = showRulesRes.reduce((pre: any, item: any) => {
      pre[item.key] = item.children.map((ite: any) => ite.key);
      return pre;
    }, {});
    setSelectedRowKeys(keyList);
  }, [showRulesRes]);
  const infoTitDom = useMemo(() => {
    return (
      <>
        {translations.scanner_detail_tab_base}&nbsp;&nbsp;
        {keyStatus.nameStatus ? <span className="f12 fw lh20 dib">*{translations.unStandard.str37}</span> : null}
      </>
    );
  }, [keyStatus]);
  const rulesTitDom = useMemo(() => {
    return (
      <>
        {translations.rules_of_entry_into_force}&nbsp;&nbsp;
        {keyStatus.rulesStatus ? <span className="f12 fw lh20 dib"> *{translations.unStandard.str36} </span> : null}
      </>
    );
  }, [keyStatus]);
  const scopesTitDom = useMemo(() => {
    return (
      <>
        {translations.imageReject_used_for_obj}&nbsp;&nbsp;
        {keyStatus.scopesStatus ? <span className="f12 fw lh20 dib"> *{translations.unStandard.str147} </span> : null}
      </>
    );
  }, [keyStatus]);
  const LinkRulesDom = useMemo(() => {
    if (!showRulesRes.length) return null;
    const { Link } = Anchor;
    return (
      <Anchor
        affix={false}
        className="tz-anchor"
        showInkInFixed
        onClick={(e: React.MouseEvent<HTMLElement>, link: any) => {
          e.preventDefault();
        }}
        getContainer={() => {
          return document.getElementById('tableCase') || window;
        }}
      >
        {showRulesRes.map((t: any) => {
          let { key, title } = t;
          if (selectedRowKeys && selectedRowKeys[key] && selectedRowKeys[key]?.length) {
            return (
              <Link
                href={`#${key}`}
                title={
                  <div className="df dfac dfjb" style={{ width: '100%' }}>
                    <span className="tit-txt">{title}</span>
                    {key != 'ALL' ? <span className="round-pup f-r mr4">{selectedRowKeys[key]?.length}</span> : null}
                  </div>
                }
              />
            );
          } else {
            return null;
          }
        })}
      </Anchor>
    );
  }, [showRulesRes, selectedRowKeys]);
  let ConditionDom = forwardRef((props: any, ref: any) => {
    const [formIns] = Form.useForm();
    let [data, setData] = useState<any>([]);
    let [error, setError] = useState<any>('');
    let [optionsKey1, setOptionsKey1] = useState<any>([]);
    let getHolaRules = () => {
      holaRules({ domain: 'signal.context', type: 'key' }).subscribe((res) => {
        let obj = res.getItem() || {};
        whitelistContext().subscribe((res: any) => {
          let data = res.getItems();
          let result = data.map((item: string | number) => {
            return {
              label: obj[item] || item,
              value: item,
            };
          });
          setOptionsKey1(result);
        });
      });
    };
    useEffect(() => {
      getHolaRules();
      setData([props.conditionExpr]);
    }, []);
    useEffect(() => {
      formIns.setFieldsValue({
        conditionExpr: data.filter((item: any) => item).join('\n&& '),
      });
    }, [data]);
    const key2 = Form.useWatch('key2', formIns);
    const key1 = Form.useWatch('key1', formIns);
    let getPlaceholder = useMemo(() => {
      if ((key2 == '==' || key2 == '!=') && key1 === 'file_path') {
        return translations.unStandard.str145;
      }
      return undefined;
    }, [key2, key1]);
    let getErrorMessage = useMemo(() => {
      let item = optionsKey1.find((item: { value: any }) => item.value == key1) || {
        label: undefined,
      };
      return item.label + translations.notEmpty;
    }, [key1, optionsKey1]);
    useImperativeHandle(
      ref,
      () => {
        return {
          getConditionExpr: async () => {
            return new Promise(function (resolve, reject) {
              if (!formIns.getFieldValue('conditionExpr')) {
                resolve(formIns.getFieldValue('conditionExpr'));
              } else {
                checkExpr({
                  expr: formIns.getFieldValue('conditionExpr'),
                }).subscribe((res: WebResponse<any>) => {
                  if (res.error) {
                    reject(res.error.message);
                    setError(res.error.message);
                  } else {
                    setError('');
                    resolve(formIns.getFieldValue('conditionExpr'));
                  }
                });
              }
            });
          },
        };
      },
      [],
    );
    return (
      <>
        <TzForm
          form={formIns}
          initialValues={{
            key1: 'proc_name',
            key2: '==',
            key3: null,
            conditionExpr: undefined,
          }}
          onFinish={(values) => {
            let { key1, key2, key3 } = values;
            let str = '';
            setData((pre: string[]) => {
              if (key2 == 'excluding') {
                str = `!(${key1} contains "${key3}")`;
              } else {
                str = `${key1} ${key2} "${key3}"`;
              }
              return [formIns.getFieldValue('conditionExpr'), str];
            });
            formIns.resetFields();
          }}
        >
          <TzRow gutter={8}>
            <TzCol flex={1}>
              <TzFormItem
                label={translations.the_condition_type}
                name={'key1'}
                rules={[
                  {
                    required: true,
                    message: '',
                  },
                ]}
              >
                <TzSelect
                  options={optionsKey1}
                  showSearch
                  filterOption={(input, option: any) => (option?.label ?? '').includes(input)}
                />
              </TzFormItem>
            </TzCol>
            <TzCol flex={1}>
              <TzFormItem label={' '} name={'key2'}>
                <TzSelect
                  options={[
                    {
                      label: translations.equal_to,
                      value: '==',
                    },
                    {
                      label: translations.not_equal_to,
                      value: '!=',
                    },
                    {
                      label: translations.regular_matching,
                      value: 'matches',
                    },
                    {
                      label: translations.contains,
                      value: 'contains',
                    },
                    {
                      label: translations.does_not_contain,
                      value: 'excluding',
                    },
                  ]}
                />
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
                <TzButton
                  type={'text'}
                  style={{ marginTop: '6px' }}
                  onClick={() => {
                    formIns.submit();
                  }}
                >
                  {translations.add}
                </TzButton>
              </TzFormItem>
            </TzCol>
          </TzRow>
          <TzFormItem
            className={'form-item-block'}
            style={{ marginBottom: 0 }}
            label={
              <>
                {translations.conditional_content + '：'}
                <TzButton
                  className={'f-r'}
                  type={'text'}
                  onClick={() => {
                    setData([]);
                  }}
                >
                  {translations.clear_all}
                </TzButton>
              </>
            }
            name={'conditionExpr'}
            extra={
              <div className="form-item-tips">
                {error && (
                  <p className={`${error ? 'form-item-tips-error' : ''}`}>
                    {error} <br />
                  </p>
                )}
                {translations.unStandard.str144}{' '}
              </div>
            }
          >
            <TzTextArea autoSize={{ minRows: 4 }} />
          </TzFormItem>
        </TzForm>
        {Store.policyDetail.value.type && (
          <InfoDetail type={Store.policyDetail.value.type} ids={Store.policyDetail.value.ids} />
        )}
      </>
    );
  });
  useEffect(() => {
    let arr = showRulesRes.reduce((pre: any[], item: any) => {
      pre = pre.concat(
        item.children.map((ite: { key: any; conditionExpr: any }) => {
          return {
            category: item.key,
            name: ite.key,
            key: item.key,
            conditionExpr: ite.conditionExpr,
          };
        }),
      );
      return pre;
    }, []);
    let obj = {
      isAllRule: false,
      conditionExpr: '',
      rules: arr,
    };
    if (arr[0] && arr[0].key === 'ALL') {
      obj = Object.assign({}, obj, {
        isAllRule: true,
        conditionExpr: arr[0].conditionExpr,
      });
    }
    form.setFieldsValue({ ...info, ...obj });
    setKeyStatus(() => {
      return {
        nameStatus: false,
        scopesStatus: false,
        rulesStatus: false,
      };
    });
  }, [info, showRulesRes]);
  let getColumnsRule = useCallback((k) => {
    let key = ((k) => {
      return k;
    })(k);
    let pTitle = getTitle(key);
    let items: any = [
      {
        title: translations.originalWarning_rule,
        dataIndex: 'tag',
        key: 'tag',
        render(item: any, row: any) {
          return item ? `${item}/${pTitle}` : pTitle;
        },
      },
      {
        title: translations.notificationCenter_details_name,
        dataIndex: 'title',
        key: 'title',
        render(item: any, row: any) {
          return <>{item}</>;
        },
      },
      {
        title: translations.scanner_detail_severity,
        dataIndex: 'severity',
        key: 'severity',
        width: '100px',
        className: 'th-center',
        align: 'center',
        filters: severityFilters,
        onFilter: (value: string, record: any) => {
          return value.indexOf(record.severity) != -1;
        },
        render(item: any) {
          let type = setTemp(item);
          let str = tampTit[type];
          return <span className={`btn-state btn-${type.toLowerCase()}`}> {str} </span>;
        },
      },
    ];
    if (key === 'ATT&CK' || key === 'Watson') {
      items.push({
        title: translations.needEmergencyHandle,
        dataIndex: 'urgency',
        key: 'urgency',
        align: 'center',
        width: localLang == 'en' ? '100px' : '150px',
        filters: [
          { text: translations.yes, value: translations.yes },
          { text: translations.no, value: translations.no },
        ],
        onFilter: (value: string, record: any) => {
          return record.urgency == value;
        },
        render(item: any) {
          return (
            <span
              style={{
                color: `${item === translations.yes ? '#E95454' : '#3E4653'}`,
              }}
            >
              {item}
            </span>
          );
        },
      });
    } else if (key === 'ALL') {
      items = [
        {
          title: translations.originalWarning_rule,
          dataIndex: 'title',
          key: 'title',
        },
        {
          title: translations.notificationCenter_details_name,
          dataIndex: 'title',
          key: 'title',
        },
        {
          title: translations.operation,
          dataIndex: 'urgency',
          key: 'urgency',
          width: '140px',
          render(item: any, row: any) {
            return (
              <div>
                <TzButton
                  type={'text'}
                  onClick={() => {
                    TzConfirm({
                      width: document.body.clientWidth < 1366 && Store.policyDetail.value.type ? '560px' : '800px', //20230213-TEN-776
                      title: translations.add_condition,
                      content: <ConditionDom ref={conditionDomRef} conditionExpr={row.conditionExpr} />,
                      okText: translations.add,
                      onOk: (close) => {
                        return new Promise((resolve, reject) => {
                          conditionDomRef.current
                            .getConditionExpr()
                            .then((conditionExpr: any) => {
                              setShowRulesRes((pre: any) => {
                                pre.map((item: any) => {
                                  if (item['key'] === key) {
                                    let children = item['children'];
                                    let index = children.findIndex((ite: { key: any }) => row.key === ite.key);
                                    children.splice(
                                      index,
                                      1,
                                      merge({}, children[index], {
                                        conditionExpr,
                                      }),
                                    );
                                    item['children'] = [...children];
                                    return item;
                                  }
                                });
                                return [...pre];
                              });
                              close();
                            })
                            .catch(function (reason: any) {
                              reject();
                            });
                        });
                      },
                    });
                  }}
                >
                  {translations.add_condition}
                </TzButton>
                <TzPopconfirm
                  title={translations.unStandard.str39}
                  placement="topLeft"
                  cancelButtonProps={{
                    type: 'text',
                    danger: true,
                    size: 'small',
                  }}
                  okButtonProps={{
                    type: 'primary',
                    danger: true,
                    size: 'small',
                  }}
                  onConfirm={() => {
                    setShowRulesRes((pre: any) => {
                      pre.map((item: any) => {
                        let children = item['children'];
                        remove(children, (it: any) => {
                          return row.key == it.key;
                        });
                        item['children'] = [...children];
                        return item;
                      });
                      return [...pre];
                    });
                  }}
                  okText={translations.delete}
                  cancelText={translations.cancel}
                >
                  <TzButton type={'text'} danger>
                    {translations.delete}
                  </TzButton>
                </TzPopconfirm>
              </div>
            );
          },
        },
      ];
    }
    return items;
  }, []);
  const TableRulesDom = useMemo(() => {
    let doms = null;
    let rulesResData = [...showRulesRes].map((item: any) => {
      let children = item['children'].filter((ite: any) => {
        return (
          !search ||
          ite?.title.indexOf(search) != -1 ||
          ite?.tag.indexOf(search) != -1 ||
          (ite.category && ite.category.indexOf(search) != -1)
        );
      });
      return Object.assign({}, item, { children });
    });
    if (rulesResData.length) {
      doms = rulesResData
        .filter((item) => item.children.length)
        .map((t: any) => {
          return (
            <div id={`${t.key}`}>
              <TzTable
                className={'table-expand-none nohoverTable'}
                tableLayout={'fixed'}
                expandable={{
                  columnWidth: 0,
                  expandIcon: () => <></>,
                  defaultExpandAllRows: true,
                  expandedRowKeys: t.children.map((item: any) => {
                    return item.conditionExpr ? item.key : null;
                  }),
                  expandedRowRender: (record) => <p className="expanded-content">{record.conditionExpr}</p>,
                }}
                dataSource={t.children || []}
                pagination={false}
                rowClassName={(record, index) => {
                  return record.conditionExpr ? 'td-border-none' : '';
                }}
                sticky={true}
                rowKey={'key'}
                columns={getColumnsRule(t.key)}
              />
            </div>
          );
        });
    } else {
      doms = (
        <TzTable
          className={'table-expand-none'}
          dataSource={[]}
          pagination={false}
          sticky={true}
          rowKey={'key'}
          columns={getColumnsRule('ATT&CK')}
        />
      );
    }
    return doms;
  }, [showRulesRes, getColumnsRule, search]);
  let getButtonDisabled = useMemo(() => {
    return showRulesRes.length == 0 ? false : showRulesRes[0].key == 'ALL' && showRulesRes[0].children.length != 0;
  }, [showRulesRes]);
  return (
    <>
      <TzPageHeader
        title={translations.new_white_list_policy}
        onBack={() => {
          props.setOpenModal(false);
        }}
        style={{ paddingBottom: '4px' }}
      />
      <div className="white-list-policy-detail" style={{ marginBottom: '60px' }}>
        <TzCard
          title={infoTitDom}
          id="base"
          className={classNames({ 'error-info-case': keyStatus.nameStatus })}
          bodyStyle={{
            padding: '4px 0 0',
          }}
        >
          <TzForm
            className="plr24"
            form={form}
            initialValues={info}
            onValuesChange={(val) => {
              setInfo((pre: any) => {
                return Object.assign({}, pre, val);
              });
            }}
            onFinish={(values) => {
              let data = merge({}, values, {
                status: values.status ? 'enabled' : 'disabled',
                id: values.id ? Number(values.id) : '',
              });
              let type = data.id == '' ? 'POST' : 'PUT';
              submitWhiteList(data, type).subscribe((res: WebResponse<any>) => {
                if (!res.error) {
                  showSuccessMessage(translations.activeDefense_updateSuccessTip);
                  props?.setOpenModal();
                }
              });
            }}
          >
            <TzFormItem label={translations.microseg_namespace_status} name={'status'} valuePropName="checked">
              <TzSwitch
                checkedChildren={translations.microseg_tenants_enabled}
                unCheckedChildren={translations.confirm_modal_isdisable}
              />
            </TzFormItem>
            <TzFormItem
              label={translations.policyName}
              name={'name'}
              rules={[
                {
                  required: true,
                  message: translations.unStandard.str37,
                },
              ]}
            >
              <TzInput
                placeholder={translations.runtimePolicy_policy_name_place}
                maxLength={30}
                status={keyStatus.nameStatus ? 'error' : ''}
              />
            </TzFormItem>
            <TzFormItem label={translations.imageReject_comment_title} name={'remark'}>
              <TzInputTextArea placeholder={translations.unStandard.str40} rows={2} maxLength={100} />
            </TzFormItem>
            <TzFormItem hidden name={'id'}></TzFormItem>
            <TzFormItem hidden name={'scopes'}></TzFormItem>
            <TzFormItem hidden name={'rules'}>
              {' '}
            </TzFormItem>
            <TzFormItem hidden name={'isAllRule'}></TzFormItem>
            <TzFormItem hidden name={'conditionExpr'}>
              {' '}
            </TzFormItem>
          </TzForm>
        </TzCard>
        <TzCard
          title={scopesTitDom}
          id="effective"
          className={`mt20 ${classNames({ 'error-info-case': keyStatus.scopesStatus })}`}
          bodyStyle={{
            paddingBottom: '20px',
          }}
        >
          <TzTable
            dataSource={info.scopes}
            pagination={false}
            showHeader={!!info.scopes?.length}
            sticky={true}
            rowKey={'id'}
            columns={columns}
          />
          <AddInfoBtn
            className={'mt6'}
            onClick={async () => {
              let dw: any = await TzDrawerFn({
                className: 'add-scopes-group drawer-body0',
                title: translations.new_effective_object,
                width: '38.9%',
                children: <AddEffectiveScopes submit={operateSendDataFn} />,
              });
              dw.show();
            }}
          />
        </TzCard>
        <TzCard
          title={rulesTitDom}
          extra={
            <TzButton
              disabled={getButtonDisabled}
              onClick={async () => {
                TzConfirm({
                  width: '1000px',
                  title: translations.select_specific_rule,
                  content: <RuleListDom ref={ruleListRef} rulesRes={rulesRes} selectedRowKeys={selectedRowKeys} />,
                  okText: translations.confirm_modal_sure,
                  onOk: () => {
                    let keyList = ruleListRef?.current.getSelectedRowKeys();
                    let checkboxValue = ruleListRef?.current.getCheckboxValue();
                    let result = [];
                    if (checkboxValue) {
                      TzConfirm({
                        title: <></>,
                        content: translations.unStandard.str146,
                        okText: translations.yes,
                        cancelText: translations.no,
                        onCancel() {
                          result = rulesRes.reduce(
                            (
                              pre: any,
                              element: {
                                children: any[];
                                key: string | number;
                              },
                            ) => {
                              let { children = [] } =
                                showRulesRes.find((ite: { key: string | number }) => {
                                  return ite.key == element.key;
                                }) || {};
                              let arrRules = children.filter((item: any) => {
                                return keyList[element.key].indexOf(item.key) != -1;
                              });
                              let arr = element.children.filter((item: any) => {
                                return keyList[element.key].indexOf(item.key) != -1;
                              });
                              pre.push(
                                Object.assign({}, element, {
                                  children: mergeWithId(arrRules, arr, 'key'),
                                }),
                              );
                              return pre;
                            },
                            [],
                          );
                          setShowRulesRes(result);
                        },
                        onOk() {
                          result = [
                            {
                              children: [
                                {
                                  name: translations.scanner_images_all,
                                  title: translations.scanner_images_all,
                                  key: 'ALL',
                                },
                              ],
                              key: 'ALL',
                              title: translations.scanner_images_all,
                            },
                          ];
                          setShowRulesRes(result);
                        },
                      });
                    } else {
                      result = rulesRes.reduce((pre: any, element: { children: any[]; key: string | number }) => {
                        let { children = [] } =
                          showRulesRes.find((ite: { key: string | number }) => {
                            return ite.key == element.key;
                          }) || {};
                        let arrRules = children.filter((item: any) => {
                          return keyList[element.key].indexOf(item.key) != -1;
                        });
                        let arr = element.children.filter((item: any) => {
                          return keyList[element.key].indexOf(item.key) != -1;
                        });
                        pre.push(
                          Object.assign({}, element, {
                            children: mergeWithId(arrRules, arr, 'key'),
                          }),
                        );
                        return pre;
                      }, []);
                    }
                    setShowRulesRes(result);
                  },
                });
              }}
            >
              {translations.select_rules}
            </TzButton>
          }
          id="rules"
          className={`mt20 ${classNames({
            'error-info-case': keyStatus.rulesStatus,
          })}`}
        >
          <div className="rules-group">
            <div className="rule-menu-group">
              <div className="rule-type-group df dfac dfjb">
                <span className="title">{translations.originalWarning_rule}</span>
              </div>
              <div className="menu-case" style={{ flex: '1' }}>
                {LinkRulesDom}
              </div>
            </div>
            <div className="rule-content-group">
              <div className="rule-type-group df dfac dfjb">
                <span className="title">{translations.rule_list}</span>
                <TzInputSearch
                  style={{ width: '30%' }}
                  placeholder={translations.unStandard.str35}
                  onChange={(val: any) => setSearch(val)}
                />
              </div>
              <div className="table-list-group" id="tableCase">
                {TableRulesDom}
              </div>
            </div>
          </div>
        </TzCard>
      </div>
      <div className={'ant-page-footer-ghost'}>
        <div className={'f-r'}>
          <TzButton
            onClick={() => {
              TzConfirm({
                content: translations.unStandard.str38,
                cancelText: translations.breadcrumb_back,
                onOk: () => {
                  props?.setOpenModal();
                },
              });
            }}
            className={'mr16'}
          >
            {translations.cancel}
          </TzButton>
          <TzButton
            onClick={() => {
              let o = {
                nameStatus: !info.name,
                scopesStatus: !info.scopes.length && info.status,
                rulesStatus: !showRulesRes[0]?.children.length && info.status,
              };
              setKeyStatus(() => o);
              Object.values(o).some((item) => item) || form.submit();
            }}
            type="primary"
          >
            {translations.scanner_config_confirm}
          </TzButton>
        </div>
      </div>
    </>
  );
};

export default WhiteListPolicyModalDetail;
