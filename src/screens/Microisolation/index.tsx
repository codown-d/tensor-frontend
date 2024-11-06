import { Hierarchy, WebResponse } from '../../definitions';
import React, { useRef, useState, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import VisualizeChart, { TrafficType, linkDataProps } from './VisualizeChart';
import './index.less';
import { Store } from '../../services/StoreService';
import {
  microsegAllassets,
  microsegNamespaces,
  microsegResources,
  microsegSegments,
  microsegSettings,
  microsegTopology,
  topologyNamespace,
} from '../../services/DataService';
import { find, keys, remove } from 'lodash';
import { useBoolean, useMemoizedFn, useSetState, useSize } from 'ahooks';
import { getClusterName, useAssetsClusterList } from '../../helpers/use_fun';
import { translations } from '../../translations';
import { useLocation, useNavigate } from 'react-router-dom';
import { TzButton } from '../../components/tz-button';
import { Routes } from '../../Routes';
import { TzSelect } from '../../components/tz-select';
import moment from 'moment';
import { TzForm, TzFormItem } from '../../components/tz-form';
import { Form } from 'antd';
import { RenderTag } from '../../components/tz-tag';
import { lineObjectsEnum, trafficStatusEnum } from './lib';
import { TzTooltip } from '../../components/tz-tooltip';
import { protocolEnum } from './PolicyManagement/Manual';
import ResourceDetail from './component/ResourceDetail';
import LinkDetail from './component/LinkDetail';
import { TzInput } from '../../components/tz-input';
import { LoadingImg } from '../../components/tz-table';
import useLayoutMainSearchWid from '../../helpers/useLayoutMainSearchWid';

let typeOp = [
  { label: translations.onlineVulnerability_outerShapeMeaning, value: 'namespace' },
  { label: translations.resources, value: 'resource' },
  { label: translations.microseg_segments_segment_title, value: 'resourceGroup' },
];

let filterArr: any = {
  protocol: protocolEnum.slice(0, -1),
  action: trafficStatusEnum,
  lineObject: lineObjectsEnum,
};
let formatAssets = (list: any[], level: number, idpath: any[]) => {
  for (let i = 0; i < list.length; i++) {
    let item = list[i];
    item['id'] = level == 1 ? item['name'] : item['id'];
    item['_id'] = [...idpath, item.id].join('_');
    item['idpath'] = [...idpath, item.id].join('/');
    item['value'] = level == 1 ? item['children'].length : 1;
    if (level === 2) {
      item['_children'] = item['children'].map((ite: any) => {
        return {
          ...ite,
          value: 0,
          idpath: [item['idpath'], ite.id].join('/'),
          _id: [item['_id'], ite.id].join('_'),
        };
      });
      item['children'] = [];
    }
    if (item['children'] && item['children'].length != 0) {
      formatAssets(item['children'], level + 1, item['idpath'].split('/'));
    }
  }
  return list;
};
let FilterPanel = (props: { onChange: any; onClose?: (isHide: boolean) => void }) => {
  let { onChange, onClose } = props;
  const [filter, setFilter] = useSetState<any>({ protocol: [], action: [], lineObject: [] });
  const [state, { toggle }] = useBoolean(false);
  useEffect(() => {
    onChange(filter);
  }, [filter]);
  useEffect(() => {
    onClose?.(state);
  }, [state]);
  return (
    <div
      className={`filter ${state ? 'hidden' : ''}`}
      style={{
        zIndex: 9,
      }}
    >
      <div
        style={{
          position: 'relative',
        }}
      >
        <div className="filter-header flex-r-c" style={{ justifyContent: 'space-between' }}>
          <span style={{ flex: 1 }}>
            {translations.filter_condition}
            <TzTooltip title={translations.reset_filters}>
              <i
                className={'icon iconfont icon-refresh ml8 cursor-p'}
                style={{ color: '#b3bac6' }}
                onClick={() => {
                  setFilter({ protocol: [], action: [], lineObject: [] });
                }}
              ></i>
            </TzTooltip>
          </span>
          <TzTooltip placement="left" title={!state ? translations.expand_filter : translations.collapse_filter}>
            <i
              className="icon iconfont icon-arrow-double cursor-p mr10 f20 mr-4"
              onClick={toggle}
              style={{ color: '#b3bac6' }}
            ></i>
          </TzTooltip>
        </div>
        {keys(filterArr).map((item) => {
          return (
            <div key={item}>
              <p className="filter-title ">{(translations as any)[item]}：</p>
              {filterArr[item].map((ite: any) => {
                return (
                  <div
                    key={ite.value}
                    className={`filter-item ${ite.value} ${filter[item].includes(ite.value) ? 'act' : ''}`}
                    onClick={() => {
                      setFilter((pre) => {
                        let pos = pre[item].indexOf(ite.value);
                        pos < 0 ? pre[item].push(ite.value) : pre[item].splice(pos, 1);
                        return { [item]: [...pre[item]] };
                      });
                    }}
                  >
                    {ite.label}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
let current_time = [moment().add(-1, 'd'), moment()];
export default function Microisolation(props: any) {
  const [selectOp, setSelectOp] = useState<any[]>([]);
  const [chartHierarchy, setChartHierarchy] = useState<Hierarchy>();
  const [linkData, setLinkData] = useState<linkDataProps[]>([]);
  const [cfgInfo, setCfgInfo] = useState<any>({});
  const [filterWidth, setFilterWidth] = useState<number>(180);
  const [topologyNamespaceInfo, setTopologyNamespaceInfo] = useState<any[]>([]);
  const [filter, setFilter] = useSetState<any>({ protocol: [], action: [], lineObject: [] });
  let clusterList = useAssetsClusterList();
  const microisolationRef = useRef(null);
  const size = useSize(microisolationRef);
  let visualizeChartRef = useRef<any>();
  const [form] = Form.useForm();
  let type = Form.useWatch('type', form);
  let activateNode = Form.useWatch('typeId', form);
  let cluster = Form.useWatch('cluster', form);
  let time = Form.useWatch('time', form);
  let [info, setInfo] = useState<any>([]);
  let [loading, setLoading] = useState<boolean>(true);
  let getMicrosegAllassets = useMemoizedFn(() => {
    if (!cluster) return;
    microsegAllassets({ cluster }).subscribe((res) => {
      if (res.error) return;
      let items = res.getItems().map((item) => {
        let node = find(topologyNamespaceInfo, (ite) => ite.name === item.name);
        let { unknown, IPBlock } = node || {};
        let arr = [];
        !unknown || arr.push('Unknown');
        !IPBlock || arr.push('IPBlock');
        item['externalTopology'] = arr;
        return item;
      });
      let newItems = formatAssets(items, 1, []);
      setChartHierarchy({
        id: cluster,
        name: getClusterName(cluster),
        children: newItems,
      });
      setLoading(false);
    });
  });
  let topologyRef: any = useRef();
  let topologyNamespaceRef: any = useRef();
  let getTopologyNamespace = useMemoizedFn(() => {
    topologyNamespaceRef.current?.unsubscribe();
    topologyNamespaceRef.current = topologyNamespace({
      cluster,
      start: time ? moment(time[0]).valueOf() : undefined,
      end: time ? moment(time[1]).valueOf() : undefined,
    }).subscribe((res) => {
      if (res.error) return;
      let items = res.getItems();
      setTopologyNamespaceInfo(items);
      getMicrosegAllassets();
    });
  });
  let getSelectData = useMemoizedFn((type: 'namespace' | 'resourceGroup' | 'resource') => {
    let fetch: any = {
      namespace: microsegNamespaces,
      resourceGroup: microsegSegments,
      resource: microsegResources,
    };
    let prams: any = { cluster, includeSensitiveNs: true };
    type &&
      fetch[type](prams).subscribe((res: WebResponse<any>) => {
        if (res.error) return;
        let items = res.getItems().map((item: any) => {
          let idpath = [];
          let label = item.name;
          if (type === 'namespace') {
            idpath.push(item.name);
          } else if (type === 'resourceGroup') {
            idpath.push(item.namespace, item.id);
          } else if (type === 'resource') {
            label = `${item.namespace}/${item.name}(${item.kind})`;
            idpath.push(item.namespace, item.segmentID, item.id);
          }
          return {
            label,
            value: item.id,
            idpath: idpath.join('/'),
          };
        });
        setSelectOp(items);
      });
  });

  let getMicrosegTopology = useMemoizedFn(() => {
    if (!cluster) return;
    topologyRef.current?.unsubscribe();
    topologyRef.current = microsegTopology({
      ...filter,
      cluster,
      start: time ? moment(time[0]).valueOf() : undefined,
      end: time ? moment(time[1]).valueOf() : undefined,
    }).subscribe((res) => {
      let items = res.getItems().map((item) => {
        let { srcID, dstID, srcKind, dstKind, action } = item;
        return { ...item, source: srcID, target: dstID, type: action || 'Allow', srcKind, dstKind };
      });
      setLinkData(items);
    });
  });
  useLayoutEffect(() => {
    if (cluster && time) {
      getMicrosegTopology();
    }
    return () => {
      topologyRef.current?.unsubscribe();
    };
  }, [cluster, time, filter]);
  useLayoutEffect(() => {
    if (cluster && time) {
      setLoading(true);
      getTopologyNamespace();
    }
    return () => {
      topologyNamespaceRef.current?.unsubscribe();
    };
  }, [cluster, time]);
  useEffect(() => {
    form.setFieldsValue({ typeId: undefined });
    getSelectData(type);
  }, [cluster, type]);
  useLayoutEffect(() => {
    if (clusterList.length) {
      form.setFieldsValue({
        cluster: clusterList[0].value,
        type: 'namespace',
        time: current_time,
      });
    }
  }, [clusterList]);
  useEffect(() => {
    if (loading || !chartHierarchy?.children) return;
    let node = find(selectOp, (item) => item.value == activateNode);
    visualizeChartRef.current.setActivateNode(node?.idpath, type);
  }, [activateNode, selectOp, loading]);
  const l = useLocation();
  const setLayout = useLayoutMainSearchWid({});
  let setHeader = useMemoizedFn(() => {
    Store.header.next({
      title: (
        <div className="flex-r-c">
          {translations.calico_visualize}
          <TzForm form={form}>
            <div className="flex-r-c ml16" style={{ width: '440px', justifyContent: 'flex-start' }}>
              <div> {translations.clusterManage_key}：</div>
              <TzFormItem name={'cluster'} noStyle>
                <TzSelect
                  bordered={false}
                  placeholder={translations.activeDefense_clusterPla}
                  options={clusterList}
                  className="select-pr12"
                  style={{ width: 'auto', maxWidth: '480px' }}
                />
              </TzFormItem>
              <TzFormItem name="time" hidden>
                <TzInput />
              </TzFormItem>
              <TzFormItem name="time_c" initialValue={'hours_24'} noStyle>
                <TzSelect
                  placeholder={translations.superAdmin_loginLdapConfig_selectPlaPrefix}
                  bordered={false}
                  className="select-pr12"
                  options={[
                    { label: translations.hours_24, value: 'hours_24' },
                    { label: translations.days_7, value: 'days_7' },
                    { label: translations.days_30, value: 'days_30' },
                  ]}
                  onChange={(val) => {
                    let time: any = {
                      hours_24: [moment().add(-24, 'h'), moment()],
                      days_7: [moment().add(-7, 'd'), moment()],
                      days_30: [moment().add(-30, 'd'), moment()],
                    };
                    form.setFieldsValue({ time: time[val] });
                  }}
                  style={{ width: 'auto', maxWidth: '130px', minWidth: '90px' }}
                />
              </TzFormItem>
            </div>
          </TzForm>
        </div>
      ),
      extra: (
        <TzForm form={form}>
          <div className="ml16 flex-r-c" style={{ borderRadius: '8px', width: setLayout, overflow: 'hidden' }}>
            <TzFormItem name={'type'} noStyle>
              <TzSelect
                placeholder={translations.superAdmin_loginLdapConfig_selectPlaPrefix}
                options={typeOp}
                bordered={false}
                style={{ width: '108px', background: '#F4F6FA', marginRight: '1px' }}
              />
            </TzFormItem>
            <TzFormItem name={'typeId'} noStyle>
              <TzSelect
                placeholder={translations.superAdmin_loginLdapConfig_selectPlaPrefix}
                options={selectOp}
                allowClear
                showSearch
                filterOption={(input, option) => {
                  return (option?.label as string).toLowerCase()?.indexOf(input.toLowerCase()) >= 0;
                }}
                bordered={false}
                style={{ background: '#F4F6FA', width: '0', flex: 1 }}
              />
            </TzFormItem>
          </div>
        </TzForm>
      ),
    });
  });
  let getMicrosegSettings = useCallback(() => {
    microsegSettings().subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setCfgInfo(item);
    });
  }, []);
  useEffect(() => {
    getMicrosegSettings();
  }, [l]);
  useEffect(() => {
    setHeader();
  }, [l, cfgInfo, selectOp, setLayout]);
  let getVisualizeChartW = useMemo(() => {
    return (size?.width || 900) - filterWidth;
  }, [size?.width, filterWidth]);
  return (
    <div
      className="microisolation mr32"
      style={{ height: 'calc(100vh - 76px)', position: 'relative' }}
      ref={microisolationRef}
    >
      <div className="resource-detail-modal p-a" style={{ left: 32, top: 4, width: '389px' }}>
        {info.map((item, index) => {
          if (item.type === 'node') {
            let { nodeInfo } = item;
            return (
              <ResourceDetail
                key={index}
                onClose={() => {
                  setInfo((pre: any[]) => {
                    remove(pre, (n) => n.type == 'node');
                    return [...pre];
                  });
                }}
                {...nodeInfo}
                start_time={time ? moment(time[0]).valueOf() : undefined}
                end_time={time ? moment(time[1]).valueOf() : undefined}
              />
            );
          } else {
            let { lineInfo } = item;
            return (
              <LinkDetail
                onClose={() => {
                  setInfo((pre: any[]) => {
                    remove(pre, (n) => n.type == 'line');
                    return [...pre];
                  });
                }}
                lineInfo={lineInfo.source.data}
                start_time={time ? moment(time[0]).valueOf() : undefined}
                end_time={time ? moment(time[1]).valueOf() : undefined}
              />
            );
          }
        })}
      </div>

      <div className="flex-r-c" style={{ alignItems: 'flex-start', width: '100%' }}>
        <div style={{ flex: 1, width: '100%' }}>
          {loading ? (
            <div style={{ top: '50%', left: ' 50%', position: 'fixed', transform: 'translate(-50%, -50%)' }}>
              <LoadingImg />
            </div>
          ) : (
            <VisualizeChart
              height={(size?.height || 600) - 35}
              width={getVisualizeChartW}
              data={chartHierarchy}
              linkData={linkData}
              ref={visualizeChartRef}
              showNodeInfo={(nodeInfo: any) => {
                if (nodeInfo) {
                  setInfo([
                    {
                      type: 'node',
                      nodeInfo,
                    },
                  ]);
                }
              }}
              showLinkInfo={(lineInfo: any) => {
                if (lineInfo) {
                  setInfo([
                    {
                      type: 'line',
                      lineInfo,
                    },
                  ]);
                }
              }}
            />
          )}
        </div>
        <FilterPanel onChange={setFilter} onClose={(isHide) => setFilterWidth(isHide ? 0 : 180)} />
      </div>
    </div>
  );
}
