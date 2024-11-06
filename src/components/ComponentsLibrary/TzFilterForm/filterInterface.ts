import { RangePickerProps } from 'antd/lib/date-picker/generatePicker';
import { TzDatePickerProps } from '../../tz-date-picker';
import { TzInputProps } from '../../tz-input';
import { TzRangePickerProps } from '../../tz-range-picker';
import { TzSelectProps } from '../../tz-select';
import { TzCascaderProps } from '../TzCascader/interface';
import { TzTimePickerProps } from '../TzTimePicker';
import { TzFilterCascaderProps } from './component/TzFilterCascader';
import { TzFilterSelectProps } from './component/TzFilterSelect';
import { TzCustomFilterRangePickerProps } from './component/TzCustomFilterRangePicker';

export type FilterFormValueType = Record<string, any>;

export type FormValues = Record<string, any>;

interface FilterItem<T> {
  // 字段名对应的展示名称
  label: string;
  // 字段名
  name: string;
  // 图标
  icon: string;
  // 是否是不可清除项
  fixed?: boolean;
  value?: T;
  // 字典显示项，toolTip用
  enumLabel?: string;
  onChange?: (arg: T, arg1?: any) => void;
}
export interface FilterInput extends FilterItem<TzInputProps['value']> {
  type: 'input';
  props?: TzInputProps & {
    // 输入多个对象匹配，参考筛选项：资产发现-容器-节点
    isTag?: boolean;
  };
}
export interface FilterSelect extends FilterItem<TzSelectProps['value']> {
  type: 'select';
  props?: Omit<TzFilterSelectProps, 'name'>;
  condition?: Omit<FilterSelect, 'label' | 'type' | 'icon'>;
}
export interface FilterCascader extends FilterItem<TzCascaderProps['value']> {
  type: 'cascader';
  props?: Omit<TzFilterCascaderProps, 'name'>;
}
export interface FilterDatePicker
  extends FilterItem<TzDatePickerProps['value']> {
  type: 'datePicker';
  props?: TzDatePickerProps & {
    popupClassName?: string | undefined;
  };
}
export interface FilterTimePicker
  extends FilterItem<TzTimePickerProps['value']> {
  type: 'timePicker';
  props?: TzDatePickerProps & {
    popupClassName?: string | undefined;
  };
}
export interface FilterRangePicker
  extends FilterItem<TzRangePickerProps['value']> {
  type: 'rangePicker';
  props?: RangePickerProps<moment.Moment> & {
    popupClassName?: string | undefined;
  };
}
export interface FilterCustomRangePicker
  extends FilterItem<TzCustomFilterRangePickerProps['value']> {
  type: 'rangePickerCt';
  props?: Omit<TzCustomFilterRangePickerProps, 'picker'> & {
    popupClassName?: string | undefined;
  };
}
export type FilterType =
  | 'input'
  | 'select'
  | 'cascader'
  | 'datePicker'
  | 'timePicker'
  | 'rangePicker'
  | 'rangePickerCt';

export type FilterFormParam = FilterFormParamCommon | FilterInput;

export type FilterFormParamDate =
  | FilterDatePicker
  | FilterTimePicker
  | FilterRangePicker
  | FilterCustomRangePicker;

export type FilterFormParamCommon =
  | FilterSelect
  | FilterCascader
  | FilterFormParamDate;
