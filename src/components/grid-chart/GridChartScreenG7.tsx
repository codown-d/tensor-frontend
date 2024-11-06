/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import './GridChartScreen.scss';
// import { data as mockData } from './GridData';
import { addItems, dealData, deleteItems } from './GridHelper';
// import { cloneDeep } from 'lodash';
import { Slider } from 'antd';
import { isEqual } from 'lodash';
import { useMemoizedFn, useUpdateEffect } from 'ahooks';
import G6 from '@antv/g6';

interface History {
  [t: number]: {
    up: { isClicked: boolean; data: string[] };
    down: { isClicked: boolean; data: string[] };
  };
}

let allParameters: any = {
  default: {
    graph: null,
    root: { nodes: [], edges: [] },
    focus: null,
    initdata: [],
  },
};

let graph: any = null,
  root: any = { nodes: [], edges: [] },
  focus: any = null;
let initdata: any[] = [];

interface IProps {
  width: number;
  height: number;
  data?: any;
  select: Function;
  linksArr?: any;
  selectedNode: string[];
  initFnSel?: Function;
  type: string;
  linekey?: string;
  objKey?: string | undefined;
  linkObj: any;
  loading?: boolean;
}

const cleanInitData = (objKey: string) => {
  Reflect.deleteProperty(allParameters, objKey);
};

const lineStyleColor = (lkey?: any, objKey: string = 'default') => {
  let sources = allParameters[objKey].initdata.map((l: any) => l.id);
  if (!sources?.length) return;
  allParameters[objKey].root.edges = allParameters[objKey].root.edges.map((edge: any) => {
    let k = lkey === 'ingressTab' ? edge.target : edge.source;
    edge?.['style'] || (edge['style'] = {});
    edge?.['style']?.['endArrow'] || (edge['style']['endArrow'] = {});
    if (sources.includes(k)) {
      edge.style.endArrow = {
        path: G6.Arrow.triangle(10, 10, 8),
        fill: 'rgba(33, 119, 209, 1)',
        stroke: 'rgba(33, 119, 209 ,0)',
        d: 10,
      };
      edge.style.stroke = 'rgba(33, 119, 209, 1)';
      edge.style.strokeOpacity = 1;
    } else {
      edge.style.endArrow = {
        path: G6.Arrow.triangle(10, 10, 8),
        fill: 'rgba(33, 119, 209, 1)',
        stroke: 'rgba(33, 119, 209, 0)',
        d: 10,
      };
      // edge.style.stroke = 'rgba(231, 233, 237, 1)';
      edge.style.stroke = 'rgba(33, 119, 209, 1)';
      edge.style.strokeOpacity = 0.05;
    }
    edge.style.lineWidth = 1;
    return edge;
  });
  allParameters[objKey].graph.changeData(allParameters[objKey].root);
};

const lineDisableStyleColor = (lkey?: any, objKey: string = 'default', selectedList: any[] = []) => {
  let sources = allParameters[objKey].initdata.map((l: any) => l.id);
  if (!sources?.length) return;
  allParameters[objKey].root.edges = allParameters[objKey].root.edges.map((edge: any) => {
    let k = lkey === 'ingressTab' ? edge.target : edge.source;
    edge?.['style'] || (edge['style'] = {});
    edge?.['style']?.['endArrow'] || (edge['style']['endArrow'] = {});
    if (sources.includes(k)) {
      edge.style.endArrow.fill = 'rgb(33, 119, 209)';
      edge.style.endArrow.stroke = 'rgb(33, 119, 209)';
      edge.style.stroke = 'rgba(33, 119, 209, 1)';
    } else {
      edge.style.endArrow.fill = 'rgba(231, 233, 237, 1)';
      edge.style.endArrow.stroke = 'rgba(231, 233, 237, 1)';
      edge.style.stroke = 'rgba(231, 233, 237, 1)';
    }
    edge.style.strokeOpacity = 0;
    edge.style.lineWidth = 1;
    return edge;
  });
  allParameters[objKey].root.edges = allParameters[objKey].root.edges.map((edge: any) => {
    let k = lkey === 'ingressTab' ? edge.target : edge.source;
    let e = lkey === 'ingressTab' ? edge.source : edge.target;
    edge?.['style'] || (edge['style'] = {});
    edge?.['style']?.['endArrow'] || (edge['style']['endArrow'] = {});
    if (sources.includes(k) && selectedList.includes(e)) {
      edge.style.endArrow.fill = 'rgb(33, 119, 209)';
      edge.style.endArrow.stroke = 'rgb(33, 119, 209)';
      edge.style.stroke = 'rgba(33, 119, 209, 1)';
      edge.style.lineWidth = 1;
      edge.style.strokeOpacity = 1;
    }
    return edge;
  });
  allParameters[objKey].graph.changeData(allParameters[objKey].root);
};

const GridCharts = (props: IProps, ref?: any) => {
  const refContainer = useRef<any>(null);

  const {
    width,
    height,
    select,
    selectedNode = [],
    type,
    linekey = '',
    initFnSel,
    objKey = 'default',
    linkObj,
    loading,
  } = props;

  useEffect(() => {
    if (objKey && objKey !== 'default' && !allParameters[objKey]) {
      allParameters[objKey] = {
        graph: null,
        root: { nodes: [], edges: [] },
        focus: null,
        initdata: [],
      };
    }
  }, [linkObj, objKey]);

  useEffect(() => {
    if (!allParameters[objKey].graph) {
      allParameters[objKey].graph = new G6.Graph({
        container: refContainer.current,
        width,
        height,
        modes: {
          default: [
            {
              type: 'zoom-canvas',
              sensitivity: 1,
              minZoom: 0.4,
              maxZoom: 2,
              shouldUpdate: () => false,
            },
            'drag-canvas',
            'drag-node',
            {
              type: 'tooltip',
              formatText: (model: any) => {
                const fTexts = model?.id ? model.id.split('/') : [];
                if (fTexts.length > 1) {
                  if (fTexts[0] === 'd') {
                    return model?.value?.pod_name || 'unknow';
                  }
                  if (fTexts[0] === 'c') {
                    return model?.value?.containerName || 'unknow';
                  }
                  if (fTexts[0] === 'p') {
                    return model?.value?.processName || 'unknow';
                  }
                  return fTexts.slice(1).join('/');
                }
                return model?.value?.containerName || model?.value?.processName || model?.value?.pod_name || 'unknow';
              },
              offset: 10,
            },
            'activate-relations',
            {
              type: 'click-select',
            },
          ],
        },
        nodeStateStyles: {
          selected: {
            r: 14,
            size: 28,
            fill: 'rgba(33, 119, 209, 1)',
            stroke: '#fff',
            shadowColor: 'rgb(130, 174, 240)',
            shadowBlur: 30,
            lineWidth: 3,
          },
        },
        edgeStateStyles: {
          active: {
            strokeOpacity: 1,
          },
        },
        layout: {
          type: 'grid',
          begin: [0, 20],
          sortBy: 'cluster',

          // type: 'force',
          // workerEnabled: true,
        },
        defaultNode: {},
        defaultEdge: {
          style: {
            endArrow: {
              path: G6.Arrow.triangle(10, 10, 8),
              fill: 'rgba(231, 233, 237, 1)',
              stroke: 'rgba(231, 233, 237, 0)',
              d: 10,
            },
            lineDash: [5, 5],
            stroke: 'rgba(231, 233, 237, 1)',
          },
        },
        animate: true,
      });
      allParameters[objKey].graph.data(allParameters[objKey].root);
    }
    return () => {
      cleanInitData(objKey);
    };
  }, [objKey]);

  const clickItems = useCallback((ev: any) => {
    select && select(ev.item._cfg.model);
  }, []);

  useEffect(() => {
    if (allParameters[objKey].graph && width) {
      allParameters[objKey].graph.set('width', width);
      allParameters[objKey].graph.set('height', height);
      allParameters[objKey].graph.set('fitCenter', true);
      allParameters[objKey].graph.changeSize(width, height);
      allParameters[objKey].graph.updateLayout({
        width: width,
        height: height,
      });
      allParameters[objKey].graph.on('node:click', clickItems);
      allParameters[objKey].graph.on('node:mouseenter', (e: any) => {
        const { nodes } = allParameters[objKey].graph?.save();
        for (const n of nodes) {
          allParameters[objKey].graph.setItemState(n.id, 'active', false);
          allParameters[objKey].graph.setItemState(n.id, 'highlight', false);
          allParameters[objKey].graph.setItemState(n.id, 'inactive', false);
        }
      });
      allParameters[objKey].graph.on('canvas:click', (e: any) => {
        if (initFnSel) {
          initFnSel();
        }
        (allParameters[objKey].initdata || []).forEach((n: any) => {
          allParameters[objKey].graph.setItemState(n.id, 'selected', true);
        });
      });
      allParameters[objKey].graph.paint();
      allParameters[objKey].graph.setAutoPaint(true);
      allParameters[objKey].graph.render();
    }
  }, [width, height, initFnSel, objKey]);

  // useEffect(() => {
  //   if (allParameters[objKey].graph && selectedNode?.length && !loading) {
  //     selectedNode.forEach((id) => {
  //       allParameters[objKey].graph.setItemState(id, 'selected', true);
  //       return id;
  //     });
  //   }
  // }, [JSON.stringify(selectedNode), objKey, loading]);

  const ownRender = useCallback(
    (items) => {
      if (allParameters[objKey].graph) {
        // allParameters[objKey].graph.read(items);
        allParameters[objKey].graph.changeData(items);
      }
    },
    [objKey],
  );

  const ownChange = useCallback(
    (items) => {
      if (allParameters[objKey].graph) {
        const isInit = allParameters[objKey].graph.get('fitCenter');
        // if (isInit && allParameters[objKey].root.nodes.length === 1) {
        if (isInit || allParameters[objKey].root.nodes.length === 1) {
          allParameters[objKey].graph.setAutoPaint(false);
          allParameters[objKey].graph.set('fitCenter', allParameters[objKey].root.nodes.length === 1 ? true : false);
          allParameters[objKey].graph.paint();
          allParameters[objKey].graph.setAutoPaint(true);
          allParameters[objKey].graph.render();
        }
        allParameters[objKey].graph.changeData(items);
      }
    },
    [objKey],
  );

  const addNewItems = useCallback(
    (nodes: any, edges: any) => {
      const items = addItems(allParameters[objKey].root, nodes, edges);
      allParameters[objKey].root = items;
      lineStyleColor(linekey, objKey);
      ownChange(items);
    },
    [ownChange, linekey, objKey],
  );

  const deleteOldItems = useCallback(
    (nodesIDArr: any[], lines: string[] = []) => {
      const items = deleteItems(allParameters[objKey].root, nodesIDArr, lines);
      allParameters[objKey].root = items;
      ownChange(items);
    },
    [ownChange, objKey],
  );

  const [ratio, setRato] = useState(1);

  const onChange = useCallback(
    (value) => {
      setRato(value);
      allParameters[objKey].graph.zoomTo(value, {
        x: width / 2,
        y: height / 2,
      });
    },
    [width, height, objKey],
  );

  const onChangeBtn = useCallback(
    (type: 'add' | 'red') => {
      let temRatio = type === 'add' ? ratio + 0.2 : ratio - 0.2;
      if (temRatio > 2) temRatio = 2;
      if (temRatio < 0.4) temRatio = 0.4;
      setRato(temRatio);
      allParameters[objKey].graph.zoomTo(temRatio, {
        x: width / 2,
        y: height / 2,
      });
    },
    [width, height, ratio, objKey],
  );

  useEffect(() => {
    if (allParameters[objKey].graph && width) {
      allParameters[objKey].graph.on('wheelzoom', (e: any) => {
        const num = allParameters[objKey].graph.getZoom();
        setRato(num);
      });
    }
  }, [width, objKey]);

  const setFocus = useMemoizedFn(() => {
    if (allParameters[objKey].graph && allParameters[objKey].focus?.nodes?.length) {
      allParameters[objKey].focus.nodes.map((t: any) => {
        allParameters[objKey].graph.setItemState(t.id, 'selected', true);
        return t;
      });
      allParameters[objKey].focus = null;
    }

    if (allParameters[objKey].graph && selectedNode?.length) {
      selectedNode.forEach((id) => {
        allParameters[objKey].graph.setItemState(id, 'selected', true);
        return id;
      });
      const initIDs = (allParameters[objKey].initdata || []).map((p: any) => {
        return p.id;
      });
      if (!isEqual(selectedNode, initIDs)) {
        allParameters[objKey].root.nodes.forEach((f: any) => {
          if (!selectedNode.includes(f?.id)) {
            allParameters[objKey].graph.setItemState(f?.id, 'disable', true);
          }
        });
      } else {
        allParameters[objKey].root.nodes.forEach((f: any) => {
          if (!selectedNode.includes(f?.id)) {
            allParameters[objKey].graph.setItemState(f?.id, 'disable', false);
          }
        });
      }
      // allParameters[objKey].graph.setItemState(selectedNode, 'selected', true);
    }
  });

  useUpdateEffect(() => {
    if (selectedNode?.length !== allParameters[objKey].initdata?.length) {
      lineDisableStyleColor(linekey, objKey, selectedNode);
    } else {
      lineStyleColor(linekey, objKey);
    }
    setFocus();
  }, [setFocus, linekey, objKey, JSON.stringify(selectedNode)]);

  useImperativeHandle(
    ref,
    () => {
      return {
        btnAddItems(nodes: any[], edges: { source: string; target: string }[]) {
          const { nodes: _nodes, edges: _edges } = dealData({ nodes, edges });
          addNewItems(_nodes, _edges);
          setFocus();
        },
        btnDeleteItems(nodesIDArr: any, lines: string[]) {
          deleteOldItems(nodesIDArr, lines);
        },
        setNewData(nodes: any[], f: boolean = false) {
          ownRender({});
          allParameters[objKey].root = { nodes: [], edges: [] };
          const { nodes: _nodes } = dealData({
            nodes,
            edges: [],
          });
          allParameters[objKey].focus = { nodes, edges: [] };
          allParameters[objKey].initdata = nodes;
          addNewItems(_nodes, []);
          // f && setFocus();
        },
        refreshFocus() {
          setFocus();
        },
      };
    },
    [ownRender, deleteOldItems, addNewItems, setFocus, objKey],
  );

  return (
    <>
      <div ref={refContainer} className="tooltip-g6">
        <div className="slider-case">
          <span className="slider-add-btn" onClick={() => onChangeBtn('add')}>
            +
          </span>
          <Slider min={0.4} max={2} onChange={onChange} step={0.02} value={ratio} vertical />
          <span className="slider-red-btn" onClick={() => onChangeBtn('red')}>
            -
          </span>
        </div>
      </div>
    </>
  );
};

export default forwardRef(GridCharts);
