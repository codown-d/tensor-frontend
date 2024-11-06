import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Hierarchy } from '../../definitions';
import * as d3 from 'd3';
import './BubbleChartSegmentComponent.scss';
import { getSegmentColor, getSegmentStrokeColor } from './BubbleColorResolver';

export interface BubbleChartSegmentProps {
  data?: Hierarchy;
  links?: {
    source: string;
    target: string;
    info?: {
      dstPort?: number | undefined;
      protocol?: string | undefined;
    }[];
  }[];
}

let svg: d3.Selection<SVGSVGElement, any, null, undefined> | null = null;
let root: d3.HierarchyCircularNode<any> | null = null;
let focus: d3.HierarchyCircularNode<any> | null = null;
let node: d3.Selection<SVGCircleElement | null, d3.HierarchyCircularNode<any>, SVGGElement, any> | null = null;
let label: d3.Selection<d3.BaseType | SVGTextElement, d3.HierarchyCircularNode<any>, SVGGElement, any> | null = null;
let view: [number, number, number] | null = null;

function elementDimentions(id: string): {
  x: number;
  y: number;
  r: number;
  color: string;
} {
  const el = document.getElementById(id);
  if (!el)
    return {
      x: 0,
      y: 0,
      r: 0,
      color: '',
    };
  const computedStyle = getComputedStyle(el);
  const matrix = new WebKitCSSMatrix(computedStyle.transform);
  return {
    x: matrix.m41,
    y: matrix.m42,
    r: el.getBoundingClientRect().width / 2,
    color: computedStyle.fill,
  };
}

function getPath(p1x: number, p1y: number, p2x: number, p2y: number) {
  const mpx = (p2x + p1x) * 0.5;
  const mpy = (p2y + p1y) * 0.5;

  const theta = Math.atan2(p2y - p1y, p2x - p1x) - Math.PI / 2;
  const offset = 100;

  const c1x = mpx + offset * Math.cos(theta);
  const c1y = mpy + offset * Math.sin(theta);

  return 'M' + p1x + ' ' + p1y + ' Q ' + c1x + ' ' + c1y + ' ' + p2x + ' ' + p2y;
}

function getTargetNodeCircumferencePoint(
  source: {
    x: number;
    y: number;
    r: number;
    color: string;
  },
  target: {
    x: number;
    y: number;
    r: number;
    color: string;
  },
) {
  const t_radius = target.r;
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const gamma = Math.atan2(dy, dx);
  const tx = target.x - Math.cos(gamma) * t_radius;
  const ty = target.y - Math.sin(gamma) * t_radius;

  return [tx, ty];
}

function handlePathVisiblity(selector: string, dim: boolean) {
  const paths = document.querySelectorAll(selector);
  paths.forEach((path) => {
    if (dim) {
      path.classList.add('dim');
    } else {
      path.classList.remove('dim');
    }
  });
}

const BubbleChartSegment = (props: BubbleChartSegmentProps) => {
  const d3Container = useRef(null as SVGSVGElement | null);

  const { data, links } = props;
  const [width, setwidth] = useState(0);
  const [height, setheight] = useState(0);

  const [hassvg, sethassvg] = useState(false);

  const drawLinks = useCallback(() => {
    svg!.selectAll('path.linkLineSegs').remove();
    svg!.selectAll('text.infoText').remove();
    svg!.selectAll('defs').remove();

    svg!
      .append('defs')
      .selectAll('marker')
      .data(['end'])
      .join('marker')
      .attr('id', `arrow-dd`)
      .attr('viewBox', '0 -5 10 10')
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', 'rgba(107, 123, 153,0.9)')
      .attr('d', 'M0,-5L10,0L0,5');

    const nodes = root!.descendants().slice(1);

    links?.forEach((link) => {
      const source = nodes.find((n) => n.data.id.toString() === link.source.toString());
      const target = nodes.find((n) => n.data.id.toString() === link.target.toString());

      if (source && target) {
        const sourceDimentions = elementDimentions(link.source);
        const targetDimentions = elementDimentions(link.target);
        const point = getTargetNodeCircumferencePoint(sourceDimentions, targetDimentions);

        svg!
          .append('path')
          .attr('fill', 'none')
          .attr('class', 'linkLineSegs')
          .attr('stroke-width', 2.5)
          .attr('id', `path_${link.source}_${link.target}`)
          .attr('d', getPath(sourceDimentions.x, sourceDimentions.y, point[0], point[1]));

        svg!
          .append('g')
          .style('font', '10px sans-serif')
          .attr('pointer-events', 'none')
          .attr('text-anchor', 'middle')
          .style('fill', '#000')
          .selectAll('text')
          .data(['end'])
          .join('text')
          .style('fill-opacity', (d) => 1)
          .style('display', (d) => 'inline-block')
          .attr('x', point[0])
          .attr('y', point[1])
          .attr('class', 'infoText')
          .text((d) => {
            return link.info?.map((item) => `${item.protocol}(${item.dstPort})`).join() || '-';
          });
      }
    });
  }, [links]);

  const zoomTo = useCallback(
    (v: [number, number, number]) => {
      const k = (width / v[2]) * 0.3;

      label!.attr('transform', (d) => {
        const x = (d.x - v[0]) * k;
        let y = (d.y - v[1]) * k - d.r / 1.5;

        if (d.depth === 3) {
          y += 20;
        }
        return `translate(${x},${y})`;
      });

      node!.attr('transform', (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);

      node!.attr('r', (d) => {
        if (d.depth === 3) {
          return (d.r * k) / 1.5;
        }
        return d.r * k;
      });

      view = v;

      drawLinks();
    },
    [drawLinks, width],
  );

  const zoom = useCallback(
    (event: any, d: any = root) => {
      svg!.selectAll('path').remove();

      const duration = 750;
      focus = d;

      const transition = svg!
        .transition()
        .duration(duration)
        .tween('zoom', (d: any) => {
          // eslint-disable-next-line import/namespace
          const i = d3.interpolateZoom(view!, [focus!.x, focus!.y, focus!.r]);
          return (t: any) => zoomTo(i(t));
        });

      label!
        // .filter(function (this: any, d: any) {
        //   return (
        //     d.parent === focus ||
        //     (d.parent &&
        //       d.parent.parent !== root &&
        //       d.parent.parent === focus) ||
        //     this.style.display === 'inline'
        //   );
        // })
        .transition(transition as any)
        .style('fill-opacity', (d: any) => {
          if (d.parent) {
            if (d.parent.parent) {
              if (focus === d.parent.parent) {
                return 0;
              } else if (focus === d.parent) {
                return 1;
              } else {
                return 1;
              }
            } else {
              if (focus === d.parent) {
                return 1;
              } else {
                return 1;
              }
            }
          } else {
            return 0;
          }
        })
        .on('start', function (this: any, d: any) {
          if (
            d.parent === focus ||
            (d.parent && d.parent.parent !== root && d.parent.parent === focus && d.depth !== 3)
          )
            this.style.display = 'inline';
        })
        .on('end', function (this: any, d: any) {
          if ((d.parent !== focus && d.parent && d.parent.parent !== focus) || d.depth === 3)
            this.style.display = 'inline';
        });
    },
    [zoomTo],
  );

  const renderChart = useCallback(
    (data: Hierarchy, isRerender?: boolean) => {
      // eslint-disable-next-line import/namespace
      root = d3.pack().size([width, height]).padding(15)(
        d3
          // eslint-disable-next-line import/namespace
          .hierarchy(data)
          .sum((d) => d.value)
          .sort((a, b) => b.value! - a.value!),
      );
      focus = root;
      node = (isRerender ? svg! : svg!.append('g'))
        .selectAll('circle' as any)
        .data(root.descendants().slice(1))
        .join('circle')
        .attr('fill', (d: any) => {
          return getSegmentColor(d);
        })
        .attr('id', (d: any) => {
          return d.data.id;
        })
        .attr('stroke', (d) => {
          return getSegmentStrokeColor(d);
        })
        .attr('stroke-width', (d) => {
          return d.depth === 1 ? '1' : '2';
        })
        .on('click', (event: any, d: any) => {
          return focus !== d && (zoom(event, d), event.stopPropagation());
        })
        .on('mouseover', function (e: any, d: any) {
          // eslint-disable-next-line import/namespace
          d3.select(e.currentTarget).attr('opacity', '0.8');
          if (d.data.id) {
            const selector = `[id^=path_${d.data.id}]`;
            if (document.querySelectorAll(selector).length > 0) {
              handlePathVisiblity('.linkLineSegs', true);
              handlePathVisiblity(selector, false);
            }
          }
        })
        .on('mouseout', function (e: any) {
          // eslint-disable-next-line import/namespace
          d3.select(e.currentTarget).attr('opacity', '1');
          handlePathVisiblity('.linkLineSegs', false);
        });

      label = svg!
        .append('g')
        .style('font', '10px sans-serif')
        .attr('pointer-events', 'none')
        .attr('text-anchor', 'middle')
        .style('fill', '#000')
        .selectAll('text')
        .data(root.descendants())
        .join('text')
        .style('fill-opacity', (d) => {
          if (d.parent) {
            if (d.parent.parent) {
              if (focus === d.parent.parent) {
                return 0;
              } else if (focus === d.parent) {
                return 1;
              } else {
                return 1;
              }
            } else {
              if (focus === d.parent) {
                return 1;
              } else {
                return 1;
              }
            }
          } else {
            return 0;
          }
        })
        .text((d) => {
          // const original = d.data?.original;
          const name = d.data?.name;
          const kind = d.data?.kind;
          // const dstPort = original?.dstPort;
          return `${name}${kind ? `(${kind})` : ''}`;
        });

      zoomTo([root.x, root.y, root.r]);

      sethassvg(true);
    },
    [height, width, zoom, zoomTo],
  );

  useEffect(() => {
    if (!width || !height || !hassvg) {
      return;
    }

    const timer = setTimeout(() => {
      drawLinks();
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [drawLinks, hassvg, height, width]);

  useEffect(() => {
    if (!data || !width || !height) {
      svg = null;
      sethassvg(false);
      return;
    }
    let timer1: any;
    let timer2: any;

    if (svg) {
      svg.attr('class', 'd3-segment motioned');
      timer1 = setTimeout(() => {
        svg!.selectAll('text').remove();
        renderChart(data, true);
        timer2 = setTimeout(() => {
          svg!.attr('class', 'd3-segment');
        }, 500);
      }, 10);
    } else {
      // eslint-disable-next-line import/namespace
      svg = d3.select(d3Container.current!);
      renderChart(data);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [data, renderChart, width, height]);

  useEffect(() => {
    const svgel = d3Container.current!;
    const parentNode = svgel.parentElement;
    const style = parentNode!.getBoundingClientRect();
    setwidth(style.width);
    setheight(style.width * 0.6);
  }, []);

  const viewBox = useMemo(() => {
    return `-${width / 2} -${height / 2} ${width} ${height}`;
  }, [height, width]);

  return (
    <svg className="d3-segment" width={width} height={height} viewBox={viewBox} ref={d3Container} onClick={zoom} />
  );
};

export default BubbleChartSegment;
