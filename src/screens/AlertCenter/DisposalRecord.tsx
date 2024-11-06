import { cloneDeep, debounce, keys, set, throttle } from 'lodash';
import moment from 'moment';
import React, { PureComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tap } from 'rxjs/internal/operators/tap';
import { TzFilter, TzFilterForm } from '../../components/ComponentsLibrary';
import TzDivider from '../../components/ComponentsLibrary/TzDivider';
import useTzFilter, {
  FilterContext,
} from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { TzButton } from '../../components/tz-button';
import { TzDrawer, TzDrawerFn } from '../../components/tz-drawer';
import { TzInput } from '../../components/tz-input';
import { TzInputSearch } from '../../components/tz-input-search';
import { TzConfirm } from '../../components/tz-modal';
import { TzDatePickerCT } from '../../components/tz-range-picker';
import { TzCol, TzRow } from '../../components/tz-row-col';
import { TzSelect, TzSelectProps } from '../../components/tz-select';
import { TableScrollFooter, TzTable } from '../../components/tz-table';
import TableFilter from '../../components/tz-table/TableFilter';
import { TzTag } from '../../components/tz-tag';
import { TzTimelineNoraml } from '../../components/tz-timeline';
import { screens } from '../../helpers/until';
import { Routes } from '../../Routes';
import { processingCenterRecord } from '../../services/DataService';
import { useThrottle } from '../../services/ThrottleUtil';
import { translations } from '../../translations/translations';
import './DisposalRecord.scss';
// import KeepAlive, { useActivate, useAliveController, useUnactivate } from 'react-activation';
import { Store } from '../../services/StoreService';
import { useMemoizedFn, useUnmount } from 'ahooks';
import DisposalRecordChildren from './DisposalRecordDrawer';

let opType: any = {
  PodIsolation: translations.podIsolation,
  PodDeletion: translations.podDeletion,
};
let status: any = {
  end: translations.scanner_images_finished,
  isolated: translations.isolated,
};
export let openDrawer = debounce(async (id: any, onCloseCallBack?: () => void) => {
  let dw: any = await TzDrawerFn({
    className: 'drawer-body0',
    title: translations.disposalDetails,
    width: '80%',
    children: (
      <DisposalRecordChildren
        key="1"
        recordId={id}
        onClose={() => {
          dw.hiden();
        }}
      />
    ),
    onCloseCallBack,
  });
  dw.show();
}, 100);

const DEFAULT_PAGINATION_PARAM = { limit: 10, offset: 0 };
const DisposalRecord = (props: any) => {
  let [filters, setFilters] = useState<any>({});
  let [dataSource, setDataSource] = useState<any>([]);
  let [pagination, setPagination] = useState<any>(DEFAULT_PAGINATION_PARAM);
  let [noMore, setNoMore] = useState(false);
  let [loading, setLoading] = useState(false);
  let [disposalRecordId, setDisposalRecordId] = useState<string>();
  let scrollRef = useRef<any>(null);
  let containerRef = useRef<HTMLDivElement>(null);
  const cacheDrawerData = useRef<string>();
  let columns = useMemo(() => {
    return [
      {
        title: translations.Work_order_no,
        dataIndex: 'id',
        render(item: any, row: any) {
          return item;
        },
      },
      {
        title: translations.disposalType,
        dataIndex: 'opType',
        render(item: any, row: any) {
          return opType[item];
        },
      },
      {
        title: translations.disposalObject,
        dataIndex: 'object',
        render(object: any, row: any) {
          let arr = object.map((item: string) => {
            return item.split('@').pop();
          });
          return arr.join(',');
        },
      },
      {
        title: translations.associatedEvents,
        dataIndex: 'eventID',
      },
      {
        title: translations.compliances_node_status,
        dataIndex: 'status',
        render(item: any, row: any) {
          return status[item] || '-';
        },
      },
      {
        title: translations.sponsor,
        dataIndex: 'lastOpUser',
      },
      {
        title: translations.originalWarning_oprTimer,
        dataIndex: 'updatedAt',
        render(item: any, row: any) {
          return (
            <>
              <div>{moment(item).format('YYYY-MM-DD')}</div>
              <div>{moment(item).format('HH:mm:ss')}</div>
            </>
          );
        },
      },
    ];
  }, []);
  let getDataSource = useCallback(() => {
    let { updatedAt = {}, id } = filters;
    let startTimestamp = updatedAt['startTimestamp'] ? updatedAt['startTimestamp'].valueOf() : '';
    let endTimestamp = updatedAt['endTimestamp'] ? updatedAt['endTimestamp'].valueOf() : '';
    let obj: any = { ...filters };
    delete obj.updatedAt;
    delete obj.id;
    let data = Object.assign({}, pagination, {
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      id: id,
      filter: JSON.stringify(obj),
      startTimestamp,
      endTimestamp,
    });
    setLoading(true);
    processingCenterRecord(data).subscribe((res) => {
      let items: any[] = res.getItems();
      setDataSource((pre: any) => {
        if (pagination.offset === 0) {
          return items;
        } else {
          return [].concat(...pre, ...items);
        }
      });
      setLoading(false);
      setNoMore(data.limit != items.length);
    });
  }, [pagination, filters]);
  let onScrollHandle = useCallback(
    useThrottle(() => {
      if (!scrollRef.current || loading || noMore) {
        return;
      }
      const { scrollTop, clientHeight, scrollHeight } = scrollRef.current;
      const isBottom = scrollTop + clientHeight + 60 >= scrollHeight;
      if (isBottom) {
        setPagination((pre: any) => {
          let o = { offset: pre.offset + pre.limit, limit: pre.limit };
          return o;
        });
      }
    }, 0),
    [loading, noMore, scrollRef],
  );
  useEffect(() => {
    let dom = $('.layout-main-container')[0];
    scrollRef.current = dom;
    $(dom).on('mousewheel DOMMouseScroll scroll', onScrollHandle);
    return () => {
      $(dom).off('mousewheel DOMMouseScroll scroll');
    };
  }, []);
  const { gutter, spanCount } = useMemo(() => {
    return screens();
  }, []);
  useEffect(() => {
    getDataSource();
  }, [pagination, filters]);
  let onChangeFilters = (data: any) => {
    setFilters((pre: any) => {
      return Object.assign({}, pre, data);
    });
    setPagination((pre: any) => {
      return DEFAULT_PAGINATION_PARAM;
    });
  };
  let [opTypeOptions, statusOptions] = useMemo(() => {
    let opTypeOptions = Object.keys(opType).map((item) => {
      return { label: opType[item], value: item };
    });
    let statusOptions = Object.keys(status).map((item) => {
      return { label: status[item], value: item };
    });
    return [opTypeOptions, statusOptions];
  }, []);
  const disposalRecordFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.Work_order_no,
        name: 'id',
        type: 'input',
        icon: 'icon-bianhao',
      },
      {
        label: translations.disposalObject,
        name: 'object',
        type: 'input',
        icon: 'icon-shuxing_1',
      },
      {
        label: translations.associatedEvents,
        name: 'eventID',
        type: 'input',
        icon: 'icon-jiedian',
      },
      {
        label: translations.disposalType,
        name: 'opType',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          options: opTypeOptions,
        },
      },
      {
        label: translations.finalDisposalStatus,
        name: 'status',
        type: 'select',
        icon: 'icon-celveguanli',
        props: {
          options: statusOptions,
        },
      },
      {
        label: translations.originalWarning_oprTimer,
        name: 'updatedAt',
        type: 'rangePickerCt',
        icon: 'icon-shijian',
        props: {
          showTime: true,
          format: 'YYYY/MM/DD HH:mm:ss',
        },
      },
    ],
    [opTypeOptions, statusOptions],
  );

  const data = useTzFilter({ initial: disposalRecordFilter });

  const handleChange = useCallback((values: any) => {
    const temp = {};
    keys(values).forEach((key) => {
      let _val = cloneDeep(values[key]);
      if (key === 'updatedAt') {
        _val[0] && set(temp, 'updatedAt.startTimestamp', _val[0]);
        _val[1] && set(temp, 'updatedAt.endTimestamp', _val[1]);
        return;
      }
      set(temp, [key], _val);
    });
    setFilters(temp);
    setPagination(DEFAULT_PAGINATION_PARAM);
  }, []);
  // const { refreshScope } = useAliveController();

  const closeDrawer = useMemoizedFn(() => {
    setDisposalRecordId(undefined);
    setPagination(DEFAULT_PAGINATION_PARAM);
  });
  // useActivate(() => {
  //   if (Store.menuCacheItem.value === 'NotificationCenter') {
  //     refreshScope('disposalDetails');
  //   } else {
  //     setDisposalRecordId(cacheDrawerData.current);
  //   }
  // });
  // useUnmount(() => {
  //   refreshScope('disposalDetails');
  //   closeDrawer();
  // });
  // useUnactivate(closeDrawer);
  return (
    <div className="association-case disposal-record" ref={containerRef}>
      <div className="disposal-record-filter mt4 mb12">
        <FilterContext.Provider value={{ ...data }}>
          <TzFilter />
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      <TzTable
        loading={loading}
        dataSource={dataSource}
        pagination={false}
        sticky={true}
        rowKey={'id'}
        onRow={(record) => {
          return {
            onClick: (event) => {
              cacheDrawerData.current = record.id;
              setDisposalRecordId(record.id);
            },
          };
        }}
        columns={columns}
        footer={() => {
          return <TableScrollFooter isData={!!(dataSource.length >= 20)} noMore={noMore} />;
        }}
      />
      {!!disposalRecordId && (
        <TzDrawer
          getContainer={() => containerRef.current}
          onClose={closeDrawer}
          visible={!!disposalRecordId}
          title={translations.disposalDetails}
          width="80%"
          className="drawer-body0"
          closable={false}
        >
          {/* <KeepAlive id="disposalDetails" name="disposalDetails" saveScrollPosition="screen"> */}
          <DisposalRecordChildren recordId={disposalRecordId} />
          {/* </KeepAlive> */}
        </TzDrawer>
      )}
    </div>
  );
};

export default DisposalRecord;
