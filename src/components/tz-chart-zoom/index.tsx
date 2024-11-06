import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Resources } from '../../Resources';
import { Slider } from 'antd';
import './index.scss';
export interface ChartZoomProps {
  onChange?: (n: number) => void;
  rest?: (n: number) => void;
}
const ChartZoom = (props: ChartZoomProps) => {
  const [ratio, setRato] = useState<number>(1);
  const onChange = useCallback(
    (value: any) => {
      setRato(value);
      props.onChange?.(value);
    },
    [props],
  );
  const onChangeBtn = useCallback(
    (type: 'add' | 'dec') => {
      let _temRatio = type === 'add' ? (ratio * 10 + 1) / 10 : (ratio * 10 - 1) / 10;
      if (_temRatio > 4) _temRatio = 4;
      if (_temRatio < 0.4) _temRatio = 0.4;
      onChange(_temRatio);
    },
    [ratio],
  );
  const initRatio = useCallback(() => {
    setRato(1);
    props.rest?.(1);
  }, [props]);
  return (
    <div className="slider-case flex-r-c">
      <div className="reducBtn" onClick={() => initRatio()}>
        <img src={Resources.back} alt="back" />
      </div>
      <span className="slider-dec-btn" onClick={() => onChangeBtn('dec')}>
        -
      </span>
      <div className="cont-case">
        <Slider min={0.4} max={4} onChange={onChange} step={0.1} value={ratio} />
      </div>
      <span className="slider-add-btn" onClick={() => onChangeBtn('add')}>
        +
      </span>
    </div>
  );
};
export default ChartZoom;
