import { merge } from 'lodash';
import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { TzCard } from '../../components/tz-card';
import { TableScrollFooter, TzTable } from '../../components/tz-table';
import { Routes } from '../../Routes';
import { getKeepaliveList, setKeepaliveList } from '../../services/AccountService';
import { getEventsCenter } from '../../services/DataService';
import { Store } from '../../services/StoreService';
import { useThrottle } from '../../services/ThrottleUtil';
import './AttckDetail.scss';
import { getEventColumns } from './EventData';
import { useMemoizedFn } from 'ahooks';
// import { useActivate, useAliveController } from 'react-activation';

const AttckDetail = () => {
  let navigate = useNavigate();
  const [result] = useSearchParams();
  let [dataSource, setDataSource] = useState<any>([]);
  let [page, setPage] = useState<any>({ limit: 10, offset: 0, token: '' });
  let [query, setQuery] = useState<any>({
    // tags: [result.get('tags')],
    // severity: [Number(result.get('severity'))],
    description: result.get('description'),
    ruleKey: [decodeURIComponent(result.get('enRuleKeyPath') || '')],
    updatedAt: { start: Number(result.get('start')), end: Number(result.get('end')) },
  });
  let [noMore, setNoMore] = useState(false);
  let [loading, setLoading] = useState(false);
  let scrollRef = useRef<any>(null);
  // const { refreshScope } = useAliveController();
  let getDataSource = useCallback(() => {
    let sendData = Object.assign({
      ...query,
    });
    let data = {
      query: sendData,
      sort: {
        field: 'updatedAt',
        order: 'desc',
      },
      page,
    };
    setLoading(true);
    getEventsCenter(data).subscribe((res) => {
      let items: any[] = res.getItems();
      setDataSource((pre: any) => {
        if (page.offset === 0) {
          return items;
        } else {
          return [].concat(...pre, ...items);
        }
      });
      setPage((pre: any) => {
        return merge(pre, { token: res.data?.pageToken });
      });
      setLoading(false);
      setNoMore(data.page.limit != items.length);
    });
  }, [page]);
  let onScrollHandle = useCallback(
    useThrottle(() => {
      if (!scrollRef.current || loading || noMore) {
        return;
      }
      const { scrollTop, clientHeight, scrollHeight } = scrollRef.current;
      const isBottom = scrollTop + clientHeight + 60 >= scrollHeight;
      if (isBottom) {
        setLoading(true);
        setPage((pre: any) => {
          let o = { offset: pre.offset + pre.limit, limit: pre.limit };
          return merge({}, pre, o);
        });
      }
    }, 0),
    [loading, noMore, scrollRef],
  );
  useEffect(() => {
    let dom = $('#layoutMain');
    scrollRef.current = dom[0];
    dom.on('mousewheel DOMMouseScroll scroll', onScrollHandle);
    return () => {
      dom.off('mousewheel DOMMouseScroll scroll');
    };
  }, []);
  let keepaliveList = getKeepaliveList();
  const location = useLocation();
  if (!keepaliveList[location.pathname]) {
    keepaliveList[location.pathname] = true;
    setKeepaliveList(keepaliveList);
    setQuery({
      // tags: [result.get('tags')],
      // severity: [Number(result.get('severity'))],
      description: result.get('description'),
      ruleKey: [decodeURIComponent(result.get('enRuleKeyPath') || '')],
    });
    setPage({ limit: 10, offset: 0, token: '' });
  }
  useEffect(() => {
    getDataSource();
  }, [page]);
  const setHeader = useMemoizedFn(() => {
    Store.header.next({
      title: query.description,
      onBack: () => {
        navigate(-1);
      },
    });
    Store.breadcrumb.next([
      {
        children: 'ATT&CK',
        href: Routes.Attck,
      },
      {
        children: query.description,
      },
    ]);
  });
  useEffect(() => {
    setHeader();
  }, [query, location]);
  // useActivate(() => {
  //   setHeader();
  // });
  return (
    <TzCard className="attck-detail" bodyStyle={{ padding: '0px 32px 24px' }} bordered={false}>
      <TzTable
        loading={loading}
        dataSource={dataSource}
        pagination={false}
        sticky={true}
        onRow={(record) => {
          return {
            onClick: (event) => {
              event.stopPropagation();
              // refreshScope('PalaceEventCenterId');
              // Store.menuCacheItem.next('PalaceEventCenterId');
              navigate(Routes.PalaceEventCenterId.replace('/:id', `/${record.id}`));
            },
          };
        }}
        rowKey="id"
        columns={getEventColumns(() => {
          setPage({ limit: 10, offset: 0, token: '' });
        }, navigate)}
        footer={() => {
          return <TableScrollFooter isData={!!(dataSource.length >= 20)} noMore={noMore} />;
        }}
      />
    </TzCard>
  );
};

export default AttckDetail;
