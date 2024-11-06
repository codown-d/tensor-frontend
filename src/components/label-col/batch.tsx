import React from 'react';
import {useMemoizedFn} from 'ahooks';
import {translations} from '../../translations/translations';
import {TzButton} from '../tz-button';
import {useBatchLabelContext} from './context';

export interface IBatchButtonProps {
  style?: any;
}
export function BatchButton(props: IBatchButtonProps) {
  const {style = {}} = props;
  const [{activeBatchBtn, isInLabelPage}, {setActiveBatchBtn, setSelectedItems}] = useBatchLabelContext();

  const onClickBatch = useMemoizedFn(() => {
    const newVal = !activeBatchBtn;
    if (newVal) {
      setSelectedItems!([]);
    }
    setActiveBatchBtn!(newVal);
  });

  if (isInLabelPage) return null;
  return (
    <TzButton
      style={{margin: '-4px 0 12px', ...style}}
      onClick={onClickBatch}
    >
      {activeBatchBtn ? translations.cancel_batch_operation : translations.batch_operation}
    </TzButton>
  );
}
