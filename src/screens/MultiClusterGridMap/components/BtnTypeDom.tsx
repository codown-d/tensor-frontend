import React, { useMemo } from 'react';
import TzSegmented from '../../../components/ComponentsLibrary/TzSegmented';
import { translations } from '../../../translations/translations';

const btnTimerDatas: any = {
  resource: [
    {
      label: translations.resources,
      value: 'resource',
    },
    {
      label: translations.clusterGraphList_container,
      value: 'container',
    },
    {
      label: 'Pod',
      value: 'pod',
    },

    {
      label: translations.process,
      value: 'process',
    },
  ],
  pod: [
    {
      label: 'Pod',
      value: 'pod',
    },
    {
      label: translations.clusterGraphList_container,
      value: 'container',
    },

    {
      label: translations.process,
      value: 'process',
    },
  ],
  container: [
    {
      label: translations.clusterGraphList_container,
      value: 'container',
    },

    {
      label: translations.process,
      value: 'process',
    },
  ],
  process: [],
};
export const BtnTypeDom = (props: any) => {
  let { onChange, type } = props;
  let btnTypeOp = useMemo(() => {
    return btnTimerDatas[type];
  }, [props]);
  return (
    <TzSegmented
      defaultValue={type}
      options={btnTypeOp}
      onChange={onChange}
      style={{ background: 'rgba(33, 119, 209, 0.02)' }}
    />
  );
};
