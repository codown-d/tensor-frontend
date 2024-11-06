import { isArray, set } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TzDatePicker, TzDatePickerProps } from '../../tz-date-picker';
import { TzRangePicker, TzRangePickerProps } from '../../tz-range-picker';
import TzTimePicker, { TzTimePickerProps } from '../TzTimePicker';
import {
  FilterCustomRangePicker,
  FilterFormParam,
  FilterFormParamDate,
  FilterInput,
  FilterSelect,
  FilterType,
} from './filterInterface';
import { TWids } from './RederValueTxt';
import TzCustomFilterRangePicker, { TzCustomFilterRangePickerProps } from './component/TzCustomFilterRangePicker';
import TzFilterCascader, { TzFilterCascaderProps } from './component/TzFilterCascader';
import TzFilterInput, { TTzFilterInput } from './component/TzFilterInput';
import TzFilterSelect, { TzFilterSelectProps } from './component/TzFilterSelect';
import { DefaultOptionType } from 'antd/lib/select';
import classNames from 'classnames';

type RenderItemProps = FilterFormParam & {
  // 是否是过滤器渲染
  isFilter?: boolean;
  overRef?: HTMLDivElement | undefined;
  tooltipOver?: HTMLDivElement | undefined;
  // 日历组件中值的文本宽度集合
  wids?: TWids;
  setFocusItem?: any;
  updateEnumLabels?: (arg: any) => void;
  enumLabels?: any;
};

export const SELECT_DEFAULT_PROPS = {
  bordered: false,
  showArrow: false,
  dropdownMatchSelectWidth: false,
  allowClear: false,
  maxTagCount: 1,
};

const RenderItem = (props: RenderItemProps) => {
  const {
    type,
    props: itemProps,
    value,
    isFilter,
    overRef,
    onChange,
    wids,
    name,
    setFocusItem,
    updateEnumLabels,
    enumLabels,
    label,
    tooltipOver,
  } = props;

  const [wid, setWid] = useState<number>(0);
  const [focusedDate, setFocusedDate] = useState<boolean>();

  useEffect(() => {
    if (wids?.[name]) {
      setWid((prev) => {
        return focusedDate ? (wids?.[name] + 5 > prev ? prev + 5 : prev) : wids?.[name];
      });
    }
  }, [focusedDate, wids?.[name]]);

  const foucusItemWhenOpen = useCallback(
    (open) => {
      open ? setFocusItem?.(name) : setFocusItem?.(undefined);
    },
    [open, setFocusItem, name],
  );

  const mergePropsWithRangePickerCt = (defaultProps: FilterCustomRangePicker['props']) => {
    defaultProps && wids?.[name] && set(defaultProps, ['style', 'width'], wids?.[name]);
    return {
      ...defaultProps,
      bordered: false,
      inputReadOnly: true,
      popupClassName: classNames('tz-filter-picker-panel', defaultProps?.popupClassName),
      className: 'tz-filter-picker-ct',
      onOpenChange: (open: boolean) => {
        foucusItemWhenOpen(open);
        defaultProps?.onOpenChange?.(open);
      },
      getCalendarContainer: (node: HTMLElement) => overRef ?? node,
      separator: <div className="tz-picker-range-separator">&ndash;</div>,
    };
  };
  const mergePropsWithDate = (defaultProps: Omit<FilterFormParamDate, 'TzCustomFilterRangePickerProps'>['props']) => {
    if (wid) {
      defaultProps && set(defaultProps, ['style', 'width'], wid);
    }
    return {
      ...defaultProps,
      bordered: false,
      allowClear: false,
      inputReadOnly: true,
      popupClassName: classNames('tz-filter-picker-panel', defaultProps?.popupClassName),
      onOpenChange: (open: boolean) => {
        foucusItemWhenOpen(open);
        defaultProps?.onOpenChange?.(open);
      },
      onBlur: (e: any) => {
        setFocusedDate?.(false);
        defaultProps?.onBlur?.(e);
      },
      onFocus: (e: any) => {
        setFocusedDate?.(true);
        defaultProps?.onFocus?.(e);
      },
      getCalendarContainer: (node: HTMLElement) => overRef ?? node,
      separator: <span className="tz-picker-range-separator">&ndash;</span>,
    };
  };
  const mergePropsWithInput = (defaultProps: FilterInput['props']) => ({
    ...defaultProps,
    onDropdownVisibleChange: foucusItemWhenOpen,
    bordered: false,
    readOnly: true,
  });
  const mergePropsWithSelect = (defaultProps: FilterSelect['props']) => ({
    ...defaultProps,
    updateEnumLabels,
    enumLabels,
    tooltipOver,
    onChange: (v: any, arg: DefaultOptionType | DefaultOptionType[]) => {
      if (isArray(v) && defaultProps?.value?.length < v.length) {
        defaultProps?.onChange?.(isArray(v) ? v.reverse() : v, arg);
      } else {
        defaultProps?.onChange?.(v, arg);
      }
    },
    label,
    popupClassName: classNames('tz-filter-select-dropdown', defaultProps?.popupClassName),
    ...SELECT_DEFAULT_PROPS,
  });
  const getMergeProps = useCallback(
    (type: FilterType) => {
      const elseP = isFilter ? { open: true } : {};
      const defaultProps: any = {
        ...itemProps,
        ...elseP,
        isFilter,
        wids,
        name,
        value,
        onChange: (v: any, arg: any) => {
          itemProps?.onChange?.(v, arg);
          onChange?.(v, arg);
        },
      };
      if (isFilter && overRef) {
        defaultProps['getPopupContainer'] = () => overRef;
      }
      let _mergeProps;
      switch (type) {
        case 'rangePickerCt':
          _mergeProps = mergePropsWithRangePickerCt(defaultProps);
          break;
        case 'rangePicker':
        case 'datePicker':
        case 'timePicker':
          _mergeProps = mergePropsWithDate(defaultProps);
          break;

        case 'input':
          _mergeProps = mergePropsWithInput(defaultProps);
          break;

        case 'cascader':
        case 'select':
          _mergeProps = mergePropsWithSelect(defaultProps);
          break;
        default:
          _mergeProps = defaultProps;
          break;
      }
      return _mergeProps;
    },
    [itemProps, isFilter, value, onChange, overRef, wid, wids, setFocusItem, label],
  );

  const renderItem = useMemo(() => {
    const mergeProps = getMergeProps(type);
    switch (type) {
      case 'input': {
        return <TzFilterInput {...(mergeProps as TTzFilterInput)} />;
      }
      case 'select': {
        return <TzFilterSelect {...(mergeProps as TzFilterSelectProps)} />;
      }
      case 'cascader': {
        return <TzFilterCascader {...(mergeProps as TzFilterCascaderProps)} />;
      }
      case 'datePicker': {
        return <TzDatePicker {...(mergeProps as TzDatePickerProps)} />;
      }
      case 'timePicker': {
        return <TzTimePicker {...(mergeProps as TzTimePickerProps)} />;
      }
      case 'rangePicker': {
        return <TzRangePicker {...(mergeProps as TzRangePickerProps)} />;
      }
      case 'rangePickerCt': {
        return isFilter ? (
          <TzDatePicker {...(mergeProps as TzDatePickerProps)} />
        ) : (
          <TzCustomFilterRangePicker {...(mergeProps as TzCustomFilterRangePickerProps)} />
        );
      }

      default:
        return <></>;
    }
  }, [type, getMergeProps]);

  return renderItem;
};
export default RenderItem;
