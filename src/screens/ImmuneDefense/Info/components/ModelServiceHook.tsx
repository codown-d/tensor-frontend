import React from 'react';
import { SegmentedType } from '../useData';
import { modelCommand, modelFile, modelNetwork } from '../../../../services/DataService';

export default (props: { type: SegmentedType }) => {
  let { type } = props;
  return React.useMemo(() => {
    let ServiceHook: any = {
      [SegmentedType.FILE]: modelFile,
      [SegmentedType.COMMAND]: modelCommand,
      [SegmentedType.NETWORK]: modelNetwork,
    };
    return ServiceHook[type];
  }, [props.type]);
};
