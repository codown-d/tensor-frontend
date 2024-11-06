import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import './index.scss';
import { TzTabs } from '../../../components/tz-tabs';
import { Store } from '../../../services/StoreService';
import { translations } from '../../../translations/translations';
import useNewSearchParams from '../../../helpers/useNewSearchParams';
import { find, merge } from 'lodash';
import { RepoManagement } from './RepoManagement';
import { KeyManagement } from './KeyManagement';
import { ImageScanConfig } from './ImageScanConfig';
import { BaseImageManagement } from './BaseImageManagement';
// import { useNavigate } from 'react-router';
// import { Routes } from '../../../Routes';
// import { useActivate } from 'react-activation';
// import { useNavigatereFresh } from '../../../helpers/useNavigatereFresh';
import { Webhooks } from './Webhooks';
// import { tabType } from '../ImagesScannerScreen';
import { useLocation } from 'react-router-dom';

const ImageConfig = (props: any) => {
  const { allSearchParams, addSearchParams } = useNewSearchParams();
  // let [tabKey, setTabKey] = useState(allSearchParams?.tab || 'scanConfiguration');
  const { tab: tabKey = 'scanConfiguration' } = allSearchParams;
  // const navigate = useNavigate();
  const l = useLocation();
  let tabItems = [
    {
      label: translations.scanConfiguration,
      key: 'scanConfiguration',
      children: <ImageScanConfig />,
    },
    {
      label: translations.scanner_config_repoManage,
      key: 'warehouseManagement',
      children: <RepoManagement />,
    },
    {
      label: translations.scanner_config_baseImage,
      key: 'baseImage',
      children: <BaseImageManagement />,
    },
    {
      label: translations.trusted_keys,
      key: 'trustedkey',
      children: <KeyManagement />,
    },
    {
      label: 'Webhooks',
      key: 'webhooks',
      children: <Webhooks />,
    },
  ];
  let dom = useMemo(() => {
    return find(tabItems, (item) => item.key === tabKey)?.children;
  }, [tabKey, l]);
  // let { jump } = useNavigatereFresh();
  let setHeader = () => {
    Store.header.next({
      title: translations.scanner_images_setting,
      // onBack: () => {
      //   jump(`${Routes.ImagesCILifeCycle}?tab=${tabType.registry}`);
      // },
      footer: (
        <TzTabs
          activeKey={tabKey}
          onChange={(val) => {
            addSearchParams({ tab: val });
            // setTabKey(val);
          }}
          items={tabItems.map((item) => {
            item['children'] = <></>;
            return item;
          })}
        />
      ),
    });
  };
  useEffect(() => {
    setHeader();
  }, [tabKey, l]);

  // useActivate(() => {
  //   setHeader();
  // });
  return <div className={'image-config mlr32 mt20'}>{dom}</div>;
};
export default ImageConfig;
