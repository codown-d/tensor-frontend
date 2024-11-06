import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Form, Input, Space } from 'antd';
import classNames from 'classnames';
import { keys } from 'lodash';
import Icon from '@ant-design/icons';
import { TzSelect } from '../../tz-select';
import './index.scss';
import {
  FilterDatePicker,
  FilterFormParam,
  FilterTimePicker,
  FilterRangePicker,
  FilterSelect,
} from './filterInterface';
import { DATES, getDefaultFormat } from './utils';
import RenderItem, { SELECT_DEFAULT_PROPS } from './RenderItem';
import { FilterContext } from '../TzFilter/useTzFilter';
import PopoverFilter from '../TzFilter/PopoverFilter';
import RederValueTxt, { TWids } from './RederValueTxt';
import { ReactComponent as FilterIcon } from '../../../assets/icons/add.svg';
import { ReactComponent as CloseIcon } from '../../../assets/icons/close.svg';
import { TzForm, TzFormItem } from '../../tz-form';
import FormItemWithToolTip from './FormItemWithToolTip';

export interface FilterFormProps {
  formFieldData?: FilterFormParam[];
  className?: string;
  onChange?: (values: any, formFieldData: FilterFormParam[]) => void;
}

const TzFilterForm = ({ onChange, className }: FilterFormProps) => {
  const [form] = Form.useForm();
  const context = useContext(FilterContext);
  const [wids, setWids] = useState<TWids>({});
  const {
    state: { filterFormItems: formFields, fitlerFormValues, enumLabels },
    removeFilter,
    updateFormItemValue,
    updateEnumLabels,
  } = context;
  const [focusItem, setFocusItem] = useState<string>();

  useEffect(() => {
    form?.setFieldsValue?.(fitlerFormValues);
    onChange?.(fitlerFormValues, formFields);
  }, [form, fitlerFormValues]);

  const RenderCondition = ({ props, name }: Pick<FilterSelect, 'props' | 'name'>) => {
    return (
      <TzSelect
        onDropdownVisibleChange={(open: boolean) => {
          open ? setFocusItem(name) : setFocusItem(undefined);
        }}
        popupClassName="tz-filter-form-second-dropdown"
        {...props}
        {...SELECT_DEFAULT_PROPS}
      />
    );
  };

  const renderItem = useCallback(
    (formFields) =>
      formFields.map((item: FilterFormParam, index: React.Key | null | undefined) => (
        <TzFormItem
          key={index}
          label={
            <Space size={4}>
              {item.icon ? (
                <i className={classNames('tz-filter-form-item-label-icon icon iconfont', item.icon)}></i>
              ) : null}
              {item.label}
            </Space>
          }
          colon={false}
          className="tz-filter-form-item"
        >
          <Input.Group compact>
            {item.type === 'select' && item.condition ? (
              <TzFormItem
                name={item.condition.name}
                className={classNames('tz-filter-form-item-value tz-filter-form-second', {
                  'tz-filter-form-item-value-active': item.condition.name === focusItem,
                })}
              >
                {RenderCondition(item.condition)}
              </TzFormItem>
            ) : (
              <span className="tz-filter-form-second">:</span>
            )}
            <FormItemWithToolTip
              formItemProps={{
                name: item.name,
                className: classNames('tz-filter-form-item-value', {
                  'tz-filter-form-item-value-active': item.name === focusItem,
                }),
              }}
            >
              <RenderItem
                {...item}
                wids={wids}
                enumLabels={enumLabels}
                updateEnumLabels={updateEnumLabels}
                setFocusItem={setFocusItem}
              />
            </FormItemWithToolTip>
            {!item.fixed && (
              <TzFormItem name={item.name} className="tz-filter-form-item-delete">
                <div
                  onClick={() => {
                    removeFilter(item.name);
                  }}
                >
                  <CloseIcon className="tz-icon tz-close-icon" />
                </div>
              </TzFormItem>
            )}
          </Input.Group>
        </TzFormItem>
      )),
    [removeFilter, RenderCondition, wids],
  );

  const FormContent = useMemo(() => {
    if (!formFields?.length) {
      return null;
    }

    return (
      <>
        {formFields.some((item) => DATES.includes(item.type)) && !keys(wids).length ? null : renderItem(formFields)}
        {formFields
          // .filter((item) => DATES.includes(item.type))
          .map((item, index) => {
            return fitlerFormValues?.[item.name] ? (
              <RederValueTxt
                key={index}
                className="tz-filter-extra-item"
                name={item.name}
                value={fitlerFormValues[item.name]}
                type={item.type}
                valueText={enumLabels?.[item.name]}
                format={getDefaultFormat(item as FilterDatePicker | FilterTimePicker | FilterRangePicker)}
                setWids={setWids}
              />
            ) : null;
          })}
        <PopoverFilter
          icon={<FilterIcon className="tz-icon tz-filter-icon tz-add-icon" />}
          className="tz-form-filter-popover"
          Popoverprops={{ placement: 'bottomLeft' }}
        />
      </>
    );
  }, [formFields, fitlerFormValues, enumLabels, wids]);

  return (
    <TzForm
      form={form}
      className={classNames(
        'tz-filter-form',
        {
          'tz-filter-form-no-item': !formFields?.length,
        },
        className,
      )}
      layout="inline"
      onValuesChange={(changedValues: any, values: any) => {
        updateFormItemValue(changedValues);
      }}
    >
      {FormContent}
    </TzForm>
  );
};
export default TzFilterForm;
