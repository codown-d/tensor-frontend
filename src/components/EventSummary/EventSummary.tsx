import React, { useEffect, useState } from 'react';
import MultiLineChart from '../ChartLibrary/MultiLineChart/MultiLineChart';
import './EventSummary.scss';
import moment from 'moment';
import { getEventsCenterStatistics } from '../../services/DataService';
import { tap } from 'rxjs/operators';
import { WebResponse } from '../../definitions';
import { translations } from '../../translations/translations';
import { TzSelectNormal } from '../tz-select';
import { TzCard } from '../tz-card';
interface eventSummary {
  onFollow?: () => any;
  onCancleFollow?: () => any;
  height?: number;
}

enum dataType {
  month = 'month',
  day = 'day',
  hour = 'hour',
}

const EventSummary = (props: eventSummary) => {
  let { height = 350 } = props;
  const [data, setData] = useState([]);
  const [month, setMonth] = useState([]);
  const [day, setDay] = useState([]);
  const [hour, setHour] = useState([]);
  useEffect(() => {
    getEventsCenterStatistics({
      days: 30,
      hours: 24,
    })
      .pipe(
        tap((res: WebResponse<any>) => {
          // list || []
          const list = res.getItem();
          if (!list) {
            return;
          }
          setMonth(() => {
            return list.daysStatistics
              .sort((a: any, b: any) => a.startTimestamp - b.startTimestamp)
              .map((item: any) =>
                Object.assign(
                  {
                    axis: moment(item.startTimestamp).format('MM/DD'),
                    desc: translations.originalWarning_day_30,
                  },
                  item
                )
              );
          });
          setDay(() => {
            const len = list.daysStatistics.length;
            return list.daysStatistics.slice(len - 7).map((item: any) =>
              Object.assign(
                {
                  desc: translations.originalWarning_day_7,
                  axis: moment(item.startTimestamp).format('dddd'),
                },
                item
              )
            );
          });
          const h = list.hoursStatistics
            .sort((a: any, b: any) => a.startTimestamp - b.startTimestamp)
            .map((item: any) =>
              Object.assign(
                {
                  desc: translations.originalWarning_hour_24,
                  axis: moment(item.startTimestamp).format('HH:mm'),
                },
                item
              )
            );
          setHour(h);
          setData(h);
        })
      )
      .subscribe();
  }, []);
  function Operate() {
    const options = [
      {
        value: dataType.hour,
        label: translations.originalWarning_hour_24,
      },
      {
        value: dataType.day,
        label: translations.originalWarning_day_7,
      },
      {
        value: dataType.month,
        label: translations.originalWarning_day_30,
      },
    ];
    const change = (value: string) => {
      let d = hour;
      switch (value) {
        case dataType.hour:
          d = hour;
          break;
        case dataType.day:
          d = day;
          break;
        case dataType.month:
          d = month;
          break;
      }
      setData([...d]);
    };
    return (
      <>
        <TzSelectNormal
          style={{ width: '127px', color: '#676E79' }}
          defaultValue={dataType.hour}
          options={options}
          onChange={change}
        />
      </>
    );
  }

  return (
    <TzCard
      title={translations.originalWarning_eventOverview}
      bodyStyle={{ paddingTop: '0px' }}
    >
      <div className="event-summary-chart">
        <div className="event-summary-item_1">
          <div className="event-summary-item_1-desc">
            <div>
              <p className="num">
                {hour.reduce((prev: number, cur: any) => {
                  return prev + cur.count;
                }, 0)}
              </p>
              <p className="title">
                {translations.originalWarning_eventAddHour_24}
              </p>
            </div>
          </div>
          <div className="event-summary-item_1-desc">
            <div>
              <p className="num">
                {day.reduce((prev: number, cur: any) => {
                  return prev + cur.count;
                }, 0)}
              </p>
              <p className="title">
                {translations.originalWarning_eventAddDay_7}
              </p>
            </div>
          </div>
          <div className="event-summary-item_1-desc">
            <div>
              <p className="num">
                {month.reduce((prev: number, cur: any) => {
                  return prev + cur.count;
                }, 0)}
              </p>
              <p className="title">
                {translations.originalWarning_eventAddDay_30}
              </p>
            </div>
          </div>
        </div>
        <div className="event-summary-item_2">
          <MultiLineChart
            data={data}
            height={height}
            position="axis*count"
            operate={Operate()}
            colors={['#2177D1']}
          />
        </div>
      </div>
    </TzCard>
  );
};

export default EventSummary;
