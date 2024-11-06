import Form, { FormItemProps, FormProps } from 'antd/lib/form';
import React, { useMemo } from 'react';
import composeProps from 'rc-util/es/composeProps';
import './index.scss';
import { merge, trim } from 'lodash';
import { translations } from '../../translations/translations';
import { PageTitle } from '../../screens/ImagesScanner/ImagesCI/CI';

export const TzForm = (props: FormProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-form ${props.className || ''}`,
      labelAlign: props.labelAlign || 'left',
      layout: props.layout || 'vertical',
    };
  }, [props]);
  return <Form {...realProps} />;
};

export const TzFormItem = (props: FormItemProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-form-item ${props.className || ''}`,
    };
  }, [props]);
  let label = useMemo(() => {
    if (realProps.label) {
      if (typeof realProps.label === 'string' && trim(realProps.label) != '') {
        return realProps.label.indexOf(':') == -1 && realProps.label.indexOf('：') == -1
          ? realProps.label + '：'
          : realProps.label;
      } else {
        return realProps.label;
      }
    } else {
      return null;
    }
  }, [realProps]);
  return <Form.Item {...realProps} label={label} />;
};

interface MyFormItemProps extends FormItemProps {
  render?: (children: React.ReactNode) => React.ReactElement;
}
interface MyFormItemChildrenProps {
  render?: MyFormItemProps['render'];
  children: React.ReactElement;
}
function MyFormItemChildren(props: MyFormItemChildrenProps) {
  const { render, children, ...rest } = props;
  // composeProps 合并执行 Form.Item 传的 onChange 以及组件本身的方法
  const _children = React.cloneElement(children, composeProps(children.props, rest, true));
  if (render) {
    return render(_children);
  }
  return _children;
}
export function MyFormItem(props: MyFormItemProps) {
  const { render, children, style, ...rest } = props;
  return (
    <Form.Item {...rest} style={merge({ color: '#3E4653' }, style)}>
      {React.isValidElement(children) ? (
        <MyFormItemChildren render={render}>{children}</MyFormItemChildren>
      ) : (
        children
      )}
    </Form.Item>
  );
}
export function TzFormItemLabelTip(props: { label: any; tip: any; className?: string }) {
  let { label, tip, className } = props;
  return (
    <div style={{ color: '#3e4653' }} className={`mb24 flex-c ${className}`}>
      <span>{label}</span>
      <span className={'form-item-label-tip mt8 '}>{tip}</span>
    </div>
  );
}
export function TzFormItemDivider() {
  return <div className={'form-item-divider'}></div>;
}
export function TzFormItemsSubTit(props: {
  title?: string | undefined;
  errorInfo?: string | undefined;
  className?: string;
}) {
  let { title = translations.rule_conditions, errorInfo, className = '' } = props;
  return (
    <h2 className={`sub-tit mb12 error-info f14 fw550 ${className}`}>
      {title}
      {errorInfo ? <span className="f12 ml12 fw500">*{errorInfo}</span> : null}
    </h2>
  );
}
