import React, { useMemo, useRef, useState, useEffect } from 'react';
import './index.scss';
import type { SelectProps } from 'antd/es/select';
import debounce from 'lodash/debounce';
import { TzSelect } from '../../tz-select';
import TzSpin from '../TzSpin';
import { Observable } from 'rxjs/internal/Observable';
import { finalize, tap } from 'rxjs/operators';


export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  fetchOptions: (value: string) => Observable<any[]>;
}

function TzSelectSearch<ValueType extends { key?: string; label: React.ReactNode; value: string | number } = any,
  >({ fetchOptions, ...props }: DebounceSelectProps<ValueType>) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<ValueType[]>([]);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      setOptions([]);
      setFetching(true);
      fetchOptions(value).pipe(
        tap((newOptions) => {
          setOptions(newOptions);
        }),
        finalize(() => {
          setFetching(false);
        })
      ).subscribe();
    };

    return debounce(loadOptions, 300);
  }, [fetchOptions]);
  useEffect(() => {
    fetchOptions('').subscribe(newOptions => {
      setOptions(newOptions);
    });
  }, [fetchOptions])
  return (
    <TzSelect
      allowClear
      showSearch
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <TzSpin size="small" /> : null}
      {...props}
      options={options}
    />
  );
}

export default TzSelectSearch;