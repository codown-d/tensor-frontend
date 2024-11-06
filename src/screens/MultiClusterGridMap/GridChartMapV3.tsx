import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { MicroMapDetails, WebResponse } from '../../definitions';
import { translations } from '../../translations/translations';
import './GridChartMap.scss';
import { getContainerGraphList, getProcessList, podsByOwner } from '../../services/DataService';
import { TzTabs } from '../../components/tz-tabs';
import { TopologyHeadDom } from './components/TopologyHeadDom';
import { useMemoizedFn, useSize } from 'ahooks';
import { BtnTypeDom } from './components/BtnTypeDom';
import GridChartMap from './GridChartMap';
import TableScreen from './components/TableScreen';
import { getUid } from '../../helpers/until';
import { useTopologyData } from './components/use_fn';
interface GridDetailsProps {
  detailParams: MicroMapDetails;
  type: 'resource' | 'pod' | 'container' | 'process';
}
const GridDetailsV3 = (props: GridDetailsProps) => {
  let { type } = props;
  const [checkType, setCheckType] = useState<'resource' | 'pod' | 'container' | 'process'>(type);
  const [selTime, setSelTime] = useState<'1' | '7' | '30'>('7');
  const [activeKey, setdActiveKey] = useState<'ingress' | 'egress'>('ingress');
  let [pod, setPod] = useState<any[]>([]);
  let [process, setProcess] = useState<any[]>([]);
  let [container, setContainer] = useState<any[]>([]);
  let { getResourceStreamFn, getPodStreamFn, getContainerStreamFn, getProcessStreamFn, data } = useTopologyData();
  let prams = useMemo(() => {
    const { Cluster, Namespace, Kind, Resource, pod_name, container_name, container_id, k8sManaged } =
      props.detailParams;
    return {
      cluster_key: Cluster,
      namespace: Namespace,
      res_kind: Kind,
      res_name: Resource,
      resource_kind: Kind,
      resource_name: Resource,
      clusterKey: Cluster,
      pod_name,
      container_name,
      container_id,
      k8sManaged,
    };
  }, [props.detailParams]);
  let getPod = useMemoizedFn(() => {
    if (type === 'resource') {
      podsByOwner({
        ...prams,
        limit: 10000,
        offset: 0,
      }).subscribe((res) => {
        if (res.error) return;
        let items = res.getItems().map((item) => {
          item['id'] = 'pod_' + getUid();
          item['topology_name'] = item.PodName;
          return item;
        });
        setPod(items);
      });
    } else if (type === 'pod') {
      setPod([{ ...prams, id: 'pod_' + getUid(), topology_name: prams.pod_name }]);
    }
  });

  let getContainer = useMemoizedFn(() => {
    if (type == 'resource' || type == 'pod') {
      getContainerGraphList({
        ...prams,
        offset: 0,
        limit: 1000,
        status: '0&status=1',
      }).subscribe((res) => {
        if (res.error) return;
        let items = res.getItems().map((item) => {
          let container_id = item.id;
          item['id'] = 'container_' + getUid();
          item['topology_name'] = item.name;
          item['container_id'] = container_id;
          return item;
        });
        setContainer(items);
      });
    } else if (type === 'container') {
      setContainer([{ ...prams, id: 'container_' + getUid(), topology_name: prams.container_name }]);
    }
  });
  let getProcess = useMemoizedFn(() => {
    getProcessList(prams).subscribe((res) => {
      if (res.error) return;
      let items = res.getItems().map((item) => {
        item['id'] = 'process_' + getUid();
        item['topology_name'] = item.process_name;
        return item;
      });
      setProcess(items);
    });
  });
  useEffect(() => {
    getPod();
    getProcess();
    getContainer();
  }, [type, props.detailParams]);
  useEffect(() => {
    switch (checkType) {
      case 'resource':
        getResourceStreamFn(prams, selTime, [
          {
            ...prams,
            id: 'resource_' + getUid(),
            topology_name: prams.resource_name,
          },
        ]);
        break;
      case 'pod':
        getPodStreamFn(prams, selTime, pod);
        break;
      case 'container':
        getContainerStreamFn(prams, selTime, container);
        break;
      case 'process':
        getProcessStreamFn(prams, selTime, process);
        break;
    }
  }, [checkType, selTime, pod, process, container, prams]);
  const detailCaseWrap = useRef(null);
  const size = useSize(detailCaseWrap);
  const [gWidth, gHeight] = useMemo(() => {
    let width = size?.width || 1000;
    return [width * 0.45, width * 0.45 * 0.95];
  }, [size]);
  let dataSource = useMemo(() => {
    return data[checkType][activeKey]?.['nodes']
      .filter((item: any) => item.type !== 'original')
      .map((item: any) => {
        let { originData, id, name } = item;
        return { ...originData, id, name };
      });
  }, [data, checkType, activeKey]);
  let getGridChartData = useMemo(() => {
    return data[checkType][activeKey];
  }, [data, activeKey, checkType]);
  let tableScreenRef = useRef<any>();
  let gridChartRef = useRef<any>();
  const DomV2 = useMemo(() => {
    return (
      <>
        <GridChartMap
          ref={gridChartRef}
          width={gWidth}
          height={gHeight}
          data={getGridChartData}
          onfocus={(id) => {
            tableScreenRef.current?.setNodeAct(id);
          }}
        />
        <div className="control-bar-case">
          <BtnTypeDom
            type={type}
            onChange={(t: any) => {
              setCheckType(t);
            }}
          />
        </div>
      </>
    );
  }, [gWidth, gHeight, getGridChartData, props.type]);
  return (
    <div
      className="map-chart-risk-detail-case-wrap"
      ref={detailCaseWrap}
      style={{ height: `${gHeight}px`, position: 'relative' }}
    >
      <div style={{ position: 'absolute', top: '-43px', right: '22px' }}>
        <TopologyHeadDom onChange={setSelTime} />
      </div>
      <div className="map-chart-risk-detail-case">
        <div
          className="force-case mr20"
          style={{
            width: `${gWidth}px`,
          }}
        >
          {DomV2}
        </div>

        <div className="tablesGroup" style={{ flex: 1, width: 0 }}>
          <TzTabs
            activeKey={activeKey}
            className="tab-ml0"
            onChange={(val: any) => setdActiveKey(val)}
            items={[
              {
                label: `${translations.chart_map_ingress}(${data?.[checkType]['ingress']?.['edges']?.length || 0})`,
                key: `ingress`,
                children: null,
              },
              {
                label: `${translations.chart_map_egress}(${data?.[checkType]['egress']?.['edges']?.length || 0})`,
                key: `egress`,
                children: null,
              },
            ]}
          />
          <div style={{ height: 'calc(100% - 50px)' }}>
            <TableScreen
              dataSource={dataSource}
              type={checkType}
              activeKey={activeKey}
              ref={tableScreenRef}
              onActItem={(id) => {
                gridChartRef.current.setNodeAct(id);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default forwardRef(GridDetailsV3);
