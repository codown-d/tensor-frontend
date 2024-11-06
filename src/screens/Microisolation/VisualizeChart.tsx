import { useMemoizedFn, useMount, useSize, useUpdateEffect } from 'ahooks';
import React, { useCallback, useMemo, useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './VisualizeChart.less';
import * as d3 from 'd3';
import { find, random, remove, without } from 'lodash';
import ChartTooltip from '../../components/ComponentsLibrary/ChartTooltip';
import { translations } from '../../translations/translations';
import classNames from 'classnames';
let domains = [
  { id: 'Allow', label: translations.commonpro_Allow, color: '#52C41A', type: 'arrow' },
  { id: 'Deny', label: translations.commonpro_Deny, color: '#E95454', type: 'arrow' },
  { id: 'Alert', label: translations.imageReject_reject_type_alarm, color: '#FFC423', type: 'arrow' },
  { id: 'zero_trust', label: translations.protection_mode, color: '#52C41A', type: 'rect' },
  { id: 'un_zero_trust', label: translations.warningMode, color: '#FFC423', type: 'rect' },
];
let Legend = () => {
  return (
    <div
      className="legend"
      style={{
        position: 'fixed',
        right: '32px',
        bottom: '40px',
        background: '#F4F6FA',
        borderRadius: '8px',
        padding: '12px 16px',
        zIndex: 999,
      }}
    >
      {domains.map((item, index) => {
        return (
          <p className="flex-r-c mt4" style={{ justifyContent: 'flex-start' }} key={index}>
            {item.type === 'arrow' ? (
              <span
                style={{ width: '15px', height: '24px' }}
                className={`legend-item mr8 ${item.id.toLocaleLowerCase()}`}
              ></span>
            ) : (
              <span
                className={`legend-item  mr8 ${item.id}`}
                style={{ width: '15px', height: '10px', border: `1px solid ${item.color}`, borderRadius: '7px' }}
              ></span>
            )}
            <span style={{}} className="f12">
              {item.label}
            </span>
          </p>
        );
      })}
    </div>
  );
};
export const curve_link = ({ source, target }: any) => {
  if (source.x === target.x && source.y === target.y) {
    let { x, y, r } = source;
    let deg = 0;
    let sourceY = y + Math.sin(deg) * r;
    let sourceX = x + Math.cos(deg) * r;

    let targetY = y + Math.sin(deg + Math.PI / 4) * r;
    let targetX = x + Math.cos(deg + Math.PI / 4) * r;

    let oY = y + Math.sin(deg + Math.PI / 8) * r * 2;
    let oX = x + Math.cos(deg + Math.PI / 8) * r * 2;
    return `M ${sourceX} ${sourceY} Q ${oX} ${oY} ${targetX} ${targetY}`;
  } else {
    const theta = Math.atan2(target.y - source.y, target.x - source.x);
    let p1x = source.x + source.r * Math.cos(theta);
    let p1y = source.y + source.r * Math.sin(theta);
    let p2xr = target.x + (target.r + 15) * Math.cos(theta + Math.PI);
    let p2yr = target.y + (target.r + 15) * Math.sin(theta + Math.PI);
    let p2x = target.x + (target.r + 14.9) * Math.cos(theta + Math.PI);
    let p2y = target.y + (target.r + 14.9) * Math.sin(theta + Math.PI);

    const mpx = (p2xr + p1x) * 0.5;
    const mpy = (p2yr + p1y) * 0.5;
    const offset =
      Math.sqrt((source.x - target.x) * (source.x - target.x) + (source.y - target.y) * (source.y - target.y)) / 8;
    const c1x = mpx + offset * Math.cos(theta - Math.PI / 2);
    const c1y = mpy + offset * Math.sin(theta - Math.PI / 2);
    return `M ${p1x} ${p1y} Q ${c1x} ${c1y}, ${p2xr} ${p2yr} L${p2x} ${p2y}`;
  }
};

export enum TrafficType {
  Unknown = 'Unknown',
  IPBlock = 'IPBlock',
  Internal = 'Internal',
}
export interface linkDataProps {
  srcID: string;
  dstID: string;
  type: 'Allow' | 'Deny' | 'Alert';
  srcKind: TrafficType;
  dstKind: TrafficType;
}
let k = 4;

export default forwardRef(function (props: { [x: string]: any; linkData: linkDataProps[] }, ref) {
  let { width = 900, height = 600, showNodeInfo, showLinkInfo } = props;
  const [mouseNode, setMouseNode] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(props.data);
  const [chartData, setChartData] = useState<any>();
  const [linkData, setLinkData] = useState<any>();
  const [actIds, setActIds] = useState<string[]>([]);
  const [actPathId, setActPathId] = useState('');
  const [actNodeId, setActNodeId] = useState<string>('');
  let [expanedCircle, setExpanedCircle] = useState<string[]>([]);
  let [isHovered, setIsHovered] = useState<string[]>([]);
  let [viewBoxCenter, setViewBoxCenter] = useState<number[]>();

  const d3Container = useRef(null);

  const pack = useMemoizedFn((data) =>
    d3
      .pack()
      .size([width * 2, height * 2])
      .padding((d) => {
        // 根据节点的值动态计算填充
        return d.depth == 0 ? 30 : d.depth == 1 ? 60 : 50;
      })
      .radius((d) => (d.depth === 3 ? 20 : 66))(
      d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a: any, b: any) => b.value - a.value),
    ),
  );
  let getNodeFill = useCallback((data: any) => {
    let { depth, children, id } = data;
    if (id == 'Unknown' || id == 'IPBlock') {
      return `url(#${id})`;
    }
    let nodeFill: any = {
      '1': '#2D94FF',
      '2': children?.length == 0 ? '#2D94FF' : '#fff',
      '3': '#2177d1',
    };
    return nodeFill[depth];
  }, []);
  let getNodeFillOpacity = useMemoizedFn((data) => {
    let { depth, children, id } = data;
    if (id == 'Unknown' || id == 'IPBlock') {
      return 1;
    }
    let fillOpacity: any = {
      '1': 0.05,
      '2': children?.length == 0 ? 0.05 : 1,
      '3': 1,
    };
    return fillOpacity[depth];
  });
  let getNodeStroke = useCallback((data: any) => {
    let { depth, id, mode = 'protecting' } = data;
    if (id == 'Unknown' || id == 'IPBlock') {
      return `none`;
    }
    let nodeStroke: any = {
      '1': '#2177d1',
      '2': mode == 'protecting' ? '#52C41A' : mode == 'warning' ? '#FFC423' : '#2177d1',
      '3': '#2177d1',
    };
    return nodeStroke[depth];
  }, []);
  let getNodeStrokeDasharray = useMemoizedFn((data) => {
    let { depth, id } = data;
    return depth == 2 && id != 0 ? 'none' : '8 8';
  });
  let getLineStroke = useMemoizedFn((d: any) => {
    let node = find(domains, (item) => item.id === d.source.data.type);
    return node?.color || '#fff';
  });

  let getLinkList = useMemoizedFn(() => {
    return props.linkData
      .filter((item) => !expanedCircle.includes(item.dstID) && !expanedCircle.includes(item.srcID))
      .map((item) => {
        let { srcID, dstID, ...otherData } = item;
        let sourceNode = find(chartData, (ite) => ite.data.idpath === srcID);
        let targetNode = find(chartData, (ite) => ite.data.idpath === dstID);
        return {
          source: Object.assign({}, sourceNode, { data: item }),
          target: Object.assign({}, targetNode, { data: item }),
        };
      })
      .filter((item) => item.source.x && item.target.x);
  });
  let getTextTransform = useMemoizedFn((d: any) => {
    let y = d.y;
    if (d.depth == 2 && d.children) {
      y = d.y - d.r + 30;
    } else if (d.depth == 3) {
      y = d.y + d.r + 14;
    } else if (d.depth == 1) {
      y = d.y - d.r + 40;
    }
    return `translate(${d.x},${y})`;
  });
  let getFontSize = useMemoizedFn((p) => {
    let { depth, id, data } = p;
    let size = 20;
    switch (depth) {
      case 1:
        size = 20;
        break;
      case 2:
        size = data.children.length == 0 ? 16 : 14;
        break;
      case 3:
        size = 12;
        break;
    }
    return size;
  });
  let getFontWeight = useMemoizedFn((p) => {
    let { depth, id, data } = p;
    let size: any = 600;
    switch (depth) {
      case 1:
        size = 600;
        break;
      case 2:
        size = data.children.length == 0 ? 'normal' : 550;
        break;
      case 3:
        size = 'normal';
        break;
    }
    return size;
  });
  let getTextFill = useMemoizedFn((d) => {
    return '#3E4653';
  });
  let getAllDataList = useMemoizedFn(() => {
    let imageList: any = [];
    let root = pack(originalData);
    setViewBoxCenter([root.x, root.y]);
    let nodesList = root
      .descendants()
      .slice(1)
      .map((d: any) => {
        let { depth } = d;
        let r = 20;
        if (depth == 1 && d.data['externalTopology']) {
          d.data['externalTopology'].forEach((item: any) => {
            let nodeCopy = d.copy();
            imageList.push({
              ...nodeCopy,
              data: { id: item, idpath: `${d.data.id}/${item}`, type: 'icon' },
              r: r,
              y: d.y - d.r,
              x: item == 'Unknown' ? d.x - 2 * r : d.x + 2 * r,
            });
          });
        }
        return d;
      });
    return [...nodesList, ...imageList];
  });
  let zoomNode: any = d3
    .zoom()
    .scaleExtent([0.66, 4])
    .on('zoom', function (event: any) {
      let { transform } = event;
      let svg = d3.select(d3Container.current);
      svg.select('g.chart').transition().duration(10).attr('transform', transform);
    });
  let initChart = useMemoizedFn(() => {
    d3.select(d3Container.current).call(zoomNode);
  });
  useEffect(() => {
    initChart();
  }, []);
  useEffect(() => {
    setOriginalData(props.data);
  }, [props.data]);
  useEffect(() => {
    if (props.linkData.length === 0) {
      setLinkData([]);
      return;
    }
    let lines = getLinkList();
    setLinkData(lines);
  }, [props.linkData, chartData, expanedCircle]);

  useEffect(() => {
    if (!originalData) return;
    let allCircleList = getAllDataList();
    setChartData(allCircleList);
  }, [originalData]);
  useImperativeHandle(ref, () => {
    return {
      setActivateNode(idpath: string, type: string) {
        if (!idpath) return;
        let _id = idpath.replaceAll('/', '_');
        if ('resource' == type) {
          let newId = _id.substring(0, _id.lastIndexOf('_'));
          for (let i = 0; i < originalData.children.length; i++) {
            let item = originalData.children[i];
            for (let j = 0; j < item.children.length; j++) {
              let itemNode = item.children[j];
              if (newId === itemNode._id) {
                itemNode['children'] = itemNode['_children'];
              }
            }
          }
          setOriginalData({ ...originalData });
        }
        let root = pack(originalData);
        setTimeout(() => {
          let gChart = d3.select(d3Container.current).select('g.chart');
          gChart.selectAll(`circle`).classed('bling', false);
          gChart.select(`circle#${_id}`).classed('bling', true);
          let node: any = find(root.descendants(), (item: any) => idpath === item.data.idpath);
          if (node) {
            d3.select(d3Container.current)
              .transition()
              .call(zoomNode.transform, d3.zoomIdentity.translate(-node.x + width * 2, -node.y + height * 2));
          }
        }, 0);
      },
    };
  }, [originalData, chartData]);
  let getStrokeOpacity = useMemoizedFn((id) => {
    return actIds.length == 0 || actIds.includes(id);
  });
  let getPathLine = useMemo(() => {
    return linkData?.map((d: any) => {
      let { source, target } = d;
      let lindId = `${source.data.srcID}_${target.data.dstID}`;
      let colors: any = { Allow: '#52C41A', Deny: '#E95454', Alert: '#FFC423' };
      let dpath = curve_link(d);
      let isAct = getStrokeOpacity(lindId);
      let opacity = isAct ? 1 : 0.3;
      return (
        <g key={lindId}>
          <path
            className={`flowing`}
            d={dpath}
            fill={'none'}
            stroke={getLineStroke(d)}
            strokeOpacity={opacity}
            strokeWidth={actPathId == lindId ? 3 : 2}
            markerEnd={`url(#${d.source.data.type}${isAct ? '_act' : ''})`}
          ></path>
          <path
            style={{
              cursor: 'pointer',
            }}
            id={lindId}
            d={dpath}
            stroke={'transparent'}
            strokeWidth={10}
            fill="none"
            onMouseOver={() => {
              setActPathId(lindId);
            }}
            onMouseOut={() => {
              setActPathId('');
            }}
            onClick={() => {
              let node = find(linkData, (item) => lindId === `${item.source.data.srcID}_${item.target.data.dstID}`);
              showLinkInfo(node);
            }}
          />
          <circle
            r={4}
            fill={colors[d.source.data.type]}
            opacity={opacity}
            stroke={colors[d.source.data.type]}
            strokeOpacity={isAct ? 0.3 : 0}
            cx="0"
            cy="0"
            strokeWidth={3}
          >
            <animateMotion path={dpath} begin="0s" dur="4s" rotate="auto" repeatCount="indefinite" />
          </circle>

          <circle r={2} cx="0" cy="0" strokeWidth={0} fill={'#fff'}>
            <animateMotion path={dpath} begin="0s" dur="4s" rotate="auto" repeatCount="indefinite" />
          </circle>
        </g>
      );
    });
  }, [linkData, actIds, actPathId]);

  const refDom = useRef(null);
  return (
    <div className="visualize-chart" ref={refDom} style={{ overflow: 'hidden', position: 'relative' }}>
      {mouseNode && <ChartTooltip style={{ left: mouseNode.left, top: mouseNode.top }} text={mouseNode.data?.name} />}
      {true ? <Legend /> : null}

      <svg
        width={width}
        height={height}
        ref={d3Container}
        viewBox={`${0} ${0} ${viewBoxCenter?.[0] * 2} ${viewBoxCenter?.[1] * 2}`}
      >
        <defs>
          {domains
            .filter((item) => item.type === 'arrow')
            .map((item) => {
              return (
                <marker
                  key={item.id}
                  id={`${item.id}_act`}
                  markerUnits="strokeWidth"
                  markerWidth="15"
                  markerHeight="15"
                  viewBox="0 0 12 12"
                  refX="0"
                  refY="3"
                  orient="auto"
                >
                  <path d="M 0 0 L 5 3 L 0 6 z" fill={`${item.color}`}></path>
                </marker>
              );
            })}
          {domains
            .filter((item) => item.type === 'arrow')
            .map((item) => {
              return (
                <marker
                  key={item.id}
                  id={`${item.id}`}
                  markerUnits="strokeWidth"
                  markerWidth="15"
                  markerHeight="15"
                  viewBox="0 0 12 12"
                  fillOpacity={0.3}
                  refX="0"
                  refY="3"
                  orient="auto"
                >
                  <path d="M 0 0 L 5 3 L 0 6 z" fill={`${item.color}`}></path>
                </marker>
              );
            })}
          {['IPBlock', 'Unknown'].map((item) => {
            return (
              <pattern id={item} key={item} patternContentUnits="objectBoundingBox" width="100%" height="100%">
                <image width="1" height="1" preserveAspectRatio="none" href={`/images/${item}.png`}></image>
              </pattern>
            );
          })}
          <filter id="blurMe">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>
        <g className="chart">
          {chartData?.map((d: any) => {
            let isEllipsis =
              (d.data.name?.length > 13 && (d.depth == 1 || d.depth == 2)) ||
              (d.data.name?.length > 11 && d.depth == 3);

            let {
              depth,
              data: { _id, idpath, type },
            } = d;
            return (
              <circle
                key={_id}
                className={classNames({
                  icon: type == 'icon',
                  node: type != 'icon',
                  ellipsis: isEllipsis,
                  'node-active': actNodeId == _id || isHovered.includes(_id),
                })}
                r={d.r}
                id={_id}
                depth={depth}
                transform={`translate(${d.x},${d.y})`}
                fillOpacity={getNodeFillOpacity({ ...d, ...d.data })}
                fill={getNodeFill({ ...d, ...d.data })}
                stroke={getNodeStroke({ ...d, ...d.data })}
                strokeWidth={depth == 2 ? 3 : 0}
                strokeDasharray={getNodeStrokeDasharray({ ...d, ...d.data })}
                onClick={(event) => {
                  setActNodeId('');
                  setActIds([]);
                  if (idpath.indexOf('Unknown ') != -1 || idpath.indexOf('IPBlock ') != -1 || depth == 1) {
                    return;
                  } else if (depth == 2) {
                    event.stopPropagation();
                    let ids = props.linkData.reduce((pre, item) => {
                      if (item.srcID.indexOf(idpath) != -1 || item.dstID.indexOf(idpath) != -1) {
                        pre.push(`${item.srcID}_${item.dstID}`);
                      }
                      return pre;
                    }, []);
                    setActIds(ids);
                    setExpanedCircle((pre) => {
                      if (pre.includes(idpath)) {
                        return without([...pre], idpath);
                      } else {
                        pre.push(idpath);
                        return pre;
                      }
                    });
                    for (let i = 0; i < originalData.children.length; i++) {
                      let item = originalData.children[i];
                      for (let j = 0; j < item.children.length; j++) {
                        let itemNode = item.children[j];
                        if (_id === itemNode._id) {
                          if (!itemNode['children'] || itemNode['children'].length == 0) {
                            itemNode['children'] = itemNode['_children'];
                          } else {
                            itemNode['children'] = [];
                          }
                        }
                      }
                    }
                    setOriginalData({ ...originalData });
                  } else if (depth == 3) {
                    let node = find(chartData, (item) => _id === item.data._id);
                    let ids = props.linkData.reduce((pre, item) => {
                      if (item.srcID == idpath || item.dstID == idpath) {
                        pre.push(`${item.srcID}_${item.dstID}`);
                      }
                      return pre;
                    }, []);
                    setActIds(ids);
                    showNodeInfo(node.data);
                    setActNodeId(_id);
                  }
                }}
                onMouseEnter={() => {
                  if (depth == 3) {
                    setIsHovered([_id]);
                  }
                }}
                onMouseLeave={() => {
                  setIsHovered([]);
                  setMouseNode(null);
                }}
                onMouseMove={(event: any) => {
                  const className = event.target.className.baseVal;
                  if (className.indexOf('ellipsis') != -1) {
                    let node = find(chartData, (item: any) => item.data._id == _id);
                    let { clientX, clientY } = event;
                    node && setMouseNode({ left: clientX, top: clientY, data: node.data });
                  }
                }}
              ></circle>
            );
          })}

          {chartData?.map((d: any) => {
            let name = d.data.name;
            if (d.depth == 1) {
              name = d.data.name?.length > 15 ? d.data.name.substr(0, 13) + '...' : d.data.name;
            } else if (d.depth == 2) {
              if (d.data.name?.length <= 10) {
                name = name + ` (${d.data._children?.length || 0})`;
              } else {
                name = d.data.name.substr(0, 13) + '...';
              }
            } else if (d.depth == 3) {
              name = d.data.name?.length > 13 ? d.data.name.substr(0, 11) + '...' : d.data.name;
            }

            return (
              <text
                key={d.data._id}
                id={d.data._id}
                textAnchor={'middle'}
                pointerEvents={'none'}
                y={'0.5em'}
                fill={getTextFill(d)}
                fontSize={getFontSize(d)}
                fontWeight={getFontWeight(d)}
                transform={getTextTransform(d)}
              >
                <tspan x={'0em'} y={'0.5em'}>
                  {name}
                </tspan>
                {d.depth == 2 && d.data.name?.length > 10 ? (
                  <tspan x={'0em'} y={'1em'}>{`(${d.data._children?.length})`}</tspan>
                ) : null}
              </text>
            );
          })}
          {getPathLine}
        </g>
      </svg>
    </div>
  );
});
