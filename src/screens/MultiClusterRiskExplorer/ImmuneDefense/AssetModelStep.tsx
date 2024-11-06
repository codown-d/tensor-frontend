import React, { useContext, useEffect, useState } from 'react';
import { TzCard } from '../../../components/tz-card';
import { TzSteps } from '../../../components/tz-step';
import { ImmuneDefenseContext } from '../../ImmuneDefense/Info/context';
import { ModelStepProps, immuneDefenseSteps } from '../../ImmuneDefense/Info/components/ModelStep';
export default function (props: ModelStepProps) {
  const { baseInfo } = useContext(ImmuneDefenseContext) ?? {};
  return (
    <TzCard {...props} bodyStyle={{ paddingBottom: 0, margin: '-4px 0 11px' }}>
      <TzSteps
        current={(baseInfo?.learn_status ?? 0) - 1}
        labelPlacement="vertical"
        items={immuneDefenseSteps}
      />
    </TzCard>
  );
}
