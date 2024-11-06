/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import G6 from '@antv/g6';
import './GridChartScreen.scss';
import { addItems, dealData, deleteItems } from './GridHelper';
import { Slider } from 'antd';
import { isEqual } from 'lodash';

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
  second?: boolean;
}

const cleanInitData = () => {
  graph = null;
  root = { nodes: [], edges: [] };
  focus = null;
  initdata = [];
};

const lineStyleColor = (lkey?: any) => {
  let sources = initdata.map((l) => l.id);
  if (!sources?.length) return;
  root.edges = root.edges.map((edge: any) => {
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
      edge.style.stroke = 'rgba(33, 119, 209, 1)';
      edge.style.strokeOpacity = 0.05;
    }
    edge.style.lineWidth = 1;
    return edge;
  });

  graph?.changeData(root);
};

const lineDisableStyleColor = (lkey?: any, selectedList: any[] = []) => {
  let sources = initdata.map((l: any) => l.id);
  if (!sources?.length) return;
  root.edges = root.edges.map((edge: any) => {
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
  root.edges = root.edges.map((edge: any) => {
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
  graph?.changeData(root);
};

const GridCharts = (props: IProps, ref?: any) => {
  const refContainer = useRef<any>(null);

  const { width, height, select, selectedNode = [], linekey = '', initFnSel } = props;

  useEffect(() => {
    graph = new G6.Graph({
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
    graph.data(root);
    return () => {
      cleanInitData();
    };
  }, []);

  const clickItems = useCallback((ev: any) => {
    select && select(ev.item._cfg.model);
  }, []);

  useEffect(() => {
    if (graph && width) {
      graph.set('width', width);
      graph.set('height', height);
      graph.set('fitCenter', true);
      graph.changeSize(width, height);
      graph.updateLayout({
        width: width,
        height: height,
      });
      graph.on('node:click', clickItems);
      graph.on('node:mouseenter', (e: any) => {
        const { nodes } = graph.save();
        for (const n of nodes) {
          graph.setItemState(n.id, 'active', false);
          graph.setItemState(n.id, 'hover', false);
          graph.setItemState(n.id, 'highlight', false);
          graph.setItemState(n.id, 'inactive', false);
        }
      });
      graph.on('canvas:click', (e: any) => {
        if (initFnSel) {
          initFnSel();
        }
        (initdata || []).forEach((n) => {
          graph.setItemState(n.id, 'selected', true);
        });
      });
      graph.paint();
      graph.setAutoPaint(true);
      graph.render();
    }
  }, [width, height, initFnSel]);

  const ownRender = useCallback((items) => {
    if (graph) {
      graph.changeData(items);
    }
  }, []);

  const ownChange = useCallback((items) => {
    if (graph) {
      const isInit = graph.get('fitCenter');
      if (isInit || root.nodes.length === 1) {
        graph.setAutoPaint(false);
        graph.set('fitCenter', root.nodes.length === 1 ? true : false);
        graph.paint();
        graph.setAutoPaint(true);
        graph.render();
      }
      graph.changeData(items);
    }
  }, []);

  const addNewItems = useCallback(
    (nodes: any, edges: any) => {
      const items = addItems(root, nodes, edges);
      root = items;
      lineStyleColor(linekey);
      ownChange(items);
    },
    [ownChange, linekey],
  );

  const deleteOldItems = useCallback(
    (nodesIDArr: any[], lines: string[] = []) => {
      const items = deleteItems(root, nodesIDArr, lines);
      root = items;
      ownChange(items);
    },
    [ownChange],
  );

  const [ratio, setRato] = useState(1);

  const onChange = useCallback(
    (value) => {
      setRato(value);
      graph.zoomTo(value, { x: width / 2, y: height / 2 });
    },
    [width, height],
  );

  const onChangeBtn = useCallback(
    (type: 'add' | 'red') => {
      let temRatio = type === 'add' ? ratio + 0.2 : ratio - 0.2;
      if (temRatio > 2) temRatio = 2;
      if (temRatio < 0.4) temRatio = 0.4;
      setRato(temRatio);
      graph.zoomTo(temRatio, { x: width / 2, y: height / 2 });
    },
    [width, height, ratio],
  );

  useEffect(() => {
    if (graph && width) {
      graph.on('wheelzoom', (e: any) => {
        const num = graph.getZoom();
        setRato(num);
      });
    }
  }, [width]);

  const setFocus = useCallback(() => {
    if (graph && focus?.nodes?.length) {
      focus.nodes.map((t: any) => {
        graph.setItemState(t.id, 'selected', true);
        return t;
      });
      focus = null;
    }

    if (graph && selectedNode?.length) {
      selectedNode.forEach((id) => {
        graph.setItemState(id, 'selected', true);
        return id;
      });
      const initIDs = (initdata || []).map((p: any) => {
        return p.id;
      });
      if (!isEqual(selectedNode, initIDs)) {
        root.nodes.forEach((f: any) => {
          if (!selectedNode.includes(f?.id)) {
            graph.setItemState(f?.id, 'disable', true);
          }
        });
      } else {
        root.nodes.forEach((f: any) => {
          if (!selectedNode.includes(f?.id)) {
            graph.setItemState(f?.id, 'disable', false);
          }
        });
      }
    }
  }, [JSON.stringify(selectedNode)]);

  useEffect(() => {
    if (selectedNode?.length !== initdata?.length) {
      lineDisableStyleColor(linekey, selectedNode);
    } else {
      lineStyleColor(linekey);
    }
    setFocus();
  }, [setFocus, linekey, JSON.stringify(selectedNode)]);

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
          root = { nodes: [], edges: [] };
          const { nodes: _nodes } = dealData({
            nodes,
            edges: [],
          });
          focus = { nodes, edges: [] };
          initdata = nodes;
          addNewItems(_nodes, []);
        },
        refreshFocus() {
          setFocus();
        },
      };
    },
    [ownRender, deleteOldItems, addNewItems, graph, setFocus],
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
