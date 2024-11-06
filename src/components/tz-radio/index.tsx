import { Radio, RadioGroupProps, RadioProps } from 'antd';
import React, { useMemo } from 'react';

import './index.scss';

const { Group } = Radio;

export const TzRadio = (props: RadioProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-radio ${props.className || ''}`,
    };
  }, [props]);
  return <Radio {...realProps} />;
};

export const TzRadioGroup = (props: RadioGroupProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-radio-group ${props.className || ''}`,
    };
  }, [props]);
  return <Group {...realProps} />;
};

export interface TzRadioNormalType extends RadioGroupProps {
  radioList?: RadioProps[];
}

export const TzRadioGroupNormal = (props: TzRadioNormalType) => {
  const { radioList, ...groupProps } = props;
  const _radioprops = useMemo(() => {
    return radioList?.map((radioprops, index) => {
      return <TzRadio key={`${radioprops.value}_${index}`} {...radioprops} />;
    });
  }, [radioList]);

  return <TzRadioGroup {...groupProps}>{_radioprops}</TzRadioGroup>;
};
