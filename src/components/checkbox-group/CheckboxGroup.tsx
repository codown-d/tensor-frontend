import React, { useEffect, useRef, useState , useMemo } from 'react';
import { omit } from 'lodash';
import './CheckboxGroup.scss';
import classNames from 'classnames';

interface TensorCheckBoxProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label?: any;
}

const TensorCheckBoxClassName = 'tensorCheckBox';

export const TensorCheckBox = (props: TensorCheckBoxProps) => {
  const isDisabled = useMemo(() => {
    if (props.hasOwnProperty('disabled')) {
      if (props.disabled === true || undefined) {
        return true;
      }
      return false;
    }
    return false;
  }, [props]);

  const isChecked = useMemo(() => {
    if (props.hasOwnProperty('checked')) {
      if (props.checked === true || undefined) {
        return true;
      }
      return false;
    }
    return false;
  }, [props]);

  const className = useMemo(() => {
    return classNames(
      TensorCheckBoxClassName,
      { checked: isChecked, disable: isDisabled },
      props.className
    );
  }, [props.className, isDisabled, isChecked]);

  const realProps = useMemo(() => {
    let tempProps = {
      ...props,
      className,
    };
    tempProps = omit(tempProps, ['label', 'type']);
    return tempProps;
  }, [props, className]);

  return (
    <label className={className}>
      <span className="checkbox">
        <input {...realProps} type="checkbox" />
        <span />
      </span>
      <span className="label">{props.label}</span>
    </label>
  );
};

export interface TensorCheckBoxGroupProps {
  name: string;
  onChange?: (val: string[]) => any;
  value?: string[];
  defaultValue?: string[];
  tensorCheckBoxList: {
    label: string;
    value: string;
    disabled?: boolean;
    otherProps?: TensorCheckBoxProps;
  }[];
  className?: string;
}

const TensorCheckBoxGroupClassName = 'tensorCheckBoxGroup';

export const TensorCheckBoxGroup = (props: TensorCheckBoxGroupProps) => {
  const {
    defaultValue = [],
    onChange,
    name,
    tensorCheckBoxList,
    value,
  } = props;
  const [checked, setChecked] = useState(defaultValue);

  const onChangeFun = useRef(null as any);
  useEffect(() => {
    onChangeFun.current = onChange;
  }, [onChange]);

  const tensorCheckBoxs = useMemo(() => {
    return tensorCheckBoxList.map((item) => {
      const { label, value, disabled, otherProps } = item;
      return (
        <TensorCheckBox
          {...otherProps}
          key={value}
          label={label}
          onChange={(e) => {
            const val = e.target.value;
            let nval = checked.slice(0);
            if (checked.includes(val)) {
              const cindex = checked.findIndex((item) => item === val);
              nval.splice(cindex, 1);
            } else {
              nval.push(val);
            }
            setChecked(nval);
            onChangeFun.current && onChangeFun.current(nval);
          }}
          checked={checked.includes(value)}
          name={name}
          value={value}
          disabled={disabled}
        />
      );
    });
  }, [tensorCheckBoxList, name, checked]);

  const className = useMemo(() => {
    return classNames(TensorCheckBoxGroupClassName, props.className);
  }, [props.className]);

  useEffect(() => {
    const _oval = value || [];
    const val = _oval.slice(0).sort().join();
    setChecked((preval) => {
      const _val = preval.slice(0).sort().join();
      if (val === _val) {
        return preval;
      }
      return _oval;
    });
  }, [value, defaultValue]);

  return <div className={className}>{tensorCheckBoxs}</div>;
};

export default TensorCheckBoxGroup;
