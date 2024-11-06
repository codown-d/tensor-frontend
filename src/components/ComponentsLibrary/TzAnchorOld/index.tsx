import React, { useEffect, useMemo } from 'react';
import './index.scss';
import { Anchor, AnchorLinkProps, AnchorProps } from 'antd';
import { Store } from '../../../services/StoreService';
const { Link } = Anchor;

interface TzAnchorProps extends AnchorProps {
  itemList: AnchorLinkProps[];
  styleGroup?: any;
  styleCase?: any;
  isDrawer?: boolean;
  cID?: string;
}

const TzAnchorOld = (props: TzAnchorProps) => {
  const { itemList, styleGroup, styleCase, cID, ...otherProps } = props;
  const realProps = useMemo(() => {
    return {
      ...otherProps,
      targetOffset: otherProps.targetOffset || otherProps.offsetTop || 94 + 4,
      className: `tz-anchor-old ${otherProps.className || ''}`,
      getContainer: () => {
        let dom = cID ? $(cID).get()[0] : document.getElementById('layoutMain') || document.body;
        return dom;
      },
      onClick: (e: any, link: any) => {
        e.preventDefault();
        !props.onClick || props.onClick(e, link);
      },
    };
  }, [otherProps]);

  useEffect(() => {
    Store.pageHeaderSize.subscribe((val) => {
    });
  }, [Store.pageHeaderSize]);

  const _itemList = useMemo(() => {
    return itemList?.map((item, index) => {
      return <Link {...item} />;
    });
  }, [itemList]);

  const fstyle = useMemo(() => {
    return Object.assign(
      {},
      {
        width: '138px',
        marginRight: '20px',
        paddingTop: '4px',
        position: 'relative',
      },
      styleGroup,
    );
  }, [styleGroup]);
  const sstyle = useMemo(() => {
    return Object.assign(
      {},
      {
        borderRight: '1px solid #F4F6FA',
        width: '138px',
        height: '100vh',
        position: 'fixed',
      },
      styleCase,
    );
  }, [styleCase]);
  return (
    <div style={fstyle}>
      <div style={sstyle}>
        <Anchor {...realProps}> {_itemList}</Anchor>
      </div>
    </div>
  );
};
export default TzAnchorOld;
