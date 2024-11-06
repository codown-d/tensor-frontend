import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { map } from 'rxjs/operators';
import { TzButton } from '../../../components/tz-button';
import TzInputSearch from '../../../components/tz-input-search';
import { TzTableServerPage } from '../../../components/tz-table';
import { WebResponse } from '../../../definitions';
import { Routes } from '../../../Routes';
import { nodeImageImagesList } from '../../../services/DataService';
import { translations } from '../../../translations/translations';
//周期扫描报告
const ScanReports = (props: any) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<any>({});
  const [search, setSearch] = useState<any>({});
  const tablelistRef = useRef<any>(undefined);
  const columns = useMemo(() => {
    return [
      {
        title: translations.scanner_report_reportName,
        key: 'registryUrl',
        width: '14%',
        render: (time: any) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: translations.scanner_report_reportType,
        dataIndex: 'imageAttr',
        key: 'imageAttr',
        filters: [
          {
            text: translations.scanner_report_weeklyReport,
            value: 'week',
          },
          {
            text: translations.scanner_report_monthlyReport,
            value: 'month',
          },
        ],
      },
      {
        title: translations.report_format,
        dataIndex: 'vulnStatic',
        key: 'vulnStatic',
      },
      {
        title: translations.scanner_report_reportContent,
        key: 'online',
        dataIndex: 'online',
      },
      {
        title: translations.clusterManage_createtime,
        dataIndex: 'bootUser',
        key: 'bootUser',
        render: (item: any, row: any) => {
          return moment().format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: translations.operation,
      },
    ];
  }, []);
  const reqFun = useCallback(
    (pagination, filter) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const params = {
        offset,
        limit: pageSize,
        imageFromType: 'node',
        ...filters,
        search,
      };
      return nodeImageImagesList(params).pipe(
        map((res: WebResponse<any>) => {
          const items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems || 0,
          };
        }),
      );
    },
    [filters, search],
  );
  return (
    <div className={'mlr32 scan-reports'}>
      <p className={'mb12'}>
        <TzButton
          onClick={() => {
            navigate(`${Routes.ImageScanReportDetail.replace('/:type', '/add?id=')}`);
          }}
        >
          {translations.newAdd}
        </TzButton>
        <TzInputSearch
          style={{ width: 375 }}
          className={'f-r'}
          onChange={setSearch}
          placeholder={translations.unStandard.str218}
        />
      </p>
      <TzTableServerPage columns={columns} rowKey={'id'} reqFun={reqFun} ref={tablelistRef} />
    </div>
  );
};
export default ScanReports;
