import { useMemoizedFn, useInfiniteScroll, useSize, useUpdateEffect } from 'ahooks';
import { TzTable, TableScrollFooter } from '../../../components/tz-table';
import { sortBy, findIndex, merge } from 'lodash';
import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import {
  filterMicroseglog,
  flowDetailslog,
  getEventsCenter,
  microseglog,
  resourceDetailslog,
  resourcesId,
} from '../../../services/DataService';
import { columnsList, trafficStatusEnum } from '../lib';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { translations } from '../../../translations';
import { protocolEnum } from '../PolicyManagement/Manual';

interface Result {
  list: any[];
  nextId: string | undefined;
}
export interface ViewTrafficLogsProps {
  cluster: string;
  end_time: number;
  msg_type: number;
  start_time: number;
  [property: string]: any;
}
let timer: any;
export default (props: ViewTrafficLogsProps) => {
  let { title, close, ...otherProps } = props;
  const ref = useRef<any>(null);
  const [filters, setFilters] = useState<any>({});
  let getLoadMoreList = useMemoizedFn((nextId: string | undefined, limit: number): Promise<Result> => {
    return new Promise((resolve, reject) => {
      let prams = {
        ...filters,
        ...otherProps,
        token: nextId,
        limit,
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
    let a = ['created_at', 'src_ip', 'src_port', 'dst_ip', 'dst_port', 'proto_str', 'action_str'];
    let arr = columnsList.filter((item: any) => a.includes(item.dataIndex));
    let newArr = sortBy(arr, (x) => findIndex(a, (y) => x.dataIndex === y));
    return newArr;
  }, []);
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
    ],
    [],
  );
  const filterData = useTzFilter({ initial: screenFilter });
  const handleChange = useCallback((values: any) => {
    setFilters((pre: any) => merge({}, values));
  }, []);
  useEffect(() => {
    ref.current?.scrollTo(0, 0);
    clearTimeout(timer);
    timer = setTimeout(() => {
      reload();
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [props, filters]);
  return (
    <div className="view-traffic-logs" style={{ height: '100%', paddingTop: '24px' }}>
      <div className="mb16 p-r">
        <div
          className="p-a"
          style={{ lineHeight: '38px', fontWeight: 550, fontSize: '20px', color: 'rgba(0, 0, 0, 0.85)' }}
        >
          {props.title}
        </div>
        <FilterContext.Provider value={{ ...filterData }}>
          <div className="flex-r-c" style={{ justifyContent: 'flex-end' }}>
            <TzFilter />
            <span className="ant-drawer-close">
              <i
                className="icon iconfont icon-lansexiaocuohao f24 cursor-p ml16 "
                onClick={() => {
                  props?.close();
                }}
              ></i>
            </span>
          </div>

          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>

      <div ref={ref} style={{ height: 'calc(100% - 94px)', overflow: 'auto' }}>
        <TzTable
          loading={loading}
          dataSource={data?.list}
          pagination={false}
          sticky={true}
          rowKey={'id'}
          columns={columns}
          footer={() => {
            return <TableScrollFooter isData={!!data?.list?.length} noMore={noMore} />;
          }}
        />
      </div>
    </div>
  );
};
