import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TzButton } from '../../components/tz-button';
import { TzTabPane, TzTabs } from '../../components/tz-tabs';
import { Routes } from '../../Routes';
import { Store } from '../../services/StoreService';
import CompliancwContainer from './CompliancwContainer';
import ClusterSelector from '../../screens/RiskExplorer/OnlineVulnerabilities/MultiOnlineVulnerSelector';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { tabsScroll } from '../ImagesScanner/ImagesCI/ImagesCILifeCycle';
import { capitalize } from 'lodash';
import { translations } from '../../translations/translations';
import { useAssetsClusterList } from '../../helpers/use_fun';
import useNewSearchParams from '../../helpers/useNewSearchParams';
import { useUpdateEffect } from 'ahooks';
const Compliance = () => {
  const navigate = useNavigate();
  const l = useLocation();
  const { allSearchParams, addSearchParams } = useNewSearchParams();
  const { pathname } = l;
  const { tab: activeKey = 'kube' } = allSearchParams;

  let historyDetail = useMemo(() => {
    return pathname === Routes.ComplianceHistoryInfo;
  }, [pathname]);

  let clusterList = useAssetsClusterList();
  // const { refreshScope } = useAliveController();
  let setHeader = useCallback(() => {
    if (!historyDetail) {
      let tabPaneTitle =
        clusterList.length != 0 ? capitalize(clusterList[0].platForm) : translations.orchestration_software;
      Store.header.next({
        title: (
          <div className={'flex-r-c'} style={{ justifyContent: 'flex-start' }}>
            <span>{translations.compliance_testing}</span>
            <ClusterSelector />
          </div>
        ),
        extra: (
          <>
            <TzButton
              className="mr16"
              icon={<i className="icon iconfont icon-jingxiangsaomiao-peizhi"></i>}
              onClick={() => {
                // refreshScope('ComplianceStrategicManagement');
                navigate(Routes.ComplianceStrategicManagement + `?scapType=${activeKey}`);
              }}
            >
              {translations.baseline_management}
            </TzButton>
            <TzButton
              icon={<i className="icon iconfont icon-jingxiangsaomiao-peizhi"></i>}
              onClick={() => {
                // refreshScope('ComplianceScanManagement');
                navigate(Routes.ComplianceScanManagement + `?scapType=${activeKey}`);
              }}
            >
              {translations.scanManagement}
            </TzButton>
          </>
        ),
        footer: (
          <>
            {historyDetail || clusterList.length === 0 ? null : (
              <TzTabs
                activeKey={activeKey}
                onChange={(val: any) => {
                  addSearchParams({ tab: val });
                  // setActiveKey(val);
                  // $('#layoutMain').scrollTop(0);
                }}
                items={[
                  { label: tabPaneTitle, key: 'kube', children: null },
                  { label: translations.runtime, key: 'docker', children: null },
                  { label: translations.host, key: 'host', children: null },
                ]}
              />
            )}
          </>
        ),
      });
    }
  }, [activeKey, historyDetail, clusterList, l]);
  useUpdateEffect(() => {
    setHeader();
  }, [setHeader]);

  // useActivate(() => {
  //   setHeader();
  // });
  useEffect(() => {
    tabsScroll();
  }, []);
  return (
    <div className={'compliance-whole mt24'}>
      <TzTabs
        activeKey={activeKey}
        destroyInactiveTabPane
        tabBarStyle={{ display: 'none' }}
        items={[
          { label: '', key: 'kube', children: <CompliancwContainer type={'kube'} /> },
          { label: '', key: 'docker', children: <CompliancwContainer type={'docker'} /> },
          { label: '', key: 'host', children: <CompliancwContainer type={'host'} /> },
        ]}
      />
    </div>
  );
};
export default Compliance;
