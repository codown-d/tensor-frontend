import TextArea, { TextAreaProps } from 'antd/lib/input/TextArea';
import React, { useMemo } from 'react';
import './index.scss';

interface Props extends TextAreaProps {
  children?: any;
}
const TzTextArea = (props: Props) => {
  let { children, ...otherProps } = props;
  const realProps = useMemo(() => {
    return {
      ...otherProps,
      className:`tz-text-area ${props.className||''}`
    };
  }, [otherProps]);
  return <TextArea {...realProps}> {children}</TextArea>;
};
export default TzTextArea;
