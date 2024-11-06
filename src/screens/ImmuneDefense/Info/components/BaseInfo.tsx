import React, { useContext, useEffect, useMemo, useState } from 'react';
import { TzCard } from '../../../../components/tz-card';
import ArtTemplateDataInfo from '../../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { translations } from '../../../../translations/translations';
import { BehavioralLearnInfoRes } from '../../../../definitions';
import { find, keys } from 'lodash';
import { useClusterList } from '../../../../helpers/use_fun';
import { ImmuneDefenseContext } from '../context';
import { BasicCardProps } from '../../type';
import { getTime } from '../../../../helpers/until';
import { JumpNamespace, JumpNode } from '../../../MultiClusterRiskExplorer/components';

function BaseInfo(props: BasicCardProps) {
  const { baseInfo } = useContext(ImmuneDefenseContext);
  const clusterList = useClusterList();

  const dataInfoList = useMemo(() => {
    const obj: Record<string, string> = {
      kind: translations.microseg_resources_res_kind + '：',
      cluster: translations.commonpro_Cluster + '：',
      namespace: translations.commonpro_Namespace + '：',
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
      if ('cluster' === item) {
        let node = find(clusterList, (item) => item.value === val) || val;
        o['render'] = () => {
          return node?.name;
        };
      }
      if ('namespace' === item) {
        o['render'] = (_row: any) => {
          let { namespace, name, cluster } = baseInfo || {};
          return <JumpNamespace namespace={namespace} clusterKey={cluster} title={namespace} />;
        };
      }
      return o;
    });
  }, [baseInfo, clusterList]);
  return (
    <TzCard {...props} bordered bodyStyle={{ padding: 0 }}>
      <ArtTemplateDataInfo data={dataInfoList} span={2} />
    </TzCard>
  );
}

export default BaseInfo;
