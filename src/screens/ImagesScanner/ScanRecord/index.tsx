import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { map } from 'rxjs/operators';
// import { useActivate, useAliveController } from 'react-activation';
import { translations } from '../../../translations/translations';
import { reschedule, scanStatus, subtaskList, taskList } from '../../../services/DataService';
import { useViewConst } from '../../../helpers/use_fun';
import { TzSpinLoadingOutlined } from '../../../components/ComponentsLibrary/TzSpin';
import { TzButton } from '../../../components/tz-button';
import { getUserInformation } from '../../../services/AccountService';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import TzInputSearch from '../../../components/tz-input-search';
import { TzTableServerPage } from '../../../components/tz-table';
import { WebResponse } from '../../../definitions';
import { parseGetMethodParams } from '../../../helpers/until';
import { getCurrentLanguage } from '../../../services/LanguageService';
import { Store } from '../../../services/StoreService';
import { Routes } from '../../../Routes';
import { RenderTag } from '../../../components/tz-tag';
import { tabType } from '../ImagesScannerScreen';
import { JumpImageDetail, JumpNode, JumpPod } from '../../MultiClusterRiskExplorer/components';
import { find } from 'lodash';
import useLayoutMainSearchWid from '../../../helpers/useLayoutMainSearchWid';
import { fetchExportScanTask, fetchReport } from '../components/ImagesScannerDataList';
let nodeTaskStatus: any = {
  notReady: {
    title: translations.deflectDefense_ready,
    type: 'disable',
  },
  pending: {
    title: translations.waiting,
    type: 'disable',
  },
  inprogress: {
    title: translations.execution,
    type: 'finish',
  },
  finished: {
    title: translations.completed,
    type: 'pass',
  },
  terminate: {
    title: translations.terminated,
    type: 'reject',
  },
  pause: {
    title: translations.paused,
    type: 'alarm',
  },
};
let nodeTaskSannStatus = Object.keys(nodeTaskStatus).map((item) => {
  return {
    text: nodeTaskStatus[item].title,
    value: item,
  };
});

let nodeStatus: any = {
  pending: {
    title: translations.waiting,
    style: {
      background: 'rgba(255, 196, 35, 1)',
    },
  },
  inprogress: {
    title: translations.kubeScan_scanning,
    style: {
      background: 'rgba(33, 119, 209, 1)',
    },
  },
  finished: {
    title: translations.scanner_images_success,
    style: {
      background: 'rgba(82, 196, 26, 1)',
    },
  },
  failed: {
    title: translations.scanner_images_failed,
    style: {
      background: 'rgba(233, 84, 84, 1)',
    },
  },
};
let nodeSannStatus = Object.keys(nodeStatus).map((item) => {
  return {
    text: nodeStatus[item].title,
    value: item,
  };
});
function getFormatDuringTime(during: number) {
  let lang = getCurrentLanguage();
  let s = Math.floor(during / 1) % 60;
  during = Math.floor(during / 60);
  let i = during % 60;
  during = Math.floor(during / 60);
  let h = during % 24;
  during = Math.floor(during / 24);
  let d = during;
  let arr = [];
  if (s) {
    arr.push(s + (lang == 'zh' ? '秒' : 's'));
  }
  if (i) {
    arr.push(i + (lang == 'zh' ? '分' : 'min'));
  }
  if (h) {
    arr.push(h + (lang == 'zh' ? '时' : 'hour'));
  }
  if (d) {
    arr.push(d + (lang == 'zh' ? '天' : 'day'));
  }
  return arr.reverse();
}
let FitlerWidTzInputSearch = (props: { onPressEnter: any }) => {
  const fitlerWid = useLayoutMainSearchWid({});
  let { onPressEnter } = props;
  return (
    <TzInputSearch
      style={{ width: fitlerWid }}
      onPressEnter={onPressEnter}
      placeholder={translations.unStandard.str241}
    />
  );
};

const ScanRecord = (props: any) => {
  const [result] = useSearchParams();
  let imageFromType = result.get('imageFromType') || 'registry';
  const navigate = useNavigate();
  const [search, setSearch] = useState<any>('');
  const tablelistRef = useRef<any>(undefined);

  let scanStatusFn = (data: { id: any; statusStr: string; updater: string }) => {
    scanStatus(data).subscribe((res) => {
      if (res.error) {
        return;
      }
      tablelistRef.current.refresh();
    });
  };
  let viewConstData = useViewConst({ constType: 'scanTaskType' });
  const columns = useMemo(() => {
    return [
      {
        title: translations.taskCreationTime,
        dataIndex: 'createdAt',
        width: '14%',
        render: (time: any) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: translations.scanType,
        dataIndex: 'scanType',
        key: 'scanType',
        filters: viewConstData,
        render: (scanType: any, row: any) => {
          let node = find(viewConstData, (item: any) => {
            return item.value === scanType;
          });
          return node?.text || scanType;
        },
      },
      {
        title: translations.scanSuccessRate,
        dataIndex: 'taskStatusGroup',
        key: 'taskStatusGroup',
        render: (scanType: any, row: any) => {
          let { taskStatusGroup } = row;
          return taskStatusGroup.finished + '/' + taskStatusGroup.all;
        },
      },
      {
        title: translations.scanTime,
        key: 'online',
        dataIndex: 'online',
        render: (item: any, row: any) => {
          let { finishedAt, createdAt, statusStr } = row;
          return finishedAt ? getFormatDuringTime((finishedAt - createdAt) / 1000) : '-';
        },
      },
      {
        title: translations.creator,
        dataIndex: 'creator',
        key: 'creator',
        render: (creator: any, row: any) => {
          return creator || '-';
        },
      },
      {
        title: translations.taskStatus,
        key: 'statusStr',
        dataIndex: 'statusStr',
        filters: nodeTaskSannStatus,
        render: (statusStr: any, row: any) => {
          return statusStr === 'notReady' ? (
            <TzSpinLoadingOutlined title={nodeTaskStatus[statusStr].title} />
          ) : (
            <RenderTag
              type={nodeTaskStatus[statusStr].type || 'reject'}
              title={nodeTaskStatus[statusStr].title || '-'}
            />
          );
        },
      },
      {
        title: translations.clusterManage_operate,
        key: 'statusStr',
        dataIndex: 'statusStr',
        width: '134px',
        render: (statusStr: any, row: any) => {
          let arr = [];
          if ('pending' === statusStr) {
            arr.push(
              <TzButton
                type={'text'}
                danger
                onClick={() => {
                  scanStatusFn({
                    id: row.id,
                    statusStr: 'terminate',
                    updater: getUserInformation().username,
                  });
                }}
              >
                {translations.termination}
              </TzButton>,
            );
          } else if ('inprogress' === statusStr) {
            arr.push(
              <>
                <TzButton
                  type={'text'}
                  className={'mr12'}
                  onClick={() => {
                    scanStatusFn({
                      id: row.id,
                      statusStr: 'pause',
                      updater: getUserInformation().username,
                    });
                  }}
                >
                  {translations.suspend}
                </TzButton>
                <TzButton
                  type={'text'}
                  danger
                  onClick={() => {
                    scanStatusFn({
                      id: row.id,
                      statusStr: 'terminate',
                      updater: getUserInformation().username,
                    });
                  }}
                >
                  {translations.termination}
                </TzButton>
              </>,
            );
          } else if ('pause' === statusStr) {
            arr.push(
              <>
                <TzButton
                  type={'text'}
                  className={'mr12'}
                  onClick={() => {
                    scanStatusFn({
                      id: row.id,
                      statusStr: 'pending',
                      updater: getUserInformation().username,
                    });
                  }}
                >
                  {translations.go_on}
                </TzButton>
                <TzButton
                  type={'text'}
                  danger
                  onClick={() => {
                    scanStatusFn({
                      id: row.id,
                      statusStr: 'terminate',
                      updater: getUserInformation().username,
                    });
                  }}
                >
                  {translations.termination}
                </TzButton>
              </>,
            );
          } else if ('finished' === statusStr) {
            arr.push(
              <TzButton
                type={'text'}
                onClick={() =>
                  fetchExportScanTask(
                    {
                      scanTaskId: row.id,
                      taskCreateAt: row.createdAt,
                      imageFromType: imageFromType,
                    },
                    () => {},
                  )
                }
              >
                {translations.export_report}
              </TzButton>,
            );
          } else {
            arr.push('-');
          }
          return (
            <p
              className={'td-btn-m0'}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {arr}
            </p>
          );
        },
      },
    ];
  }, [viewConstData]);
  const reqFun = useCallback(
    (pagination, filter) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const params = {
        offset,
        limit: pageSize,
        ...filter,
        imageFromType,
      };
      return taskList(params).pipe(
        map((res: WebResponse<any>) => {
          const items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems || 0,
          };
        }),
      );
    },
    [search],
  );
  let ExceptRecord = (props: any) => {
    let { parentTable, ...otherProps } = props;
    const tablelistRef = useRef<any>(undefined);
    let reqFun = useCallback(
      (pagination, filter) => {
        const { current = 1, pageSize = 10 } = pagination;
        const offset = (current - 1) * pageSize;
        const params = {
          offset,
          limit: pageSize,
          ...filter,
          ...otherProps,
          nodeNameKeyword: search,
        };
        return subtaskList(params).pipe(
          map((res: WebResponse<any>) => {
            const items = res.getItems();
            return {
              data: items,
              total: res?.data?.totalItems || 0,
            };
          }),
        );
      },
      [search],
    );
    let recordDetailcolumns = useMemo(() => {
      let arr: any = [
        {
          title: translations.image,
          dataIndex: 'imageName',
          key: 'imageName',
          render: (imageName: any, row: any) => {
            return (
              <JumpImageDetail
                imageUniqueID={row.imageUniqueID}
                imageFromType={imageFromType}
                name={imageName}
                imageCleared={row.imageCleared}
              />
            );
          },
        },

        {
          title: translations.scanner_images_scanStatus,
          dataIndex: 'statusStr',
          key: 'statusStr',
          width: '12%',
          filters: nodeSannStatus,
          render: (statusStr: any, row: any) => {
            return (
              <p className={'node-marker'}>
                {'inprogress' === statusStr ? (
                  <p style={{ color: 'rgba(82, 196, 26, 1)' }}>
                    <TzSpinLoadingOutlined title={nodeStatus[statusStr]?.title} />
                  </p>
                ) : (
                  <>
                    <span className="mr6" style={nodeStatus[statusStr]?.style}></span>
                    {nodeStatus[statusStr]?.title}
                  </>
                )}
              </p>
            );
          },
        },
        {
          title: translations.scanStartTime,
          dataIndex: 'startedAt',
          key: 'startedAt',
          width: '11%',
          render: (startedAt: any, row: any) => {
            return startedAt ? moment(startedAt).format('YYYY-MM-DD HH:mm:ss') : '-';
          },
        },
        {
          title: translations.scanTime,
          dataIndex: 'imageAttr',
          key: 'imageAttr',
          render: (item: any, row: any) => {
            let { finishedAt, startedAt } = row;
            return finishedAt && startedAt ? getFormatDuringTime((finishedAt - startedAt) / 1000) : '-';
          },
        },
        {
          title: translations.error_message,
          dataIndex: 'reason',
          width: '12%',
          key: 'reason',
          render: (reason: any, row: any) => {
            return reason || '-';
          },
        },
        {
          title: translations.operation,
          width: '9%',
          render: (item: any, row: any) => {
            return row.statusStr === 'failed' ? (
              <TzButton
                type={'text'}
                onClick={() => {
                  reschedule({
                    id: row.id,
                    statusStr: 'pending',
                    updater: getUserInformation().username,
                  }).subscribe((res) => {
                    if (res.error) return;
                    tablelistRef.current.refresh();
                    parentTable.current.refresh();
                  });
                }}
              >
                {translations.rescan}
              </TzButton>
            ) : row.statusStr === 'finished' ? (
              <TzButton
                type={'text'}
                onClick={() => fetchReport({ imageUniqueID: [row.imageUniqueID], imageFromType })}
              >
                {translations.export_report}
              </TzButton>
            ) : (
              '-'
            );
          },
        },
      ];
      imageFromType === tabType.node
        ? arr.splice(1, 0, {
            title: translations.host_name,
            dataIndex: 'hostname',
            render: (hostname: any, row: any) => {
              let { clusterKey } = row;
              return <JumpNode namespace={hostname} clusterKey={clusterKey} title={hostname} />;
            },
          })
        : arr.splice(1, 0, {
            title: translations.scanner_report_repo,
            dataIndex: 'hostname',
            render: (hostname: any, row: any) => <EllipsisPopover lineClamp={2}>{hostname}</EllipsisPopover>,
          });
      return arr;
    }, [imageFromType]);
    return (
      <TzTableServerPage
        className="nohoverTable"
        tableLayout={'fixed'}
        defaultPagination={{
          current: 1,
          pageSize: 5,
          hideOnSinglePage: true,
        }}
        columns={recordDetailcolumns}
        rowKey={'id'}
        reqFun={reqFun}
        ref={tablelistRef}
      />
    );
  };
  const location = useLocation();
  let setHeader = useCallback(() => {
    if (location.pathname !== Routes.ImageScanRecord) return;
    Store.header.next({
      title: translations.scanRecord,
      extra: <FitlerWidTzInputSearch onPressEnter={setSearch} />,
      onBack: () => {
        navigate(-1);
      },
    });
  }, [imageFromType, location]);
  let setBreadcrumb = useCallback(() => {
    Store.breadcrumb.next([
      {
        children: translations.mirror_lifecycle,
        href: `${Routes.ImagesCILifeCycle}?tab=${imageFromType}`,
      },
      {
        children:
          imageFromType === tabType.registry
            ? translations.scanner_report_repoImage
            : translations.scanner_report_nodeImage,
        href: `${Routes.ImagesCILifeCycle}?tab=${imageFromType}`,
      },
      {
        children: translations.scanRecord,
      },
    ]);
  }, [imageFromType]);
  useEffect(() => {
    setBreadcrumb();
  }, [setBreadcrumb]);
  useEffect(() => {
    setHeader();
  }, [setHeader]);
  // useActivate(() => {
  //   setHeader();
  //   setBreadcrumb();
  // });
  return (
    <div className={'mlr32 scan-record'}>
      <TzTableServerPage
        columns={columns}
        rowKey={'id'}
        tableLayout={'fixed'}
        reqFun={reqFun}
        ref={tablelistRef}
        expandable={{
          expandedRowRender: (item: any) => {
            return <ExceptRecord taskID={item.id} parentTable={tablelistRef} />;
          },
        }}
      />
    </div>
  );
};
export default ScanRecord;
