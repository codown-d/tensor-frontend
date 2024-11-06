import ConfigProvider from 'antd/lib/config-provider';
import DatePicker, { DatePickerProps } from 'antd/lib/date-picker';
import en_US from 'antd/lib/locale/en_US';
import zh_CN from 'antd/lib/locale/zh_CN';
import classNames from 'classnames';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { SupportedLangauges } from '../../definitions';
import { getUid } from '../../helpers/until';
import { localLang } from '../../translations/translations';
import './index.scss';

export type TzDatePickerProps = DatePickerProps & {
  label?: string;
};
export const TzDatePicker = (props: TzDatePickerProps) => {
  const { ...otherProps } = props;
  let [visible, setVisible] = useState(false);
  let [value, setValue] = useState<any>();
  let dropdownClass = useMemo(() => {
    let str = 'select-dropdown-close';
    if (visible || value) {
      str = 'select-dropdown-open';
    }
    return str;
  }, [props, visible, value]);
  useEffect(() => {
    setValue(props.value);
  }, [props.value]);
  const realProps: any = useMemo(() => {
    return {
      ...otherProps,
      suffixIcon: props.suffixIcon ? (
        props.suffixIcon
      ) : (
        <i className="icon iconfont icon-date" style={{ color: '#B3BAC6' }}></i>
      ),
      getPopupContainer: (triggerNode: any) => {
        if (otherProps.getPopupContainer) {
          return otherProps.getPopupContainer(triggerNode);
        }
        if ($(triggerNode).parents('.ant-drawer-content').length) {
          return $(triggerNode).parents('.ant-drawer-content')[0];
        } else {
          return document.getElementById('layoutMainContent');
        }
      },
      label: props.label,
      placeholder: props.label ? '' : props.placeholder,
      className: `tz-date-picker ${otherProps.className || ''}`,
      popupClassName: classNames(
        'tz-picker-dropdown',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        otherProps.popupClassName,
      ),
    };
  }, [otherProps]);
  return (
    <span className={`tz-selection ${dropdownClass} ${realProps.className}`} style={realProps.style}>
      {React.createElement(ConfigProvider, { locale: localLang === SupportedLangauges.English ? en_US : zh_CN }, [
        React.createElement(DatePicker, {
          ...realProps,
          style: { width: '100%' },
          onFocus: (val) => {
            setVisible(true);
            !realProps.onFocus || realProps.onFocus(val);
          },
          onBlur: (val) => {
            setVisible(false);
            !realProps.onBlur || realProps.onBlur(val);
          },
          onChange: (date) => {
            setValue(date);
            !realProps.onChange || realProps.onChange(date);
          },
        }),
      ])}
      {realProps.label && (
        <p className={'ant-select-selection-placeholder selection-placeholder-color'}>{realProps.label}</p>
      )}
    </span>
  );
};
