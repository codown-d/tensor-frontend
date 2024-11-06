import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Link, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { TzCard } from '../../../components/tz-card';
import { map, tap } from 'rxjs/operators';
import { Store } from '../../../services/StoreService';
import {
  assetsIngresses,
  assetsServices,
  backendKinds,
  getListClusters,
  ingressesInfo,
  ingressIdRules,
} from '../../../services/DataService';
import { translations } from '../../../translations/translations';
import { TzTableServerPage } from '../../../components/tz-table';
import { getClusterName, useAssetsClusterList } from '../../../helpers/use_fun';
import { getTime } from '../../../helpers/until';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { find, merge } from 'lodash';
import moment from 'moment';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { of } from 'rxjs';
import { TzInput } from '../../../components/tz-input';
import TzInputSearch from '../../../components/tz-input-search';
import { JumpNamespace } from '../components';
import { TzTag } from '../../../components/tz-tag';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';

let pathTypeOp = [
  {
    label: 'Prefix',
    value: 'Prefix',
    text: 'Prefix',
  },
  {
    label: 'Exact',
    value: 'Exact',
    text: 'Exact',
  },
  {
    label: 'ImplementationSpecific',
    value: 'ImplementationSpecific',
    text: 'ImplementationSpecific',
  },
];
const IngressInfo = (props: any) => {
  const [info, setInfo] = useState<any>(null);
  const [backendKindsList, setBackendKindsList] = useState<
    {
      label: any;
      value: any;
      text: any;
    }[]
  >([]);
  const [result] = useSearchParams();
  let [query, setQuery] = useState({
    cluster_key: result.get('cluster_key') || '',
    namespace: result.get('namespace') || '',
    ingress_name: result.get('ingress_name') || '',
  });

  const [search, setSearch] = useState<string>();
  let getIngressesInfo = useCallback(() => {
    ingressesInfo(query).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setInfo(item);
    });
  }, [query]);
  const l = useLocation();
  const setHeader = useCallback(() => {
    Store.header.next({
      title: info?.name,
    });
  }, [info, l]);
  useEffect(() => {
    setHeader();
  }, [setHeader]);
  useEffect(() => {
    getIngressesInfo();
  }, [getIngressesInfo]);
  const reqFun = useCallback(
    (pagination, fliter) => {
      if (!info?.id) {
        return of(undefined);
      }
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let params = {
        offset,
        limit: pageSize,
        ...fliter,
        query: search,
        ingress_id: info.id,
      };
      return ingressIdRules(params).pipe(
        map((res) => {
          const items = res.getItems();
          return {
            data: items,
            total: res.data?.totalItems,
          };
        }),
      );
    },
    [info, search],
  );
  const columns = useMemo(() => {
    let items = [
      {
        title: translations.assets_host_name,
        dataIndex: 'host',
        render: (item: string, row: any) => {
          return <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover>;
        },
      },
      {
        title: translations.backend_type,
        dataIndex: 'backendKind',
        filters: backendKindsList,
        render: (item: string, row: any) => {
          return <TzTag>{item}</TzTag>;
        },
      },
      {
        title: translations.backend_name,
        dataIndex: 'backendName',
        render: (item: string, row: any) => {
          return <>{item || '-'}</>;
        },
      },
      {
        title: translations.api_rental,
        dataIndex: 'backendApiGroup',
        render: (item: string, row: any) => {
          return <>{item || '-'}</>;
        },
      },
      {
        title: translations.microseg_segments_policy_port_title,
        dataIndex: 'servicePort',
        render: (item: string, row: any) => {
          return <>{item || '-'}</>;
        },
      },
      {
        title: translations.path_match_type,
        dataIndex: 'pathType',
        filters: pathTypeOp,
        render: (item: string, row: any) => {
          return (
            <EllipsisPopover lineClamp={2}>
              {find(pathTypeOp, (it) => it.value === item)?.label || item}
            </EllipsisPopover>
          );
        },
      },
      {
        title: translations.runtimePolicy_container_path,
        dataIndex: 'path',
        render: (item: string, row: any) => {
          return <>{item || '-'}</>;
        },
      },
    ];
    return items;
  }, [backendKindsList]);
  let getbackendKinds = useCallback(() => {
    backendKinds().subscribe((res) => {
      if (res.error) return;
      let items = res.getItems().map((item) => {
        return {
          label: item,
          value: item,
          text: item,
        };
      });
      setBackendKindsList(items);
    });
  }, []);
  useEffect(() => {
    getbackendKinds();
  }, [getbackendKinds]);

  const dataInfoList = useMemo(() => {
    if (!info) {
      return [];
    }
    const obj: any = {
      clusterKey: translations.clusterManage_key + '：',
      namespace: translations.calico_cluster_namespace + '：',
      CreatedAt: translations.clusterManage_createtime + '：',
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: info[item] || '-',
      };
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
          return moment(info[item]).format('YYYY-MM-DD HH:mm:ss');
        };
      }
      return o;
    });
  }, [info]);
  return (
    <div className="asset-ingress-info mlr32 mt4">
      <TzCard title={translations.compliances_breakdown_taskbaseinfo} bodyStyle={{ paddingBottom: '0px' }}>
        <ArtTemplateDataInfo data={dataInfoList} span={2} rowProps={{ gutter: [0, 0] }} />
      </TzCard>
      <TzCard
        title={translations.rule_configuration}
        extra={
          <TzInputSearch
            placeholder={translations.unStandard.str271}
            allowClear
            onChange={(val: any) => setSearch(val)}
          />
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
          defaultPagination={{
            current: 1,
            pageSize: 5,
          }}
        />
      </TzCard>
    </div>
  );
};

export default IngressInfo;
