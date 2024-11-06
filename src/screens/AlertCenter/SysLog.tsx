import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { translations } from '../../translations/translations';
import { TzSwitch } from '../../components/tz-switch';
import { TzSelect } from '../../components/tz-select';
import { TzInput } from '../../components/tz-input';
import { TzCard } from '../../components/tz-card';
import { TzButton } from '../../components/tz-button';
import ArtTemplateDataInfo from '../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { Observable } from 'rxjs/internal/Observable';
import { TSyslog, WebResponse } from '../../definitions';
import { get, keys, merge } from 'lodash';
import { TzForm, TzFormItem } from '../../components/tz-form';
import { TzCol, TzRow } from '../../components/tz-row-col';
import { Form } from 'antd';
import { RenderTag } from '../../components/tz-tag';
import { getNotifyConfig, setNotifyConfig } from '../../services/DataService';
import { Store } from '../../services/StoreService';

type TSysLog = {
  postApi: (data: any) => Observable<WebResponse<TSyslog>>;
  getApi: () => Observable<WebResponse<TSyslog>>;
  type?: string;
};
const ArrToEnum = (arr: string[]) =>
  arr?.map((item) => {
    return { label: item, value: item };
  });
const networkEnum = ['udp', 'tcp'];
const facilityOptions = [
  'kern',
  'user',
  'mail',
  'daemon',
  'auth',
  'syslog',
  'lpr',
  'news',
  'uucp',
  'cron',
  'authpriv',
  'ftp',
  'local0',
  'local1',
  'local2',
  'local3',
  'local4',
  'local5',
  'local6',
  'local7',
];
const severityOptions = ['emerg', 'alert', 'crit', 'err', 'warning', 'notice', 'info', 'debug'];
const SysLog = (props: TSysLog) => {
  const { postApi, getApi, type } = props;
  const [form] = Form.useForm();
  const [formNotifyConfig] = Form.useForm();
  const [edit, setEdit] = useState(false);
  const [editSound, setEditSound] = useState(false);
  const [info, setInfo] = useState<TSyslog>();
  const [notifyConfigInfo, setNotifyConfigInfo] = useState();

  const getConfigSyslogFn = () => {
    getApi().subscribe((res: WebResponse<TSyslog>) => {
      if (res.error) {
        return;
      }
      let item = res.getItem();
      if (item) {
        setInfo(item);
        edit && form.setFieldsValue(item);
      }
    });
  };
  const getNotifyConfigFn = () => {
    getNotifyConfig().subscribe((res: WebResponse<TSyslog>) => {
      if (res.error) {
        return;
      }
      let item: any = res.getItem();
      let newItem = merge(item, { sound: item.sound == 'enabled' });
      formNotifyConfig.setFieldsValue(newItem);
      setNotifyConfigInfo(item);
    });
  };
  useEffect(getConfigSyslogFn, [edit]);
  useEffect(getNotifyConfigFn, []);

  const dataInfoList = useMemo(() => {
    if (edit) {
      return [];
    }
    const obj: Record<string, any> = {
      network: `${translations.networkProtocol}：`,
      addr: `${translations.address}：`,
      tag: 'tag：',
      facility: 'Facility：',
      severity: 'Severity：',
    };
    return keys(obj).map((key: string) => {
      const content = get(info, key) || '-';
      return {
        title: obj[key],
        content,
      };
    });
  }, [info, edit]);
  return (
    <>
      {type !== 'audit' ? (
        <TzCard
          bodyStyle={{ paddingTop: '0px', paddingBottom: editSound ? '4px' : '0px', marginTop: '-4px' }}
          title={
            <>
              {translations.sound_reminder_configuration}
              {!editSound && (
                <RenderTag
                  className="ml12"
                  type={`${notifyConfigInfo?.sound}`}
                  title={
                    notifyConfigInfo?.sound ? translations.confirm_modal_isopen : translations.confirm_modal_isclose
                  }
                />
              )}
            </>
          }
          extra={
            <div>
              {!editSound ? (
                <TzButton size="small" onClick={() => setEditSound(true)}>
                  {translations.edit}
                </TzButton>
              ) : (
                <>
                  <TzButton
                    type="primary"
                    size="small"
                    onClick={() => {
                      let value = formNotifyConfig.getFieldsValue();
                      let newValue = { sound: value.sound ? 'enabled' : 'disabled' };
                      setNotifyConfig(newValue).subscribe((res: any) => {
                        setEditSound(false);
                        Store.eventsSound.next(value.sound);
                        getNotifyConfigFn();
                      });
                    }}
                  >
                    {translations.save}
                  </TzButton>
                  <TzButton className="ml16" size="small" onClick={() => setEditSound(false)}>
                    {translations.cancel}
                  </TzButton>
                </>
              )}
            </div>
          }
          className="mb20"
        >
          <p className="mb20" style={{ color: 'rgb(142, 151, 163)' }}>
            {translations.event_generated}
          </p>
          {editSound ? (
            <TzForm form={formNotifyConfig}>
              <TzFormItem valuePropName="checked" label={translations.functionSwitch} name="sound">
                <TzSwitch
                  checkedChildren={translations.confirm_modal_isopen}
                  unCheckedChildren={translations.confirm_modal_isclose}
                />
              </TzFormItem>
            </TzForm>
          ) : null}
        </TzCard>
      ) : null}
      <TzCard
        bodyStyle={{ padding: '4px 0 0 0' }}
        title={
          <>
            {translations.exportConfiguration}
            {!edit && <RenderTag className="ml12" type={`${info?.enable}`} />}
          </>
        }
        extra={
          <div className="f-r">
            {!edit ? (
              <TzButton size="small" onClick={() => setEdit(true)}>
                {translations.edit}
              </TzButton>
            ) : (
              <>
                <TzButton
                  type="primary"
                  size="small"
                  onClick={() => {
                    postApi(form.getFieldsValue()).subscribe((res: any) => {
                      setEdit(false);
                    });
                  }}
                >
                  {translations.save}
                </TzButton>
                <TzButton className="ml16" size="small" onClick={() => setEdit(false)}>
                  {translations.cancel}
                </TzButton>
              </>
            )}
          </div>
        }
      >
        {edit ? (
          <TzForm className="mlr24 pb4" form={form}>
            <TzRow gutter={48}>
              <TzCol span={12}>
                <TzFormItem valuePropName="checked" label={translations.functionSwitch} name="enable">
                  <TzSwitch
                    checkedChildren={translations.confirm_modal_isopen}
                    unCheckedChildren={translations.confirm_modal_isclose}
                  />
                </TzFormItem>
              </TzCol>
            </TzRow>
            <TzRow gutter={48}>
              <TzCol span={12}>
                <TzFormItem label={translations.networkProtocol} name="network">
                  <TzSelect
                    options={ArrToEnum(networkEnum)}
                    placeholder={translations.unStandard.requireSelectTip(translations.networkProtocol)}
                  />
                </TzFormItem>
              </TzCol>
              <TzCol span={12}>
                <TzFormItem label={translations.address} name="addr">
                  <TzInput placeholder={translations.unStandard.requireTip(translations.address)} />
                </TzFormItem>
              </TzCol>
            </TzRow>

            <TzRow gutter={48}>
              <TzCol span={12}>
                <TzFormItem label="tag" name="tag">
                  <TzInput placeholder={translations.unStandard.requireTip('tag')} />
                </TzFormItem>
              </TzCol>
              <TzCol span={12}>
                <TzFormItem label="Facility" name="facility">
                  <TzSelect
                    options={ArrToEnum(facilityOptions)}
                    placeholder={translations.unStandard.requireSelectTip('Facility')}
                  />
                </TzFormItem>
              </TzCol>
            </TzRow>
            <TzRow gutter={48}>
              <TzCol span={12}>
                <TzFormItem label="Severity" name="severity">
                  <TzSelect
                    options={ArrToEnum(severityOptions)}
                    placeholder={translations.unStandard.requireSelectTip('Severity')}
                  />
                </TzFormItem>
              </TzCol>
            </TzRow>
          </TzForm>
        ) : (
          <ArtTemplateDataInfo className={'configure-base-case'} data={dataInfoList} span={3} />
        )}
      </TzCard>
    </>
  );
};

export default SysLog;
