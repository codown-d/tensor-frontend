import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Slider from 'antd/lib/slider';
import { useMemoizedFn } from 'ahooks';
import G6 from '@antv/g6';
import { merge } from 'lodash';
interface GridChartMapProps {
  data: any;
  width: any;
  height: any;
  onfocus: (arg: any) => void;
}
const GridChartMap = (props: GridChartMapProps, ref: any) => {
  let { width, height, data, onfocus } = props;
  const refContainer = useRef<any>(null);
  const graph = useRef<any>(null);
  const [ratio, setRato] = useState(1);
  const onChange = useMemoizedFn((value) => {
    setRato(value);
    graph.current.zoomTo(value, {
      x: width / 2,
      y: height / 2,
    });
  });
  const onChangeBtn = useMemoizedFn((type: 'add' | 'red') => {
    let temRatio = type === 'add' ? ratio + 0.2 : ratio - 0.2;
    if (temRatio > 2) temRatio = 2;
    if (temRatio < 0.4) temRatio = 0.4;
    setRato(temRatio);
    graph.current.zoomTo(temRatio, {
      x: width / 2,
      y: height / 2,
    });
  });
  let init = useMemoizedFn(() => {
    let edgeSelectedStyle = {
      endArrow: {
        shadowBlur: 0,
        path: G6.Arrow.triangle(10, 10, 8),
        fill: 'rgba(33, 119, 209, 1)',
        d: 10,
        stroke: 'rgba(231, 233, 237, 0)',
      },
      lineDash: [5, 5],
      lineWidth: 1,
      shadowBlur: 0,
      stroke: 'rgba(33, 119, 209, 1)',
    };
    graph.current?.destroy();
    let g = new G6.Graph({
      container: refContainer.current,
      width,
      height,
      fitCenter: true,
      layout: {
        type: 'grid',
        begin: [0, 0],
        sortBy: 'value',
      },
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
              return model.originData?.topology_name || model?.topology_name || 'unknow';
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
        active: {
          fill: 'rgba(33, 119, 209, 1)',
          stroke: 'rgba(33, 119, 209,0)',
        },
        inactive: {
          fill: 'rgba(33, 119, 209, 0.4)',
          stroke: 'rgba(33, 119, 209,0)',
        },
        selected: {
          fill: 'rgba(33, 119, 209, 1)',
          stroke: '#fff',
          lineWidth: 3,
        },
        focus: edgeSelectedStyle,
      },
      defaultNode: {
        size: 22,
        style: {
          stroke: 'rgba(33, 119, 209,0)',
          fill: 'rgba(33, 119, 209, 0.4)',
        },
      },
      edgeStateStyles: {
        selected: edgeSelectedStyle,
        active: edgeSelectedStyle,
        inactive: merge({}, edgeSelectedStyle, {
          endArrow: { fill: 'rgba(231, 233, 237, 1)' },
          stroke: 'rgba(231, 233, 237, 1)',
        }),
        focus: edgeSelectedStyle,
      },
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
    });
    g.on('canvas:click', (ev) => {
      onfocus('');
    });
    g.on('node:click', (evt) => {
      const item = evt.item; // 被操作的节点 item
      const relatedEdges = item.getEdges();
      const edges = g.getEdges();
      onfocus(item?.getModel()?.id);
      edges.forEach((edge) => {
        if (relatedEdges.includes(edge)) {
          g.setItemState(edge, 'selected', true);
        } else {
          g.clearItemStates(edge, 'selected');
        }
      });
    });
    graph.current = g;
  });
  useEffect(() => {
    init();
    return () => {
      graph.current = null;
    };
  }, []);
  useEffect(() => {
    graph.current.changeSize(width, height);
  }, [width, height]);
  useEffect(() => {
    if (data) {
      data.nodes.map((item) => {
        if (item.type === 'original') {
          item['size'] = 28;
          item['value'] = 1;
          item['style'] = {
            fill: 'rgba(33, 119, 209, 1)',
            stroke: '#fff',
            shadowColor: 'rgb(130, 174, 240)',
            shadowBlur: 10,
            lineWidth: 3,
          };
        }
      });
      graph.current.data(data);
      graph.current.render();
      setTimeout(() => {
        let nodes = graph.current.getNodes();
        let node = nodes[0];
        node &&
          node.getEdges().forEach((item) => {
            graph.current.setItemState(item, 'selected', true);
          });
      }, 0);
    }
  }, [props.data]);
  useImperativeHandle(
    ref,
    () => {
      return {
        setNodeAct(id: string) {
          let nodes = graph.current.getNodes();
          nodes.forEach((node) => {
            let _id = node?.getModel()?.id;
            if (_id === id) {
              graph.current.setItemState(node, 'selected', true);
            } else {
              graph.current.clearItemStates(node, 'selected');
            }
          });
        },
      };
    },
    [props],
  );
  return (
    <div ref={refContainer} className="grid-chart">
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
  );
};

export default forwardRef(GridChartMap);
