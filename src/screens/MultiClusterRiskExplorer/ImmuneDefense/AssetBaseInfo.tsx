import React, { useContext, useEffect, useMemo, useState } from 'react';
import { TzCard } from '../../../components/tz-card';
import { TzSteps } from '../../../components/tz-step';
import { ImmuneDefenseContext } from '../../ImmuneDefense/Info/context';
import { ModelStepProps, immuneDefenseSteps } from '../../ImmuneDefense/Info/components/ModelStep';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { getTime } from '../../../helpers/until';
import { translations } from '../../../translations/translations';
import { BehavioralLearnInfoRes } from '../../../definitions';
import { RenderTag } from '../../../components/tz-tag';
import { LEARNING_STATUS } from '../../ImmuneDefense/util';
export default function (props: ModelStepProps) {
  const { baseInfo } = useContext(ImmuneDefenseContext);
  const dataInfoList = useMemo(() => {
    if (!baseInfo) return [];
    const obj: Record<string, string> = {
      learn_status: translations.compliances_node_status + '：',
      start_time: translations.recent_study_time + '：',
    };
    return Object.keys(obj).map((item) => {
      const val = baseInfo?.[item as keyof BehavioralLearnInfoRes];
      let o: any = {
        title: obj[item] ?? '-',
        content: val ?? '-',
      };
      if ('start_time' === item) {
        o['render'] = () => {
          return val ? getTime(Number(val) * 1000) : '-';
        };
      }
      if ('learn_status' === item) {
        o['render'] = () => {
          const { type } = LEARNING_STATUS[baseInfo['learn_status']] || {};
          return <RenderTag type={type} />;
        };
      }
      return o;
    });
  }, [baseInfo]);
  return (
    <TzCard {...props} bordered bodyStyle={{ padding: 0 }}>
      <ArtTemplateDataInfo data={dataInfoList} span={2} />
    </TzCard>
  );
}
