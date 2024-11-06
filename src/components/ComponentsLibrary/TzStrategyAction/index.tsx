import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { translations } from '../../../translations/translations';
import './index.scss';
export let segmentedOp = [
  {
    label: translations.imageReject_reject_type_alarm,
    value: 'alarm',
  },
  {
    label: translations.deflectDefense_blockUp,
    value: 'block',
  },
];
interface StrategyActionProps {
  data: any[];
  value?: string | '';
  type?: 'rule' | 'sensitive' | 'webshell';
  onChange?: (item: { title: string; value: string }) => void;
  style?: React.CSSProperties;
  className?: string;
}

export const StrategyAction = (props: StrategyActionProps) => {
  let { data, onChange, type } = props;
  let [value, setValue] = useState(props.value);
  let getColor = (val: string) => {
    if (['alarm', 'alert', 'Log', 'detection'].indexOf(val) != -1) {
      return 'orange';
    } else if (['reject', 'block', 'Deny', 'prevention', 'protect'].indexOf(val) != -1) {
      return 'red';
    } else if (['ignore', 'Allow'].indexOf(val) != -1) {
      return 'blue';
    } else if (['passthrough'].indexOf(val) != -1) {
      return 'green';
    }
    return;
  };
  useEffect(() => {
    setValue(props.value);
  }, [props]);
  return (
    <div className={`strategy-action ${props.className || ''}`} style={props.style}>
      {data.map((item: any) => {
        return (
          <span
            onClick={() => {
              !onChange || onChange(item.value);
            }}
            className={`${getColor(item.value) || ''} ${value === item.value ? 'act' : ''}`}
          >
            {item['title'] || item['label']}
          </span>
        );
      })}
    </div>
  );
};
