import { useMemo } from 'react';
import { sourceObjectEnum } from './Manual';

export default (props: any) => {
  let { srcType, dstType } = props;
  let srcTypeOpEnum = useMemo(() => {
    return sourceObjectEnum.map((item) => {
      return {
        ...item,
        disabled: item.value != 'IPBlock' ? false : item.value == 'IPBlock' && item.value == dstType,
      };
    });
  }, [dstType]);
  let dstTypeOpEnum = useMemo(() => {
    return sourceObjectEnum.map((item) => {
      return {
        ...item,
        disabled: item.value != 'IPBlock' ? false : item.value == 'IPBlock' && item.value == srcType,
      };
    });
  }, [srcType]);
  return { srcTypeOpEnum, dstTypeOpEnum };
};
