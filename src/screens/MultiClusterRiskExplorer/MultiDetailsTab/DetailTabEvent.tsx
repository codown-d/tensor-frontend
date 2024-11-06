import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import AssetTopAction from '../../../components/AssetModule/TopActionBar';
import { TzCard } from '../../../components/tz-card';
import { translations } from '../../../translations/translations';
import AlertCenterScreen from '../../AlertCenter/AlertCenterScreen';
import './DetailTabEvent.scss';

interface IProps {
  children?: any;
  history?: any;
}

const DetailTabEvent = (props: IProps, ref?: any) => {
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
      <div className="detail-event-case">
        <AssetTopAction>
          <button className="btn-scan btn-left">{translations.kubeScan_scann}</button>
          <button className="btn-scan btn-right">{translations.scanner_images_setting}</button>
        </AssetTopAction>
        <div className="details-content-case">
          <TzCard
            headStyle={{ padding: 0 }}
            bodyStyle={{ paddingLeft: 0, paddingRight: 0 }}
            // title={<span className="subtitle">管理镜像</span>}
            className="detail-info-card initCard"
          >
            <AlertCenterScreen mark={'tab'}> </AlertCenterScreen>
          </TzCard>
        </div>
      </div>
    </>
  );
};

export default forwardRef(DetailTabEvent);
