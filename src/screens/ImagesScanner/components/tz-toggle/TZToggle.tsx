import React, { useState } from 'react';
import classNames from 'classnames';
import './TZToggle.scss';

interface Iprops {
  checked: boolean;
  prefixCls?: string;
  classNameGroup?: string;
  classNameItem?: string;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

function TZToggle(props: Iprops) {
  const {
    checked,
    classNameGroup,
    // prefixCls,
    classNameItem,
    disabled,
    onChange,
  } = props;
  const [active, setActive] = useState(checked);
  // const pixCls = prefixCls || 'TZ';
  if (checked !== active) {
    setActive(checked);
  }
  const renew = () => {
    if (disabled) {
      return;
    }
    if (onChange) {
      onChange(active);
    } else {
      setActive(!active);
    }
  };
  return (
    <span
      className={classNames(
        'TZ-toggle-group',
        { checked: active },
        { disabled: disabled },
        classNameGroup
      )}
      onClick={() => renew()}
    >
      <span className={classNames('TZ-toggle-itme', classNameItem)}></span>
    </span>
  );
}

export default TZToggle;
