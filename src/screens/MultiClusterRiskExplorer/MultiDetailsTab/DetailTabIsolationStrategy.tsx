import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { TzCard } from '../../../components/tz-card';
import AssetTopAction from '../../../components/AssetModule/TopActionBar';
import { translations } from '../../../translations/translations';

interface IProps {
  children?: any;
  history?: any;
}

const DetailTabIsolationStrategy = (props: IProps, ref?: any) => {
  useEffect(() => {}, []);

  useImperativeHandle(
    ref,
    () => {
      return {
        show() {},
      };
    },
    []
  );
  return (
    <>
      <div className="detail-isolationStrategy-case">
        <AssetTopAction>
          <button className="btn-scan">{translations.scanner_scanAll}</button>
        </AssetTopAction>
        <div className="details-content-case">
          <TzCard
            headStyle={{ padding: 0 }}
            bodyStyle={{ paddingLeft: 0, paddingRight: 0 }}
            // title={<span className="subtitle">管理镜像</span>}
            className="detail-info-card initCard"
          >
            {translations.inoutTraffic}
          </TzCard>
        </div>
      </div>
    </>
  );
};

export default forwardRef(DetailTabIsolationStrategy);
