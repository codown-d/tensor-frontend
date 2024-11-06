import { useDebounce, useInfiniteScroll, useMemoizedFn, useUpdateEffect } from 'ahooks';
import { Empty } from 'antd';
import React, { Dispatch, SetStateAction, forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import NoData from '../../noData/noData';
import LoadingOutlined from '@ant-design/icons/lib/icons/LoadingOutlined';
import TzSelectCommon, { TzSelectCommonProps } from './TzSelectCommon';
import classNames from 'classnames';
import usePropsAttr from './usePropsAttr';
import { get, has, isArray, isEqual, isNil, toUpper } from 'lodash';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

const PAGESIZE = 50;
const LISTITEMHEIGHT = 36;

export type LoadOptionsPage = { token?: string; limit: number; offset?: number };
export type LoadOptionsParams = {
  page?: LoadOptionsPage;
  keyword?: string;
  ids?: string;
};
interface Result {
  list: TzSelectCommonProps['options'];
  nextId?: string | undefined;
  total?: number;
}
export type TzAsyncSelect = {
  loadOptions: (params: LoadOptionsParams) => Observable<Result>;
  /** 默认token方式滚动加载 */
  loadOptionsType?: 'token' | 'offset';
} & Omit<TzSelectCommonProps, 'options'>;

/**
 * 服务器加载： 下拉列表默认非checkbox展示，可手动更改，如果更改为checkbox展示会有性能问题
 */
const AsyncSelect = forwardRef((props: TzAsyncSelect, ref?: any) => {
  const { loadOptions, loadOptionsType, ...rest } = props;
  const {
    listItemHeight,
    showSearch,
    mode,
    onSearch,
    onChange,
    popupClassName,
    value: valueProps,
    defaultValue,
    onFocus,
    onBlur,
    fieldNames,
    onDropdownVisibleChange,
    open,
  } = rest;
  const [searchValue, setSearchValue] = usePropsAttr<string | undefined>(props, 'searchValue');
  const [value, setValue] = usePropsAttr<string | string[]>(props, 'value', valueProps || defaultValue);
  const [selectedList, setSelectedList] = useState<TzSelectCommonProps['options']>([]);
  const [valueChangedNum, setValueChangedNum] = useState<number>(0);
  const offsetRef = useRef<number>(0);
  const openRef = useRef<boolean>(!!open);

  const _value: string[] | undefined = isArray(value) ? value : isNil(value) ? value : [value];

  const setSateFn = useMemoizedFn((setSate: Dispatch<SetStateAction<any>>, val) => {
    setSate((prev: any) => (isEqual(prev, val) ? prev : val));
  });
  const isTokenType = loadOptionsType !== 'offset';

  const firVals = useRef<string[]>();
  useEffect(() => {
    if (has(rest, 'open') && rest.open) {
      setValueChangedNum(1);
    }
    return () => {
      offsetRef.current = 0;
      // firVals.current = undefined;
      setValueChangedNum(3);
    };
  }, []);
  useEffect(() => {
    if (valueChangedNum > 1) {
      return;
    }
    firVals.current = _value;
    if (!_value?.length) {
      setSateFn(setSelectedList, []);
    } else {
      loadOptions({
        ids: _value.join(','),
      })
        .pipe(map(({ list }) => setSateFn(setSelectedList, list)))
        .subscribe();
    }
    openRef.current && setValueChangedNum(2);
  }, [JSON.stringify(_value), valueChangedNum]);

  const debouncedSearchValue = useDebounce(searchValue, { wait: 500 });

  const { data, loading, loadMore, loadingMore, reload } = useInfiniteScroll(
    (d) =>
      loadOptions({
        page: isTokenType
          ? { token: d?.nextId, limit: PAGESIZE }
          : { limit: PAGESIZE, offset: offsetRef.current * PAGESIZE },
        ...(showSearch ?? mode === 'multiple' ? { keyword: debouncedSearchValue } : {}),
      })
        .pipe(
          map((res) => {
            const resList = (get(res, 'list') || []).filter(
              (v: any) => !firVals.current?.includes(v[fieldNames?.value ?? 'value']),
            );
            offsetRef.current += 1;
            // setOffset((prev) => prev + 1);
            return {
              ...res,
              list: resList,
            };
          }),
        )
        .toPromise(),
    {
      isNoMore: (d) => (isTokenType ? d?.nextId === undefined : offsetRef.current * PAGESIZE > (d?.total || 0)),
    },
  );
  const reloadFn = useMemoizedFn(() => {
    offsetRef.current = 0;
    reload();
  });
  useUpdateEffect(reloadFn, [debouncedSearchValue]);
  useUpdateEffect(() => {
    if (valueChangedNum < 2) {
      reloadFn();
    }
  }, [valueChangedNum]);
  const { list } = data || {};
  const mergeListItemHeight = listItemHeight ?? LISTITEMHEIGHT;
  const mregeSelectedList = useMemo((): TzSelectCommonProps['options'] => {
    if (valueChangedNum === 0) {
      return selectedList || [];
    }
    const filterList = searchValue
      ? selectedList?.filter((v) => toUpper(v[fieldNames?.label ?? 'label']).includes(toUpper(searchValue)))
      : selectedList;
    return [...(filterList || []), ...(list || [])];
  }, [selectedList, list]);

  return (
    <TzSelectCommon
      showSearch
      onSearch={(val: string) => {
        setSearchValue(val);
        onSearch?.(val);
      }}
      listItemHeight={mergeListItemHeight}
      itemRenderWithCheckbox={false}
      autoClearSearchValue={false}
      isSelection={false}
      {...rest}
      options={mregeSelectedList}
      ref={ref}
      popupClassName={classNames('tz-async-select-dropdown', popupClassName)}
      value={value}
      onChange={(val, opt) => {
        onChange?.(val, opt);
        setValue(val);
      }}
      defaultActiveFirstOption={false}
      onDropdownVisibleChange={(open) => {
        openRef.current = open;
        if (open) {
          setValueChangedNum(1);
        } else {
          setValueChangedNum(3);
          setSearchValue(undefined);
        }
        onDropdownVisibleChange?.(open);
      }}
      // onFocus={(e) => {
      //   setValueChangedNum(1);
      //   onFocus?.(e);
      // }}
      // onBlur={(e) => {
      //   setValueChangedNum(3);
      //   setSearchValue(undefined);
      //   onBlur?.(e);
      // }}
      searchValue={searchValue}
      notFoundContent={
        loading || searchValue !== debouncedSearchValue ? (
          <Empty
            description={false}
            image={<LoadingOutlined style={{ marginTop: 10, fontSize: 24, color: '#2177D1' }} />}
          />
        ) : (
          <NoData small={true} />
        )
      }
      onPopupScroll={(e: any) => {
        if (
          (mregeSelectedList?.length || 0) - (e.target?.scrollTop + e.target?.clientHeight) / mergeListItemHeight <
            PAGESIZE / 3 &&
          !loadingMore
        ) {
          loadMore();
        }
      }}
    />
  );
});

export default AsyncSelect;
