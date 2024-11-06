import { TooltipPlacement } from 'antd/lib/tooltip';
import React, { useEffect, useMemo, useState } from 'react';
import { TzTooltip } from '../tz-tooltip';
import './ellipsisPopover.less';

interface TensorEllipsisProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  preHidden?: boolean;
  lineClamp?: number;
  lineHeight?: number;
  onChange?: (b: any) => void;
  placement?: TooltipPlacement;
  overlayClassName?: string;
  onOpenChange?: (open: boolean) => void;
}
export const EllipsisPopover = (props: TensorEllipsisProps) => {
  const {
    title = null,
    children = null,
    style,
    preHidden,
    placement = 'topLeft',
    lineClamp = 1,
    lineHeight = 22,
    className = '',
    overlayClassName,
    onOpenChange,
    ...extraProps
  } = props;
  let [open, setOpen] = useState(false);
  useEffect(() => {
    props?.onChange && props.onChange(open);
  }, [open, props.onChange]);
  let getStyle = useMemo(() => {
    let obj: React.CSSProperties = {
      whiteSpace: lineClamp === 1 ? 'nowrap' : 'break-spaces',
      maxWidth: '100%',
    };
    if (lineClamp !== 1) {
      obj['wordBreak'] = 'break-all';
    }
    return obj;
  }, [lineClamp]);
  if (props.title || (props.children != '' && props.children != undefined)) {
    return (
      <div
        className={`${className}`}
        ref={(node) => {
          if (!node || open) return;
          setTimeout(() => {
            let f = false;
            if (lineClamp >= 2) {
              let h = $(node).height();
              f = lineHeight * (lineClamp + 0.5) < h;
            } else {
              let w = $(node).width();
              let cw = $(node).children('span').width();
              f = w <= cw - 1;
            }
            if (f) {
              setOpen(f);
              $(node)
                .removeClass(lineClamp === 2 ? 'double-line' : 'singe-line')
                .addClass(lineClamp === 2 ? 'double-line' : 'singe-line');
            }
          }, 34);
        }}
        style={getStyle}
      >
        <TzTooltip
          placement={placement}
          title={title || children}
          onOpenChange={onOpenChange}
          overlayStyle={!open ? { display: 'none' } : undefined}
        >
          {children}
        </TzTooltip>
      </div>
    );
  } else {
    return <span>-</span>;
  }
};

export default EllipsisPopover;
