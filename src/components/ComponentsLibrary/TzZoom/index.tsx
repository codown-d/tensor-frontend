import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Slider } from 'antd';
import './index.scss';
import { SliderSingleProps } from 'antd/lib/slider';

interface TzZoomProps extends SliderSingleProps {
  onRestSlider?: (value?: number) => void;
}

const TzZoom = (props: TzZoomProps, ref?: any) => {
  let step = useMemo(() => {
    return props.step || 0.2;
  }, [props]);
  let [value, setValue] = useState(props.defaultValue || 1);
  let onChangeSlider = useCallback((type) => {
    setValue(pre=>{
      if (type === 'add') {
        return props.max ? pre + step > props.max ? props.max : pre + step : pre + step;
      } else {
        return props.min ? pre - step < props.min ? props.min : pre - step : pre - step;
      }
    });
  }, [props]);
  useEffect(() => {
    setValue(props?.value || 1);
  }, [props]);
  useEffect(() => {
    props?.onChange && props?.onChange(value);
  }, [value]);
  const realProps = useMemo(() => {
    return {
      ...props
    };
  }, [props]);
  useImperativeHandle(ref, () => {
    return {
      setValue(val: number) {
        setValue(val);
      },
      getValue() {
        return value;
      }
    };
  });
  return <div className={`zoom-case ${props.className || ''}`}>
    <i className={'icon iconfont icon-huidaoyuanlaiweizhi'} onClick={() => {
      props?.onRestSlider&&props.onRestSlider()
    }}></i>
    <span className='slider-btn' onClick={() => onChangeSlider('subtract')}>-</span>
    <div className={'cont-case'}>
      <Slider {...realProps} value={value} onChange={(val: any) => {
        setValue(val);
      }} range={false} />
    </div>
    <span className='slider-btn slider-btn-add' onClick={() => onChangeSlider('add')}>+</span>
  </div>;
};

export default forwardRef(TzZoom);