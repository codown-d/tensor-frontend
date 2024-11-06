import React, { RefObject, useMemo } from 'react';
import { TzCheckbox, TzCheckboxGroup } from '../../../../components/tz-checkbox';
import { translations } from '../../../../translations/translations';
import { TzTag } from '../../../../components/tz-tag';
import { TRecords } from './interface';
import { SCOPE_KINDS_ENUM } from './util';
import { TzForm, TzFormItem } from '../../../../components/tz-form';
import { Form } from 'antd';
import { TzModal } from '../../../../components/tz-modal';
import { useSize } from 'ahooks';
import { DefaultOptionType } from 'antd/lib/select';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';

type SProps = {
  list: DefaultOptionType[];
  onOk: (values: TRecords) => void;
  onCancel: () => void;
  valueMaps: RefObject<Record<string, any>>;
};
const sceneErrorTip = translations.unStandard.requireSelectTip(translations.object_type);
const ScopeConfirm = (props: SProps) => {
  const [form] = Form.useForm();
  const { list, onOk, onCancel, valueMaps } = props;
  const size = useSize(document.querySelector('body'));
  const objs = valueMaps.current || {};

  const TagsDom = useMemo(() => {
    return Object.keys(objs).map((t) => {
      return (
        <div
          style={{
            maxWidth: '100%',
          }}
        >
          {`${SCOPE_KINDS_ENUM[t]}：`}
          {objs[t].map((v: any) => (
            <TzTag>
              <EllipsisPopover title={v.name}>{v.name}</EllipsisPopover>
            </TzTag>
          ))}
        </div>
      );
    });
  }, [objs]);

  const txtScene = useMemo(() => {
    if (!list.length) return;
    const i = list.map(({ name }) => name);
    return translations.unStandard.whiteListScope(i.join('、'));
  }, [list]);

  const disabled = Form.useWatch('all', form);
  return (
    <TzModal
      title={translations.white_list_range_confirmation}
      bodyStyle={{
        maxHeight: (size?.height || 400) * 0.8 - 158,
        overflowY: 'auto',
      }}
      visible={!!objs}
      width={520}
      onOk={() => {
        form.validateFields().then((data) => {
          objs['scene'] = data.all ? list : list.filter((v) => data.value.includes(v.id));
          onOk(objs);
        });
      }}
      onCancel={onCancel}
      okText={translations.submit}
      cancelText={translations.confirm_modal_cancel}
      destroyOnClose={true}
      maskClosable={false}
    >
      <TzForm form={form} className="scope-confirm mb0 df dfdc">
        <TzFormItem className="mb12">
          <div className="tags-case">{TagsDom}</div>
        </TzFormItem>
        <TzFormItem className="mb12">
          <span className="txt-des">{txtScene}</span>
        </TzFormItem>
        <TzFormItem name="all" valuePropName="checked" className="mb0">
          <TzCheckbox
            onChange={(e) => {
              if (e.target.checked) {
                objs['scene'] = list;
                form.setFields([{ name: 'value', errors: [], value: undefined }]);
              } else {
                !form.getFieldValue('value')?.length &&
                  form.setFields([{ name: 'value', errors: [sceneErrorTip], value: undefined }]);
              }
            }}
          >
            {translations.all_alarms}
          </TzCheckbox>
        </TzFormItem>
        <TzFormItem
          shouldUpdate={(prevValues, curValues) => prevValues.all !== curValues.all}
          name="value"
          rules={[
            {
              required: true,
              validator: (_, value) => {
                const isAll = form.getFieldValue('all');
                return isAll || value?.length
                  ? Promise.resolve()
                  : Promise.reject(new Error(sceneErrorTip));
              },
            },
          ]}
        >
          <TzCheckboxGroup
            onChange={(vals) => {
              objs['scene'] = list.filter((v) => vals.includes(v.id));
            }}
            className="df dfdc"
            disabled={disabled}
            options={list as any}
          />
        </TzFormItem>
      </TzForm>
    </TzModal>
  );
};

export default ScopeConfirm;
