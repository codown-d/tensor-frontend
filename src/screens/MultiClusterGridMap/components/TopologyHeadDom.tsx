import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import TzSegmented from '../../../components/ComponentsLibrary/TzSegmented';
import { translations } from '../../../translations/translations';
const btnTimerDatas = [
  {
    label: translations.chart_map_24,
    value: '1',
  },
  {
    label: translations.chart_map_7,
    value: '7',
  },
  {
    label: translations.chart_map_30,
    value: '30',
  },
];
export const TopologyHeadDom = (props: { onChange: any }) => {
  let { onChange } = props;
  const [selTime, setSelTime] = useState<'1' | '7' | '30'>('7');
  return (
    <TzSegmented
      value={selTime}
      className={'ml12'}
      options={btnTimerDatas}
      onChange={(val: any) => {
        setSelTime(val);
        onChange(val);
      }}
    />
  );
};
