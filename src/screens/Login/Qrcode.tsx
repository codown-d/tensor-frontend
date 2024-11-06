import React, { useCallback, useEffect, useRef } from 'react';
import { useUnmount } from 'ahooks';

type TQrcode = {
  text: string;
  style?: any;
  width?: number;
  height?: number;
};
const Qrcode = ({ text, width, height }: TQrcode) => {
  const qrcodeRef = useRef<any>();
  const ref = useRef<any>();

  const renderPopQrcode = useCallback(() => {
    const dom = ref.current;
    if (!dom) {
      return;
    }
    qrcodeRef.current = new window.QRCode(dom, {
      text,
      width: width ?? 120,
      height: height ?? 120,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: window.QRCode.CorrectLevel.L,
    });
    dom.title = '';
  }, [text]);
  useEffect(() => {
    renderPopQrcode();
  }, [renderPopQrcode]);

  useUnmount(() => {
    qrcodeRef.current?.clear?.();
  });

  return <span key={text} ref={ref} />;
};
export default Qrcode;
