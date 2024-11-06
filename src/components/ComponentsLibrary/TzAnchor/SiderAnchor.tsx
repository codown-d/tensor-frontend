import React, { useMemo } from 'react';
import './index.scss';
import { Affix, Anchor, AnchorLinkProps, AnchorProps } from 'antd';
import classNames from 'classnames';
import { useBoolean, useMemoizedFn, useSize } from 'ahooks';
import { TzTooltip } from '../../tz-tooltip';
import { translations } from '../../../translations/translations';
import { useAnchorItem } from '.';
const { Link } = Anchor;

interface TzAnchorLinkProps extends AnchorLinkProps {
  children?: TzAnchorLinkProps[];
}
export interface SiderAnchorProps extends AnchorProps {
  items: TzAnchorLinkProps[];
  showAnchorInk?: boolean;
  // 锚点菜单区域高度
  targetH?: number;
  // 页脚高度，有Footer情况
  offsetBottom?: number;
  wrapperClassName?: string;
}

const SiderAnchor = (props: SiderAnchorProps) => {
  const {
    className,
    items,
    showAnchorInk = false,
    onClick,
    targetH,
    offsetBottom = 0,
    wrapperClassName,
    ...rest
  } = props;

  const [isHidden, { toggle }] = useBoolean();

  let { getAnchorItem } = useAnchorItem();
  const createNestedLink = (options?: TzAnchorLinkProps[]): React.ReactNode =>
    Array.isArray(options)
      ? options.map((item: TzAnchorLinkProps, index) =>
          item.children?.length ? (
            createNestedLink(item.children)
          ) : (
            <Link {...item} className={item.href.slice(1)} key={index} />
          ),
        )
      : null;

  // 顶部栏上所有占有空间的高度
  const { height: licenseToastCaseH = 0 } = useSize(document.querySelector('.ant-alert-banner')) || {};
  const { height: headerH = 0 } = useSize(document.querySelector('.tz-header')) || {};
  const { height: dxHeaderH = 0 } = useSize(document.querySelector('#dxHeader')) || {};
  const pageHeaderH = dxHeaderH + headerH;

  const { height: bodyH = 0 } = useSize(document.body) || {};

  const anchorH = (targetH ?? bodyH - pageHeaderH) - offsetBottom;

  const key = pageHeaderH + licenseToastCaseH;

  const ot = pageHeaderH + 56;

  const realProps = useMemo(
    () => ({
      showInkInFixed: false,
      getContainer: () => document.getElementById('layoutMain') || document.body,
      offsetTop: ot, // 快捷导航内容占高56
      ...rest,
      style: { height: anchorH, ...rest.style },
      onClick: (e: any, link: any) => {
        e.preventDefault();
        onClick?.(e, link);
      },
      className: classNames('tz-anchor', className, {
        'no-anchor-ink': !showAnchorInk,
      }),
    }),
    [props, pageHeaderH, anchorH],
  );
  let newItems = useMemo(() => {
    return getAnchorItem(items);
  }, [items]);
  return (
    <div className={classNames('tz-anchor-wrapper', wrapperClassName, { hidden: isHidden })}>
      <Affix offsetTop={pageHeaderH + 8}>
        <div className="tz-anchor-tip">
          <span>{translations.quick_navigation}</span>
          <TzTooltip
            title={isHidden ? translations.expand_navigation : translations.collapse_navigation}
            placement="left"
          >
            <i onClick={toggle} className="icon iconfont icon-arrow-double" />
          </TzTooltip>
        </div>
      </Affix>
      <Anchor {...realProps} key={key}>
        {createNestedLink(newItems)}
      </Anchor>
    </div>
  );
};
export default SiderAnchor;
