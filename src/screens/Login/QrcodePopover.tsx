import React, { useCallback, useEffect, useRef } from 'react';
import { TzPopover } from '../../components/tz-popover';
import { useUnmount } from 'ahooks';
import './qrcode.scss';
import classNames from 'classnames';

type TQrcodePopover = {
  text: string;
  className?: string;
  style?: any;
  width?: number;
  height?: number;
};
const QrcodePopover = ({ text, className, style, width, height }: TQrcodePopover) => {
  const qrcodeRef = useRef<any>();
  const ref = useRef<any>();

  const renderPopQrcodePopover = useCallback(() => {
    const dom = ref.current;
    if (!dom) {
      return;
    }
    qrcodeRef.current = new window.QRCode(dom, {
      text,
      width: width ?? 200,
      height: height ?? 200,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: window.QRCode.CorrectLevel.L,
    });
    dom.title = '';
  }, [text]);
  useEffect(() => {
    renderPopQrcodePopover();
  }, [renderPopQrcodePopover]);

  useUnmount(() => {
    qrcodeRef.current?.clear?.();
  });

  return (
    <TzPopover
      overlayClassName="qrcode-popover"
      destroyTooltipOnHide={false}
      onOpenChange={(open) => {
        if (!qrcodeRef.current) {
          renderPopQrcodePopover();
        }
      }}
      content={<span ref={ref} />}
    >
      <span className="qrcode">
        <span className="qrcode-icon-wrapper">
          <i style={style} className={classNames('icon iconfont icon-erweima', className)} />
        </span>
      </span>
    </TzPopover>
  );
};
export default QrcodePopover;
