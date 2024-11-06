import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Moment } from 'moment';
import './index.scss';
import { localLang, translations } from '../../translations/translations';
import { TzDatePicker } from '../tz-date-picker';
import { RangeValue } from 'rc-picker/lib/interface';
import classNames from 'classnames';
import DatePicker, { DatePickerProps, RangePickerProps } from 'antd/lib/date-picker';
import locale from 'antd/lib/date-picker/locale/en_US';
import ConfigProvider from 'antd/lib/config-provider';
import { SupportedLangauges } from '../../definitions';
import en_US from 'antd/lib/locale/en_US';
import zh_CN from 'antd/lib/locale/zh_CN';

const { RangePicker }: any = DatePicker;

export type TzRangePickerProps = RangePickerProps & {
  className?: string;
  label?: string;
  popupClassName?: string;
};
export const TzRangePicker = (props: TzRangePickerProps) => {
  const { ...otherProps } = props;

  let [visible, setVisible] = useState(false);
  let [value, setValue] = useState<any>();
  let dropdownClass = useMemo(() => {
    let str = 'select-dropdown-close';
    if (visible || (value && value['length'])) {
      str = 'select-dropdown-open';
    }
    return str;
  }, [props, visible, value]);

  useEffect(() => {
    setValue(props.value || props.defaultValue);
  }, [props.value]);

  const realProps = useMemo(() => {
    return {
      ...otherProps,
      popupClassName: classNames('tz-picker-dropdown-range', otherProps.popupClassName),
      label: dropdownClass === 'select-dropdown-open' ? props.label : '',
      className: `tz-date-picker ${otherProps.className || ''}`,
      suffixIcon: <i className="icon iconfont icon-date" style={{ color: '#B3BAC6' }}></i>,
    };
  }, [otherProps, dropdownClass]);
  return (
    <>
      <span className={`tz-selection ${dropdownClass} ${realProps.className}`} style={realProps.style}>
        {React.createElement(ConfigProvider, { locale: localLang === SupportedLangauges.English ? en_US : zh_CN }, [
          React.createElement(RangePicker, {
            key:'RangePicker',
            placeholder: [translations.originalWarning_startTimer, translations.originalWarning_endTimer],
            ...realProps,
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
              setVisible(true);
              !realProps.onFocus || realProps.onFocus(e);
            },
            onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
              setVisible(false);
              !realProps.onBlur || realProps.onBlur(e);
            },
            onChange: (date: RangeValue<Moment>, dateString: [string, string]) => {
              setValue(date);
              !realProps.onChange || realProps.onChange(date as any, dateString);
            },
          }),
        ])}
        <p className={'ant-select-selection-placeholder selection-placeholder-color'}>{realProps.label}</p>
      </span>
    </>
  );
};
type TzDatePickerCT = DatePickerProps & {
  className?: string;
  label?: [string, string];
  defaultRangeValue: Moment[];
  onChangeRangePicker: (value: Moment[], dateString?: string | number) => void;
  onInputKeyDown?: (value: Moment[]) => void;
};
export const TzDatePickerCT = (props: TzDatePickerCT) => {
  const { ...otherProps } = props;
  let [startTime, setStartTime] = useState<any>(props.defaultRangeValue[0]);
  let [endTime, setEndTime] = useState<any>(props.defaultRangeValue[1]);
  let startDisabledDate = useCallback(
    (current) => {
      return current && current > endTime;
    },
    [endTime],
  );
  let endDisabledDate = useCallback(
    (current) => {
      return current && current < startTime;
    },
    [startTime],
  );

  const [focusMark, setFocusMark] = useState<boolean>(false);
  useEffect(() => {
    setStartTime(props.defaultRangeValue[0] || null);
    setEndTime(props.defaultRangeValue[1] || null);
  }, [props.defaultRangeValue]);
  const realProps = useMemo(() => {
    return {
      className: `${otherProps.className || ''}`,
    };
  }, [otherProps, focusMark]);

  return (
    <>
      <div
        className={`tz-date-picker tz-selection border-hover ${realProps.className}`}
        style={{ border: '1px solid #e7e9ed' }}
      >
        <div
          className={classNames('dfc tz-picker-case', {
            'tz-picker-case-focued': focusMark,
          })}
          style={{ justifyContent: 'space-around' }}
        >
          <TzDatePicker
            showTime
            suffixIcon={<></>}
            {...realProps}
            bordered={false}
            style={{
              paddingRight: '0px',
              width: 'calc(50%)',
              float: 'left',
            }}
            onFocus={() => setFocusMark(true)}
            onBlur={() => setFocusMark(false)}
            label={props.label ? props.label[0] : ''}
            placeholder={props.label ? '' : translations.originalWarning_startTimer}
            value={startTime}
            onChange={(date) => {
              setStartTime(date);
              props.onChangeRangePicker([date, endTime], date?.valueOf());
            }}
            disabledDate={endTime ? startDisabledDate : undefined}
          />
          <i className="icon iconfont icon-date-arrow f12" style={{ color: '#B3BAC6' }}></i>
          <TzDatePicker
            showTime
            {...realProps}
            bordered={false}
            style={{
              paddingLeft: '0px',
              width: 'calc(50%)',
              float: 'left',
            }}
            onFocus={() => setFocusMark(true)}
            onBlur={() => setFocusMark(false)}
            label={props.label ? props.label[1] : ''}
            placeholder={props.label ? '' : translations.originalWarning_endTimer}
            value={endTime}
            onChange={(date) => {
              setEndTime(date);
              props.onChangeRangePicker([startTime, date], date?.valueOf());
            }}
            disabledDate={startTime ? endDisabledDate : undefined}
          />
        </div>
      </div>
    </>
  );
};
