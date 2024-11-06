import Tooltip, { TooltipProps } from 'antd/lib/tooltip';
import React, { useMemo } from 'react';

import './index.scss';

export declare type TzTooltipProps = TooltipProps & {
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
};
export const TzTooltip = React.forwardRef<
  React.RefAttributes<unknown>,
  TzTooltipProps
>((props, ref) => {
  const realProps = useMemo(() => {
    return {
      destroyTooltipOnHide: { keepParent: false },
      ...props,
      ref,
      className: `tz-tooltip ${props.className || ''}`,
    };
  }, [props]);
  return <Tooltip {...realProps} />;
});
type TzInfoTooltipProps = TzTooltipProps & {
  icon?: string;
};
export const TzInfoTooltip = (props: TzInfoTooltipProps) => {
  let { icon = 'icon-tishi' } = props;
  let style = useMemo(() => {
    let obj = props.style || {};
    return Object.assign({}, { color: '#676E79' }, obj);
  }, [props]);
  return (
    <TzTooltip {...props}>
      <span style={style} className={props.className}>
        {props.children}
        <i className={`icon iconfont ${icon}`} style={{ marginLeft: 6 }}></i>
      </span>
    </TzTooltip>
  );
};
