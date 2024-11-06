import { Popover, PopoverProps } from 'antd';
import React, { useMemo } from 'react';

import './index.scss';

export const TzPopover = React.forwardRef((props: PopoverProps, ref) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      ref,
      className: `tz-popover  ${props.className || ''}`,
    };
  }, [props]);
  return <Popover {...realProps} />;
});
