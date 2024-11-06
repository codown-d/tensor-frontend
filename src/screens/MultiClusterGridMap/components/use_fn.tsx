import { useMemoizedFn, useSetState } from 'ahooks';
import {
  ResProps,
  getContainerStream,
  getPodStream,
  getProcessList,
  getProcessStream,
  getResourceStream,
} from '../../../services/DataService';
import { translations } from '../../../translations';
import {
  JumpContainer,
  JumpNamespace,
  JumpPod,
  JumpResource,
} from '../../../screens/MultiClusterRiskExplorer/components';
import { TzTag } from '../../../components/tz-tag';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { formatGeneralTime } from '../../../definitions';
import React, { useMemo } from 'react';
import { grayStyle } from './TableScreen';
import { getUid } from '../../../helpers/until';
import { merge } from 'lodash';

export const useTopologyData = () => {
  let [data, setData] = useSetState<any>({ resource: {}, pod: {}, container: {}, process: {} });
  let getResourceStreamFn = useMemoizedFn((value: ResProps, selTime: '1' | '7' | '30', arr) => {
    const list = (arr || []).map((item: any) => {
      let { topology_name, id } = item;
      return merge({
        id,
        topology_name,
        type: 'original',
        originData: item,
      });
    });
    let resource: any = {
      ingress: {
        nodes: [...list],
        edges: [],
      },
      egress: {
        nodes: [...list],
        edges: [],
      },
    };
    Promise.all(
      ['ingress', 'egress'].map((item: any) => {
        return new Promise((resolve) => {
          Promise.all(
            list.map((ite: any) => {
              let { originData } = ite;
              return new Promise((re) => {
                getResourceStream(originData, item, selTime).subscribe((res) => {
                  res.getItems().forEach((t: any) => {
                    let id = 'resource_' + getUid();
                    resource[item].nodes.push({ id, originData: merge(t, { id, topology_name: t.resource_name }) });
                    let source = item === 'ingress' ? id : ite.id;
                    let target = item === 'ingress' ? ite.id : id;
                    resource[item].edges.push({ source, target });
                  });
                  re(null);
                });
              });
            }),
          ).then((res) => {
            resolve(res);
          });
        });
      }),
    ).then((res) => {
      setData((pre: any) => {
        pre['resource'] = resource;
        return pre;
      });
    });
  });
  let getPodStreamFn = useMemoizedFn((value: ResProps, selTime: '1' | '7' | '30', arr) => {
    const list = (arr || []).map((item: any) => {
      let { topology_name, id } = item;
      return merge({
        id,
        topology_name,
        type: 'original',
        originData: item,
      });
    });
    let pod: any = {
      ingress: {
        nodes: [...list],
        edges: [],
      },
      egress: {
        nodes: [...list],
        edges: [],
      },
    };
    Promise.all(
      ['ingress', 'egress'].map((item: any) => {
        return new Promise((resolve) => {
          Promise.all(
            list.map((ite: any) => {
              let { PodName, pod_name } = ite.originData;
              return new Promise((re) => {
                getPodStream(
                  {
                    ...value,
                    pod_name: PodName || pod_name,
                  },
                  item,
                  selTime,
                ).subscribe((res) => {
                  const items = res.getItems().forEach((t: any) => {
                    let id = 'pod_' + getUid();
                    pod[item].nodes.push({ id, originData: merge(t, { id, topology_name: t.pod_name }) });
                    let source = item === 'ingress' ? id : ite.id;
                    let target = item === 'ingress' ? ite.id : id;
                    pod[item].edges.push({ source, target });
                  });
                  re(items);
                });
              });
            }),
          ).then((res) => {
            resolve(res);
          });
        });
      }),
    ).then((res) => {
      setData((pre: any) => {
        pre['pod'] = pod;
        return pre;
      });
    });
  });
  let getContainerStreamFn = useMemoizedFn((value: ResProps, selTime: '1' | '7' | '30', arr) => {
    const list = (arr || []).map((item: any) => {
      let { topology_name, id } = item;
      return merge({
        id,
        topology_name,
        type: 'original',
        originData: item,
      });
    });
    let container: any = {
      ingress: {
        nodes: [...list],
        edges: [],
      },
      egress: {
        nodes: [...list],
        edges: [],
      },
    };
    Promise.all(
      ['ingress', 'egress'].map((item: any) => {
        return new Promise((resolve) => {
          Promise.all(
            list.map((ite: any) => {
              let { container_id } = ite.originData;
              return new Promise((re) => {
                getContainerStream(
                  {
                    ...value,
                    container_id: container_id,
                  },
                  item,
                  selTime,
                ).subscribe((res) => {
                  const items = res.getItems().forEach((t: any) => {
                    let id = 'container_' + getUid();
                    container[item].nodes.push({ id, originData: merge(t, { id, topology_name: t.container_name }) });
                    let source = item === 'ingress' ? id : ite.id;
                    let target = item === 'ingress' ? ite.id : id;
                    container[item].edges.push({ source, target });
                  });
                  re(items);
                });
              });
            }),
          ).then((res) => {
            resolve(res);
          });
        });
      }),
    ).then((res) => {
      setData((pre: any) => {
        pre['container'] = container;
        return pre;
      });
    });
  });
  let getProcessStreamFn = useMemoizedFn((value: ResProps, selTime: '1' | '7' | '30', arr) => {
    const list = (arr || []).map((item: any) => {
      let { topology_name, id } = item;
      return merge({
        id,
        topology_name,
        type: 'original',
        originData: item,
      });
    });
    let process: any = {
      ingress: {
        nodes: [...list],
        edges: [],
      },
      egress: {
        nodes: [...list],
        edges: [],
      },
    };
    Promise.all(
      ['ingress', 'egress'].map((item: any) => {
        return new Promise((resolve) => {
          Promise.all(
            list.map((ite: any) => {
              let { container_id, process_name } = ite.originData;
              return new Promise((re) => {
                getProcessStream(
                  {
                    ...value,
                    container_id: container_id,
                    proc_name: process_name,
                  },
                  item,
                  selTime,
                ).subscribe((res) => {
                  const items = res.getItems().forEach((t: any) => {
                    let id = 'process_' + getUid();
                    process[item].nodes.push({ id, originData: merge(t, { id, topology_name: t.process_name }) });
                    let source = item === 'ingress' ? id : ite.id;
                    let target = item === 'ingress' ? ite.id : id;
                    process[item].edges.push({ source, target });
                  });
                  re(items);
                });
              });
            }),
          ).then((res) => {
            resolve(res);
          });
        });
      }),
    ).then((res) => {
      setData((pre: any) => {
        pre['process'] = process;
        return pre;
      });
    });
  });
  return { getResourceStreamFn, getPodStreamFn, getContainerStreamFn, getProcessStreamFn, data };
};
export const useTableScreenColumns = (type: string) => {
  let arrColumns = useMemo(() => {
    let arr: any = [
      {
        title: translations.chart_map_columns_sourceResources,
        dataIndex: 'resource',
        render(item: any, row: any) {
          let { resource_name, resource_kind, namespace, cluster_id } = row;
          const str = `${translations.chart_map_type}：` + resource_kind;
          return (
            <>
              <JumpResource
                name={resource_name}
                kind={resource_kind}
                namespace={namespace}
                clusterKey={cluster_id}
                title={resource_name}
              />
              <div style={{ maxWidth: '100%' }}>
                <TzTag style={grayStyle} className="small mt4 ">
                  <EllipsisPopover title={resource_kind || '-'}>{str}</EllipsisPopover>
                </TzTag>
              </div>
            </>
          );
        },
      },
      {
        title: translations.scanner_detail_aboutResource,
        dataIndex: 'namespace',
        ellipsis: {
          showTitle: true,
        },
        render(item: any, row: any) {
          let { resource_name, resource_kind, cluster_id, namespace } = row;
          return (
            <>
              <JumpResource
                name={resource_name}
                kind={resource_kind}
                namespace={namespace}
                clusterKey={cluster_id}
                title={resource_name}
              />
            </>
          );
        },
      },
      {
        title: translations.chart_map_columns_connectionInformation,
        dataIndex: 'port',
        render(item: any, row: any) {
          let { dst_port, link_count, create_at, update_at } = row;
          return (
            <>
              <div className="f12">{`${translations.chart_map_port}：${dst_port}（${translations.chart_map_connectionCount}：${link_count}）`}</div>
              <div className="f12">{`${translations.chart_map_createTime}：${formatGeneralTime(create_at)}`}</div>
              <div className="f12">{`${translations.chart_map_updateTime}：${formatGeneralTime(update_at)}`}</div>
            </>
          );
        },
      },
    ];
    if (type === 'resource') {
      arr[1] = {
        title: translations.scanner_detail_aboutResource,
        dataIndex: 'namespace',
        ellipsis: {
          showTitle: true,
        },
        render(item: any, row: any) {
          let { namespace, cluster_id } = row;
          return (
            <>
              <JumpNamespace namespace={namespace} clusterKey={cluster_id} title={namespace} />
            </>
          );
        },
      };
    }
    if (type === 'pod') {
      arr[0] = {
        title: translations.chart_map_columns_sourceResources,
        dataIndex: 'resource',
        render(item: any, row: any) {
          let { pod_name, namespace, cluster_id } = row;
          return <JumpPod PodName={pod_name} namespace={namespace} clusterKey={cluster_id} title={pod_name} />;
        },
      };
    }
    if (type === 'container') {
      arr[0] = {
        title: translations.chart_map_columns_sourceResources,
        dataIndex: 'resource',
        render(item: any, row: any) {
          let { container_name, pod_name, container_id, cluster_id } = row;
          const str = `Pod：` + pod_name;
          return (
            <>
              <JumpContainer Cluster={cluster_id} containerid={container_id} name={container_name} />
              <div style={{ maxWidth: '100%' }}>
                <TzTag style={grayStyle} className="small mt4 ">
                  <EllipsisPopover title={pod_name || '-'}>{str}</EllipsisPopover>
                </TzTag>
              </div>
            </>
          );
        },
      };
    }
    if (type === 'process') {
      arr[0] = {
        title: translations.chart_map_columns_sourceResources,
        dataIndex: 'resource',
        render(item: any, row: any) {
          let { process_name, pod_name } = row;
          const str = `Pod：` + pod_name;
          return (
            <>
              <div>{process_name}</div>
              <div style={{ maxWidth: '100%' }}>
                <TzTag style={grayStyle} className="small mt4 ">
                  <EllipsisPopover title={pod_name || '-'}>{str}</EllipsisPopover>
                </TzTag>
              </div>
            </>
          );
        },
      };
    }
    return arr;
  }, [type]);
  return arrColumns;
};
