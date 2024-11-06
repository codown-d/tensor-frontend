import { Form } from 'antd';
import { cloneDeep, keys } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TzCheckbox, TzCheckboxGroup } from '../../../../components/tz-checkbox';
import { TzForm, TzFormItem } from '../../../../components/tz-form';
import { WebResponse } from '../../../../definitions';
import { translations } from '../../../../translations/translations';
import TzSelect from '../../../../components/ComponentsLibrary/tzSelect';
import { getScopeKind } from '../../../../services/DataService';
import { map } from 'rxjs/internal/operators/map';
import { TzButton } from '../../../../components/tz-button';
import { RecordItem, TRecords } from './interface';
import ScopeConfirm from './ScopeConfirm';
import { SCOPE_KINDS } from './util';
import './index.scss';
import { DefaultOptionType } from 'antd/lib/select';
import { useMemoizedFn } from 'ahooks';

type TEffectObjectPopupEdit = {
  record?: TRecords;
  onOk: (values: TRecords) => void;
  onCancel: () => void;
};
const EffectObjectPopup = ({ record, onOk, onCancel }: TEffectObjectPopupEdit) => {
  const [form] = Form.useForm();
  const [sceneList, setSceneList] = useState<DefaultOptionType[]>([]);
  const [sceneComfirmData, setSceneComfirmData] = useState<TRecords>();
  const valueMaps = useRef<Record<string, any>>(cloneDeep(record) || {});

  const closeSceneComfirmPop = useMemoizedFn(() => setSceneComfirmData(undefined));
  useEffect(() => {
    getScopeKind('scene', { limit: 1000 })
      .pipe(
        map((res: WebResponse<any>) => {
          const data: RecordItem[] = res.getItems();
          setSceneList(data.map((v) => ({ ...v, label: v.name, value: v.id })));
        }),
      )
      .subscribe();

    if (!record) {
      return;
    }
    const data = keys(record);
    data.forEach((key: string) => {
      form.setFieldValue(
        key,
        record[key].map(({ id, name }) => (key === 'container' ? name : id)),
      );
    });
    form.setFieldValue(['type'], data);
  }, [record]);

  const onConfirm = useCallback(() => {
    form
      .validateFields()
      .then((formValues) => {
        if (
          (formValues.hostname && formValues.cluster && Object.keys(formValues).length === 3) ||
          (formValues.hostname && Object.keys(formValues).length === 2)
        ) {
          setSceneComfirmData(formValues);
        } else {
          onOk(valueMaps.current);
        }
      })
      .catch(() => {});
  }, []);

  const typeValue = Form.useWatch('type', form);

  return (
    <div className="mt8">
      <TzForm form={form} className="effect-object-popup">
        <TzFormItem label={translations.object_scope} name="type">
          <TzCheckboxGroup className="boxs-group">
            {SCOPE_KINDS.map((item, idx) => (
              <TzCheckbox
                onChange={(e) => {
                  if (!e.target.checked) {
                    form.setFieldValue(item.value, undefined);
                    delete valueMaps.current[item.value];
                  }
                }}
                value={item.value}
              >
                {item.label}
              </TzCheckbox>
            ))}
          </TzCheckboxGroup>
        </TzFormItem>
        <TzFormItem
          className="type-list"
          shouldUpdate={(prevValues, curValues) => prevValues.type !== curValues.type}
        >
          {(data) =>
            SCOPE_KINDS.map(({ label, value }, idx) =>
              typeValue?.includes(value) ? (
                <TzFormItem
                  label={label}
                  name={value}
                  className="config-value"
                  rules={[
                    {
                      required: true,
                      message: `${label}${translations.notEmpty}`,
                    },
                  ]}
                >
                  <TzSelect
                    allowClear
                    mode="multiple"
                    options={value === 'scene' ? (sceneList as any) : undefined}
                    onChange={(_, opt) => (valueMaps.current[value] = opt)}
                    loadOptions={
                      value === 'scene'
                        ? undefined
                        : (data: any) => {
                            const { page, ...rest } = data;
                            return getScopeKind(value, {
                              ...page,
                              ...rest,
                            }).pipe(
                              map((res: WebResponse<any>) => ({
                                list: res.getItems().map((v) => ({
                                  ...v,
                                  value: value === 'container' ? v.name : v.id,
                                  label: v.name,
                                })),
                                nextId: res.data?.pageToken,
                              })),
                            );
                          }
                    }
                    placeholder={prompt || `${translations.unStandard.requireSelectTip(label)}`}
                  />
                </TzFormItem>
              ) : null,
            )
          }
        </TzFormItem>
        <TzFormItem className="dfc">
          <TzButton
            className="mr24"
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
          >
            {translations.cancel}
          </TzButton>
          <TzButton
            type="primary"
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
          >
            {record === undefined ? translations.add : translations.save}
          </TzButton>
        </TzFormItem>
      </TzForm>
      {!!sceneComfirmData && (
        <ScopeConfirm
          valueMaps={valueMaps}
          list={sceneList}
          onOk={(v) => {
            onOk(v);
            closeSceneComfirmPop();
          }}
          onCancel={() => {
            delete valueMaps.current['scene'];
            closeSceneComfirmPop();
          }}
        />
      )}
    </div>
  );
};

export default EffectObjectPopup;
