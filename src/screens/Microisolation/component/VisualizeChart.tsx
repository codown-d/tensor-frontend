import { useMemoizedFn, useUpdateEffect } from 'ahooks';
import React, { useCallback, useMemo, useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './VisualizeChart.less';
import * as d3 from 'd3';
import ChartTooltip from '../../../components/ComponentsLibrary/ChartTooltip';
import { find } from 'lodash';
import { translations } from '../../../translations';
import { curve_link } from '../VisualizeChart';

const VisualizeChart = (props: any, ref) => {
  let { width, height } = props;
  const [mouseNode, setMouseNode] = useState<any>(null);
  const [chartData, setChartData] = useState<any>();
  const d3Container = useRef(null);
  const pack = useMemoizedFn((data) =>
    d3
      .pack()
      .size([width, height])
      .padding((d) => {
        return d.depth == 0 ? 30 : 40;
      })
      .radius((d) => {
        if (d.data.isAct && d.data.children.length == 0) {
          return 100;
        }
        return 20;
      })(
      d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value),
    ),
  );
  let getAllDataList = useMemoizedFn(() => {
    let root = pack(props.data);
    let nodesList = root.descendants().slice(1);
    return nodesList;
  });
  let getNodeFill = useCallback(
    (data: any) => {
      let { type, isAct, id } = data;
      if (props.linkData?.includes(id)) {
        return '#D2D8E2';
      }
      if (type == 'group') {
        return isAct ? '#fff' : 'rgba(45, 148, 255, 0.05)';
      } else {
        return '#2177d1';
      }
    },
    [props.linkData],
  );
  let getNodeStroke = useCallback((data: any) => {
    return '#2177D1';
  }, []);
  let getTextTransform = useMemoizedFn((d: any) => {
    let y = d.y + d.r + 10;
    if (d.data.type == 'group') {
      y = d.y - d.r + 20;
    }
    return `translate(${d.x},${y})`;
  });
  let getFontSize = useMemoizedFn((d) => {
    return d.data.type == 'group' ? 16 : 12;
  });
  let getTextFill = useMemoizedFn((d) => {
    let { data } = d;
    if (props.linkData?.includes(data.id)) {
      return '#D2D8E2';
    }
    return '#1E222A';
  });
  let zoomNode: any = d3
    .zoom()
    .scaleExtent([1, 4])
    .on('zoom', function (event: any) {
      let { transform } = event;
      d3.select(d3Container.current).select('g.chart').transition().duration(10).attr('transform', transform);
    });
  useEffect(() => {
    d3.select(d3Container.current).call(zoomNode);
  }, []);

  useEffect(() => {
    if (!props.data) return;
    let allCircleList = getAllDataList();
    setChartData(allCircleList);
  }, [props.data, width, props.linkData]);
  let getType = useCallback((data) => {
    let { type, name } = data;
    let obj: any = {
      group: translations.microseg_segments_segment_title,
      node: translations.resources,
    };
    return `${obj[type]}：${name}`;
  }, []);

  useImperativeHandle(ref, () => {
    return {
      setActivateNode(id: string) {
        if (!id) return;
        setTimeout(() => {
          let node: any = find(chartData, (item: any) => id === item.data.id);
          if (node) {
            d3.select(d3Container.current)
              .transition()
              .call(zoomNode.transform, d3.zoomIdentity.translate(-node.x + width / 2, -node.y + height / 2));
          }
        }, 0);
      },
    };
  }, [chartData]);
  let getLinkList = useMemoizedFn(() => {
    return props.linkData
      ?.map((item) => {
        let nodeId = item.split('_')[0];
        let sourceNode = find(chartData, (ite) => ite.data.id == item);
        let targetNode = find(chartData, (ite) => ite.data.id == nodeId);
        return {
          source: Object.assign({}, sourceNode, { data: item }),
          target: Object.assign({}, targetNode, { data: item }),
        };
      })
      .filter((item) => item.source.x && item.target.x);
  });
  let getPathLine = useMemo(() => {
    let linkData = getLinkList();
    return linkData?.map((d, index) => {
      let dpath = curve_link(d);
      return (
        <g key={index}>
          <path
            d={dpath}
            stroke={'#2177d1'}
            fill="transparent"
            strokeDasharray={'3 3'}
            strokeWidth={2}
            markerEnd={`url(#arrow)`}
          ></path>
        </g>
      );
    });
  }, [props.linkData, chartData]);
  return (
    <div className="visualize-chart">
      {mouseNode && (
        <ChartTooltip style={{ left: mouseNode.left, top: mouseNode.top }} text={getType(mouseNode.data)} />
      )}
      <svg width={width} height={height} ref={d3Container}>
        <marker
          id={`arrow`}
          markerUnits="strokeWidth"
          markerWidth="15"
          markerHeight="15"
          viewBox="0 0 12 12"
          refX="0"
          refY="3"
          orient="auto"
        >
          <path d="M 0 0 L 5 3 L 0 6 z" fill="#2177d1"></path>
        </marker>
        <g className="chart">
          {chartData?.map((d: any) => {
            return (
              <circle
                key={d.data.id}
                className={`node ${d.data.name?.length > 13 ? 'ellipsis' : ''}`}
                r={d.r}
                id={d.data.id}
                transform={`translate(${d.x},${d.y})`}
                fill={getNodeFill({ ...d, ...d.data })}
                stroke={getNodeStroke({ ...d, ...d.data })}
                strokeWidth={d.data.type == 'group' ? 2 : 0}
                strokeDasharray={d.data.type == 'group' && !d.data.isAct ? '3 3' : 'none'}
                onMouseLeave={() => {
                  setMouseNode(null);
                }}
                onMouseMove={(event: any) => {
                  const className = event.target.className.baseVal;
                  if (className.indexOf('ellipsis') != -1) {
                    let node = find(chartData, (item: any) => item.data.id == d.data.id);
                    let { clientX, clientY } = event;
                    node && setMouseNode({ left: clientX, top: clientY, data: node.data });
                  }
                }}
              ></circle>
            );
          })}
          {chartData?.map((d: any) => {
            let name = d.data.name;
            if (d.data.type == 'group') {
              name = d.data.name?.length > 15 ? d.data.name.substr(0, 13) + '...' : d.data.name;
            } else {
              name = d.data.name?.length > 12 ? d.data.name.substr(0, 10) + '...' : d.data.name;
            }
            return (
              <text
                id={d.data.id}
                key={d.data.id}
                textAnchor={'middle'}
                pointerEvents={'none'}
                fontSize={getFontSize(d)}
                fill={getTextFill(d)}
                transform={getTextTransform(d)}
              >
                {name}
              </text>
            );
          })}
          {getPathLine}
        </g>
      </svg>
    </div>
  );
};

export default forwardRef(VisualizeChart);
