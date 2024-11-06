import { useSize, useFullscreen, useMemoizedFn, useBoolean } from 'ahooks';
import { TzCard } from '../../../components/tz-card';
import { TzTag } from '../../../components/tz-tag';
import { groupBy, keys, merge } from 'lodash';
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { getClusterName } from '../../../helpers/use_fun';
import { microsegNamespaces, microsegResources } from '../../../services/DataService';
import VisualizeChart from './VisualizeChart';
import { translations } from '../../../translations/translations';
let initChartData = (items: any[], key: string, name: string) => {
  let itemsKeyObj = groupBy(items, (item) => `${item[key]}`);
  let unGroup = itemsKeyObj?.['0'] || [];
  let arr = keys(itemsKeyObj)
    .filter((keyObj: any) => keyObj != '0')
    .map((item) => {
      let node = itemsKeyObj[item][0];
      return {
        name: node[name] || item,
        id: item,
        type: 'group',
        children: itemsKeyObj[item],
      };
    });
  let obj = {
    name: 'environment',
    id: 'root',
    children: [...unGroup, ...arr],
  };
  return obj;
};
interface GroupOverviewProps {
  cluster?: string;
  namespace?: string;
  type: 'resourceGroup' | 'namespaceGroup';
}
const GroupOverview = (props: GroupOverviewProps) => {
  let { cluster, namespace, type } = props;
  let [chartHierarchy, setChartHierarchy] = useState<any>();
  const ref = useRef(null);
  const size = useSize(ref);
  const [isFullscreen, { toggleFullscreen }] = useFullscreen(ref);
  let getmicrosegResources = useMemoizedFn(() => {
    let fn = type === 'resourceGroup' ? microsegResources : microsegNamespaces;
    let prams = { cluster, namespace };
    fn(prams).subscribe((res) => {
      if (res.error) return;
      let items = res.getItems().map((item) => {
        return merge(item, { value: 1, type: 'node' });
      });
      let data = {};
      if (type === 'resourceGroup') {
        data = initChartData(items, 'segmentID', 'segmentName');
      } else {
        data = initChartData(items, 'nsgroupID', 'nsgroupName');
      }
      setChartHierarchy(data);
    });
  });
  useEffect(() => {
    getmicrosegResources();
  }, [cluster, namespace]);
  return (
    <div ref={ref} style={{ height: '577px', background: '#fff' }} className="mb20">
      <TzCard
        style={{ position: 'relative' }}
        title={
          <div className="flex-r-c" style={{ justifyContent: 'flex-start' }}>
            {translations.group_overview}
            <span>
              <TzTag className="ml12 ant-tag-gray f12 small">
                {translations.clusterManage_key}：{getClusterName(cluster || '')}
              </TzTag>
              {namespace ? (
                <TzTag className="ml4 ant-tag-gray f12 small">
                  {translations.onlineVulnerability_outerShapeMeaning}：{namespace}
                </TzTag>
              ) : null}
            </span>
          </div>
        }
      >
        <i
          onClick={toggleFullscreen}
          className={`icon iconfont f16 ${isFullscreen ? 'icon-quxiaoquanping' : 'icon-quanping'}`}
          style={{ position: 'absolute', right: '20px', top: '20px' }}
        ></i>
        <VisualizeChart
          height={(size?.height || 900) - 77}
          width={(size?.width || 600) - 48}
          data={chartHierarchy}
          type={type}
        />
      </TzCard>
    </div>
  );
};
export default GroupOverview;
