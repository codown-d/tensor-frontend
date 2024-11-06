import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

interface IProps {
  time: number | string;
  customClassName: string;
  complyFn: () => void;
}

const CountDown = (props: IProps) => {
  const { time: t, customClassName, complyFn } = props;
  const [time, setTime] = useState(Number(t));

  useEffect(() => {
    const timerId = setInterval(() => {
      const t = time - 1;
      setTime(t);
    }, 1000);
    if (time === 0) {
      clearInterval(timerId);
      complyFn();
    }
    return () => {
      clearInterval(timerId);
    };
  }, [time, complyFn]);

  return <span className={classNames(customClassName)}>{time}</span>;
};

export default CountDown;
