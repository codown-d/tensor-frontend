import React, { useMemo } from 'react';
import { DealData } from '../../../screens/AlertCenter/AlertRulersScreens';
import { localLang } from '../../../translations/translations';
import { EllipsisPopover } from '../../ellipsisPopover/ellipsisPopover';
import { TzCol, TzRow } from '../../tz-row-col';
import './ArtTemplateDataInfo.scss';
import { RowProps } from 'antd';
import { isArray } from 'lodash';
import { TzTag } from '../../tz-tag';
interface ArtTemplateDataInfoProps {
  data: DealData[];
  className?: any;
  span?: number;
  style?: React.CSSProperties;
  rowProps?: RowProps;
}
export let renderTagItem = (list: React.ReactNode[], o: DealData) => {
  o['className'] = `flex-r-c dfas ${list?.length ? 'mb12' : ''}`;
  o['renderTitle'] = ({ title }: any) => {
    return list?.length ? <span style={{ lineHeight: '28px' }}>{title}</span> : title;
  };
  o['render'] = () => {
    return (
      <div>
        {list?.length
          ? list?.map((item: any) => {
              return <TzTag className="mb8">{item}</TzTag>;
            })
          : '-'}
      </div>
    );
  };
  return o;
};
const ArtTemplateDataInfo = (props: ArtTemplateDataInfoProps) => {
  let { data = [], className, span = 2, rowProps } = props;
  let realProps = useMemo(() => {
    return {
      className: `art-template art-template-span${span} ${className || ''} ${
        localLang === 'en' ? 'wautoEN' : 'wautoZN'
      }`,
      style: props?.style,
    };
  }, [props]);
  return (
    <>
      <div {...realProps}>
        <TzRow className={'flex-r flex-wrap'} gutter={[48, 0]} style={{ width: '100%', margin: 0 }} {...rowProps}>
          {data.map((item, index) => {
            return (
              <TzCol
                className={`flex-r flex-item ${item?.className || ''}`}
                style={{
                  width: `${(1 / span) * 100}%`,
                  alignItems: span === 1 ? 'flex-start' : 'center',
                  ...(item.titleStyle ?? {}),
                }}
                key={index}
              >
                <div className={'art-template-title'}>
                  {item?.renderTitle ? (
                    item.renderTitle(item)
                  ) : (
                    //解决苹果英文环境行高默认错误问题
                    <EllipsisPopover style={{ float: 'left' }}>{item.title}</EllipsisPopover>
                  )}
                </div>
                <div className={'art-template-content'}>
                  {item?.render ? (
                    item.render(item)
                  ) : (
                    <EllipsisPopover>
                      {!item?.content || (isArray(item.content) && item.content.length == 0) ? '-' : item.content}
                    </EllipsisPopover>
                  )}
                </div>
              </TzCol>
            );
          })}
        </TzRow>
      </div>
    </>
  );
};
export default ArtTemplateDataInfo;
