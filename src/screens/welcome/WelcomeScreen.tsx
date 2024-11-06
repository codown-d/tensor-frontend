import React, { useEffect, useState, useRef, useCallback, useContext, useMemo } from 'react';
import './WelcomeScreen.scss';
import { translations } from '../../translations/translations';
import ImagesDiscoverChart from '../ImagesDiscover/imgeDiscoverChart';
import ImagesScannerOverview from '../ImagesScanner/components/Image-scanner-overview/ImagesScannerOverview';
import { OverView } from '../ImageReject';
import { Store } from '../../services/StoreService';
import ClusterSelector from '../RiskExplorer/OnlineVulnerabilities/MultiOnlineVulnerSelector';
import { tap } from 'rxjs/operators';
import { TzCard } from '../../components/tz-card';
import ComplianceChart from '../ComplianceWhole/ComplianceChart';
import { EventDataChart } from '../AlertCenter/EventData';
import moment from 'moment';
import GraphListNavi, { useAssetsModule } from '../../components/AssetModule/GraphListNavi';
import { useSearchParams } from 'react-router-dom';
import { PageTitle } from '../ImagesScanner/ImagesCI/CI';
import { tabType } from '../ImagesScanner/ImagesScannerScreen';
import { BatchLabelProvider } from '../../components/label-col';

function WelcomeScreen() {
  const detailComp = useRef<any>(null);
  const [clusterID, setClusterID] = useState<string>('');
  const filterOriginValues = useRef();
  const [eventDataChartQuery, setEventDataChartQuery] = useState<any>({
    severity: [],
    updatedAt: {
      start: moment().add(-24, 'h').valueOf(),
      end: moment().valueOf(),
    },
  });

  useEffect(() => {
    const sub = Store.clusterID
      .pipe(
        tap((clusterID: string) => {
          setClusterID(clusterID);
        }),
      )
      .subscribe();
    return () => {
      sub.unsubscribe();
    };
  }, []);
  const [result] = useSearchParams();
  let { moduleList } = useAssetsModule();
  useEffect(() => {
    const id = result.get('id');
    const ctab = result.get('ctab');

    if (!id) {
      return;
    }
    detailComp.current.showDetail({ id }, ctab);
  }, [result]);
  return (
    <>
      <div className={'mb4'}>
        <BatchLabelProvider>
          <GraphListNavi moduleList={moduleList} isHomePage={true} />
        </BatchLabelProvider>
      </div>
      <div className={'mb32 mt8'} style={{ overflow: 'hidden' }}>
        <EventDataChart
          filters={filterOriginValues.current}
          onChangeFilters={(values: any) => {
            filterOriginValues.current = values;
            setEventDataChartQuery({
              updatedAt: {
                start: moment(values.updatedAt[0]).valueOf(),
                end: moment(values.updatedAt[1]).valueOf(),
              },
            });
          }}
          query={eventDataChartQuery}
        />
      </div>
      <div className="welcome-screen">
        <div className="scanner-overview-wraper" style={{ position: 'relative', marginTop: '0' }}>
          <ImagesScannerOverview imageFromType={tabType.registry} />
        </div>
        <div className="scanner-overview-wraper" style={{ padding: '20px 0' }}>
          <ImagesDiscoverChart ref={detailComp} />
        </div>
        <div className="scanner-overview-wraper">
          <OverView />
        </div>
        <div style={{ margin: '24px 0 14px 0px', width: '400px' }}>
          <ClusterSelector />
        </div>
        <div className="scanner-overview-wraper">
          <div className="flex-r-s" style={{ justifyContent: 'space-around' }}>
            {[
              {
                title: translations.orchestration_software,
                props: { checkType: 'kube', clusterKey: clusterID },
              },
              {
                title: 'Docker',
                props: { checkType: 'docker', clusterKey: clusterID },
              },
              {
                title: translations.host,
                props: { checkType: 'host', clusterKey: clusterID },
              },
            ].map((item, index) => {
              let { title, props } = item;
              return (
                <div style={{ flex: 1 }} key={index}>
                  <PageTitle title={title} style={{ justifyContent: 'center' }} />
                  <ComplianceChart {...props} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default WelcomeScreen;
