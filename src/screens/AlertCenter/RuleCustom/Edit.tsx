import { Form } from 'antd';
import { findIndex, get, uniq } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { TzModal } from '../../../components/tz-modal';
import { TzRadio, TzRadioGroup } from '../../../components/tz-radio';
import { TCustomConfigs, TCustomConfigsSetting } from '../../../definitions';
import { fixedWidthOrPrecentage } from '../../../helpers/until';
import { translations } from '../../../translations/translations';
import RuleTableSelect, { RecordType, TRuleTableSelect } from '../component/RuleTableSelect';
import { useSize } from 'ahooks';
import { gap } from '../component/util';
import TzSelectTag from '../../../components/ComponentsLibrary/TzSelectTag';

type TRuleCustomEdit = {
  ruleConfig: TCustomConfigs[];
  onOk: (values: any) => void;
  open: boolean;
  onCancel: () => void;
};
type TRuleConfigData = TCustomConfigsSetting & {
  rules: TRuleTableSelect['dataSource'];
};
type TFormValues = {
  rule: string[];
  type: string;
  value: string[];
};
const RuleCustomEdit = ({ ruleConfig, onOk, open, onCancel }: TRuleCustomEdit) => {
  const [formRef] = Form.useForm();
  const size = useSize(document.querySelector('body'));

  const ruleConfigData = useMemo(() => {
    return ruleConfig.reduce((t: TRuleConfigData[], v: TCustomConfigs) => {
      const { rule, customSetting, effect, id } = v;
      const idx = findIndex(t, (o) => o.key === customSetting.key);
      if (idx > -1) {
        const itemRule = get(t, [idx, 'rules']);
        itemRule.push({
          ...rule,
          effect,
        });
      } else {
        t.push({
          id,
          ...customSetting,
          rules: [
            {
              ...rule,
              effect,
            },
          ],
        });
      }
      return t;
    }, []);
  }, [ruleConfig]);

  useEffect(() => {
    formRef.setFieldValue('type', get(ruleConfigData, [0, 'key']));
  }, [ruleConfigData]);

  const isEdit = !!get(ruleConfigData, [0, 'id']);

  const onConfirm = useCallback(() => {
    formRef
      .validateFields()
      .then((formValues: TFormValues) => {
        const { type, value, rule } = formValues;
        const { rules, id, ...rest } = ruleConfigData.find((item) => item.key === type) || {};

        onOk(
          isEdit
            ? [
                {
                  id,
                  customSetting: { ...rest, value: uniq(value) },
                },
              ]
            : rules
                ?.filter((v) => rule.includes(v.key))
                .map((item: RecordType) => ({
                  ruleKey: item.key,
                  customSetting: { ...rest, value: uniq(value) },
                })),
        );
      })
      .catch(() => {});
  }, []);
  return (
    <TzModal
      title={
        isEdit
          ? `${translations.edit}${gap}${translations.rule}`
          : `${translations.newAdd}${gap}${translations.rule_custom}`
      }
      bodyStyle={{
        maxHeight: (size?.height || 400) * 0.8 - 158,
        overflowY: 'auto',
      }}
      className="rule-custom-modal"
      visible={open}
      width={fixedWidthOrPrecentage('80%')}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={isEdit ? translations.save : translations.newAdd}
      cancelText={translations.confirm_modal_cancel}
      centered={false}
      destroyOnClose={true}
      maskClosable={false}
    >
      <TzForm form={formRef}>
        <TzFormItem hidden={isEdit} label={translations.rule_condition_type} name="type" required>
          <TzRadioGroup>
            {ruleConfigData.map((item) => (
              <TzRadio value={item.key}>{item.name}</TzRadio>
            ))}
          </TzRadioGroup>
        </TzFormItem>
        <TzFormItem shouldUpdate={(prevValues, curValues) => prevValues.type !== curValues.type}>
          {(data) => {
            const typeKey = data.getFieldValue('type');
            const type2RuleItem: TRuleConfigData | undefined = ruleConfigData.find(
              (v) => v.key === typeKey,
            );

            const { rules, name, value, prompt } = type2RuleItem || {};
            data.setFields([
              {
                name: 'rule',
                errors: undefined,
                value: rules?.map((v) => v.key),
              },
              {
                name: 'value',
                errors: undefined,
                value: value?.length ? value : undefined,
              },
            ]);

            const _prompt =
              prompt ||
              `${translations.rule_value_placeholder}${name}，${translations.rule_value_placeholder_more_tips}${name}${translations.rule_value_placeholder_tips}`;

            return (
              <TzFormItem className="mb0">
                <TzFormItem
                  label={translations.influence_rule}
                  name="rule"
                  rules={
                    isEdit
                      ? undefined
                      : [
                          {
                            required: true,
                            message: translations.choose_rule_tips,
                          },
                        ]
                  }
                >
                  <RuleTableSelect readOnly={isEdit} dataSource={rules ?? []} />
                </TzFormItem>
                <TzFormItem
                  label={name}
                  name="value"
                  className="config-value"
                  rules={[
                    {
                      required: true,
                      message: `${name}${translations.rule_value_notEmpty}`,
                    },
                  ]}
                >
                  <TzSelectTag placeholder={_prompt} />
                </TzFormItem>
              </TzFormItem>
            );
          }}
        </TzFormItem>
      </TzForm>
    </TzModal>
  );
};

export default RuleCustomEdit;
