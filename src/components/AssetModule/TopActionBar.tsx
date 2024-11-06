import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from 'react';
import { tap } from 'rxjs/operators';
import classNames from 'classnames';
import './TopActionBar.scss';
import { translations } from '../../translations/translations';
import { TzTag } from '../tz-tag';

const AssetTopAction = (props?: any, ref?: any) => {
  const {
    tagTitle = '',
    nsTxt = '',
    replicaSet = '',
    activated = '',
    children,
    classNameChild = 'df dfac',
  } = props;

  const [colorModel, setColorModel] = useState('light');

  const fetchData = useCallback(() => {}, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tagTxt = useMemo(() => {
    switch (tagTitle) {
      case 'web':
      case 'database':
      case 'resource':
        return translations.resources;
      case 'namespace':
        return translations.clusterGraphList_namespace;
      case 'node':
        return translations.clusterGraphList_node;
      case 'container':
        return translations.clusterGraphList_container;
      default:
        return translations.resources;
    }
  }, [tagTitle]);

  const activatedTxt = useMemo(() => {
    switch (activated) {
      case '0':
        return translations.clusterGraphList_on;
      case '1':
        return translations.clusterGraphList_off;
      case '2':
        return translations.clusterGraphList_noReady;
      default:
        return;
    }
  }, [activated]);

  const activeColorCls = useMemo(() => {
    let style = {};
    switch (activated) {
      case '0':
        style = {
          color: 'rgba(33, 119, 209, 1)',
          background: 'rgba(33, 119, 209, 0.05)',
        };
        return style;
      case '1':
        style = {
          color: 'rgba(152, 166, 190, 1)',
          background: 'rgba(152, 166, 190, 0.05)',
        };
        return style;
      case '2':
        style = {
          color: 'rgba(152, 166, 190, 1)',
          background: 'rgba(152, 166, 190, 0.05)',
        };
        return style;
      default:
        return style;
    }
  }, [activated]);

  useImperativeHandle(
    ref,
    () => {
      return {
        show() {},
        changeColor() {
          const _color = colorModel === 'light' ? 'dark' : 'light';
          setColorModel(_color);
        },
      };
    },
    [colorModel],
  );

  return (
    <div className={classNames('df dfac top-action-case', colorModel)}>
      <div className="left-tit-case">
        {nsTxt && <span className="nstext">{nsTxt}</span>}
        {replicaSet && <span className="tag ant-tag-gray">{replicaSet}</span>}
        {activated && (
          <>
            {/* <span className={`tag${activeColorCls}`}>{activatedTxt}</span> */}
            <TzTag className={'f14'} style={activeColorCls}>
              {activatedTxt}
            </TzTag>
          </>
        )}
      </div>
      {children && (
        <div className={classNames('right-fun-case noScrollbar', classNameChild)}>{children}</div>
      )}
    </div>
  );
};

export default forwardRef(AssetTopAction);
