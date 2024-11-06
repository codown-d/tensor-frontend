import Checkbox, { CheckboxGroupProps, CheckboxProps } from 'antd/lib/checkbox';
import React, { useMemo } from 'react';

import './index.scss';
export interface TzCheckboxGroupProps extends CheckboxGroupProps {}

const { Group } = Checkbox;
export const TzCheckbox = (props: CheckboxProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-checkbox ${props.className || ''}`,
    };
  }, [props]);
  return <Checkbox {...realProps} />;
};

export const TzCheckboxGroup = (props: TzCheckboxGroupProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-checkbox-group ${props.className || ''}`,
    };
  }, [props]);
  return <Group {...realProps} />;
};

export interface TzCheckboxNormalType extends CheckboxGroupProps {
  CheckboxList?: CheckboxProps[];
}

export const TzCheckboxGroupNormal = (props: TzCheckboxNormalType) => {
  const { CheckboxList, ...groupProps } = props;
  const _Checkboxprops = useMemo(() => {
    return CheckboxList?.map((Checkboxprops, index) => {
      return (
        <TzCheckbox
          key={`${Checkboxprops.value}_${index}`}
          {...Checkboxprops}
        />
      );
    });
  }, [CheckboxList]);

  return <TzCheckboxGroup {...groupProps}>{_Checkboxprops}</TzCheckboxGroup>;
};
