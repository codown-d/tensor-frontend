import { useMemoizedFn, useInfiniteScroll, useSize, useUpdateEffect } from 'ahooks';
import { TzTable, TableScrollFooter } from '../../../components/tz-table';
import { sortBy, findIndex, merge } from 'lodash';
import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { filterMicroseglog } from '../../../services/DataService';
import { columnsList, trafficStatusEnum } from '../lib';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { translations } from '../../../translations';
import { protocolEnum } from '../PolicyManagement/Manual';
import { useAssetsClusterList } from '../../../helpers/use_fun';
import { TzButton } from '../../../components/tz-button';

interface Result {
  list: any[];
  nextId: string | undefined;
}
export interface ViewTrafficLogsProps {
  cluster: string;
  msg_type: number;
  [property: string]: any;
}
let timer: any;
export default (props: ViewTrafficLogsProps) => {
  let { msg_type, cluster, ...otherProps } = props;
  const ref = useRef<any>(null);
  const [filters, setFilters] = useState<any>({});
  let getLoadMoreList = useMemoizedFn((nextId: string | undefined, limit: number): Promise<Result> => {
    return new Promise((resolve, reject) => {
      let prams = {
        ...filters,
        token: nextId,
        limit,
        msg_type: 3,
      };
      filterMicroseglog(prams).subscribe((res) => {
        if (res.error) {
          reject();
          return;
        }
        let list = res.getItems();
        let nextId = res.data?.token;
        resolve({
          list,
          nextId: list.length < limit ? undefined : nextId,
        });
      });
    });
  });
  const { data, loading, noMore, reload } = useInfiniteScroll((d) => getLoadMoreList(d?.nextId, 20), {
    target: ref,
    manual: true,
    isNoMore: (d) => d?.nextId === undefined || d?.nextId === '',
  });
  let columns = useMemo(() => {
    let a = ['created_at', 'src_ip', 'src_port', 'dst_ip', 'dst_port', 'proto_str', 'action_str', 'cluster'];
    let arr = columnsList.filter((item: any) => a.includes(item.dataIndex));
    let newArr = sortBy(arr, (x) => findIndex(a, (y) => x.dataIndex === y));
    return newArr;
  }, []);
  let clusters = useAssetsClusterList();
  const screenFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.source_IP,
        name: 'src_ip',
        type: 'input',
        icon: 'icon-ip',
      },
      {
        label: translations.destination_IP,
        name: 'dst_ip',
        type: 'input',
        icon: 'icon-ip',
      },
      {
        label: translations.microseg_segments_policy_src_obj,
        name: 'src_res',
        type: 'input',
        icon: 'icon-lujing',
      },
      {
        label: translations.microseg_segments_policy_dst_obj,
        name: 'dst_res',
        type: 'input',
        icon: 'icon-ip',
      },

      {
        label: translations.compliances_breakdown_dotstatus,
        name: 'action',
        type: 'select',
        icon: 'icon-celveguanli',
        props: {
          mode: 'multiple',
          options: trafficStatusEnum,
        },
      },
      {
        label: translations.calico_protocol,
        name: 'proto',
        type: 'select',
        icon: 'icon-shuxing_1',
        props: {
          mode: 'multiple',
          options: protocolEnum.slice(0, -1),
        },
      },
      {
        label: translations.clusterManage_key,
        name: 'cluster',
        type: 'select',
        props: {
          options: clusters,
        },
        icon: 'icon-jiqun',
      },
      {
        label: translations.notificationCenter_rule_timestamp,
        name: 'attack_time',
        type: 'rangePickerCt',
        icon: 'icon-shijian',
        props: {
          showTime: true,
          format: 'YYYY/MM/DD HH:mm:ss',
        },
      },
    ],
    [],
  );
  const filterData = useTzFilter({ initial: screenFilter });
  const handleChange = useCallback((values: any) => {
    let { attack_time, ...otherValues } = values;
    setFilters((pre: any) =>
      Object.assign({}, otherValues, {
        start_time: attack_time?.[0]?.valueOf(),
        end_time: attack_time?.[1]?.valueOf(),
      }),
    );
  }, []);
  let refresh = useMemoizedFn(() => {
    ref.current?.scrollTo(0, 0);
    reload();
  });
  useEffect(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      refresh();
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [props, filters, filters.attack_time]);
  return (
    <div className="flow-rate mlr32" style={{ height: '100%' }}>
      <div className="mb12">
        <FilterContext.Provider value={{ ...filterData }}>
          <div className="flex-r-c">
            <TzButton
              onClick={() => {
                refresh();
              }}
            >
              {translations.refresh_manually}
            </TzButton>
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      <div ref={ref} style={{ height: 'calc(100vh - 166px)', overflow: 'auto' }}>
        <TzTable
          loading={loading}
          dataSource={data?.list}
          pagination={false}
          sticky={true}
          rowKey={'id'}
          columns={columns}
        />
      </div>
    </div>
  );
};
