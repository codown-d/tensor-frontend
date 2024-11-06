import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from 'react';
import classNames from 'classnames';
import './TopActionBar.scss';
import { RenderTag, TzTag } from '../tz-tag';
import { translations } from '../../translations/translations';
interface TopActionBarProps {
  type: string;
  title: string;
  tag: string;
  statusType?: string;
}

const NewTopActionBar = (props: TopActionBarProps, ref?: any) => {
  const { type = '', title = '', tag = '', statusType = null } = props;

  const [colorModel, setColorModel] = useState('light');

  const fetchData = useCallback(() => {}, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    <div className={classNames('top-action-case')}>
      <div className="left-tit-case">
        {title && <span className="nstext">{title}</span>}
        {tag && <TzTag className="tag ant-tag-gray">{tag}</TzTag>}
        {statusType && <RenderTag type={statusType} />}
      </div>
    </div>
  );
};

export default forwardRef(NewTopActionBar);
