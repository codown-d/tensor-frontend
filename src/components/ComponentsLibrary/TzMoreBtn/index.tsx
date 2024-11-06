import React, { useEffect, useState } from 'react';
import './index.scss';
import { translations } from '../../../translations/translations';

interface MoreBtnProps {
  onClick: (v?: any) => void;
  expand: boolean;
  className?: string;
}
const TzMoreBtn = (props: MoreBtnProps) => {
  let { onClick, className } = props;
  let [expand, setExpand] = useState(props.expand || false);
  useEffect(() => {
    setExpand(props.expand);
  }, [props.expand]);
  return (
    <span
      className={`tz-more-btn f12 ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick && onClick();
      }}
    >
      {expand ? translations.collapse_details : translations.expand_details}
      <i
        className="icon iconfont icon-arrow-double"
        style={{
          position: 'relative',
          top: '1px',
          transition: '0.3s',
          display: 'inline-block',
          transform: expand ? 'rotate(180deg)' : '',
        }}
      ></i>
    </span>
  );
};
export default TzMoreBtn;
