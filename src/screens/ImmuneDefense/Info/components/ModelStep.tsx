import React, { useContext, useEffect, useState } from 'react';
import { TzSteps } from '../../../../components/tz-step';
import { TzCard } from '../../../../components/tz-card';
import { BasicCardProps } from '../../type';
import { ImmuneDefenseContext } from '../context';
import { translations } from '../../../../translations/translations';
import './ModelStep.scss';
import { CardProps } from 'antd/lib/card';
export const immuneDefenseSteps = [
  {
    title: translations.behavioral_learning,
    icon: <span>1</span>,
    key: 1,
  },
  {
    title: translations.model_confirmation,
    icon: <span>2</span>,
    key: 2,
  },
  {
    title: translations.model_app,
    icon: <span>3</span>,
    key: 3,
  },
];
export type ModelStepProps = BasicCardProps & CardProps;
function ModelStep(props: ModelStepProps) {
  const { baseInfo } = useContext(ImmuneDefenseContext) ?? {};
  return (
    <TzCard {...props} bodyStyle={{ paddingBottom: 0, margin: '-6px 0 11px' }}>
      <TzSteps
        current={(baseInfo?.learn_status ?? 0) - 1}
        labelPlacement="vertical"
        items={immuneDefenseSteps}
      />
    </TzCard>
  );
}

export default ModelStep;
