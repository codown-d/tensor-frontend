import { merge } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './EventOverviewDetails.less';
import { getUrlQuery } from '../../helpers/until';
import { getEventsCenter } from '../../services/DataService';
import { Store } from '../../services/StoreService';
import { translations } from '../../translations/translations';
import './Configure.scss';
import { getEventColumns } from './EventData';
import { TableScrollFooter, TzTable } from '../../components/tz-table';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Routes } from '../../Routes';
import { Subscription } from 'rxjs';
import { useThrottle } from '../../services/ThrottleUtil';
// import { useActivate, useAliveController } from 'react-activation';
let timer: any;
const EventDetailsList = () => {
  const navigate = useNavigate();
  const l = useLocation();
  const [result] = useSearchParams();
  // const { refreshScope } = useAliveController();
  let [page, setPage] = useState<any>({ limit: 20, offset: 0, token: '' });
  let [dataSource, setDataSource] = useState<any>([]);
  let [title] = useState<any>(result.get('title'));
  let urlQuery = getUrlQuery();
  let param = Object.keys(urlQuery).reduce((pre: any, item) => {
    if (['start', 'end'].includes(item)) {
      pre[item] = Number(decodeURIComponent(urlQuery[item]));
    } else if (['scope'].includes(item)) {
      pre[item] = JSON.parse(decodeURIComponent(urlQuery[item]));
    } else if (['title'].includes(item)) {
      pre[item] = decodeURIComponent(urlQuery[item]);
    } else if (['processStatus', 'severity'].includes(item)) {
      pre[item] = urlQuery[item]
        ? decodeURIComponent(urlQuery[item])
            .split(',')
            .map((item) => Number(item))
        : [];
    } else {
      pre[item] = urlQuery[item] ? decodeURIComponent(urlQuery[item]).split(',') : [];
    }
    return pre;
  }, {});
  delete param.title;
  const [riskQuery] = useState<any>({
    ...param,
    updatedAt: {
      start: param.start || moment().valueOf(),
      end: param.end || moment().valueOf(),
    },
  });
  let [filters] = useState<any>(riskQuery);
  let [noMore, setNoMore] = useState(false);
  let [loading, setLoading] = useState(false);
  const reqsub = useRef(undefined as undefined | Subscription);
  let scrollRef = useRef<any>(null);
  let query: any = useMemo(() => {
    return { ...filters };
  }, [filters]);
  let getDataSource = useCallback(() => {
    reqsub.current?.unsubscribe();
    let data = {
      query,
      sort: {
        field: 'updatedAt',
        order: 'desc',
      },
      page,
    };
    if (page.offset === 0) {
      setDataSource([]);
    }
    reqsub.current = getEventsCenter(data).subscribe((res: any) => {
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
  }, [page, query]);
  useEffect(() => {
    getDataSource();
  }, [page, filters]);
  let setHeader = useCallback(() => {
    Store.breadcrumb.next([
      {
        children: translations.alertCenter,
        href: Routes.NotificationCenter,
      },
      {
        children: translations.event_overview,
        href: Routes.EventOverviewDetails,
      },
      {
        children: title,
      },
    ]);
    Store.header.next({
      title,
      onBack: () => {
        navigate(-1);
      },
    });
  }, [title]);
  // useActivate(setHeader);
  useEffect(setHeader, [l]);
  let onScrollHandle = useCallback(
    useThrottle(() => {
      if (!scrollRef.current || loading || noMore) {
        return;
      }
      const { scrollTop, clientHeight, scrollHeight } = scrollRef.current;
      const isBottom = scrollTop + clientHeight + 60 >= scrollHeight;
      if (isBottom && scrollTop) {
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
  return (
    <div className="mlr32">
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
        rowKey={'id'}
        columns={getEventColumns(() => {
          setPage({ limit: 20, offset: 0, token: '' });
        }, navigate)}
        footer={() => {
          return <TableScrollFooter isData={!!(dataSource.length >= 20)} noMore={noMore} />;
        }}
      />
    </div>
  );
};

export default EventDetailsList;
