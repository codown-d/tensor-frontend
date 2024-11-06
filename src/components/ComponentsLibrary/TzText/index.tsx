import React, { useMemo } from 'react';
import './index.scss';
import { Typography } from 'antd';
import { TextProps } from 'antd/lib/typography/Text';

const { Text } = Typography;
interface Props extends TextProps {
  children?: any;
}
const TSSpin = (props: Props) => {
  let { children, ...otherProps } = props;
  const realProps = useMemo(() => {
    return {
      ...otherProps,
    };
  }, [otherProps]);
  return <Text {...realProps}> {children}</Text>;
};
export default TSSpin;
