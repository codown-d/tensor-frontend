import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { TzCard } from '../../../components/tz-card';
import { map, tap } from 'rxjs/operators';
import { Store } from '../../../services/StoreService';
import { assetsEndpointsDetail, subsetDetail, subsetKinds } from '../../../services/DataService';
import { translations } from '../../../translations/translations';
import { TzTableServerPage } from '../../../components/tz-table';
import { getClusterName, useAssetsClusterList } from '../../../helpers/use_fun';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { find, merge } from 'lodash';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { of } from 'rxjs';
import { RenderTag } from '../../../components/tz-tag';
import { JumpNamespace, JumpNode, JumpPod, JumpService } from '../components';
// import { useActivate } from 'react-activation';
import { getTime } from '../../../helpers/until';

export const statusOp = [
  {
    label: 'NotReady',
    value: 'NotReady',
  },
  {
    label: 'Ready',
    value: 'Ready',
  },
];
const EndpointsInfo = (props: any) => {
  const [info, setInfo] = useState<any>(null);
  const [subsetKindsList, setSubsetKindsList] = useState<any>([]);
  const [filters, setFilters] = useState<any>({});
  const [result] = useSearchParams();
  const l = useLocation();
  let [query] = useState({
    cluster_key: result.get('cluster_key') || '',
    namespace: result.get('namespace') || '',
    endpoints_name: result.get('endpoints_name') || '',
  });

  let clusterList = useAssetsClusterList();
  let getAssetsEndpointsInfo = useCallback(() => {
    assetsEndpointsDetail(query).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setInfo(item);
    });
  }, [query]);
  const setHeader = useCallback(() => {
    Store.header.next({
      title: info?.name,
    });
  }, [info, l]);
  useEffect(() => {
    setHeader();
  }, [setHeader]);
  // useActivate(() => {
  //   setHeader();
  // });
  useEffect(() => {
    getAssetsEndpointsInfo();
  }, [getAssetsEndpointsInfo]);
  const reqFun = useCallback(
    (pagination) => {
      if (!info?.id) {
        return of(undefined);
      }
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let params = {
        offset,
        limit: pageSize,
        ...filters,
        endpoints_id: info.id,
      };
      return subsetDetail(params).pipe(
        map((res) => {
          const items = res.getItems();
          return {
            data: items,
            total: res.data?.totalItems,
          };
        }),
      );
    },
    [info, filters],
  );
  const columns: any = useMemo(() => {
    let items = [
      {
        title: translations.endpoint_name,
        dataIndex: 'name',
        width: '25%',
        ellipsis: {
          showTitle: false,
        },
        render: (item: string, row: any) => {
          if (row.targetRefKind === 'Pod') {
            return (
              <JumpPod PodName={row.name} namespace={row.namespace} clusterKey={info?.clusterKey} title={row.name} />
            );
          }
          if (row.targetRefKind === 'Node') {
            return <JumpNode namespace={row.namespace} clusterKey={info?.clusterKey} title={row.nodeName} />;
          }
          if (row.targetRefKind === 'Namespace') {
            return <JumpNamespace namespace={row.namespace} clusterKey={info?.clusterKey} title={row.namespace} />;
          }
          if (row.targetRefKind === 'Service') {
            return (
              <JumpService
                service_name={row.service_name}
                namespace={row.namespace}
                clusterKey={info?.clusterKey}
                title={row.service_name}
              />
            );
          } else {
            return '-';
          }
        },
      },
      {
        title: translations.calico_cluster_type,
        dataIndex: 'targetRefKind',
        render: (item: string, row: any) => {
          return find(subsetKindsList, (it) => it === item) || '-';
        },
      },
      {
        title: translations.compliances_breakdown_dotstatus,
        dataIndex: 'addressStatus',
        align: 'center',
        render: (addressStatus: string, row: any) => {
          let value: any = find(statusOp, (item) => item.value === addressStatus)?.label || addressStatus;
          let obj: any = {
            NotReady: 'closed',
            Ready: 'finish',
          };
          return <RenderTag type={obj[value]} title={value} />;
        },
      },
      {
        title: 'IP',
        dataIndex: 'ip',
        render: (item: string, row: any) => {
          return <>{item || '-'}</>;
        },
      },
      {
        title: translations.compliances_breakdown_dotname,
        dataIndex: 'nodeName',
        width: '25%',
        ellipsis: {
          showTitle: false,
        },
        render: (item: string, row: any) => {
          return <JumpNode namespace={row.nodeName} clusterKey={info?.clusterKey} title={item} />;
        },
      },
      {
        title: translations.microseg_segments_policy_port_title,
        dataIndex: 'ports',
        render: (item: string | any[], row: any) => {
          return <>{typeof item === 'string' ? item || '-' : item.join(' ，')}</>;
        },
      },
    ];
    return items;
  }, [subsetKindsList, info]);
  const screenFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.endpoint_name,
        name: 'endpoint_name',
        type: 'input',
        icon: 'icon-weizhi',
      },
      {
        label: translations.compliances_breakdown_dotname,
        name: 'node_name',
        type: 'input',
        icon: 'icon-jiedian',
      },
      {
        label: 'IP',
        name: 'ip',
        type: 'input',
        icon: 'icon-zhujimingcheng',
      },
      {
        label: translations.calico_cluster_type,
        name: 'ref_kind',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          mode: 'multiple',
          options: subsetKindsList
            .filter((item: any) => item)
            .map((item: any) => {
              return {
                label: item,
                value: item,
              };
            }),
        },
      },
      {
        label: translations.compliances_breakdown_dotstatus,
        name: 'addr_status',
        type: 'select',
        icon: 'icon-celveguanli',
        props: {
          mode: 'multiple',
          options: statusOp,
        },
      },
    ],
    [clusterList, subsetKindsList],
  );
  const data = useTzFilter({ initial: screenFilter });
  const handleChange = useCallback((values: any) => {
    setFilters((pre: any) => merge({}, values));
  }, []);

  const dataInfoList = useMemo(() => {
    if (!info) {
      return [];
    }
    const obj: any = {
      serviceName: translations.service_name + '：',
      namespace: translations.calico_cluster_namespace + '：',
      clusterKey: translations.clusterManage_key + '：',
      CreatedAt: translations.clusterManage_createtime + '：',
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: info[item] || '-',
      };
      if ('serviceName' === item) {
        o['render'] = () => {
          return (
            <JumpService
              service_name={info[item]}
              namespace={info['namespace']}
              clusterKey={info['clusterKey']}
              title={info[item]}
            />
          );
        };
      }
      if ('namespace' === item) {
        o['render'] = () => {
          return <JumpNamespace namespace={info.namespace} clusterKey={info.clusterKey} title={info.namespace} />;
        };
      }
      if ('clusterKey' === item) {
        o['render'] = () => {
          return getClusterName(info[item]);
        };
      }
      if ('CreatedAt' === item) {
        o['render'] = () => {
          return getTime(info[item]);
        };
      }
      return o;
    });
  }, [info]);
  let getSubsetKinds = useCallback(() => {
    info?.id &&
      subsetKinds({ endpoints_id: info.id }).subscribe((res) => {
        if (res.error) return;
        let items = res.getItems();
        setSubsetKindsList(items);
      });
  }, [info]);
  useEffect(() => {
    getSubsetKinds();
  }, [getSubsetKinds]);
  return (
    <div className="asset-endpoint-info mlr32 mt4">
      <TzCard title={translations.compliances_breakdown_taskbaseinfo} bodyStyle={{ paddingBottom: '0px' }}>
        <ArtTemplateDataInfo data={dataInfoList} span={2} rowProps={{ gutter: [0, 0] }} />
      </TzCard>
      <TzCard
        title={
          <FilterContext.Provider value={{ ...data }}>
            <div className={'flex-r-c'}>
              {translations.association_endpoints} <TzFilter />
            </div>
            <TzFilterForm onChange={handleChange} />
          </FilterContext.Provider>
        }
        style={{ marginTop: '20px' }}
        bordered
        bodyStyle={{ paddingTop: '0px' }}
      >
        <TzTableServerPage
          columns={columns}
          className={'nohoverTable'}
          rowKey={'id'}
          reqFun={reqFun}
          tableLayout={'fixed'}
          defaultPagination={{
            current: 1,
            pageSize: 5,
            hideOnSinglePage: true,
          }}
        />
      </TzCard>
    </div>
  );
};

export default EndpointsInfo;
