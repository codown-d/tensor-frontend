import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import './index.scss';
import { translations } from '../../../translations/translations';
interface AddInfoBtnProps {
  title?: string;
  className?: string,
  onClick:()=>void
}
const AddInfoBtn = (props: AddInfoBtnProps) => {
  let { title = translations.add } = props
  return <div
    {...props}
    className={`add-info-btn ${props.className || ''}`}
  >
    <i className="icon iconfont icon-jiahao f14 mr10"
      style={{ color: '#2177D1' }} ></i>
    {title}
  </div>;
};

export default AddInfoBtn;