import { useUpdateEffect } from 'ahooks';
import classNames from 'classnames';
import { merge, replace } from 'lodash';
import React, { useRef , useCallback, useEffect, useMemo, useState } from 'react';
import { TzDatePicker, TzDatePickerProps } from '../../../tz-date-picker';
import { translations } from '../../../../translations/translations';

export type TzCustomFilterRangePickerProps = Omit<TzDatePickerProps, 'value'> & {
  value?: [moment.Moment, moment.Moment] | null | undefined;
  onChange?: (arg: [moment.Moment?, moment.Moment?] | undefined, arg2?: [string?, string?]) => void;
  className?: string;
  showTime?: boolean;
  startProps?: Omit<TzDatePickerProps, 'value' | 'onChange' | 'picker'>;
  endProps?: Omit<TzDatePickerProps, 'value' | 'onChange' | 'picker'>;
};
type dateVal = { value: moment.Moment | undefined | null; dateString?: string };
type valueItem = {
  start?: dateVal;
  end?: dateVal;
};
const ICON_WID = 14;
const TzCustomFilterRangePicker = (props: TzCustomFilterRangePickerProps) => {
  const { value, onChange, className, startProps, endProps, bordered, ...restProps } = props;

  const [startWid, setStartWid] = useState<number>(0);
  const [endWid, setEndWid] = useState<number>(0);
  const [focusedDate, setFocusedDate] = useState<{
    start: boolean;
    end: boolean;
  }>({ start: false, end: false });
  const [startValIsNull, setStartValIsNull] = useState<boolean>();
  const originWid = useRef([0, 0]);

  const mergeClassName = classNames('tz-filter-customer-datepicker', className, {
    'tz-date-picker-ct-bodered': !!bordered,
    'border-hover': !!bordered,
  });

  const cValue = useMemo(
    (): valueItem => ({
      start: { value: value?.[0] },
      end: { value: value?.[1] },
    }),
    [value],
  );

  const startTime = cValue.start?.value;
  const endTime = cValue.end?.value;

  const trigger = useCallback(
    (item: valueItem) => {
      const val: valueItem = {
        ...cValue,
        ...item,
      };
      if (val.start?.value || val.end?.value) {
        onChange?.(
          [val.start?.value || undefined, val.end?.value || undefined],
          [val.start?.dateString, val.end?.dateString],
        );
      } else {
        onChange?.(undefined);
      }
    },
    [cValue],
  );

  const startMergeProps = merge({}, restProps, startProps);
  const endMergeProps = merge({}, restProps, endProps);

  useEffect(() => {
    const sw = +replace('' + startMergeProps.style?.width, 'px', '') + 2;
    originWid.current[0] = endTime ? sw / 2 : sw;
    setStartWid(originWid.current[0]);
  }, [startMergeProps.style?.width, endTime]);

  useEffect(() => {
    const ew = +replace('' + endMergeProps.style?.width, 'px', '') + 2;
    originWid.current[1] = startTime ? ew / 2 : ew;
    setEndWid(startValIsNull ? originWid.current[1] + ICON_WID : originWid.current[1]);
  }, [endMergeProps.style?.width, startTime]);

  useUpdateEffect(() => {
    !startTime && setStartWid(focusedDate.start ? originWid.current[1] : 70);

    !endTime && setEndWid(focusedDate.end ? originWid.current[0] : 70);
  }, [focusedDate.start, focusedDate.end]);

  const handleBlur = useCallback((name: 'start' | 'end', isFocus: boolean = false) => {
    setFocusedDate((prev) => ({ ...prev, [name]: isFocus }));
  }, []);

  return (
    <>
      <div className={mergeClassName}>
        <TzDatePicker
          disabledDate={endTime ? (current) => current && current > endTime : undefined}
          {...startMergeProps}
          placeholder={
            endMergeProps.showTime ? translations.originalWarning_endTimer : translations.start_date
          }
          style={{
            paddingRight: '0px',
            float: 'left',
            ...startMergeProps.style,
            width: focusedDate.start || startTime ? startWid || 'calc(50%)' : 70,
          }}
          value={startTime}
          onChange={(value: moment.Moment | null, dateString: string) => {
            setStartValIsNull(!value);
            handleBlur('start');
            trigger({ start: { value, dateString } });
          }}
          onMouseEnter={(e) => {
            startTime && setStartWid((prev) => prev + ICON_WID);
            startMergeProps.onMouseEnter?.(e);
          }}
          onMouseLeave={(e) => {
            startTime && setStartWid((prev) => prev - ICON_WID);
            startMergeProps.onMouseLeave?.(e);
          }}
          onFocus={(e) => {
            handleBlur('start', true);
            startMergeProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            handleBlur('start');
            startMergeProps?.onBlur?.(e);
          }}
          onOk={(...arg) => {
            handleBlur('start');
            startMergeProps?.onOk?.(...arg);
          }}
        />
        <div className="tz-picker-range-separator">&ndash;</div>
        <TzDatePicker
          disabledDate={startTime ? (current) => current && current < startTime : undefined}
          {...endMergeProps}
          placeholder={
            endMergeProps.showTime ? translations.originalWarning_endTimer : translations.end_date
          }
          style={{
            paddingLeft: '0px',
            float: 'left',
            ...startMergeProps.style,
            width: focusedDate.end || endWid ? endWid || 'calc(50%)' : 70,
          }}
          value={endTime}
          onChange={(value: moment.Moment | null, dateString: string) => {
            handleBlur('end');
            trigger({ end: { value, dateString } });
          }}
          onMouseEnter={(e) => {
            endTime && setEndWid((prev) => prev + ICON_WID);
            startMergeProps.onMouseEnter?.(e);
          }}
          onMouseLeave={(e) => {
            endTime && setEndWid((prev) => prev - ICON_WID);
            startMergeProps.onMouseLeave?.(e);
          }}
          onFocus={(e) => {
            handleBlur('end', true);
            startMergeProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            handleBlur('end');
            startMergeProps?.onBlur?.(e);
          }}
          onOk={(...arg) => {
            handleBlur('end');
            startMergeProps?.onOk?.(...arg);
          }}
        />
      </div>
    </>
  );
};

export default TzCustomFilterRangePicker;
