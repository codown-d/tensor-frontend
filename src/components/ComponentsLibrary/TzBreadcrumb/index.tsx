import Breadcrumb, { BreadcrumbProps } from 'antd/lib/breadcrumb';
import BreadcrumbItem, { BreadcrumbItemProps } from 'antd/lib/breadcrumb/BreadcrumbItem';
import React, { useMemo } from 'react';
import './index.less';
let { Item, Separator } = Breadcrumb;
interface TzBreadcrumbProps extends BreadcrumbProps {
  itemList: BreadcrumbItemProps[];
}
const TzBreadcrumb = (props: TzBreadcrumbProps) => {
  const { itemList, ...otherProps } = props;
  const realProps = useMemo(() => {
    return {
      ...otherProps,
      className: `tz-breadcrumb ${otherProps.className || ''}`,
      separator: <span className="delimiter">/</span>,
    };
  }, [otherProps]);
  return (
    <Breadcrumb {...realProps}>
      {itemList?.map((item, index) => {
        return <Item {...item} key={item.href + '_' + index} />;
      })}
    </Breadcrumb>
  );
};
export default TzBreadcrumb;
