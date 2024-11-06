import React, { useMemo } from 'react';
import './index.scss';
import { SupportedLangauges } from '../../../definitions';
import { localLang, translations } from '../../../translations/translations';
import { SpinProps } from 'antd/lib/spin';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons/lib/icons';
interface Props extends SpinProps {
  children?: any;
}

const TzSpin = (props: Props) => {
  const { children, ...otherProps } = props;
  const realProps = useMemo(() => {
    return {
      ...otherProps,
    };
  }, [otherProps]);
  return <Spin {...realProps}> {children}</Spin>;
};
export let TzSpinLoadingOutlined = (props: any) => {
  let { title } = props;
  const antIcon = (
    <>
      <LoadingOutlined />&nbsp;{title}
    </>
  );
  return (
    <p className={'tz-spin-loading-outlined'}>
      <TzSpin indicator={antIcon} tip={null}/>
    </p>
  );
};
export default TzSpin;
