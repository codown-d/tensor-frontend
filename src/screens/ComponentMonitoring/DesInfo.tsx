import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DesInfo = (props: { title: string; className?: string }) => {
  let { title, className } = props;
  return (
    <p
      className={`des-info flex-r-c ${className}`}
      style={{
        justifyContent: 'flex-start',
        padding: '11px 25px',
        background: 'rgba(33, 119, 209, 0.05)',
        borderRadius: '8px 8px 8px 8px',
        opacity: 1,
        color: 'rgba(33, 119, 209, 1)',
      }}
    >
      <i className={'icon iconfont icon-xingzhuangjiehe mr4'}></i>
      {title}
    </p>
  );
};

export default DesInfo;
