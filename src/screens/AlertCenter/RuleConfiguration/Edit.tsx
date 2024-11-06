import { useSize } from 'ahooks';
import { Form } from 'antd';
import { findIndex, get, uniq } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import { TzCheckbox, TzCheckboxGroup } from '../../../components/tz-checkbox';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { TzModal } from '../../../components/tz-modal';
import { TCustomConfigs, TCustomConfigsSetting } from '../../../definitions';
import { fixedWidthOrPrecentage } from '../../../helpers/until';
import { translations } from '../../../translations/translations';
import TzSelectTag from '../../../components/ComponentsLibrary/TzSelectTag';
import RuleTableSelect, { RecordType } from '../component/RuleTableSelect';
import { TzSpace } from '../../../components/tz-space';
import { gap } from '../component/util';

type TRuleCustomEdit = {
  ruleConfig: TCustomConfigs[];
  open: boolean;
  onOk: (values: any) => void;
  onCancel: () => void;
};
type TRuleConfigData = {
  rule: RecordType;
  customSettings: TCustomConfigsSetting[];
};
type TFormFieldCustomSettingsValue = { value: string } | null;
const RuleConfigurationEdit = ({ ruleConfig, open, onOk, onCancel }: TRuleCustomEdit) => {
  const [form] = Form.useForm();
  const size = useSize(document.querySelector('body'));

  const ruleConfigData = useMemo(() => {
    return ruleConfig.reduce((t: TRuleConfigData[], v: TCustomConfigs) => {
      const { rule, customSetting, effect, id } = v;
      const idx = findIndex(t, (o) => o?.rule?.key === rule.key);
      if (idx > -1) {
        const itemCustomSettings = get(t, [idx, 'customSettings']);
        itemCustomSettings.push({ id, ...customSetting });
      } else {
        t.push({
          customSettings: [{ id, ...customSetting }],
          rule: {
            ...rule,
            effect,
          },
        });
        return t;
      }
      return t;
    }, []);
  }, [ruleConfig]);

  useEffect(() => {
    const obj: string[] = [];
    get(ruleConfigData, [0, 'customSettings']).forEach((v, idx) => {
      get(v, ['value'])?.length && obj.push(v.key);
      form.setFieldValue(['customSettings', idx, 'value'], v.value);
    });
    form.setFieldValue(['type'], obj);
  }, [ruleConfigData]);

  const { rule, customSettings } = ruleConfigData[0];

  const onConfirm = useCallback(() => {
    form
      .validateFields()
      .then((formValues) => {
        const { customSettings } = formValues;
        const { customSettings: originCustomSettings } = ruleConfigData[0];
        const values = customSettings
          .map((item: TFormFieldCustomSettingsValue, idx: number) => {
            if (item?.value) {
              const { id, ...rest } = originCustomSettings[idx];
              return {
                id,
                ruleKey: rule.key,
                customSetting: {
                  ...rest,
                  ...item,
                  value: uniq(item.value),
                },
              };
            }
            return undefined;
          })
          .filter((t: any) => t);
        onOk(values);
      })
      .catch(() => {});
  }, [ruleConfigData]);

  const typeValue = Form.useWatch('type', form);

  return (
    <TzModal
      title={`${translations.edit}${gap}${translations.rule}`}
      bodyStyle={{
        maxHeight: (size?.height || 400) * 0.8 - 158,
        overflowY: 'auto',
      }}
      className="rule-custom-modal rule-modal"
      visible={open}
      width={fixedWidthOrPrecentage('80%')}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={translations.save}
      cancelText={translations.confirm_modal_cancel}
      centered={false}
      destroyOnClose={true}
      maskClosable={false}
    >
      <TzForm form={form}>
        <TzFormItem label={translations.influence_rule} name="rule">
          <RuleTableSelect readOnly dataSource={[rule]} />
        </TzFormItem>
        <TzFormItem
          label={translations.rule_condition_type}
          name="type"
          rules={[
            {
              required: true,
              validator: (_, value, callback) =>
                value?.length
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error(`${translations.rule_condition_type}${translations.notEmpty}`),
                    ),
            },
          ]}
        >
          <TzCheckboxGroup>
            <TzSpace size={40}>
              {customSettings.map((item, idx) => (
                <TzCheckbox
                  onChange={(e) => {
                    if (!e.target.checked) {
                      form.setFieldValue(['customSettings', idx, 'value'], undefined);
                    }
                  }}
                  value={item.key}
                >
                  {item.name}
                </TzCheckbox>
              ))}
            </TzSpace>
          </TzCheckboxGroup>
        </TzFormItem>
        <TzFormItem
          className="type-list"
          shouldUpdate={(prevValues, curValues) => prevValues.type !== curValues.type}
        >
          {(data) =>
            customSettings.map(({ name, key, prompt }, idx) =>
              typeValue?.includes(key) ? (
                <TzFormItem
                  label={name}
                  name={['customSettings', idx, 'value']}
                  className="config-value"
                  rules={[
                    {
                      required: true,
                      message: `${name}${translations.notEmpty}`,
                    },
                  ]}
                >
                  <TzSelectTag
                    placeholder={
                      prompt ||
                      `${translations.rule_value_placeholder}${name}，${translations.rule_value_placeholder_more_tips}${name}${translations.rule_value_placeholder_tips}`
                    }
                  />
                </TzFormItem>
              ) : null,
            )
          }
        </TzFormItem>
      </TzForm>
    </TzModal>
  );
};

export default RuleConfigurationEdit;
