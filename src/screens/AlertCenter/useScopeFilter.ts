import { useEffect, useMemo, useState } from 'react';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { TzSelectProps } from '../../components/tz-select';
import { palaceSuggest } from '../../services/DataService';
import { selectType, TSelectType, TSuggestName } from './eventDataUtil';
import { map } from 'rxjs/internal/operators/map';
import { WebResponse } from '../../definitions';
import { keys, trimEnd, split } from 'lodash';

type TSuggestOptions = Record<TSuggestName, TzSelectProps['options']>;
type useScopeFilterR = {
  scopeFilterItems: FilterFormParam[];
  suggestOptions: TSuggestOptions | undefined;
};
type SuggestOptions = {
  id: string;
  label: string;
};

const useScopeFilter = (initData: Record<string, any>): useScopeFilterR => {
  const [suggestOptions, setSuggestOptions] = useState<TSuggestOptions | undefined>();
  useEffect(() => {
    const _keys = keys(initData);
    selectType.forEach(({ value: scopeName }) => {
      if (!_keys.includes(scopeName)) {
        return;
      }
      // const vals = initData[value]
      // const reqIds = value === 'cluster' ? trimEnd()
      palaceSuggest({
        index: 'events',
        ids: initData[scopeName].join(','),
        field: `scope.${scopeName}.name`,
      }).subscribe((res: any) => {
        let arr = res.getItems();
        setSuggestOptions(
          (prev) =>
            ({
              ...(prev || {}),
              [scopeName]: arr.map(({ value, label }: any) => ({
                label,
                value:
                  scopeName === 'cluster' ? split(label, `(${value})`, 1) + `_${value}` : value,
                title: label,
              })),
            } as TSuggestOptions),
        );
      });
    });
  }, [initData]);

  const suggestSelectItems: FilterFormParam[] = useMemo(
    () =>
      selectType.map(
        ({ value: scopeName, label, icon }: TSelectType): FilterFormParam => ({
          label,
          name: scopeName,
          type: 'select',
          icon,
          props: {
            ...(scopeName === 'container'
              ? { popupClassName: 'tz-select-item-option-nowrap-overlay' }
              : {}),
            mode: 'multiple',
            loadOptionsType: 'offset',
            loadOptions: (data: any) => {
              const { page, ...rest } = data;
              return palaceSuggest({
                ...page,
                ...rest,
                index: 'events',
                field: `scope.${scopeName}.name`,
              }).pipe(
                map((res: WebResponse<any>) => ({
                  list: res.getItems().map(({ value, label }) => ({
                    value:
                      scopeName === 'cluster' ? split(label, `(${value})`, 1) + `_${value}` : value,
                    label,
                  })),
                  total: res.data?.totalItems,
                })),
              );
            },
          },
        }),
      ),
    [],
  );

  return { scopeFilterItems: suggestSelectItems, suggestOptions };
};
export default useScopeFilter;
