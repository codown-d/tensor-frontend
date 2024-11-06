import React, { useCallback } from 'react';
import './VisualizeChart.less';
import * as d3 from 'd3';
import { merge } from 'lodash';
import { useFullscreen, useMemoizedFn } from 'ahooks';
import { BasicTarget } from 'ahooks/lib/utils/domTarget';

export enum ToolbarType {
  fullScreen = 'fullScreen',
  zoomIn = 'zoomIn',
  zoomOut = 'zoomOut',
  center = 'center',
  refresh = 'refresh',
}
interface ToolbarProps {
  direction: 'horizontal' | 'vertical';
  fullScreen?: { target: React.MutableRefObject<null> };
  zoomIn?: { scaleExtent: [0.66, 4] };
  zoomOut?: { scaleExtent: [0.66, 4] };
  center?: {};
  refresh?: {};
  style?: React.CSSProperties;
  target: React.ReactNode;
}
const Toolbar = function (props: ToolbarProps) {
  let { direction = 'vertical', style, fullScreen } = props;

  const [isFullscreen, { toggleFullscreen }] = useFullscreen(fullScreen?.target);
  let fullScreenFn = useMemoizedFn(() => {
    toggleFullscreen();
  });
  let zoomIn = useMemoizedFn(() => {
    // d3.select(target)
    //   .transition()
    //   .call(zoomNode.transform, d3.zoomIdentity.scale(2));
  });
  let zoomOut = useMemoizedFn(() => {});
  let center = useMemoizedFn(() => {});
  let refresh = useMemoizedFn(() => {});
  return (
    <div
      className={`toolbar toolbar-${direction}`}
      style={merge(
        {
          bottom: '20px',
          left: '15px',
        },
        style,
      )}
    >
      {[].map((item) => {
        let obj: any = {
          fullScreen: 'icon-quanping',
          zoomIn: 'icon-fangda1',
          zoomOut: 'icon-suoxiao',
          refresh: 'icon-shuaxin',
          center: 'icon-dingwei1',
        };
        return (
          <i
            className={`iocn iconfont ${obj[item]} mr8`}
            onClick={() => {
              eval(item)();
            }}
          ></i>
        );
      })}
    </div>
  );
};
export default Toolbar;
