import React, { useMemo, forwardRef, useCallback, useRef, useImperativeHandle, useState, useEffect } from 'react';
import './index.scss';
import { TzInput } from '../tz-input';
import { TzButton } from '../tz-button';
import { translations } from '../../translations/translations';
import { SearchProps } from 'antd/lib/input/Search';
export const TzInputSearch = forwardRef((props: SearchProps, ref?: any) => {
  const [value, setValue] = useState<any>(undefined);
  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  let onSearch = useCallback(
    (val?: any) => {
      props.onSearch && props.onSearch(val);
    },
    [props.onSearch],
  );
  const realProps = useMemo(() => {
    return {
      allowClear: true,
      ...props,
      prefix: (
        <i className={'icon iconfont icon-sousuo'} style={{ fontSize: '14px', marginRight: '4px', color: '#B3BAC6' }} />
      ),
      style: Object.assign({ width: '360px', background: 'rgba(244, 246, 250, 1)' }, props.style),
      suffix: props.suffix ? (
        <TzButton
          type="primary"
          size="small"
          onClick={() => {
            onSearch(value);
          }}
        >
          {translations.clusterGraphList_search}
        </TzButton>
      ) : null,
      onChange: (event: any) => {
        setValue(event.target.value);
        onSearch(event.target.value);
        props.onChange && props.onChange(event.target.value);
        props.onPressEnter && props.onPressEnter(event.target.value);
      },
      onPressEnter: (event: any) => {
        onSearch(event.target.value);
        props.onPressEnter && props.onPressEnter(event.target.value);
      },
      className: `tz-input-search ${props.className || ''}`,
    };
  }, [props, value]);
  return <TzInput {...realProps} ref={ref} value={value} />;
});
export default TzInputSearch;
