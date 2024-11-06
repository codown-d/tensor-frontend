import { Spin } from 'antd';
import classNames from 'classnames';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { chartTagStyle } from '../../../screens/RiskExplorer/OnlineVulnerabilitiesFilters/OnlineVulnerabilitiesDrawer';
import { getGraphAllTypeCount } from '../../../services/DataService';
import { Store } from '../../../services/StoreService';
import { translations } from '../../../translations/translations';
import { TzTag } from '../../tz-tag';
import TzSpin from '../TzSpin';
import './index.scss';

interface ChartInfoProps {
  tStyle: any;
  aStyle: any;
  tr?: number;
  ratio?: number;
  text: string;
  node: any;
  numData?: any;
  countFn?: (data?: any, node?: any) => void;
}

export const countkeys = ['images', 'containers', 'pods'];
export let countData: any = {
  images: { text: translations.clusterGraphList_images, count: 0 },
  containers: { text: translations.clusterGraphList_containers, count: 0 },
  pods: { text: translations.clusterGraphList_pods, count: 0 },
};

const bgColor: any = {
  Critical: {
    background: 'rgba(158, 0, 0, 0.1)',
  },
  High: {
    background: 'rgba(233, 84, 84, 0.1)',
  },
  Medium: {
    background: 'rgba(255, 152, 107, 0.1)',
  },
  Low: {
    background: 'rgba(255, 196, 35, 0.1)',
  },
  Negligible: {
    background: 'rgba(127, 142, 168, 0.1)',
  },
  None: {
    background: 'rgba(127, 142, 168, 0.1)',
  },
};

export const ChartInfoLoad = (props: ChartInfoProps) => {
  const ref = useRef<any>(null);

  const { tStyle, aStyle, text, node, numData, countFn, tr, ratio = 1 } = props;

  const orData = useMemo(() => {
    return node?.data?.original ? node?.data?.original : {};
  }, [node?.data?.original]);

  const [dts, das] = useMemo(() => {
    // const { top } = tStyle;
    // let dt = tStyle;
    // let da = aStyle;
    // if (tr && top < 0) {
    //   dt.top += 130 + tr * 2 + 10 / ratio;
    //   da.top += tr * 2 + 10 / ratio;
    //   da = Object.assign(da, bgColor[orData?.finalSeverity || 'None']);
    //   return [dt, da];
    // }
    return [tStyle, aStyle];
  }, [tStyle, aStyle, tr, ratio, orData]);

  const [loading, setLoading] = useState<boolean>(!numData);

  const resourceCountFn = useCallback(() => {
    if (!orData?.resourceName || numData) {
      return;
    }
    const { resourceName, resourceKind, namespace } = orData;
    const typeKind = {
      cluster_key: Store.clusterID.value,
      namespace: namespace,
      resourceKind,
      resourceName,
    };
    forkJoin(
      countkeys.map((item) => {
        return getGraphAllTypeCount(item, typeKind);
      })
    )
      .pipe(
        tap((res: any) => {
          res.map((t: any, k: number) => {
            const i = t.getItem();
            if (i) {
              countData[countkeys[k]].count = i.count;
            }
            return t;
          });
          setLoading(false);
          countFn && countFn(countData, node);
        })
      )
      .subscribe();
  }, [orData, numData, countFn, node]);

  useEffect(() => {
    resourceCountFn();
    return () => {
      countData = {
        images: { text: translations.clusterGraphList_images, count: 0 },
        containers: {
          text: translations.clusterGraphList_containers,
          count: 0,
        },
        pods: { text: translations.clusterGraphList_pods, count: 0 },
      };
    };
  }, [resourceCountFn]);

  const LoadDom = useMemo(() => {
    if (loading) {
      return (
        <div className="loading-case">
          <Spin tip={translations.load} />
        </div>
      );
    }
    const data = numData ? numData : countData;
    return Object.values(data).map((t: any, k: number) => {
      return (
        <div
          className={classNames('tag-num-group', { 'append-dom': k < 2 })}
          style={{ flex: 1 }}
        >
          <span className="num">{t.count}</span>
          <span className="name">{t.text}</span>
        </div>
      );
    });
  }, [loading, numData]);

  return (
    <>
      <div className="chart-info" style={dts} ref={ref}>
        <div
          className={classNames('res-group', { 'loading-respond': loading })}
          style={!!orData?.finalSeverity ? bgColor[orData?.finalSeverity] : {}}
        >
          <div className="df dfac w100p">
            <span className="head-txt">{orData?.resourceName}</span>
            <TzTag
              className={classNames('f14 detail-tz-small-tag')}
              style={chartTagStyle['Deployment'].style}
            >
              {orData?.resourceKind}
            </TzTag>
          </div>
          <span className="mt8 ns-txt">
            {translations.onlineVulnerability_outerShapeMeaning}：
            {orData?.namespace}
          </span>
        </div>
        <div className="df dfac">{LoadDom}</div>
      </div>
      <div className="arrow-block white" style={das}></div>
    </>
  );
};
export default ChartInfoLoad;
