import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from 'react';
import { finalize, tap } from 'rxjs/operators';
import classNames from 'classnames';
import './GraphListSpace.scss';
import { TzSpace } from '../tz-space';
import { Resources } from '../../Resources';
import EllipsisPopover from '../ellipsisPopover/ellipsisPopover';
import { WebResponse } from '../../definitions';
import {
  getApisCount,
  getGraphAllTypeCount,
  getListClusters,
  getResourceCount,
} from '../../services/DataService';
import { translations } from '../../translations/translations';
import { deepClone } from '../../helpers/until';

const mockData = [
  {
    num: 0,
    cls: 'cluster',
    img: Resources.GraphCluster,
    imgDes: 'cluster',
    txt: translations.clusterGraphList_clusters,
  },
  {
    num: 0,
    cls: 'namespace',
    img: Resources.GraphNamespace,
    imgDes: 'namespace',
    txt: translations.clusterGraphList_namespaces,
  },
  {
    num: 0,
    cls: 'resources',
    color:
      'linear-gradient(270deg, rgba(110, 101, 255, 0.85) 0.53%, #6E65FF 100%)',
    img: Resources.GraphResource,
    imgDes: 'resources',
    txt: translations.clusterGraphList_resources,
  },
  {
    num: 0,
    cls: 'node',
    color:
      'linear-gradient(270deg, rgba(217, 107, 250, 0.85) 0%, #D96BFA 100%)',
    img: Resources.GraphNode,
    imgDes: 'node',
    txt: translations.clusterGraphList_nodes,
  },
  {
    num: 0,
    cls: 'container',
    color: 'linear-gradient(270deg, rgba(45, 148, 255, 0.85) 0%, #2D94FF 100%)',
    img: Resources.GraphContainer,
    imgDes: 'container',
    txt: translations.clusterGraphList_container,
  },
  {
    num: '0',
    cls: 'pod',
    color:
      'linear-gradient(270deg, rgba(255, 127, 138, 0.85) 0%, #FF7F8A 100%)',
    img: Resources.GraphPod,
    imgDes: 'pod',
    txt: translations.clusterGraphList_pods,
  },
  {
    num: 0,
    cls: 'api',
    color: 'linear-gradient(270deg, rgba(255, 163, 123, 0.85) 0%, #FFA37B 20%)',
    img: Resources.GraphApi,
    imgDes: 'API',
    txt: translations.clusterGraphList_num,
  },
];

const GraphListSpace = (props?: any, ref?: any) => {
  const [overviewData, setOverviewData] = useState<any[]>(deepClone(mockData));

  const setItme = useCallback(
    (iKey: number, item: number) => {
      const items = overviewData.slice(0);
      item > 0 ? (items[iKey].num = item) : (items[iKey].num = '0');
      if (iKey === 5) {
      }
      setOverviewData(items);
    },
    [overviewData]
  );

  const mapFatchTypeCount = useCallback((type: string, iKey: number) => {
    getGraphAllTypeCount(type)
      .pipe(
        tap((res: WebResponse<any>) => {
          const item = res.getItem();
          if (item) {
            setItme(iKey, item.count);
          }
        })
      )
      .subscribe();
  }, []);

  const fetchData = useCallback(() => {
    const typeList = [
      { type: 'namespaces', ikey: 1 },
      { type: 'resources', ikey: 2 },
      { type: 'nodes', ikey: 3 },
      { type: 'rawContainers', ikey: 4 },
      { type: 'pods', ikey: 5 },
    ];
    typeList.map((t) => {
      mapFatchTypeCount(t.type, t.ikey);
      return t;
    });
  }, []);

  useEffect(() => {
    // 获取集群总数。接口是分页的，一般不会超过100个集群
    getListClusters({ offset: 0, limit: 100 })
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.data?.totalItems;
          setItme(0, items || 0);
        })
      )
      .subscribe();
    // 获取api总数
    // getApisCount()
    //   .pipe(
    //     tap((res: WebResponse<any>) => {
    //       const node = res.getItem();
    //       setItme(5, node.count);
    //     })
    //   )
    //   .subscribe();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const SpaceItems = useMemo(() => {
    return overviewData.map((t) => {
      return (
        <div
          className={`space-item-case ${t.cls}`}
          // style={{ background: t.color }}
          key={t.imgDes}
        >
          <div className="df dfjc dfdc txt-case">
            <span className="num-txt">
              {/* <EllipsisPopover>{t.num}</EllipsisPopover> */}
              {t.num}
            </span>
            <span className="des-txt">
              <EllipsisPopover>{t.txt}</EllipsisPopover>
            </span>
          </div>
          <div className="img-case">
            <img alt={t.imgDes} src={t.img} />
          </div>
        </div>
      );
    });
  }, [overviewData]);

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
      <div
        className={classNames(
          'graph-space-case',
          'noScrollbar',
          props.className
        )}
      >
        <TzSpace align="center" size={[16, 16]} wrap={false}>
          {SpaceItems}
        </TzSpace>
      </div>
    </>
  );
};

export default forwardRef(GraphListSpace);
