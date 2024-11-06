import { RefSelectProps } from 'antd';
import React, { useRef, useState } from 'react';
import { TzSelect, TzSelectProps } from '../../tz-select';
import classNames from 'classnames';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';

type TzSelectTag = TzSelectProps & {
  value?: string[];
  onChange?: (value?: string[]) => void;
  className?: string;
};
const TzSelectTag = (props: TzSelectTag) => {
  const { value, className, disabled, onChange, ...rest } = props;
  const [searchVal, setSearchVal] = useState<string | undefined>();
  const selectRef = useRef<RefSelectProps>(null);
  const keyCode = useRef<number | null>(null);
  const tagRender = (props: any) => {
    return (
      <span className={'ant-select-selection-item tz-select-selection-item'}>
        <span style={{ maxWidth: 'calc(100% - 22px)' }}>
          <EllipsisPopover lineClamp={1} style={{ float: 'left' }}>
            {props.label}
          </EllipsisPopover>
        </span>
        {disabled ? null : (
          <i className={'icon iconfont icon-lansexiaocuohao f16 ml6'} onClick={(e) => props.onClose?.(e)}></i>
        )}
      </span>
    );
  };
  return (
    <TzSelect
      searchValue={searchVal}
      onSearch={(e) => {
        if (e) {
          setSearchVal(e);
        } else {
          setSearchVal(keyCode.current !== 8 ? searchVal : undefined);
          selectRef.current?.focus?.();
        }
      }}
      onBlur={() => setSearchVal(undefined)}
      onClear={() => {
        keyCode.current = 8;
        setSearchVal(undefined);
      }}
      onChange={(v) => {
        onChange?.(v?.length ? v : undefined);
      }}
      onInputKeyDown={(e) => {
        keyCode.current = e.keyCode;
        if (e.keyCode === 32) {
          e.stopPropagation();
          e.preventDefault();
          return;
        }
        if (e.keyCode === 13) {
          if (searchVal) {
            value?.includes(searchVal) && e.stopPropagation();
            setSearchVal(undefined);
          } else {
            e.stopPropagation();
          }
          selectRef.current?.focus?.();
        }
      }}
      value={value}
      allowClear
      {...rest}
      isNeedSort={false}
      isSelection={false}
      className={classNames('tz-tag-select', className)}
      ref={selectRef}
      tagRender={tagRender}
      mode="tags"
      showArrow={false}
      dropdownStyle={{ display: 'none' }}
    />
  );
};

export default TzSelectTag;
