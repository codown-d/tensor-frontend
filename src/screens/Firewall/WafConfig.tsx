import Form from 'antd/lib/form';
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TzDivider from '../../components/ComponentsLibrary/TzDivider';
import { TzButton } from '../../components/tz-button';
import { TzCard } from '../../components/tz-card';
import {
  TzForm,
  TzFormItem,
  TzFormItemDivider,
  TzFormItemLabelTip,
} from '../../components/tz-form';
import { TzInput } from '../../components/tz-input';
import { TzMessageSuccess } from '../../components/tz-mesage';
import { TzSelect } from '../../components/tz-select';
import { TzTag } from '../../components/tz-tag';
import { putWafConfig, wafConfig, wafService } from '../../services/DataService';
import { translations } from '../../translations/translations';
import './WafConfig.scss';

const WafConfig = () => {
  let [edit, setEdit] = useState(false);
  const [form] = Form.useForm();
  const options = [
    { label: 'cookie', value: 'cookie' },
    { label: 'host', value: 'host' },
    { label: 'body', value: 'body' },
    { label: 'x-forwarded-for', value: 'x-forwarded-for' },
    { label: 'user-agent', value: 'user-agent' },
  ];
  let excluded_file_type = Form.useWatch('excluded_file_type', form);
  let detect_headers = Form.useWatch('detect_headers', form) || [];
  useEffect(() => {
    wafConfig().subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      form.setFieldsValue(item);
    });
  }, []);
  return (
    <TzCard
      className="waf-config mlr32 ml40 mt4"
      title={translations.detect_the_configuration}
      extra={
        <>
          {!edit ? (
            <TzButton
              size={'small'}
              onClick={() => {
                setEdit(true);
              }}
            >
              {translations.edit}
            </TzButton>
          ) : (
            <>
              <TzButton
                className={'mr8'}
                type={'primary'}
                size={'small'}
                onClick={() => {
                  form.submit();
                }}
              >
                {translations.save}
              </TzButton>
              <TzButton
                size={'small'}
                onClick={() => {
                  setEdit(false);
                }}
              >
                {translations.cancel}
              </TzButton>
            </>
          )}
        </>
      }
      bodyStyle={{ paddingBottom: 4 }}
    >
      <TzForm
        form={form}
        validateTrigger={'onChange'}
        initialValues={{}}
        onFinish={(values) => {
          putWafConfig(values).subscribe((res) => {
            if (res.error) return;
            setEdit(false);
            TzMessageSuccess(translations.configuration_succeeded);
          });
        }}
      >
        <TzFormItem name="id" hidden>
          <TzInput />
        </TzFormItem>

        <TzFormItemDivider />
        <TzFormItem
          name="excluded_file_type"
          label={
            <TzFormItemLabelTip
              label={translations.negligible_configuration}
              tip={translations.unStandard.str247}
            />
          }
        >
          {edit ? (
            <TzSelect
              mode="tags"
              placeholder={translations.unStandard.str249}
              showArrow={false}
              dropdownStyle={{ display: 'none' }}
            />
          ) : (
            <>
              {excluded_file_type?.map((item: any) => {
                return <TzTag>{item}</TzTag>;
              })}
            </>
          )}
        </TzFormItem>
        <TzFormItemDivider />
        <TzFormItem
          name="detect_headers"
          label={
            <TzFormItemLabelTip
              label={translations.detection_header_configuration}
              tip={translations.unStandard.str248}
            />
          }
        >
          {edit ? (
            <TzSelect
              mode="multiple"
              placeholder={translations.unStandard.str250}
              options={options}
            />
          ) : (
            <>
              {['url', ...detect_headers].map((item: any) => {
                return <TzTag>{item}</TzTag>;
              })}
            </>
          )}
        </TzFormItem>
      </TzForm>
    </TzCard>
  );
};
export default WafConfig;
