import React, { forwardRef, useMemo, useRef } from 'react';
import './index.less';
import { isArray, isNil } from 'lodash';
import classNames from 'classnames';
import NoData from '../../noData/noData';
import EllipsisPopover from '../../ellipsisPopover/ellipsisPopover';
import usePropsAttr from './usePropsAttr';
import Select, { SelectProps } from 'antd/lib/select';

export type TzSelectBaseProps = SelectProps<any> & {
  options: Record<string, any> | undefined;
  label?: string;
  groupClass?: string;
  // 是否是selection展示形式，默认true
  isSelection?: boolean;
};

const TzSelectBase = forwardRef((props: TzSelectBaseProps, ref?: any) => {
  const { groupClass, label, isSelection = true, ...rest } = props;
  const {
    value: valueProps,
    defaultValue,
    getPopupContainer,
    placeholder,
    popupClassName,
    suffixIcon,
    className,
    onDropdownVisibleChange,
    disabled,
    dropdownRender,
  } = rest;
  const [value, setValue] = usePropsAttr(props, 'value', valueProps || defaultValue);
  const [open, setOpen] = usePropsAttr(props, 'open');
  const openRef = useRef<boolean>(false);

  const tagRender = (item: any) => {
    return (
      <span className="ant-select-selection-item tz-select-selection-item">
        <span className="ant-select-selection-ellipsis-wrap">
          <EllipsisPopover lineClamp={1}>{item.label}</EllipsisPopover>
        </span>
        {disabled ? null : (
          <i className={'icon iconfont icon-lansexiaocuohao f16 ml6'} onClick={item.onClose}></i>
        )}
      </span>
    );
  };

  const realProps = useMemo(
    (): TzSelectBaseProps => ({
      listHeight: 235,
      ...rest,
      dropdownRender: (node) => {
        if (dropdownRender) {
          return dropdownRender(node);
        }
        return <div key={+openRef.current}>{node}</div>;
      },
      label,
      placeholder: label ? '' : placeholder,
      getPopupContainer: (triggerNode: any)  => {
        if (getPopupContainer) {
          return getPopupContainer(triggerNode);
        }
        if ($(triggerNode).parents('.ant-drawer-content').length) {
          return $(triggerNode).parents('.ant-drawer-content')[0];
        } else {
          return document.getElementById('layoutMainContent') as HTMLElement;
        }
      },
      suffixIcon: suffixIcon || (
        <i className={`icon iconfont icon-arrow f16 ${open ? 'rotate180' : ''}`} />
      ),
      popupClassName: classNames('tz-select-dropdown', popupClassName),
      className: classNames('tz-select', className),
      onDropdownVisibleChange: (open: any) => {
        setOpen(open);
        onDropdownVisibleChange?.(open);
      },
      onFocus: (e) => {
        openRef.current = true;
        rest.onFocus?.(e);
      },
      onBlur: (e) => {
        openRef.current = false;
        rest.onBlur?.(e);
      },
      onChange: (val, option) => {
        setValue(val);
        props.onChange?.(val, option);
      },
    }),
    [props, open],
  );

  return isSelection ? (
    <span
      className={classNames('tz-selection', groupClass, {
        'select-dropdown-open': open || (isArray(value) ? value?.length : !isNil(value)),
      })}
      style={realProps.style}
    >
      <Select
        showArrow
        tagRender={tagRender}
        notFoundContent={<NoData small={true} />}
        {...(realProps as any)}
        style={{ width: '100%' }}
        value={value}
        ref={ref}
      />
      {label && (
        <p className={'ant-select-selection-placeholder selection-placeholder-color'}>
          {realProps.label}
        </p>
      )}
    </span>
  ) : (
    <Select
      notFoundContent={<NoData small={true} />}
      tagRender={tagRender}
      {...(realProps as any)}
      value={value}
      ref={ref}
    />
  );
});
export default TzSelectBase;
