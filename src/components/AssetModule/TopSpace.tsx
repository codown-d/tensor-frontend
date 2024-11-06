import React, { forwardRef, useImperativeHandle, useEffect, useCallback, useState, useMemo } from 'react';
import { tap } from 'rxjs/operators';
import classNames from 'classnames';
import './TopSpace.scss';
import { TzSpace } from '../tz-space';
import { Resources } from '../../Resources';
import EllipsisPopover from '../ellipsisPopover/ellipsisPopover';
import { getGraphAllTypeCount } from '../../services/DataService';
import { WebResponse } from '../../definitions';
import { Store } from '../../services/StoreService';
import { translations } from '../../translations/translations';
import { TzCard } from '../tz-card';
import { TzCol, TzRow } from '../tz-row-col';
import { keys } from 'lodash';

const AssetTopSpace = (props?: any) => {
  const {
    type,
    data: { namespace, resourceKind, resourceName, namespaceName },
    clusterID,
  } = props;
  let [overviewData, setOverviewData] = useState<any>({
    images: {
      num: '0',
      img: Resources.AssetImages,
      style: { backgroundColor: '#E7F2FD' },
      type: 'images',
      txt: translations.number_images,
      op: {
        cluster_key: clusterID,
        namespace,
        resourceKind,
        resourceName,
      },
    },
    containers: {
      num: '0',
      img: Resources.AssetContainer,
      style: { backgroundColor: '#EAE8FF' },
      type: 'containers',
      txt: translations.number_containers,
      op: {
        cluster_key: clusterID,
        namespace,
        resourceKind,
        resourceName,
      },
    },
    pods: {
      num: '0',
      img: Resources.AssetPod,
      type: 'pods',
      style: { backgroundColor: '#FFE8E9' },
      txt: translations.number_pods,
      op: {
        cluster_key: clusterID,
        namespace,
        resourceKind,
        resourceName,
      },
    },
    resources: {
      num: '0',
      style: { backgroundColor: '#F0E6FF' },
      img: Resources.AssetResource,
      type: 'resources',
      txt: translations.number_resources,
      op: {
        cluster_key: clusterID,
        namespace,
        resourceKind,
        resourceName,
      },
    },
  });
  const data = useMemo(() => {
    let arr: any[] = [];
    let list = ['containers', 'pods'];
    if (type === 'namespace') {
      arr = ['resources', ...list];
    } else if (type === 'resource' || type === 'pods') {
      arr = ['images', ...list];
    }
    return arr.reduce((pre, item) => {
      if (overviewData[item]) {
        pre.push(overviewData[item]);
      }
      return pre;
    }, []);
  }, [type, overviewData]);

  useEffect(() => {
    if (type === 'pods') {
      let { ContainerCount: containers, PodCount: pods, ImageCount: images } = props.data;
      setOverviewData((pre: any) => {
        pre['containers'].num = containers;
        pre['pods'].num = pods;
        pre['images'].num = images;
        return { ...pre };
      });
    } else {
      keys(overviewData).forEach((element) => {
        getGraphAllTypeCount(element, overviewData[element].op).subscribe((res) => {
          const item = res.getItem();
          if (item) {
            setOverviewData((pre: any) => {
              pre[element].num = item.count;
              return { ...pre };
            });
          }
        });
      });
    }
  }, [type]);

  const SpaceItems = useMemo(() => {
    return data.map((t: any) => {
      return (
        <TzCol span={6} className="asset-top-space">
          <div className={`space-item-case ${t.type}`}>
            <div className="img-case dfc" style={t.style}>
              <img alt={t.type} src={t.img} />
            </div>
            <div className="content-case flex-c-c">
              <span className="num-txt">{t.num}</span>
              <span className="des-txt">{t.txt}</span>
            </div>
          </div>
        </TzCol>
      );
    });
  }, [data]);

  return <TzRow gutter={[16, 16]}>{SpaceItems}</TzRow>;
};

export default AssetTopSpace;
