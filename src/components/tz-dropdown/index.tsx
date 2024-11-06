import Dropdown, { DropDownProps } from 'antd/lib/dropdown';
import React, { useMemo } from 'react';

import './index.scss';

interface TzDropDownProps extends DropDownProps {
}

export const TzDropdown = (props: TzDropDownProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-dropdown ${props.className || ''}`,
    };
  }, [props]);
  return <Dropdown {...realProps} />;
};
