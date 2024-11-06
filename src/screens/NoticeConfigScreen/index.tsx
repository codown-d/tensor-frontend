import ArtTemplateDataInfo from '../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { TzButton } from '../../components/tz-button';
import { TzCard } from '../../components/tz-card';
import { TzCheckbox } from '../../components/tz-checkbox';
import { TzForm, TzFormItem } from '../../components/tz-form';
import { TzMessageSuccess } from '../../components/tz-mesage';
import { TzRadioGroup } from '../../components/tz-radio';
import { TzSelect } from '../../components/tz-select';
import { find, isUndefined, keys, merge } from 'lodash';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { notifyConfig, notifyEventTypes, getNoauthConfig } from '../../services/DataService';
import { translations } from '../../translations';
import { Form } from 'antd';
import { getCurrentLanguage } from '../../services/LanguageService';
import { Store } from '../../services/StoreService';
import './index.less';
import TzSelectTag from '../../components/ComponentsLibrary/TzSelectTag';
const objSeverity: any = {
  3: translations.severity_High,
  5: translations.severity_Medium,
  7: translations.severity_Low,
};
let severityOptions = [7, 5, 3].map((item) => {
  let localLang = getCurrentLanguage();
  return {
    label:
      localLang === 'zh'
        ? `${objSeverity[item]}${translations.and_above}`
        : `${translations.and_above}${objSeverity[item]}`,
    value: item,
  };
});
let notify_objectOp = [
  {
    label: translations.head_resources,
    value: 'Workload',
  },
  {
    label: translations.owner_namespace,
    value: 'Namespace',
  },
  {
    label: translations.custom_objects,
    value: 'Custom',
  },
];
export default () => {
  const [info, setInfo] = useState<any>(null);
  const [editMethod, setEditMethod] = useState(false);
  const [editConditions, setEditConditions] = useState(false);
  const [eventTypesList, setEventTypesList] = useState<any[]>();
  const [formIns1] = Form.useForm();
  const [formIns2] = Form.useForm();

  const dataInfoList = useMemo(() => {
    if (!info) {
      return [];
    }
    let obj: any = {
      form_notification: translations.form_notification + '：',
      notify_object: translations.notification_recipients + '：',
      emails: translations.scanner_report_receiveEmail + '：',
      mobiles: translations.receiving_number + '：',
      categories: translations.hit_rule + '：',
      severity: translations.scanner_detail_severity + '：',
      eventType: translations.scanner_report_eventType + '：',
    };
    if (info['message'] != 'enabled' && info['mail'] != 'enabled') {
      delete obj.notify_object;
    }
    if (info['notify_object'] == 'Custom') {
      if (info['mail'] != 'enabled') {
        delete obj.emails;
      }
      if (info['message'] != 'enabled') {
        delete obj.mobiles;
      }
    } else {
      delete obj.emails;
      delete obj.mobiles;
    }
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: '',
      };
      if (item === 'form_notification') {
        o['render'] = () => {
          let arr = [];
          if (info['mail'] === 'enabled') {
            arr.push(translations.mail);
          }
          if (info['message'] === 'enabled') {
            arr.push(translations.sms);
          }
          return arr.join(',') || '-';
        };
      }
      if (item === 'notify_object') {
        o['render'] = () => {
          let node = find(notify_objectOp, (ite) => ite.value === info[item]);
          return node?.label || '-';
        };
      }
      if (item === 'emails' || item === 'mobiles') {
        o['render'] = () => {
          return info[item]?.join('，') || '-';
        };
      }

      if (item === 'categories') {
        o['render'] = () => {
          let eventTypes = info['categories']?.map((item) => {
            let node = find(eventTypesList, (ite) => ite.value == item);
            return node?.label || '-';
          });
          return eventTypes?.join('，') || '-';
        };
      }
      if (item === 'severity') {
        o['render'] = () => {
          let node = find(severityOptions, (ite) => ite.value == info[item]);
          return node?.label || '-';
        };
      }
      if (item === 'eventType') {
        o['render'] = () => {
          let arr = [];
          if (info['microseg_event_deny']) {
            arr.push(translations.blocking_events);
          }
          if (info['microseg_event_alert']) {
            arr.push(translations.alarm_events);
          }
          return arr.join(',') || '-';
        };
      }
      return o;
    });
  }, [info, eventTypesList]);

  const saveConfigNotice = useCallback(
    async (type?: any) => {
      let val: any;
      if ('method' == type) {
        val = await formIns1.validateFields();
        val = merge({}, val, {
          mail: val.mail ? 'enabled' : '',
          message: val.message ? 'enabled' : '',
        });
        ['mail', 'message', 'sound', 'emails', 'mobiles', 'notify_object'].forEach((item) => {
          delete info[item];
        });
      } else {
        val = await formIns2.validateFields();
        ['severity', 'microseg_event_alert', 'microseg_event_deny', 'categories'].forEach((item) => {
          delete info[item];
        });
      }
      let newPrams = merge({}, info, val, { categories: val.categories });
      notifyConfig(newPrams).subscribe((res) => {
        if (res.error) return;
        TzMessageSuccess(translations.saveSuccess);
        getNotifyConfigFn();
        if ('method' == type) {
          setEditMethod(false);
        } else if ('conditions' == type) {
          setEditConditions(false);
        }
      });
    },
    [info],
  );

  let mail = Form.useWatch('mail', formIns1);
  let message = Form.useWatch('message', formIns1);
  let notify_object = Form.useWatch('notify_object', formIns1);
  let getNotifyEventTypes = useCallback(() => {
    notifyEventTypes().subscribe((res) => {
      if (res.error) return;
      setEventTypesList(res.getItems());
    });
  }, []);
  let getNotifyConfigFn = useCallback(() => {
    getNoauthConfig().subscribe((res) => {
      let item = res.getItem();
      if (res.error || !item) return;
      let newItem = merge({}, item, {
        mail: item.mail === 'enabled',
        message: item.message === 'enabled',
        notify_object: item.notify_object || 'Workload',
        severity: item.severity || 3,
      });
      formIns1.setFieldsValue(newItem);
      formIns2.setFieldsValue(newItem);
      setInfo(item);
    });
  }, []);
  useEffect(() => {
    getNotifyConfigFn();
  }, [getNotifyConfigFn]);
  useEffect(() => {
    getNotifyEventTypes();
  }, [getNotifyEventTypes]);
  return (
    <div className="mlr32 notice-config-screen">
      <TzForm form={formIns1}>
        <TzCard
          bodyStyle={{ paddingBottom: 0 }}
          extra={
            !editMethod ? (
              <TzButton key={'edit'} onClick={() => setEditMethod(true)} size="small">
                {translations.edit}
              </TzButton>
            ) : (
              <>
                <TzButton key={'save'} onClick={() => saveConfigNotice('method')} size="small">
                  {translations.save}
                </TzButton>
                <TzButton key={'cancel'} className="ml16" onClick={() => setEditMethod(false)} size="small">
                  {translations.cancel}
                </TzButton>
              </>
            )
          }
          title={translations.event_notification_method}
        >
          {editMethod ? (
            <>
              <TzFormItem
                label={translations.form_notification}
                rules={[
                  {
                    required: true,
                    message: translations.activeDefense_serviceNamePla,
                  },
                ]}
              >
                <div className="flex-r-c" style={{ justifyContent: 'flex-start' }}>
                  <TzFormItem name="mail" noStyle valuePropName="checked">
                    <TzCheckbox style={{ width: '142px' }}>{translations.mail}</TzCheckbox>
                  </TzFormItem>
                  <TzFormItem name="message" noStyle valuePropName="checked">
                    <TzCheckbox>{translations.sms}</TzCheckbox>
                  </TzFormItem>
                </div>
              </TzFormItem>
              {mail || message ? (
                <TzFormItem
                  name="notify_object"
                  label={translations.notification_recipients}
                  initialValue={'Workload'}
                  rules={[
                    {
                      required: true,
                      message: translations.activeDefense_serviceNamePla,
                    },
                  ]}
                >
                  <TzRadioGroup options={notify_objectOp} />
                </TzFormItem>
              ) : null}
              {notify_object === 'Custom' ? (
                <>
                  {mail ? (
                    <TzFormItem
                      name="emails"
                      required
                      label={translations.scanner_report_receiveEmail}
                      rules={[
                        {
                          validator: (rule, value: string[]) => {
                            return new Promise((resolve, reject) => {
                              if (!value || value?.length == 0) {
                                return reject(
                                  translations.unStandard.notEmptyTip(translations.scanner_report_receiveEmail),
                                );
                              }
                              let pattern = /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
                              let f = value.every((item) => pattern.test(item));
                              if (f) {
                                resolve(value);
                              } else {
                                reject(translations.scanner_report_emailCheck);
                              }
                            });
                          },
                        },
                      ]}
                    >
                      <TzSelectTag placeholder={translations.please_enter_inputs} allowClear />
                    </TzFormItem>
                  ) : null}
                  {message ? (
                    <TzFormItem
                      name="mobiles"
                      label={translations.receiving_number}
                      required
                      rules={[
                        {
                          validator: (rule, value: string[]) => {
                            return new Promise((resolve, reject) => {
                              if (!value || value?.length == 0) {
                                return reject(translations.unStandard.notEmptyTip(translations.receiving_number));
                              }
                              let pattern =
                                /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
                              let f = value.every((item) => pattern.test(item));
                              if (f) {
                                resolve(value);
                              } else {
                                reject(translations.please_enter_correct_phone_number);
                              }
                            });
                          },
                        },
                      ]}
                    >
                      <TzSelectTag placeholder={translations.please_enter_number_inputs} allowClear />
                    </TzFormItem>
                  ) : null}
                </>
              ) : null}
            </>
          ) : (
            <ArtTemplateDataInfo data={dataInfoList.slice(0, -3)} span={1} rowProps={{ gutter: [0, 0] }} />
          )}
        </TzCard>
      </TzForm>
      <TzForm form={formIns2}>
        <TzCard
          className="mt20"
          bodyStyle={{ paddingBottom: 0 }}
          extra={
            !editConditions ? (
              <TzButton key={'edit'} onClick={() => setEditConditions(true)} size="small">
                {translations.edit}
              </TzButton>
            ) : (
              <>
                <TzButton key={'save'} onClick={() => saveConfigNotice('conditions')} size="small">
                  {translations.save}
                </TzButton>
                <TzButton key={'cancel'} className="ml16" onClick={() => setEditConditions(false)} size="small">
                  {translations.cancel}
                </TzButton>
              </>
            )
          }
          title={translations.event_notification_conditions}
        >
          {editConditions ? (
            <>
              <p className="config-title">{translations.runtime_safe}</p>
              <TzFormItem name="categories" label={translations.hit_rule} style={{ marginBottom: 8 }}>
                <TzSelect
                  mode="multiple"
                  placeholder={translations.originalWarning_pleaseSelect}
                  options={eventTypesList}
                />
              </TzFormItem>

              <TzFormItem
                name="severity"
                label={translations.scanner_detail_severity}
                initialValue={3}
                style={{ marginBottom: 20 }}
              >
                <TzRadioGroup options={severityOptions} />
              </TzFormItem>
              <p className="config-title">{translations.calico_root}</p>
              <TzFormItem label={translations.scanner_report_eventType}>
                <div className="flex-r-c" style={{ width: '25%' }}>
                  <TzFormItem name="microseg_event_deny" noStyle valuePropName="checked">
                    <TzCheckbox>{translations.blocking_events}</TzCheckbox>
                  </TzFormItem>
                  <TzFormItem name="microseg_event_alert" noStyle valuePropName="checked">
                    <TzCheckbox>{translations.alarm_events}</TzCheckbox>
                  </TzFormItem>
                </div>
              </TzFormItem>
            </>
          ) : (
            <>
              <p className="config-title ">{translations.runtime_safe}</p>
              <ArtTemplateDataInfo
                data={dataInfoList.slice(-3, -1)}
                span={1}
                rowProps={{ gutter: [0, 0] }}
                className={'item-mb8'}
              />
              <p className="config-title mt8">{translations.calico_root}</p>
              <ArtTemplateDataInfo data={dataInfoList.slice(-1)} span={1} rowProps={{ gutter: [0, 0] }} />
            </>
          )}
        </TzCard>
      </TzForm>
    </div>
  );
};
