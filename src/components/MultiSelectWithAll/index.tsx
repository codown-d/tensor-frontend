import React, { useState } from 'react';
import classNames from 'classnames';
import { CheckboxChangeEvent, CheckboxProps } from 'antd/lib/checkbox';
import { TzCheckbox } from '../tz-checkbox';
import './index.scss';
import TzSelect, { TzSelectProps } from '../ComponentsLibrary/tzSelect';
import { translations } from '../../translations/translations';

export type MultiSelectWithAllValProps = { checkValue?: boolean; selectValue?: string[] };
export type MultiSelectWithAllProps<T = MultiSelectWithAllValProps> = TzSelectProps & {
  value?: T;
  onChange?: (arg: T) => void;
  label: string;
  checkboxLabel?: string;
  wrapClassName?: string;
  checkboxOp?: CheckboxProps;
};
function MultiSelectWithAll({
  value,
  onChange,
  label,
  checkboxLabel = translations.scanner_images_all,
  options,
  wrapClassName,
  checkboxOp,
  ...rest
}: MultiSelectWithAllProps) {
  const { selectValue, checkValue } = value || {};
  const onCheckboxChange = (e: CheckboxChangeEvent) => {
    onChange?.({ checkValue: e.target.checked });
  };
  const onSelectChange = (val: string[]) => {
    onChange?.({ selectValue: val });
  };

  return (
    <div className={classNames('tz-mlti-select-with-all', wrapClassName)}>
      <div className="row">{label}</div>
      <div className="row">
        <TzCheckbox checked={checkValue} onChange={onCheckboxChange} {...checkboxOp}>
          {checkboxLabel}
        </TzCheckbox>
      </div>
      <div className="row">
        <TzSelect
          style={{ width: '100%' }}
          onChange={onSelectChange}
          isSelection={false}
          disabled={checkValue}
          value={selectValue}
          maxTagCount="responsive"
          allowClear
          mode="multiple"
          options={options}
          {...rest}
        />
      </div>
    </div>
  );
}

export default MultiSelectWithAll;
