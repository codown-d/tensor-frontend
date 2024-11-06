import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import classNames from 'classnames';
import './OnlineVulnerabilitiesSearchPopup.scss';
import { TzTag } from '../../../components/tz-tag';
import { Store } from '../../../services/StoreService';
import { forkJoin } from 'rxjs';
import { getGraphAllTypeCount } from '../../../services/DataService';
import { finalize, tap } from 'rxjs/operators';
import { countkeys } from '../../../components/ComponentsLibrary/ChartTooltip/ChartInfoLoad';
import { Spin } from 'antd';
import { ScanSeverity } from '../../../definitions';
import { vulnerabilitiesSearch } from '../OnlineVulnerabilitiesGraphList/OnlineFilterHelper';
import { translations } from '../../../translations/translations';

interface IProps {
  children?: any;
  history?: any;
  items: any;
  pNumData?: any;
  searchKey: string;
  popupSelect: (id: string, ns: string) => void;
}

export const chartTagStyle: any = {
  Deployment: {
    title: 'Deployment',
    style: {
      color: '#6C7480',
      backgroundColor: 'rgba(33, 119, 209, 0.05)',
    },
  },
};

const getColor = (t: any) => {
  let color = '#fff';
  switch (t) {
    case ScanSeverity.Critical:
      color = 'rgba(158, 0, 0, 1)';
      break;

    case ScanSeverity.High:
      color = 'rgba(233, 84, 84, 1)';
      break;
    case ScanSeverity.Medium:
      color = 'rgba(255, 138, 52, 1)';
      break;
    case ScanSeverity.Low:
      color = 'rgba(255, 196, 35, 1)';
      break;
    case ScanSeverity.Negligible:
      color = 'rgba(171, 186, 209, 1)';
      break;
    case ScanSeverity.Unknown:
      color = 'rgba(184, 196, 217, 1)';
      break;
    case ScanSeverity.Safe:
      color = 'rgba(184, 196, 217, 1)';
      break;

    default:
      color = 'rgba(184, 196, 217, 1)';
      break;
  }
  return color;
};

const replaceSearch = (str: string, k: string) => {
  if (!str) return '';
  let rsl: any = str.replaceAll(k, '%$').split('%$');
  rsl = rsl.map((t: any, key: number) => {
    if (!key) return t;
    return (
      <>
        <span className="y-color">{k}</span>
        {t}
      </>
    );
  });
  return rsl;
};

let numObj: any = {};
let fnNum: number = 0;

const OnlineVulnerabilitiesSearchPopup = (props: IProps, ref?: any) => {
  const { items = [], pNumData = {}, searchKey } = props;
  const [isHover, setIsHover] = useState<boolean>(false);
  const [load, setLoad] = useState<boolean>(true);
  const [licenseMark, setLicenseMark] = useState<boolean>(false);

  const onOver = useCallback(() => {
    setIsHover(true);
  }, []);

  const onOut = useCallback(() => {
    setIsHover(false);
  }, []);

  const dataItems = useMemo(() => {
    if (items.length) {
      setLoad(false);
      fnNum = 0;
    }
    return vulnerabilitiesSearch(items, searchKey);
  }, [items.length, searchKey]);

  const statekey = useMemo(() => {
    if (!dataItems?.length || !searchKey) return null;
    return !isHover ? 'quick' : 'list';
  }, [isHover, dataItems, searchKey]);

  const cls = useMemo(() => {
    if (!statekey) return;
    return statekey === 'quick' ? 'quickCase' : 'listCase';
  }, [statekey]);

  const resourceCountFn = useCallback((obj, l) => {
    let countData: any = {
      images: { text: translations.clusterGraphList_images, count: 0 },
      containers: { text: translations.clusterGraphList_containers, count: 0 },
      pods: { text: translations.clusterGraphList_pods, count: 0 },
    };
    const { resourceName, resourceKind, namespace } = obj?.original;
    const typeKind = {
      cluster_key: Store.clusterID.value,
      namespace: namespace,
      resourceKind,
      resourceName,
    };
    forkJoin(
      countkeys.map((item) => {
        return getGraphAllTypeCount(item, typeKind);
      }),
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
          numObj[resourceName] = countData;
          fnNum += 1;
          if (fnNum === l) {
            setLoad(true);
          }
        }),
      )
      .subscribe();
  }, []);

  useEffect(() => {
    for (const i of dataItems) {
      resourceCountFn(i, dataItems.length);
    }
  }, [dataItems, resourceCountFn]);

  const aboutImageNumDom = useCallback((obj: any) => {
    const data = obj ? obj : {};
    return Object.values(data).map((t: any, k: number) => {
      return (
        <div className={classNames('tag-num-group', { 'append-dom': k < 2 })} style={{ flex: 1 }}>
          <span className="num">{t.count}</span>
          <span className="name">{t.text}</span>
        </div>
      );
    });
  }, []);

  const ContentDom = useMemo(() => {
    if (!searchKey) return null;
    if (!statekey) return statekey;
    if (!load) {
      return (
        <div className="loading-case">
          <Spin tip={translations.load} />
        </div>
      );
    }
    return statekey === 'list' ? (
      <>
        {dataItems.map((p: any) => {
          return (
            <>
              <div
                className="resource-case"
                onClick={() => {
                  props.popupSelect &&
                    props.popupSelect(p.original.resourceName, p.original.namespace);
                }}
              >
                <div
                  className={classNames('res-group')}
                  style={{
                    borderLeft: `4px solid ${getColor(p.original.finalSeverity)}`,
                    paddingLeft: '12px',
                  }}
                >
                  <div className="df dfac w100p">
                    <span className="head-txt">
                      {replaceSearch(p.original.resourceName, searchKey)}
                      &nbsp;&nbsp;
                      <TzTag
                        className={classNames('f14 detail-tz-small-tag')}
                        style={chartTagStyle['Deployment'].style}
                      >
                        {p.original.resourceKind}
                      </TzTag>
                    </span>
                  </div>
                  <div className="mt4 ns-txt mb4">
                    {translations.onlineVulnerability_outerShapeMeaning}：
                    {replaceSearch(p.original.namespace, searchKey)}
                  </div>
                </div>
                <div className="df dfac">{aboutImageNumDom(numObj?.[p.original.resourceName])}</div>
              </div>
            </>
          );
        })}
      </>
    ) : (
      <>{`${translations.popup_have} ${dataItems?.length}${translations.popup_res}`}</>
    );
  }, [statekey, dataItems, load, searchKey, props.popupSelect]);

  useEffect(() => {
    Store.licenseToast
      .pipe(
        tap((res) => {
          setLicenseMark(res);
        }),
      )
      .subscribe();
  }, []);

  useImperativeHandle(
    ref,
    () => {
      return {
        show() {},
        close() {
          numObj = {};
          fnNum = 0;
        },
        searchOver() {
          onOver();
        },
        searchOut() {
          onOut();
        },
      };
    },
    [onOver, onOut],
  );
  return (
    <>
      <div
        className={classNames('popup-posi-case')}
        style={{ top: licenseMark ? '54px' : '20px' }}
        onMouseEnter={onOver}
        onMouseLeave={onOut}
      >
        <div
          className={classNames('search-popup-group', cls)}
          style={{
            maxHeight: licenseMark ? 'calc(100vh - 116px)' : 'calc(100vh - 82px)',
          }}
        >
          {ContentDom}
        </div>
      </div>
    </>
  );
};

export default forwardRef(OnlineVulnerabilitiesSearchPopup);
