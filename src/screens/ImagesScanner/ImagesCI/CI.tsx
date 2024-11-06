import { TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './CI.scss';
import { capitalize, cloneDeep, keys, merge, set } from 'lodash';
import { map } from 'rxjs/operators';
import { TzButton } from '../../../components/tz-button';
import { TzDatePickerCT } from '../../../components/tz-range-picker';
import { TzCol } from '../../../components/tz-row-col';
import { TzSelect, TzSelectNormal } from '../../../components/tz-select';
import { TzTableServerPage } from '../../../components/tz-table';
import TableFilter from '../../../components/tz-table/TableFilter';
import { TzTabsNormal } from '../../../components/tz-tabs';
import { RenderTag, TzTag } from '../../../components/tz-tag';
import { TzTooltip } from '../../../components/tz-tooltip';
import { screens } from '../../../helpers/until';
import { Line } from '@antv/g2plot';
import { getCiImages, postCiStatisticImage, postCiStatisticTop5 } from '../../../services/DataService';
import './ImagesCILifeCycle.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { Routes } from '../../../Routes';
import { addWhiteList } from '../WhiteList';
import { TzProgress } from '../../../components/tz-progress';
import { Store } from '../../../services/StoreService';
import { WebResponse } from '../../../definitions';
import { translations } from '../../../translations/translations';
import { TextHoverCopy } from '../../AlertCenter/AlertCenterScreen';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import NoData from '../../../components/noData/noData';
import { ScaleLine, getMax } from '../../DeflectDefense/component/Top5';
interface PageTitleProps {
  title: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  extra?: React.ReactNode;
}
export let PageTitle = (props: PageTitleProps) => {
  let { title, className = '', style } = props;
  return (
    <span className="f16">
      <span className={`page-title-content flex-r  ${className}`}>
        <span
          style={merge(
            {
              flex: '1',
              alignItems: 'center',
              maxWidth: '100%',
              color: '#1E222A',
            },
            style,
          )}
          className={`flex-r`}
        >
          {title}
        </span>
        <span className={'extra'} style={{ display: 'flex' }}>
          {props.extra}
        </span>
      </span>
    </span>
  );
};
let CIChart = () => {
  let postCiStatisticImageFn = (interval: string) => {
    postCiStatisticImage({ interval }).subscribe((res) => {
      let items = res.getItems();
      let arr = items.reduce((pre: any, item) => {
        let { Alert, Sum, Reject, Time } = item;

        if (interval === '24') {
          Time = Time.split(' ')[1] + ':00';
        }
        return pre.concat([
          {
            count: Sum,
            type: translations.total_scans,
            time: Time,
          },
          {
            count: Alert,
            type: translations.number_of_alarms,
            time: Time,
          },
          {
            count: Reject,
            type: translations.number_of_blocks,
            time: Time,
          },
        ]);
      }, []);
      setTimeout(() => {
        if (!$('#ciChart').length) return;
        $('#ciChart').children().remove();
        const linePlot = new Line('ciChart', {
          padding: [10, 20, 60, 40],
          data: arr,
          xAxis: {
            label: {
              style: {
                fill: '#6C7480',
                fontFamily: 'Helvetica Neue Arial',
              },
            },
          },
          yAxis: {
            label: {
              style: {
                fill: '#6C7480',
                fontFamily: 'Helvetica Neue Arial',
              },
            },
            grid: {
              line: {
                style: {
                  fill: '#E7E9ED',
                  lineDash: [4, 6],
                },
              },
            },
          },
          xField: 'time',
          yField: 'count',
          seriesField: 'type',
          smooth: true,
          color: ['#2177D1', '#FFC423', '#E95454'],
          area: {
            color: (datum) => {
              let obj: any = {
                [translations.total_scans]: 'l(90) 0:rgba(33, 119, 209, 0.7) 0.8:rgba(33, 119, 209, 0)',
                [translations.number_of_alarms]: 'l(90) 0:rgba(255, 196, 35, 0.7) 0.8:rgba(255, 196, 35, 0)',
                [translations.number_of_blocks]: 'l(90) 0:rgba(233, 84, 84, 0.7) 0.8:rgba(233, 84, 84, 0)',
              };
              return obj[datum.type];
            },
          },
          point: {
            shape: 'circle',
            style: (val) => {
              return {
                r: 0,
                fillOpacity: 1,
                stroke: 'transparent',
              };
            },
          },
          theme: {
            geometries: {
              point: {
                circle: {
                  active: {
                    style: (val: any) => {
                      return {
                        r: 4,
                        stroke: val.model.color,
                        fill: '#fff',
                        lineWidth: 2,
                      };
                    },
                  },
                },
              },
            },
          },
          interactions: [{ type: 'marker-active' }],
          tooltip: {
            domStyles: {
              'g2-tooltip': {
                color: '#3E4653',
                'font-size': '12px',
                width: '150px',
                padding: '12px 16px 6px',
                'border-radius': '8px',
              },
              'g2-tooltip-title': { 'margin-top': '0px' },
              'g2-tooltip-value': { float: 'none', 'margin-left': '0' },
              'g2-tooltip-list-item': {
                'margin-bottom': '6px',
                'margin-top': '0px',
              },
            },
            showMarkers: false,
            crosshairs: {
              line: {
                style: {
                  fill: '#2177D1',
                  stroke: '#2177D1',
                  lineWidth: 2,
                  lineDash: [4, 6],
                },
              },
            },
          },
          legend: {
            layout: 'horizontal',
            position: 'bottom',
            offsetY: 0,
            marker: (name: string, index: number, item: any) => {
              let { style } = item;
              return {
                style: { r: 3, y: 5, fill: style.stroke },
                symbol: (x: number, y: number, r: number) => {
                  return [['M', x + 8, y + r - 2], ['A', r, r, 0, 1, 1, x + 8, y + r - 3], ['Z']];
                },
              };
            },
          },
        });
        linePlot.render();
      }, 0);
    });
  };
  useEffect(() => {
    postCiStatisticImageFn('7');
  }, []);
  return (
    <div className="ci-chart">
      <PageTitle
        title={translations.scan_trend_chart}
        extra={
          <>
            <TzTabsNormal
              defaultActiveKey={'7'}
              onChange={(_key) => {
                postCiStatisticImageFn(_key);
              }}
              className="ci-tabs tabs-nav-mb0"
              style={{ padding: '0px', fontWeight: 400 }}
              tabpanes={[
                {
                  tab: translations.hours_24,
                  tabKey: '24',
                },
                {
                  tab: translations.days_7,
                  tabKey: '7',
                },
                {
                  tab: translations.days_30,
                  tabKey: '30',
                },
              ]}
            />
          </>
        }
      />
      <div className={'ci-chart-content mt16'} id="ciChart"></div>
    </div>
  );
};
let Top5Image = () => {
  let [data, setData] = useState<any>([]);
  let postCiStatisticTop5Fn = () => {
    postCiStatisticTop5().subscribe((res) => {
      let items = res.getItems();
      setData(items);
    });
  };
  useEffect(() => {
    postCiStatisticTop5Fn();
  }, []);
  let max = useMemo(() => {
    if (!data.length) return 1;
    let maxCount = Math.max(...data?.map((item: any) => item.Count || 0), 0);
    return getMax(maxCount);
  }, [data]);
  return (
    <div className={'ci-top5 mb16'}>
      <PageTitle
        title={translations.number_of_exceptions_top_5_image}
        className={'mb16'}
        style={{ fontSize: '16px' }}
      />
      <div className={'top5-content'}>
        {data.map((item: any) => {
          return (
            <>
              <p className={'ci-top5-title'}>
                {item.ImageName} <span className={'f-r'}>{item.Count}</span>
              </p>
              <TzProgress
                percent={(item.Count / max) * 100}
                showInfo={false}
                className={'progressH10 top5-progress'}
                strokeColor={'linear-gradient(90deg, #2177D1 0%, #2D94FF 110.06%)'}
              />
            </>
          );
        })}
      </div>
      <ScaleLine max={max} />
    </div>
  );
};
let ImageInfoDetail = (props: any) => {
  let { ImageName, pipeline_name } = props;
  return (
    <div className={'ci-image'}>
      <p className={'ci-image-name mb8'}>
        {/* 20230223修改下边距16-8 TEN-1034 */}
        <TextHoverCopy text={ImageName} lineClamp={2} />
      </p>
      <TzTag className={'ant-tag ant-tag-default tz-tag small ci-task-name'}>
        {translations.pipeline_name}：{pipeline_name}
      </TzTag>
    </div>
  );
};
let CISeverity = (props: any) => {
  let { severity, cn = 'td-warn', icon = <></> } = props;
  let newSeverity = useMemo(() => {
    return Object.keys(severity).reduce((pre: any, item) => {
      pre[capitalize(item)] = severity[item];
      return pre;
    }, {});
  }, [severity]);
  let newSeverityLevel: any = {
    Critical: {
      title: translations.notificationCenter_columns_Critical,
      className: 'btn-critical',
    },
    High: {
      title: translations.notificationCenter_columns_High,
      className: 'btn-high',
    },
    Medium: {
      title: translations.notificationCenter_columns_Medium,
      className: 'btn-medium',
    },
    Low: {
      title: translations.notificationCenter_columns_Low,
      className: 'btn-low',
    },
    Negligible: {
      title: translations.notificationCenter_columns_Negligible,
      className: 'btn-negligible',
    },
    Unknown: {
      title: translations.unknown,
      className: 'btn-und',
    },
  };
  return (
    <div>
      {Object.keys(newSeverityLevel).reduce((pre: any, item: any) => {
        let { className = '' } = newSeverityLevel[item] || {};
        let newClassName = `${cn} ${className}`;
        if (newSeverity[item]) {
          pre.push(
            <TzTooltip title={`${newSeverityLevel[item]?.title} : ${newSeverity[item]}`}>
              <span className={`t-c severity-span ${newClassName}`} style={{ margin: '4px 8px 4px 0px' }}>
                {icon}
                {newSeverity[item]}
              </span>
            </TzTooltip>,
          );
        }
        return pre;
      }, [])}
    </div>
  );
};
export let Histogram = (props: any) => {
  let severity: any = {};
  let { severityHistogram = {} } = props;
  Object.keys(severityHistogram).forEach((element) => {
    if (severityHistogram[element]) {
      let key = element.replace(/num/, '');
      severity[key] = severityHistogram[element];
    }
  });
  return Object.values(severity).length ? <CISeverity severity={severity} /> : <>-</>;
};
let questionsItems: any = {
  1: {
    label: translations.scanner_images_vulnerabilities,
    className: 'icon-loudong',
  },
  2: {
    label: translations.scanner_images_sensitive,
    className: 'icon-minganwenjian1',
  },
};
export enum CiStatusEnum {
  alert = 'alert',
  block = 'block',
  pass = 'pass',
  abnormal = 'abnormal',
  normalPass = 'normalPass',
}
export let statusSelectEnum: any = {
  [CiStatusEnum.alert]: {
    label: translations.imageReject_reject_type_alarm,
    style: {
      color: 'rgba(255, 196, 35, 1)',
      background: 'rgba(255, 196, 35, 0.1000)',
    },
  },
  [CiStatusEnum.block]: {
    label: translations.imageReject_reject_type_reject,
    style: {
      color: 'rgba(233, 84, 84, 1)',
      background: 'rgba(233, 84, 84, 0.1000)',
    },
  },
  [CiStatusEnum.pass]: {
    label: translations.compliances_breakdown_numSuccessful,
    style: {
      color: 'rgba(82, 196, 26, 1)',
      background: 'rgba(82, 196, 26, 0.1)',
    },
  },
  [CiStatusEnum.abnormal]: {
    label: translations.abnormal,
    style: {
      color: 'rgba(255,138,52, 1)',
      background: 'rgba(255,138,52, 0.1)',
    },
  },
};
export let statusEnum: any = {
  ...statusSelectEnum,
  [CiStatusEnum.normalPass]: {
    label: translations.white_list_passed,
    style: {
      color: 'rgba(82, 196, 26, 1)',
      background: 'rgba(82, 196, 26, 0.1)',
    },
  },
};
export const CiQuestions = (props: any) => {
  let { Questions = '' } = props;
  let arr = Questions.split(',');
  return (
    <span style={{ display: 'block', height: '22px' }}>
      {Object.keys(questionsItems).map((item: string | number) => {
        return (
          <TzTooltip title={`${questionsItems[item]?.label}`}>
            <i
              className={`iconfont f20 mr10 ci-questions ${questionsItems[item].className} ${
                arr.includes(item) ? 'color-b' : ''
              }`}
            ></i>
          </TzTooltip>
        );
      })}
    </span>
  );
};
export const CI = (props: any) => {
  const navigate = useNavigate();
  let [tableOp, setTableOp] = useState(false);
  let [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  let [filters, setFilters] = useState<any>({});
  let [whiteListDisplay, setWhiteListDisplay] = useState<any>({});
  const listComp = useRef(undefined as any);
  let columns: any = [
    {
      title: translations.compliances_breakdown_taskbaseinfo,
      key: 'key',
      width: '32%',
      className: 'task-name',
      dataIndex: 'TaskName',
      render: (executeType: any, row: any) => {
        let t = row.match_whitelist && row.status === 'pass';
        return (
          <div>
            {t ? (
              <TzTooltip title={translations.white_list_passed}>
                <img src="/images/bai.png" />
              </TzTooltip>
            ) : null}
            <ImageInfoDetail {...row} />
          </div>
        );
      },
    },
    {
      title: translations.safetyProblem,
      key: 'Questions',
      width: '11%',
      dataIndex: 'Questions',
      render: (Questions: any) => {
        return <CiQuestions Questions={Questions} />;
      },
    },
    {
      title: translations.vulnerability_statistics,
      key: 'severityHistogram',
      dataIndex: 'severityHistogram',
      render: (severityHistogram: any) => {
        return <Histogram severityHistogram={severityHistogram} />;
      },
    },
    {
      title: translations.compliances_node_status,
      key: 'status',
      width: '10%',
      align: 'center',
      dataIndex: 'status',
      render: (status: any, row: any) => {
        if (!statusEnum[status]) return null;
        return <RenderTag type={status} />;
      },
    },
    {
      title: translations.scanningTime,
      key: 'ScanTime',
      width: '14.3%',
      dataIndex: 'ScanTime',
      render: (ScanTime: any) => {
        return (
          <>
            {moment(ScanTime).format('YYYY-MM-DD')}
            <br />
            {moment(ScanTime).format('HH:mm:ss')}
          </>
        );
      },
    },
    {
      title: translations.operation,
      key: 'in_whitelist',
      width: '140px',
      dataIndex: 'in_whitelist',
      render: (in_whitelist: any, row: any) => {
        let { ImageName, status } = row;
        if (in_whitelist || status === CiStatusEnum.pass || status === CiStatusEnum.abnormal) return '-';
        return (
          <TzButton
            className="ml-8"
            type={'text'}
            onClick={(event) => {
              event.stopPropagation();
              addWhiteList('add', { name: [ImageName] }, () => {
                listComp.current.refresh();
              });
            }}
          >
            {translations.increase_white_list}
          </TzButton>
        );
      },
    },
  ];
  let handleRowSelection = (selected: boolean, selectedRows: any[]) => {
    setSelectedRowKeys((pre: any) => {
      selectedRows.forEach(({ id }: any) => {
        if (selected) {
          pre.push(id);
        } else {
          pre.remove(id);
        }
      });
      return [...pre];
    });
  };
  const rowSelection = useMemo(() => {
    if (!tableOp) return undefined;
    return {
      columnWidth: '32px',
      selectedRowKeys,
      onSelect: (record: any, selected: any, selectedRows: any, nativeEvent: any) => {
        nativeEvent.stopPropagation();
        handleRowSelection(selected, [record]);
      },
      onSelectAll: (selected: any, selectedRows: any, changeRows: any) => {
        handleRowSelection(selected, changeRows);
      },
      getCheckboxProps: (record: any) => ({
        disabled: record.in_whitelist || record.status === 'pass',
        name: record.name,
      }),
    };
  }, [tableOp, selectedRowKeys]);
  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let { end_time, start_time } = filters?.updatedAt || {};
      const pageParams = {
        offset,
        limit: pageSize,
        ...filters,
        end_time: end_time ? moment(end_time).valueOf() : '',
        start_time: start_time ? moment(start_time).valueOf() : '',
      };
      delete pageParams.updatedAt;
      return getCiImages(pageParams).pipe(
        map((res: WebResponse<any>) => {
          let items = res.getItems();
          items.forEach((element: any) => {
            setWhiteListDisplay((pre: any) => {
              return Object.assign({}, pre, {
                [element.id]: element.ImageName,
              });
            });
          });
          return {
            data: res.getItems(),
            total: res.totalItems,
          };
        }),
      );
    },
    [filters],
  );
  let { questionsOp, statusOp } = useMemo(() => {
    let questionsOp = Object.keys(questionsItems).map((item) => {
      return {
        label: questionsItems[item].label,
        value: item,
      };
    });
    let statusOp = Object.keys(statusSelectEnum).map((item) => {
      return {
        label: statusSelectEnum[item].label,
        value: item,
      };
    });
    return { questionsOp, statusOp };
  }, []);

  const l = useLocation();
  useEffect(() => {
    Store.pageFooter.next(
      tableOp ? (
        <div>
          <span className="mr16 ml16">{`${translations.selected} ${selectedRowKeys.length} ${translations.items}`}</span>
          <TzButton
            disabled={!selectedRowKeys.length}
            onClick={() => {
              addWhiteList(
                'add',
                {
                  name: selectedRowKeys.map((item: any) => {
                    return whiteListDisplay[item];
                  }),
                },
                () => {
                  listComp.current.refresh();
                  setSelectedRowKeys([]);
                },
              );
            }}
          >
            {translations.increase_white_list}
          </TzButton>
        </div>
      ) : null,
    );
  }, [tableOp, selectedRowKeys, l]);
  const ciFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.scanner_images_imageName,
        name: 'image',
        type: 'input',
        icon: 'icon-jingxiang',
      },
      {
        label: translations.pipeline_name,
        name: 'taskname',
        type: 'input',
        icon: 'icon-jiedian',
      },

      {
        label: translations.safetyProblem,
        name: 'kind',
        type: 'select',
        icon: 'icon-wenti',
        props: {
          mode: 'multiple',
          options: questionsOp,
        },
        condition: {
          name: 'kind_attribute',
          props: {
            optionLabelProp: 'optionLabel',
            options: [
              {
                value: 'or',
                optionLabel: <span>&cup;</span>,
                label: (
                  <>
                    <span className="mr8 fw550 f15">&cup;</span>
                    {translations.union}
                  </>
                ),
              },
              {
                value: 'and',
                optionLabel: <span>&cap;</span>,
                label: (
                  <>
                    <span className="mr8 fw550 f15">&cap;</span>
                    {translations.intersection}
                  </>
                ),
              },
            ],
          },
        },
      },
      {
        label: translations.compliances_node_status,
        name: 'status',
        type: 'select',
        icon: 'icon-celveguanli',
        props: {
          mode: 'multiple',
          options: statusOp,
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
    [statusOp, questionsOp],
  );

  const data = useTzFilter({ initial: ciFilter });

  const handleChange = useCallback((values: any) => {
    const temp = {};
    keys(values).forEach((key) => {
      let _val = cloneDeep(values[key]);
      if (key === 'updatedAt') {
        _val[0] && set(temp, 'updatedAt.start_time', _val[0]);
        _val[1] && set(temp, 'updatedAt.end_time', _val[1]);
        return;
      }
      set(temp, [key], _val);
    });
    setFilters(temp);
  }, []);
  return (
    <div
      style={{
        background: '#fff',
        paddingBottom: `${!tableOp ? '20px' : '0px'}`,
      }}
    >
      <div className="flex-r ci-content">
        <CIChart />
        <Top5Image />
      </div>
      <PageTitle
        title={translations.mirror_scan_record}
        extra={
          <>
            <TzButton
              icon={<i className={'icon iconfont icon-jianceguize'}></i>}
              className="mr16"
              onClick={() => {
                navigate(Routes.WhiteList);
              }}
            >
              {translations.white_list}
            </TzButton>
            <TzButton
              icon={<i className={'icon iconfont icon-celveguanli'}></i>}
              onClick={() => {
                navigate(Routes.StrategicManagement);
              }}
            >
              {translations.policy_management}
            </TzButton>
          </>
        }
        className={'mt36 f16'}
      />
      <div>
        <div className="mt16 mb12">
          <FilterContext.Provider value={{ ...data }}>
            <div className="ci--filter">
              <TzButton
                onClick={() => {
                  setTableOp((pre) => !pre);
                }}
              >
                {tableOp ? translations.cancel_batch_operation : translations.batch_operation}
              </TzButton>
              <TzFilter />
            </div>
            <TzFilterForm onChange={handleChange} />
          </FilterContext.Provider>
        </div>
        <TzTableServerPage
          rowSelection={rowSelection}
          tableLayout={'fixed'}
          columns={columns}
          reqFun={reqFun}
          rowClassName={(record, index) => {
            if (record.match_whitelist && record.status === 'pass') {
              return 'rivet';
            } else {
              return '';
            }
          }}
          onRow={(record) => {
            return {
              onClick: (event: any) => {
                event.persist();
                if (event.target.className !== 'ant-checkbox-inner') {
                  navigate(`${Routes.ImagesDetailInfo}?id=${record.id}`);
                }
              },
            };
          }}
          ref={listComp}
          rowKey={'id'}
        />
      </div>
    </div>
  );
};

export default CI;
