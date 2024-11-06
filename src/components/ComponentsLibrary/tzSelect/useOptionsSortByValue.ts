import { useUpdateEffect } from 'ahooks';
import { isArray, isEqual, sortBy } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { TzSelectCommonProps } from './TzSelectCommon';
import { TzSelectProps } from '.';

const sortOptions = (
  data: TzSelectCommonProps['options'],
  value: TzSelectCommonProps['value'],
  fieldNames?: TzSelectCommonProps['fieldNames'],
) => sortBy(data, (v) => !(value?.indexOf(v[fieldNames?.value || 'value']) > -1));

export default function useOptionsSortByValue(props: TzSelectProps) {
  const { open = false, value, options: optionsProps, isNeedSort, fieldNames } = props;
  const [options, setOptions] = useState<TzSelectCommonProps['options']>(optionsProps);
  const valueChangedRef = useRef<number>(0);

  useUpdateEffect(() => {
    valueChangedRef.current = +open;
  }, [open]);

  useEffect(() => {
    if (!optionsProps?.length || valueChangedRef.current !== 1) {
      return;
    }

    const _val = isArray(value) ? value : value ? [value] : undefined;
    if (!isNeedSort || !_val?.length || !optionsProps?.length) {
      setOptions((prev) => (isEqual(prev, optionsProps) ? prev : optionsProps));
    } else {
      const _sortOptions = sortOptions(optionsProps, _val, fieldNames);
      setOptions((prev) => (isEqual(prev, _sortOptions) ? prev : _sortOptions));
    }
    valueChangedRef.current += 1;
  }, [open]);

  useUpdateEffect(() => {
    setOptions(optionsProps);
  }, [JSON.stringify(optionsProps)]);

  return options;
}
