import { useSize } from 'ahooks';
import { isArray, isEqual } from 'lodash';
import moment from 'moment';
import React, { useEffect , useRef } from 'react';
import { FilterFormParam } from './filterInterface';
import { DATES, SELECTS } from './utils';

export type TWids = Record<string, number>;
type TRederValueTxt = {
  format: string;
  value: any;
  setWids: any;
  name: string;
  className: any;
  type: FilterFormParam['type'];
  valueText?: string | undefined;
};
const DATE_ITEM_PADDING = 14;
const SEPARATOR_WID = 13;
const RANGE_DATE_SEPARATOR_PADDING = 2 * DATE_ITEM_PADDING;
const RederDateValueTxt = ({
  name,
  value,
  format,
  setWids,
  className,
  type,
}: TRederValueTxt) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const size = useSize(ref);

  const isRangeDate = isArray(value);

  const valueTxt = value
    ? isRangeDate
      ? value.filter((v) => !!v).map((v) => (v ? moment(v).format(format) : ''))
      : moment(value).format(format)
    : undefined;

  useEffect(() => {
    const { width } = size || {};
    if (!width) {
      return;
    }

    const validateNum = isRangeDate ? value.filter((v) => !!v).length : 1;
    let itemWid: number;
    if (type === 'rangePicker') {
      itemWid = width + RANGE_DATE_SEPARATOR_PADDING + SEPARATOR_WID;
    } else if (type === 'rangePickerCt') {
      itemWid =
        validateNum === 2
          ? width + RANGE_DATE_SEPARATOR_PADDING
          : width + DATE_ITEM_PADDING;
    } else {
      itemWid = width + DATE_ITEM_PADDING;
    }

    setWids((prev: TWids) => {
      const _wid = {
        ...prev,
        [name as string]: itemWid,
      };
      return isEqual(prev, _wid) ? prev : _wid;
    });
  }, [size, type, isRangeDate, value]);

  return (
    <span className={className} ref={ref}>
      {valueTxt}
    </span>
  );
};

const RederValueTxt = (props: TRederValueTxt) => {
  const { setWids, valueText, type, className, name, value } = props;
  const ref = useRef<HTMLSpanElement | null>(null);
  const size = useSize(ref);

  useEffect(() => {
    const { width } = size || {};
    setWids((prev: TWids) => {
      const _wid = {
        ...prev,
        [name as string]: width,
      };
      return isEqual(prev, _wid) ? prev : _wid;
    });
  }, [size]);

  if (DATES.includes(props.type)) {
    return <RederDateValueTxt {...props} />;
  }

  return (
    <span ref={ref} className={className}>
      {SELECTS.includes(type) ? valueText?.split(' , ')?.[0] : value}
    </span>
  );
};
export default RederValueTxt;
