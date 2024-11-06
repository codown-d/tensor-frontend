import React, { cloneElement, useRef } from 'react';
import { TzFormItem } from '../../tz-form';

const FormItemWithToolTip = ({
  children,
  formItemProps,
  ...rest
}: {
  formItemProps?: any;
  className?: string;
  children: React.ReactElement;
}) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  return (
    <TzFormItem>
      <div className="tz-filter-form-item-value-tooltip">
        <div
          className="tz-filter-form-item-value-tooltip-content"
          ref={tooltipRef}
        ></div>
      </div>
      <TzFormItem {...formItemProps}>
        {cloneElement(children, { tooltipOver: tooltipRef.current, ...rest })}
      </TzFormItem>
    </TzFormItem>
  );
};

export default FormItemWithToolTip;
