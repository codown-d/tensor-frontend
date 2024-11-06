import { cloneDeep, debounce, keys, set, throttle } from 'lodash';
import moment from 'moment';
import React, { PureComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import {
  processingCenterRecord,
  recordAction,
  recordDetail,
  recordStatus,
} from '../../services/DataService';
import { useThrottle } from '../../services/ThrottleUtil';
import { translations } from '../../translations/translations';
import { DealData, renderTableDomTemplate } from './AlertRulersScreens';
import './DisposalRecord.scss';
// import KeepAlive, { useActivate, useAliveController, useUnactivate } from 'react-activation';
import { Store } from '../../services/StoreService';
import { useMemoizedFn, useUnmount } from 'ahooks';
import { Tittle } from '../../components/ComponentsLibrary/Tittle';

let opType: any = {
  PodIsolation: translations.podIsolation,
  PodDeletion: translations.podDeletion,
};
let status: any = {
  end: translations.scanner_images_finished,
  isolated: translations.isolated,
};

export const DisposalRecordChildren = (props: any) => {
  const [info, setInfo] = useState<DealData[]>([]);
  const [search, setSearch] = useState('');
  const [data, setData] = useState([]);
  const [actionsList, setActionsList] = useState([]);
  // const { refreshScope } = useAliveController();
  let navigate = useNavigate();

  let getRecordDetail = () => {
    recordDetail({ id: props.recordId })
      .pipe(
        tap((res: any) => {
          if (!res['error']) {
            let { id, eventID, opType, status, object, actions }: any = res.getItem();
            let record: any = { id, eventID, opType, status };
            let filter: string[] = [];
            let translationStr: any = {
              id: translations.disposalId,
              eventID: translations.associatedEvents,
              opType: translations.disposalType,
              status: translations.finalDisposalStatus,
            };
            let latestWarnInfo: DealData[] = [];
            Object.keys(translationStr).forEach((item: any) => {
              if (!filter.includes(item)) {
                let obj: any = {
                  title: translationStr[item] || item,
                  content: fliter[record[item]] || record[item] + '',
                };
                if (item === 'eventID') {
                  obj['render'] = (row: any) => {
                    return (
                      <TzButton
                        type={'text'}
                        onClick={(event) => {
                          event.stopPropagation();
                          // refreshScope('PalaceEventCenterId');
                          // Store.menuCacheItem.next('PalaceEventCenterId');
                          navigate(Routes.PalaceEventCenterId.replace('/:id', `/${row.content}`));
                        }}
                      >
                        {row.content}
                      </TzButton>
                    );
                  };
                } else if (item === 'status') {
                  obj['render'] = (row: any) => {
                    return (
                      <TzTag
                        color={row.content === translations.isolated ? '#fff5dc' : '#f3f4f6'}
                        style={{
                          color: row.content === translations.isolated ? '#f8bf23' : '#a6acbd',
                        }}
                      >
                        {row.content}
                      </TzTag>
                    );
                  };
                }
                latestWarnInfo.push(obj);
              }
            });
            let arr = actions.map((item: any, index: number) => {
              item['children'] = (
                <>
                  <div
                    className="ant-card-body radius8"
                    style={{
                      border: '1px solid #f0f0f0',
                      width: '400px',
                      color: '#676E79',
                    }}
                  >
                    <p>
                      {fliter[item.action]}：{item.object.map((item: any) => item.split('@')[2])}
                    </p>
                    <p className={'mt16 mb16'}>
                      {translations.reportScreen_operator}：{item.user}
                    </p>
                    <p>
                      {translations.disposalTime}：
                      {moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                    </p>
                  </div>
                </>
              );
              return item;
            });
            setActionsList(arr);
            setData(object);
            setInfo(latestWarnInfo);
          }
        }),
      )
      .subscribe();
  };
  useEffect(() => {
    getRecordDetail();
  }, []);
  let onSearch = (keyword: string) => {
    setSearch(keyword);
  };
  let updatePod = (status: any, object: any) => {
    recordAction({
      id: props.recordId,
      object: object,
      action: 'cancelIsolation',
    })
      .pipe(
        tap((res: any) => {
          if (!res['error']) {
            setTimeout(() => {
              getRecordDetail();
            }, 1000);
          }
        }),
      )
      .subscribe();
  };
  const columns = useMemo(() => {
    return [
      {
        title: translations.scanner_detail_pod_name,
        key: 'key',
        dataIndex: 'key',
        ellipsis: {
          showTitle: false,
        },
        render: (record: any) => {
          const txt = record.split('@')[2];
          return <span>{txt}</span>;
        },
      },
      {
        title: translations.tensorWallStrategies_current_status_lable,
        dataIndex: 'status',
        key: 'status',
        render: (text: string, row: any) => {
          return <span>{fliter[text] || text}</span>;
        },
      },
      {
        title: translations.reportScreen_operating,
        dataIndex: '',
        width: '110px',
        render: (text: string, row: any) => {
          return (
            <TzButton
              type={'text'}
              onClick={() => {
                TzConfirm({
                  content: `${translations.sureIsolation}` + `${row.key.split('@').pop()}?`,
                  onOk() {
                    updatePod(text, [row.key]);
                  },
                });
              }}
            >
              {row.status === 'isolated' ? translations.cancelIsolation : ''}
            </TzButton>
          );
        },
      },
    ];
  }, []);
  const filterData = useMemo(() => {
    const sdata = data.filter((item) => {
      return Object.values(item).some((val) => {
        if (typeof val === 'string' || typeof val === 'number') {
          return val.toString().includes(search);
        }
        return false;
      });
    });
    return sdata;
  }, [data, search]);
  const rowKey = useCallback((item: any) => {
    return item.key.toString();
  }, []);
  let fliter: any = {
    isolated: translations.isolated,
    isolate: translations.isolate,
    end: translations.scanner_images_finished,
    cancelIsolation: translations.cancelIsolation,
    cancelIsolated: translations.cancelIsolation,
    deleted: translations.endOfDisposal,
    delete: translations.endOfDisposal,
    notExist: translations.notExist,
    PodIsolation: translations.podIsolation,
    PodDeletion: translations.podDeletion,
  };
  let endRecordStatus = () => {
    TzConfirm({
      icon: () => <></>,
      content: `${translations.sureEndDisposal}`,
      okText: translations.confirm_modal_sure,
      cancelText: translations.cancel,
      onOk() {
        recordStatus({ id: props.recordId, status: 'end' })
          .pipe(
            tap((res: any) => {
              if (!res['error']) {
                setTimeout(() => {
                  getRecordDetail();
                }, 1000);
              }
            }),
          )
          .subscribe();
      },
    });
  };
  return (
    <>
      <div className={'ts-draw-att_ck'}>
        <Tittle
          title={translations.disposalDetails}
          className={'mb16'}
          extra={
            <>
              <TzButton
                type={'text'}
                className={`${
                  info.find((item: any) => item.content === translations.isolated) &&
                  !data.some((item: any) => item.status === 'isolated')
                    ? ''
                    : 'display-n'
                }`}
                onClick={() => {
                  endRecordStatus();
                }}
              >
                {translations.endDisposal}
              </TzButton>
              <TzButton
                className={`${data.some((item: any) => item.status === 'isolated') || 'display-n'}`}
                onClick={() => {
                  let arr: any[] = [];
                  let arr1: any = [];
                  data.forEach((item: any) => {
                    if (item.status === 'isolated') {
                      arr.push(item.key);
                      arr1.push(item.key.split('@')[2]);
                    }
                  });
                  TzConfirm({
                    icon: () => <></>,
                    content: `${translations.sureIsolation}${arr1}?`,
                    okText: translations.confirm_modal_sure,
                    cancelText: translations.cancel,
                    onOk() {
                      updatePod('', arr);
                    },
                  });
                }}
              >
                {translations.allCancelIsolation}
              </TzButton>
            </>
          }
        />
        {renderTableDomTemplate(info)}
        <div className="cont-item">
          <Tittle title={translations.disposalObject} className={'mt40 mb16'} />
          <div className="item-details-case">
            <TzInputSearch
              className={'mb16'}
              placeholder={translations.originalWarning_placeholder}
              onSearch={onSearch}
              style={{ width: 360 }}
            />
            <TzTable
              columns={columns}
              dataSource={filterData}
              rowKey={rowKey}
              pagination={{ defaultPageSize: 10, hideOnSinglePage: true }}
            />
          </div>
        </div>
        <div className="cont-item">
          <Tittle
            title={translations.disposalLog}
            className={`mb16 ${filterData.length === 10 ? 'mt20' : 'mt40'}`}
          />
          <div style={{ overflow: 'hidden', paddingTop: '7px' }}>
            <TzTimelineNoraml timeList={actionsList}></TzTimelineNoraml>
          </div>
        </div>
      </div>
    </>
  );
};

export default DisposalRecordChildren;
