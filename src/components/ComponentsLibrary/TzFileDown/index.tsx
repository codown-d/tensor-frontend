import { Badge, ConfigProvider, notification, TablePaginationConfig } from 'antd';
import en_US from 'antd/lib/locale/en_US';
import zh_CN from 'antd/lib/locale/zh_CN';
import { ArgsProps } from 'antd/lib/notification';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { map, switchMap, tap } from 'rxjs/operators';
import { SupportedLangauges } from '../../../definitions';
import { exportList, taskDownload } from '../../../services/DataService';
import { localLang, translations } from '../../../translations/translations';
import { EllipsisPopover } from '../../ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../tz-button';
import { TzTableServerPage } from '../../tz-table';
import './index.scss';
import { useUnmount } from 'ahooks';
import { Tittle } from '../Tittle';
import { timer } from 'rxjs';
interface TzFileDownProps {
  children?: React.ReactNode;
}
let downList: any = [];
export const TzFileDownContainer = (props: TzFileDownProps) => {
  let [count, setCount] = useState(0);
  const listComp = useRef(undefined as any);
  const reqFun = useCallback((pagination?: TablePaginationConfig) => {
    const { current = 1, pageSize = 10 } = pagination || {};
    const offset = (current - 1) * pageSize;
    const pageParams = {
      offset,
      limit: pageSize,
    };
    return exportList(pageParams).pipe(
      map((res: any) => {
        let items = res.getItems();
        setCount(res.data?.notFinished);
        return {
          data: items,
          total: res.data?.totalItems,
        };
      }),
    );
  }, []);
  let FileList = (props: any) => {
    let columns: any = [
      {
        title: translations.document_name,
        dataIndex: 'filePath',
        ellipsis: {
          showTitle: false,
        },
        render: (filePath: any) => {
          return (
            <EllipsisPopover placement={'rightTop'} className={'f-l'}>
              {filePath}
            </EllipsisPopover>
          );
        },
      },
      {
        title: translations.calico_cluster_type,
        dataIndex: 'executeType',
      },
      {
        title: translations.operation,
        width: '100px',
        dataIndex: 'status',
        render: (status: any, row: any) => {
          let obj: any = {
            pending: translations.waiting,
            running: translations.exporting,
            finished: translations.scanner_report_download,
            error: translations.export_error,
          };
          let f = false;
          return (
            <>
              <TzButton
                type="text"
                loading={status == 'pending' || status == 'running' || downList.includes(row.id)}
                disabled={status == 'error'}
                onClick={() => {
                  if (!f) {
                    f = true;
                    downList.push(row.id);
                    taskDownload({ id: row.id })
                      .pipe(
                        tap((res) => {
                          let { url } = res.getItem();
                          downList.remove(row.id);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = row.filePath;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }),
                      )
                      .subscribe();
                  }
                }}
              >
                {downList.includes(row.id) ? translations.downloading : obj[status]}
              </TzButton>
            </>
          );
        },
      },
    ];
    return (
      <>
        <ConfigProvider locale={localLang === SupportedLangauges.English ? en_US : zh_CN}>
          <TzTableServerPage
            id={'widgetsFile'}
            columns={columns}
            reqFun={reqFun}
            loading={false}
            defaultPagination={{ showQuickJumper: false, showSizeChanger: false }}
            ref={listComp}
          />
        </ConfigProvider>
      </>
    );
  };
  const args: ArgsProps = {
    message: <Tittle title={translations.export_list} />,
    description: <FileList />,
    duration: 0,
    className: 'file-pane',
    key: 'widgetsFile',
    closeIcon: (
      <span style={{ color: '#B3BAC6' }}>
        {translations.pack_up}
        <i
          className={'icon iconfont icon-arrow f16'}
          style={{ transform: 'rotate(-90deg)', display: 'inline-block' }}
        ></i>
      </span>
    ),
    style: { padding: '16px 20px', width: '500px' },
    bottom: 0,
    placement: 'bottomRight',
  };
  useEffect(() => {
    let sub = timer(0, 5000)
      .pipe(
        switchMap(() => {
          return exportList({ offset: 0, limit: 10 });
        }),
        map((res) => res),
      )
      .subscribe((res: any) => {
        if (res.error) {
          sub.unsubscribe();
          return;
        }
        if ($('#widgetsFile').length) {
          setCount(res.data?.notFinished);
          listComp.current?.refresh();
        }
      });
    return () => {
      sub.unsubscribe();
    };
  }, []);
  let children = useMemo(() => {
    return (
      props.children || (
        <Badge size="small" count={count} offset={[-7, 0]}>
          <div
            className={'fixed-widgets-content flex-c-c'}
            style={{ height: '48px', width: '48px', justifyContent: 'center' }}
          >
            <i className={'icon iconfont icon-daochu f18'}></i>
            <div className="down" style={{ lineHeight: '12px' }}>
              {translations.reportScreen_download}
            </div>
          </div>
        </Badge>
      )
    );
  }, [count]);
  useUnmount(() => {
    notification.destroy();
  });
  return (
    <div
      className={'fixed-widgets'}
      id={'fixedWidgets'}
      onClick={() => {
        notification.destroy();
        notification.open(args);
      }}
    >
      {children}
    </div>
  );
};
