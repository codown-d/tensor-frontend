import { ConfigProvider, TimePicker } from 'antd';
import en_US from 'antd/lib/locale/en_US';
import zh_CN from 'antd/lib/locale/zh_CN';
import { TimePickerProps } from 'antd/lib/time-picker';
import React, { useMemo } from 'react';
import { SupportedLangauges } from '../../../definitions';
import { localLang } from '../../../translations/translations';
import './index.scss';

export interface TzTimePickerProps extends TimePickerProps {
}
const TzTimePicker = (props: TzTimePickerProps) => {
  let { ...otherProps } = props;
  const realProps = useMemo(() => {
    return {
      ...otherProps,
      getPopupContainer: (triggerNode: any) => {
        if (otherProps.getPopupContainer) {
          return otherProps.getPopupContainer(triggerNode)
        }
        if ($(triggerNode).parents('.ant-drawer-content').length) {
          return $(triggerNode).parents('.ant-drawer-content')[0]
        } else {
          return document.getElementById('layoutMainContent')
        }
      },
      suffixIcon: <></>,
    };
  }, [otherProps]);
  return React.createElement(ConfigProvider,
    { locale: localLang === SupportedLangauges.English ? en_US : zh_CN },
    [React.createElement(TimePicker, { ...realProps })
    ]);
};
export default TzTimePicker;
