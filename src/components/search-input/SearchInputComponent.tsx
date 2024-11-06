import React, { useMemo } from 'react';
import { translations } from '../../translations/translations';
import './SearchInputComponent.scss';
import { TzInput, TzInputProps } from '../tz-input';
interface SearchInputProps extends TzInputProps {
  onChange?(value: any): any;
}
const SearchInput = (props: SearchInputProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      prefix: <i className={'icon iconfont icon-sousuo mr4 cabb'}></i>,
      onChange: (e: any) => {
        !props.onChange || props.onChange(e.target.value);
      },
      style: { width: '100%' },
      placeholder: props.placeholder || translations.search,
    };
  }, [props]);
  return (
    <TzInput
      {...realProps}
      bordered={false}
      style={Object.assign({}, props.style, {
        background: '#f3f5f8',
        borderRadius: '8px',
      })}
    />
  );
};

export default SearchInput;
