import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TzButton } from '../../../components/tz-button';
import { TzTabs } from '../../../components/tz-tabs';
import ImageReject from '../../ImageReject';
import ImagesScannerScreen, { tabType } from '../ImagesScannerScreen';
import CI from './CI';
import './ImagesCILifeCycle.scss';
import { Routes } from '../../../Routes';
import { useLocation, useNavigate } from 'react-router-dom';
import { Store } from '../../../services/StoreService';
import { translations } from '../../../translations/translations';
import NodeImage from '../../MultiClusterRiskExplorer/ListComponent/NodeImage';
import ImagesScannerOverview from '../components/Image-scanner-overview/ImagesScannerOverview';
import { find, merge } from 'lodash';
import useNewSearchParams from '../../../helpers/useNewSearchParams';
import { useNavigatereFresh } from '../../../helpers/useNavigatereFresh';
import { useMemoizedFn } from 'ahooks';

export let tabsScroll = (t = '.top-tabs-scroll') => {
  setTimeout(() => {
    $('#layoutMain').scroll(function (event: any) {
      if ($('#layoutMain').scrollTop()) {
        $(t).addClass('tabs-scroll');
      } else {
        $(t).removeClass('tabs-scroll');
      }
    });
  }, 0);
};
let imageList = [
  { label: 'CI', key: tabType.ci, children: <CI /> },
  {
    label: translations.scanner_report_repoImage,
    key: tabType.registry,
    children: <ImagesScannerScreen />,
  },
  {
    label: 'CD',
    key: tabType.deploy,
    children: <ImageReject />,
  },
  {
    label: translations.nodeMirroring,
    key: tabType.node,
    children: (
      <div>
        <ImagesScannerOverview imageFromType={tabType.node} />
        <NodeImage />
      </div>
    ),
  },
];
const ImagesCILifeCycle = (props: any) => {
  const { allSearchParams, addSearchParams } = useNewSearchParams();
  const { tab: activeKey = tabType.registry } = allSearchParams;

  let dom = useMemo(() => {
    return find(imageList, (item) => item.key === activeKey)?.children;
  }, [activeKey]);
  let { jump } = useNavigatereFresh();
  const l = useLocation();
  const toImageConfig = useMemoizedFn(() => {
    jump(Routes.ImageConfig);
  });
  let setHeader = useCallback(() => {
    Store.header.next({
      title: translations.mirror_lifecycle,
      extra: (
        <TzButton icon={<i className={'icon iconfont icon-jingxiangsaomiao-peizhi'}></i>} onClick={toImageConfig}>
          {translations.scanner_images_setting}
        </TzButton>
      ),
      footer: (
        <TzTabs
          activeKey={activeKey}
          onChange={(val) => {
            addSearchParams({ tab: val });
            Store.pageFooter.next(null);
          }}
          items={imageList.map((item: any) => {
            return merge({}, item, { children: null });
          })}
        />
      ),
    });
  }, [activeKey, l]);
  useEffect(() => {
    setHeader();
  }, [setHeader]);
  return <div className="images-ci-life-cycle mt24 mlr32">{dom}</div>;
};

export default ImagesCILifeCycle;
