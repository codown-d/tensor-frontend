import Button, { ButtonProps } from 'antd/lib/button';
import classNames from 'classnames';
import React, { useMemo } from 'react';
import { translations } from '../../translations/translations';
import './index.scss';

interface TzButtonProps extends ButtonProps {
}

export const TzButton = (props: TzButtonProps) => {
  let { type='default',children } = props;
  const realProps = useMemo(() => {
    return {
      ...props,
      className: classNames('tz-button', props.className,{'cancel-btn':type!='text'&&(translations.cancel===children)}),
      type
    };
  }, [props]);
  return <Button {...realProps} />;
};
