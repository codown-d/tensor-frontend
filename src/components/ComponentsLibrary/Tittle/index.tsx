import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { Slider } from 'antd';
import './index.scss';
interface TitleProps {
  title: string | number | React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  extra?: React.ReactNode;
}

export const Tittle = (props: TitleProps) => {
  let { title, className = '', style } = props;
  return (
    <p className={`dock_h_title-content ${className}`}>
      <span className={`dock_h_title title_text family-s`} style={style}>
        {title}{' '}
      </span>
      <span className={'extra'}>{props.extra}</span>
    </p>
  );
};
