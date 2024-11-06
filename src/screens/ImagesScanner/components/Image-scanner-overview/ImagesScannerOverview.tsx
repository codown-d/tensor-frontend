import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import NoData from '../../../../components/noData/noData';
import { translations } from '../../../../translations/translations';
import './ImagesScannerOverview.scss';
import { Overview } from '../../../../definitions';
import { TzCard } from '../../../../components/tz-card';
import { tabType } from '../../ImagesScannerScreen';
import { baseChartData } from '../../../ComplianceWhole/CompliancwContainer';
import { driftStatsTop, imagesOverview } from '../../../../services/DataService';
import { TzCol, TzRow } from '../../../../components/tz-row-col';
import { Top5, getMax } from '../../../DeflectDefense/component/Top5';
import { questionEnum } from '../ImagesScannerDataList';
import { PageTitle } from '../../ImagesCI/CI';
import { isEqual, merge, sum } from 'lodash';
import CircleChart from '../../../../components/ChartLibrary/CircleChart';
export let getType = (imageFromType: tabType) => {
  let o: any = {
    [questionEnum.exceptionVuln]: translations.vulnerable_images,
    [questionEnum.exceptionSensitive]: translations.mirror_sensitive_files,
    [questionEnum.exceptionMalware]: translations.image_Trojan_virus,
    [questionEnum.exceptionWebshell]: translations.image_webShell_exists,
    [questionEnum.exceptionPKG]: translations.image_compliant_software,
    [questionEnum.exceptionEnv]: translations.mirroring_exception_environment_variables,
  };
  if (imageFromType === tabType.deploy) {
    o = {
      ...o,
      ...{
        [questionEnum.untrusted]: translations.non_trusted_mirroring,
        [questionEnum.exceptionPkgLicense]: translations.image_software_license_allowed,
        [questionEnum.exceptionLicense]: translations.risk_license_references,
        [questionEnum.exceptionBoot]: translations.scanner_overview_privilegedBoot,
        [questionEnum.notInRegistry]: translations.non_warehouse_images,
        [questionEnum.notExitBaseImage]: translations.imageReject_baseimage_cfg_title,
        [questionEnum.imageNotScanned]: translations.image_not_scanned,
      },
    };
  } else if (imageFromType === tabType.registry) {
    o = {
      ...o,
      ...{
        [questionEnum.untrusted]: translations.non_trusted_mirroring,
        [questionEnum.exceptionPkgLicense]: translations.image_software_license_allowed,
        [questionEnum.exceptionLicense]: translations.risk_license_references,
        [questionEnum.exceptionBoot]: translations.scanner_overview_privilegedBoot,
      },
    };
  } else {
    o = {
      ...o,
      ...{
        [questionEnum.exceptionBoot]: translations.scanner_overview_privilegedBoot,
        [questionEnum.exceptionPkgLicense]: translations.image_software_license_allowed,
        [questionEnum.exceptionLicense]: translations.risk_license_references,
        [questionEnum.notInRegistry]: translations.non_warehouse_images,
      },
    };
  }
  return o;
};
const SafeChart = (props: { total: any; imageFromType: any }) => {
  let { total, imageFromType } = props;
  if (!total) return <NoData />;
  let o: any = getType(imageFromType);
  let max = 500;
  let data = Object.keys(o).map((it) => {
    max = max < total[it] ? total[it] : max;
    return {
      name: o[it],
      count: total[it],
    };
  });
  max = getMax(max);
  return (
    <TzRow className={'flex-r-c mt12'} gutter={32}>
      <TzCol span={12}>
        <Top5 data={data.slice(0, 5)} max={max} />
      </TzCol>
      <TzCol span={12}>
        <Top5 data={data.slice(5)} max={max} />
      </TzCol>
    </TzRow>
  );
};
const ImagesScannerOverview = (props: any) => {
  const { imageFromType } = props;
  const [res, setRes] = useState<any>();
  let [clientRect, setClientRect] = useState({ width: 578, height: 180 });
  const fetchFromServer = useCallback(() => {
    imagesOverview({ imageFromType }).subscribe((res) => {
      if (res.error) return;
      const item = res.getItem();
      setRes(item);
    });
  }, []);

  useEffect(() => {
    fetchFromServer();
  }, [fetchFromServer]);

  const data = useMemo(() => {
    if (!res) {
      return undefined;
    }
    return [
      {
        value: res.imageCount,
        name: translations.total_mirror,
        fillColor: baseChartData[Overview.typeNull].color,
      },
      {
        value: res.onlineCount || 0,
        name: translations.scanner_overview_typeOnline,
        fillColor: baseChartData[Overview.typeOnline].color,
      },
      {
        value: res.imageCount - res.onlineCount || 0,
        name: translations.scanner_overview_typeNotline,
        fillColor: baseChartData[Overview.typeNotline].color,
      },
    ];
  }, [res]);
  const chartData = useMemo(() => {
    if (!data) {
      return undefined;
    }
    return data?.slice(1);
  }, [data]);
  let option = useMemo(() => {
    let total = sum(chartData?.map((item) => item.value));
    return {
      color: chartData?.map((item) => item.fillColor),
      legend: {
        right: '16%',
      },
      series: [
        {
          center: ['40%', '50%'],
          label: { formatter: [`{a|${total}}`, `{b|${translations.sum}}`].join('\n') },
          data: chartData,
        },
      ],
    };
  }, [data]);
  return (
    <div className="images-overview" style={{ display: 'table' }}>
      <div className="overview-chart" style={{ display: 'table-cell' }}>
        <PageTitle title={translations.scanner_overview_imagetitles} />
        <div className="flex-r-c mt16 mb8" style={{ justifyContent: 'space-around ' }}>
          {data?.map((item) => {
            return (
              <div>
                <p className="num">{item.value}</p>
                <p className="text">{item.name}</p>
              </div>
            );
          })}
        </div>
        <div
          style={{ height: '180px' }}
          ref={(node) => {
            if (!node) return;
            setTimeout(() => {
              setClientRect((pre) => {
                let o = { width: $(node).width(), height: $(node).height() };
                return isEqual(pre, o) ? pre : o;
              });
            }, 0);
          }}
        >
          <CircleChart {...clientRect} option={option} />
        </div>
      </div>
      <div
        className="safe-chart"
        style={{ width: '60%', display: 'table-cell', paddingLeft: '24px' }}
      >
        <PageTitle title={translations.scanner_overview_safetitle} />
        <SafeChart total={res?.total} imageFromType={imageFromType} />
      </div>
    </div>
  );
};

export default ImagesScannerOverview;
