/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { IGraph, Node, ScanSeverity } from '../../definitions';
import * as d3 from 'd3';
import './BubbleChartComponent.scss';
import { getColor, getSelectColor, getStrokeColor } from './BubbleColorResolver';
import { Slider } from 'antd';
import { Resources } from '../../Resources';
import classNames from 'classnames';
import { calculatePolygone } from './BubbleChartPolygone';

let root: any,
  svg: any,
  screen: any,
  node: Node,
  label: any,
  labelG: any,
  view: any,
  focus: Node,
  zoomNode: any,
  zX: any = 0,
  zY: any = 0,
  temRatio: number = 1,
  // showResourceName: any = null,
  clickedNode: any,
  // 选中效果变化
  selectNodeName: any,
  firstInitRatio: boolean = true,
  initR: number = 0,
  minRatio: number = 1;

type stateChart = '1' | '2' | '3';

let waitEvent: any,
  waitNodeName: string = '',
  // 1:缩略状态，2：正常状态
  // 记录需要返回的上一步状态
  recordReturnStatus: stateChart = '1';

// d3倍数比例
let k = 1;

let externalStatus: stateChart = '1';

const BubbleChart = (props: IGraph, ref: any) => {
  const { width, height, data, omittedMark, omitChange, select, showType, popupNodeID, popupNodeNS, onCloseDrawer } =
    props;
  const d3Container = useRef<any>(null);
  const [ratio, setRatio] = useState<number>(1);
  const [execution, setExecution] = useState<boolean>(false);
  const [showResourceName, setShowResourceName] = useState<boolean>(false);
  const [rRStatus, setRRStatus] = useState<stateChart>('1');

  const closeDrawer = useCallback(() => {
    onCloseDrawer && onCloseDrawer();
  }, [onCloseDrawer]);

  useEffect(() => {
    d3Container && d3Container?.current.addEventListener('click', closeDrawer, false);
    return () => {
      d3Container?.current.removeEventListener('click', closeDrawer);
    };
  }, [closeDrawer, d3Container]);

  const setChartStatus = useCallback(
    (s: stateChart, r?: stateChart) => {
      setRRStatus(s);
      externalStatus = s;
      r && (recordReturnStatus = r);
      omitChange && omitChange(!(s === '1'));
      setShowResourceName(s === '3');
    },
    [omitChange],
  );

  // 状态3的情况下点击命名空间返回
  const clickNsBackInitStatus = useCallback(() => {
    setChartStatus(recordReturnStatus, '2');
    setRatio(1);
    temRatio = 1;
    if (zoomNode) {
      zoomNode.scaleTo(screen, 1);
      zoomNode.translateBy(screen, -zX, -zY);
      // setShowResourceName(false);
      clickedNode = null;
    }
  }, [omitChange, rRStatus, setChartStatus]);

  const pack = useCallback(
    (data: any) => {
      return (
        d3
          // eslint-disable-next-line import/namespace
          .pack()
          .size([width, height])
          .padding(15)
          .radius(() => 20)(
          d3
            // eslint-disable-next-line import/namespace
            .hierarchy(data)
            .sum((d: any) => d.value)
            .sort((a: any, b: any) => b.value - a.value),
        )
      );
    },
    [width, height],
  );

  const zoomed = useCallback(
    (event: any) => {
      const { transform } = event;
      // svg双击效果禁用
      if (event?.sourceEvent?.type === 'dblclick') return;
      // if (
      //   event?.sourceEvent?.type === 'dblclick' &&
      //   event?.sourceEvent?.target?.nodeName === 'svg'
      // ) {
      //   transform['k'] = 1;
      //   transform['x'] = 0;
      //   transform['y'] = 0;
      //   svg.transition().duration(100).attr('transform', `${transform}`);
      //   return;
      // }
      let _ratio = transform.k;
      svg && svg.transition().duration(100).attr('transform', `${transform}`);
      if (event?.sourceEvent?.type === 'wheel') {
        // 切换状态 1 =》2
        if (externalStatus === '1' && _ratio > 1 && _ratio < 1.8) {
          _ratio = 1;
          setChartStatus('2', '2');
        }
        // 切换状态 2 =》1
        if (externalStatus === '2' && _ratio < 1) {
          _ratio = 1;
          setChartStatus('1', '1');
        }
        // 切换状态 2 =》3
        if (externalStatus === '2' && _ratio === 1.8) {
          setChartStatus('3', '2');
        }
        // 在选中情况下缩放会回到状态2
        if (externalStatus === '3' && _ratio < 1.8 && _ratio >= 1) {
          setChartStatus('2', '2');
        }
      }
      setRatio(_ratio);
      temRatio = transform.k;
      zX = transform.x;
      zY = transform.y;
    },
    [setChartStatus],
  );

  const zoomTo = useCallback(
    (v: any) => {
      let cx, cy, r, p;
      view = v;
      label.attr('transform', (d: Node) => {
        const x = (d.x - v[0]) * k;
        // let y = (d.y - v[1]) * k - (d.r || 0) / k;
        let n = omittedMark ? 6 : -14;
        let y = (d.y - v[1] + (d.r || 0)) * k + n;

        if (d.depth === 1) {
          y = (d.y - v[1] - (d.r || 0)) * k + 12;
        }
        // if (d.data.type && temRatio < 0.7) {
        //   y = (d.y - v[1]) * k + 8;
        // }
        return `translate(${x},${y})`;
      });
      // node.attr('transform', (d: Node) => {
      //   return `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`;
      // });
      // node.attr('r', (d: Node) => {
      //   return d.r * k;
      // });
      node.attr('points', (d: any) => {
        cx = (d.x - v[0]) * k;
        cy = (d.y - v[1]) * k;
        r = d.r * k;
        p = d.depth === 1 ? 0.5 : 0.1;
        return calculatePolygone(cx, cy, r, p);
      });
    },
    [omittedMark],
  );

  const zoom = useCallback(
    (event: any, d: Node): any => {
      event && event.stopPropagation();
      if (d.depth === 0 && zoomNode) {
        zoomNode.scaleTo(screen, 1);
        zoomNode.translateBy(screen, -zX, -zY);
        return;
      }
      const { r = 1, x, y } = d;
      // ns固定放大倍数
      // let kScale = Math.min(((width / 2) * 0.8) / r, ((height / 2) * 0.8) / r);
      let kScale = 1.8;

      const tsXgap = (x - view[0]) * k;
      const tsYgap = (y - view[1]) * k;

      const duration = 200;
      screen.transition().duration(duration).call(
        zoomNode.transform,
        // eslint-disable-next-line import/namespace
        d3.zoomIdentity.translate(0, 0).scale(kScale).translate(-tsXgap, -tsYgap),
      );
    },
    [width, height],
  );

  const renderChart = useCallback(
    (isRerender?: boolean) => {
      if (data && d3Container.current) {
        root = pack(data);
        focus = root;
        // eslint-disable-next-line import/namespace
        screen = d3.select(d3Container.current);
        svg = svg || screen.append('g').attr('class', 'g-animate');
        node = svg
          .selectAll('polyline')
          .data(root.descendants().slice(1))
          .join('polyline')
          .attr('fill', (d: any) => {
            if ((showType === 'drawer' || showType === 'all') && d.depth === 2 && rRStatus !== '1') {
              if (!d.data.seled) return getStrokeColor(d, true);
            }
            if ((showType === 'search' || showType === 'all') && d.depth === 2 && rRStatus !== '1') {
              if (!d.data.fade) return getSelectColor(d);
            }
            return getColor(d, rRStatus);
          })
          .attr('id', (d: any) => {
            if (d.depth === 1) {
              return d.data.name;
            }
            return d.data.id;
          })
          .attr('opacity', (d: any) => {
            if (
              (showType === 'all' && d.data.fade && d.data.seled) ||
              (showType === 'drawer' && d.data.seled) ||
              (showType === 'search' && d.data.fade)
            )
              return '0.35';

            return '1';
          })
          .attr('class', (d: Node) => {
            if (showType !== 'null' && rRStatus !== '1') {
              return '';
            }
            if (
              d.depth === 2 &&
              [ScanSeverity.Critical, ScanSeverity.High, ScanSeverity.Medium].includes(d.data.severity)
            ) {
              // return 'animate-attention';
              return '';
            }
            return '';
          })
          .attr('data-severity', (d: Node) => {
            return d.data.severity;
          })
          .attr('stroke', '1')
          .attr('stroke', (d: Node) => {
            return d.depth === 1 ? 'rgba(255, 255, 255, 1)' : getStrokeColor(d, true);
          })
          .attr('stroke-width', (d: Node) => {
            let r = 2;
            if (ratio > 1) return r / ratio;
            return 2;
          })
          .attr('stroke-opacity', '1')
          .on('click', (event: any, d: Node) => {
            event && event.stopPropagation();
            const type = d.data.type;
            let _d = d;

            // 如果是状态1
            if (!omittedMark) {
              // 点资源后找到对应的命名空间
              if (type === 'group' && _d.depth === 2) {
                _d = d.parent;
              }
              // 找到对应的ns，记录事件和ns名称，切换状态然后放大
              waitEvent = event;
              waitNodeName = _d.data.name;
              setExecution(true);
              setChartStatus('3', '1');
              return;
            }
            // 其他选中清空状态
            if (_d.depth === 2) {
              // 设置选中状态
              select && select(_d);
              // 找到资源对应命名空间，放大图像
              _d = d.parent;
            }
            // 再次点击同一个ns，回到最初状态
            if (clickedNode === d.data.name && d.depth === 1) {
              clickNsBackInitStatus();
              return;
            }
            !clickedNode && setChartStatus('3', '2');
            clickedNode = _d.data.name;
            return zoom(event, _d);
          })
          .on('mouseover', function (e: any, d: Node) {
            // 显示气泡框
            // 判断是否缩略类型 =》d.data.type
            if (d.depth === 2 || (d.depth === 1 && externalStatus !== '3')) {
              props.showTooltip && props.showTooltip(d, view, { zX, zY }, ratio);
            }
          })
          .on('mouseout', function (e: any, d: Node) {
            // 关闭显示气泡框
            props.showTooltip && props.showTooltip(null, view, { zX, zY }, ratio);
          });
        labelG = svg;
        label = labelG
          .selectAll('text')
          .data(root.descendants())
          .join('text')
          .attr('pointer-events', 'none')
          .attr('text-anchor', 'middle')
          .style('fill-opacity', (d: Node) => {
            if (showResourceName) {
              return 1;
            }
            return d.depth === 1 || d.data.type ? 1 : 0;
          })
          .style('display', (d: Node) => {
            if (d.depth === 0) {
              return 'none';
            }
            return d.depth === 1 || d.data.type || showResourceName ? 'inline-block' : 'none';
          })
          .style('fill', (d: Node) => {
            if (d.data.type || d.depth === 2) {
              return getStrokeColor(d, true);
            }
            return '#4A4C51';
          })
          .style('font-size', (d: Node) => {
            if (d.data.type) {
              return '16px';
            }
            if (d.depth === 1) {
              return '14px';
            }
            return '6px';
          })
          .style('font-weight', '400')
          .text((d: Node) => {
            const type = d.data.type;
            const name = d.data.name;
            const id = d.data.id;
            if (d.depth === 1 || (name && name.includes('...')) || (type && type === 'group')) {
              return name;
            }
            return id;
          });

        zoomNode = d3
          // eslint-disable-next-line import/namespace
          .zoom()
          .extent([
            [0, 0],
            [props.width, props.height],
          ])
          .scaleExtent([0.99, 1.8])
          .on('zoom', (e: any) => {
            return zoomed(e);
          });
        screen.call(zoomNode);
        zoomTo([root.x, root.y, root.r || 0]);
      }
    },
    [
      JSON.stringify(data),
      d3Container,
      showType,
      showResourceName,
      pack,
      zoomed,
      zoomTo,
      zoom,
      omittedMark,
      omitChange,
      select,
      clickNsBackInitStatus,
      setChartStatus,
      ratio,
    ],
  );

  useEffect(() => {
    if (props.data && props.width && d3Container.current) {
      if (svg) {
        svg.attr('class', 'g-animate motioned');
        // svg.selectAll('text').remove();
        setTimeout(() => {
          svg.attr('class', 'g-animate');
        }, 500);
      }
      renderChart();
    }
  }, [JSON.stringify(data), width, renderChart]);

  useEffect(() => {
    setChartStatus('1', '1');
    // 切换页面的时候initSearchChart会影响状态
    setTimeout(() => {
      setChartStatus('1', '1');
    }, 500);
    return () => {
      svg = null;
    };
  }, [setChartStatus]);

  useEffect(() => {
    if (execution && omittedMark && waitNodeName) {
      setTimeout(() => {
        // eslint-disable-next-line import/namespace
        let d: any = d3.select(`#${waitNodeName}`).data()?.[0];
        if (d) {
          zoom(waitEvent, d);
          clickedNode = d.data.name;
          setExecution(false);
          waitEvent = null;
          waitNodeName = '';
        }
      }, 520);
    }
  }, [execution, omittedMark, zoom]);

  const onChangeBtn = useCallback(
    (type: 'add' | 'red') => {
      if (type === 'red' && rRStatus === '1') return;
      if (type === 'add' && rRStatus === '3') return;
      let _ratio = 1;
      if (type === 'red' && rRStatus !== '1') {
        let n: any = String(Number(rRStatus) - 1);
        // 在状态3下，清除点击的click
        if (n === '2' && clickedNode) {
          clickedNode = null;
        }
        // 状态1
        setChartStatus(n, n);
      }
      if (type === 'add' && rRStatus !== '3') {
        // 状态1 点+ 状态2
        let n: any = String(Number(rRStatus) + 1);
        let lastStep = n === '3' ? '2' : '';
        setChartStatus(n, '2');
        _ratio = n === '3' ? 1.8 : 1;
      }
      setRatio(_ratio);
      temRatio = _ratio;
      if (zoomNode) {
        zoomNode.scaleTo(screen, _ratio);
        zoomNode.translateBy(screen, -zX / _ratio, -zY / _ratio);
      }
    },
    [rRStatus, setChartStatus],
  );

  const initChartCenter = useCallback(() => {
    if (temRatio && zoomNode) {
      zoomNode.translateBy(screen, -zX / temRatio, -zY / temRatio);
    }
  }, []);

  useEffect(() => {
    if (popupNodeID && popupNodeNS) {
      // eslint-disable-next-line import/namespace
      let d: any = d3.selectAll('polyline[id="' + `${popupNodeID}` + '"]').data();
      d = d.filter((f: Node) => f.depth === 2 && f.data.original.namespace === popupNodeNS);
      if (d.length >= 1) {
        select && select(d[0]);
        zoom(null, d[0]);
        setChartStatus('3', recordReturnStatus);
      }
    }
  }, [popupNodeID, popupNodeNS, select, zoom, setChartStatus]);

  const initSearchChart = useCallback(() => {
    setRatio(1);
    temRatio = 1;
    if (zoomNode) {
      zoomNode.scaleTo(screen, 1);
      zoomNode.translateBy(screen, -zX / 1, -zY / 1);
      setChartStatus('2', '2');
      clickedNode = null;
    }
  }, [setChartStatus]);

  useEffect(() => {
    if (!omittedMark) {
      // 切换集群的时候，重置状态为1
      setChartStatus('1');
    }
  }, [omittedMark, setChartStatus]);

  useImperativeHandle(ref, () => {
    return {
      show() {},
      initSearch() {
        initSearchChart();
      },
      initCenter() {
        initChartCenter();
      },
    };
  }, [initSearchChart, initChartCenter]);

  return (
    <div id="d3-chart">
      <div className="slider-case">
        <div className="reducBtn df dfac dfjc shadow-round" onClick={() => initChartCenter()}>
          <img src={Resources.back} alt="back" />
        </div>
        <span
          className={classNames('slider-red-btn shadow-round', {
            'pri-disabled': rRStatus === '1',
          })}
          onClick={() => onChangeBtn('red')}
        >
          -
        </span>
        <div className="cont-case shadow-round">
          <Slider disabled min={0.9} max={1.8} step={0.01} value={rRStatus === '1' ? 0.9 : ratio} />
        </div>
        <span
          className={classNames('slider-add-btn shadow-round', {
            'pri-disabled': rRStatus === '3',
          })}
          onClick={() => onChangeBtn('add')}
        >
          +
        </span>
      </div>
      <svg
        className="d3-component"
        width={props.width}
        height={props.height}
        viewBox={`-${props.width / 2} -${props.height / 2} ${props.width} ${props.height}`}
        ref={d3Container}
      />
    </div>
  );
};

export default forwardRef(BubbleChart);
