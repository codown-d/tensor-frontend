import { StepProps, Steps, StepsProps } from 'antd';
import React, { useMemo } from 'react';

import './index.scss';

const { Step } = Steps;

export const TzSteps = (props: StepsProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-steps ${props.className || ''}`,
    };
  }, [props]);
  return <Steps {...realProps} />;
};

export const TzStep = (props: StepProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-step ${props.className || ''}`,
    };
  }, [props]);
  return <Step {...realProps} />;
};

export interface TzStepsNoramlType extends StepsProps {
  stepList?: StepProps[];
}

export const TzStepsNoraml = (props: TzStepsNoramlType) => {
  const { stepList, ...stepsProps } = props;

  const _stepList = useMemo(() => {
    return stepList?.map((stepprops, index) => {
      return <TzStep key={`${stepprops.title}_${index}`} {...stepprops} />;
    });
  }, [stepList]);
  return <TzSteps {...stepsProps}>{_stepList}</TzSteps>;
};
