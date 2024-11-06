import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { TzTooltip } from '../../components/tz-tooltip';
import NoData from '../../components/noData/noData';
import CircleChart, { CircleChartDataItem } from '../../components/ChartLibrary/CircleChart';
import {
  ScanDiscoverStatistic,
  SeverityHistogramInfo,
  SupportedLangauges,
} from '../../definitions';
import { getVulnsStatistic, vulnsTopNImage } from '../../services/DataService';
import { localLang, translations } from '../../translations/translations';
import { leakProps } from '../ImagesScanner/components/Image-scanner-detail/ImagesScannerDetail';
import './imgeDiscoverChart.scss';
import { TzCard } from '../../components/tz-card';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { Routes } from '../../Routes';
import { useNavigate } from 'react-router-dom';
import { find, isEqual, keys, max, sum, values } from 'lodash';
import { useNavigatereFresh } from '../../helpers/useNavigatereFresh';
import { PageTitle } from '../ImagesScanner/ImagesCI/CI';

const Progressbars = (props: {
  detail: SeverityHistogramInfo;
  maxScore?: number;
  rowScore?: number;
  extra?: JSX.Element;
}) => {
  const { rowScore, maxScore, detail, extra } = props;
  const sections = useMemo(() => {
    const rowCount = sum(values(detail));
    return keys(detail)
      .map((dkey) => {
        let item = find(leakProps, (item) => dkey.toUpperCase() === item.type.toUpperCase());
        const title = item?.labe;
        const itemCount = (detail as any)[dkey] || 0;
        const percent = rowCount ? (itemCount / rowCount) * 100 : 0;
        return {
          fillColor: item?.color,
          title,
          percent,
          itemCount,
        };
      })
      .filter((item) => item.percent);
  }, [detail]);
  return (
    <div className="top5_barchart_item" style={{ width: '100%' }}>
      <div className="top5_barchart_section">
        {sections.map((sec) => {
          let { title, percent, fillColor, itemCount } = sec;
          return (
            <TzTooltip title={`${title} (${itemCount})`}>
              <div
                className={`top_section_item`}
                style={{
                  width: `${percent}%`,
                  backgroundColor: fillColor,
                }}
              ></div>
            </TzTooltip>
          );
        })}
        {extra}
      </div>
    </div>
  );
};

const Top5 = (props: { data: any[] }) => {
  const navigate = useNavigate();
  const { data } = props;
  let { jump } = useNavigatereFresh();
  const list = useMemo(() => {
    return data?.map((item, index) => {
      let severityHistogramInfo = Object.assign(
        {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          unknown: 0,
        },
        item.vulnStatic,
      );
      return (
        <div key={index} className="top5_item">
          <span
            className="top5_item_name txt-hide cursor-p btn-click"
            onClick={() => {
              jump(
                `${Routes.RegistryImagesDetailInfo}?imageUniqueID=${item.imageUniqueID}&imageFromType=${item.imageFromType}`,
                'RegistryImagesDetailInfo',
              );
            }}
          >
            <EllipsisPopover>{`${item.fullRepoName}:${item.tag}(${
              item.nodeHostname || item.registryName
            })`}</EllipsisPopover>
          </span>
          <div className="top5_item_chart_bar">
            <Progressbars detail={severityHistogramInfo} />
          </div>
        </div>
      );
    });
  }, [data]);
  return <div className="top5_list_box">{list}</div>;
};

const ImagesDiscoverChart = forwardRef((_: any, ref?: any) => {
  const [res, setres] = useState();
  let [clientRect, setClientRect] = useState({ width: 578, height: 243 });
  let [vulnsTopNImageData, setVulnsTopNImageData] = useState<any>([]);
  useEffect(() => {
    getVulnsStatistic().subscribe((res) => {
      let item = res.getItem();
      setres(item);
    });
    vulnsTopNImage({ topn: 5 }).subscribe((res) => {
      let items = res.getItems();
      setVulnsTopNImageData(items);
    });
  }, []);
  const chartData = useMemo(() => {
    if (!res) return null;
    let { severity, vulnTotal } = res;
    const data = ['critical', 'high', 'medium', 'low', 'unknown'].map((key: any) => {
      let item = find(leakProps, (item) => key.toUpperCase() === item.type.toUpperCase());
      const value = Number(severity[key]);
      const percent = vulnTotal > 0 ? ((value / vulnTotal) * 100).toFixed(2) : 0;
      let o: any = {
        critical: translations.critical_vulnerabilities,
        high: translations.high_severity_vulnerabilities,
        medium: translations.medium_risk_vulnerabilities,
        low: translations.low_vulnerabilities,
        unknown: translations.unknown_vulnerabilityC,
      };
      return {
        color: item?.color || 'rgba(233, 84, 84, 0.1)',
        name: `${o[key]} ${value} (${percent}%)`,
        percent: percent + '%',
        value: value,
      };
    });
    return {
      title: translations.imagesDiscover_discover_sec_count,
      total: vulnTotal,
      option: {
        color: data?.map((item) => item.color),
        series: [{ data }],
      },
    };
  }, [res]);
  return (
    <div
      className="vulnerabilities flex-r-c"
      style={{ width: '100%', background: '#fff', alignItems: 'flex-start' }}
    >
      <div
        className="vuln-chart"
        style={{
          width: 'calc( 50% - 24px)',
          height: 'calc(100% - 57px)',
        }}
      >
        <PageTitle title={translations.imagesDiscover_discover_chart_title} />
        <div
          className="mt16"
          style={{ height: '200px' }}
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
          <CircleChart {...clientRect} {...(chartData as any)} />
        </div>
      </div>
      <div
        style={{
          flex: 1,
        }}
      >
        <PageTitle title={translations.imagesDiscover_discover_top5_title} className="mb16" />
        {vulnsTopNImageData.length > 0 ? <Top5 data={vulnsTopNImageData} /> : <NoData />}
      </div>
    </div>
  );
});
export default ImagesDiscoverChart;
