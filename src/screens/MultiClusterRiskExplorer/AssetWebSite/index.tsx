import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { WebResponse } from '../../../definitions';
import { map, tap } from 'rxjs/operators';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { translations } from '../../../translations/translations';
import {TzTable, TzTableServerPage} from '../../../components/tz-table';
import { parseGetMethodParams } from '../../../helpers/until';
import useTzFilter, {
  FilterContext,
} from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { Routes } from '../../../Routes';
import { cloneDeep, isEqual, keys, set } from 'lodash';
import moment from 'moment';
import { TextHoverCopy } from '../../AlertCenter/AlertCenterScreen';
import { assetsWebsiteList , assetsApplicationsTargets } from '../../../services/DataService';
import LabelCol, {BatchButton, useBatchLabelContext} from '../../../components/label-col';
// import { showFailedMessage } from '../../../helpers/response-handlers';

export const useFiltersFn = (values: any, setFilters: React.Dispatch<any>) => {
  const temp = {};
  keys(values).forEach((key) => {
    let _val = cloneDeep(values[key]);
    if (key === 'updatedAt') {
      _val[0] && set(temp, [key, 'start_time'], moment(_val[0]).toISOString());
      _val[1] && set(temp, [key, 'end_time'], moment(_val[1]).toISOString());
      return;
    }
    set(temp, [key], _val);
  });
  setFilters((prev: any) => (isEqual(temp, prev) ? prev : temp));
};

const ProtocolOpts = [
  // {
  //   label: 'TCP',
  //   value: 'TCP',
  // },
  {
    label: 'HTTP',
    value: 'HTTP',
  },
  {
    label: 'HTTPS',
    value: 'HTTPS',
  },
];


interface IServeType {
  label: string;
  value: string;
}

const AssetWebSite = (props: {title: string, rowKey: string}) => {
  let { title = '', rowKey = 'Host' } = props;
  // const navigate = useNavigate();
  // 批量操作hook
  const [
    {rowSelection, isInLabelPage, onlyShowSelect, tagRelateAssetIds},
    {setRefreshTable}
  ] = useBatchLabelContext();

  const tableRef = useRef<any>(null);
  setRefreshTable(tableRef.current?.refresh);

  const columns = useMemo(() => {
    const items = [
      {
        title: translations.domain_name,
        dataIndex: 'Host',
        // width: '30%',
        render: (val: string) => <TextHoverCopy text={val} lineClamp={2} />,
      },
      {
        title: translations.clusterGraphList_detailContainer_protocol,
        dataIndex: 'Protocol',
        render: (val: string) => val || '-',
      },
      {
        title: translations.asset_label,
        dataIndex: 'Tags',
        render: (item: any, row: any) => {
          return (<LabelCol labels={item} />);
        },
      },
      /******
       {
       title: translations.service_type,
       dataIndex: 'svcName',
       render: (val: string) => val || '-',
       },
       {
       title: translations.home_directory_path,
       dataIndex: 'rootDir',
       render: (val: string) => val || '-',
       },
       **/
    ];
    if (isInLabelPage) {
      return items.filter((col: any) => col.title !== translations.asset_label);
    }
    return items;
  },[isInLabelPage]);

  const [filters, setFilters] = useState<any>({});
  const reqFun = useCallback(
    (pagination) => {
      const { current = 1, pageSize = 10 } = pagination;
      let { start_time, end_time } = filters?.updatedAt || {};
      const offset = (current - 1) * pageSize;
      const idList = (isInLabelPage && !onlyShowSelect) ? '' : tagRelateAssetIds;
      let params = {
        offset,
        limit: pageSize,
        ...filters,
        start_time,
        end_time,
        hideTags: isInLabelPage,
        idList,
      };
      return assetsWebsiteList(params).pipe(
        map((res) => {
          const items = res.getItems();
          return {
            data: items,
            total: res.data?.totalItems,
          };
        }),
      );
    },
    [filters, onlyShowSelect],
  );

  const [serveTypes, setServeType] = useState<Array<IServeType>>([]);
  useEffect(() => {
    assetsApplicationsTargets({ app_type: 'web' })
      .pipe(
        tap((res: WebResponse<any>) => {
          setServeType(res.getItems()?.map((v) => ({ label: v, value: v })));
        }),
      )
      .subscribe();
  }, []);

  const screenFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.domain_name,
        name: 'webDesc',
        type: 'input',
        icon: 'icon-yuming',
      },
      {
        label: translations.clusterGraphList_detailContainer_protocol,
        name: 'protocol',
        type: 'select',
        icon: 'icon-dengbaoduiqi',
        props: {
          mode: 'multiple',
          options: ProtocolOpts,
        },
      },
      /***** 需求暂时不做
      {
        label: translations.clusterGraphList_tabInfo_containerName,
        name: 'container_name',
        type: 'input',
        icon: 'icon-Dockerjingxiang',
      },
      {
        label: translations.service_type,
        name: 'type',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          mode: 'multiple',
          options: serveTypes,
        },
      },**/
    ],
    [serveTypes],
  );
  const data = useTzFilter({ initial: screenFilter });
  const handleChange = useCallback((values: any) => {
    useFiltersFn(values, setFilters);
  }, []);

  return (
    <div className="asset-website">
      <div className="mb12">
        <FilterContext.Provider value={{ ...data }}>
          <div className={'flex-r-c'}>
            {!isInLabelPage && <span className="headTit">{title}</span>}
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      <BatchButton />
      <TzTableServerPage
        ref={tableRef}
        columns={columns}
        tableLayout={'fixed'}
        rowKey={rowKey}
        reqFun={reqFun}
        rowSelection={rowSelection}
        expandable={{
          expandedRowRender: (record) => (<ExpandTable record={record} />),
        }}
      />
    </div>
  );
};

const defPaginationExpand = {
  current: 1,
  pageSize: 5,
  pageSizeOptions: [5, 10, 20, 50, 100],
};

const ExpandTableColumn = [
  {
    // 路径
    title: translations.runtimePolicy_container_path,
    dataIndex: 'WebDesc',
    width: '32%',
    render: (val: string) => (<TextHoverCopy text={val} lineClamp={2} />),
  },
  {
    title: translations.clusterGraphList_detailContainer_hostPort,
    dataIndex: 'hostPort',
    width: '100px',
    render: (v: any) => v || '-',
  },
  {
    title: translations.clusterGraphList_detailContainer_containerPort,
    dataIndex: 'containerPort',
    width: '100px',
    render: (v: any) => v || '-',
  },
  {
    title: translations.deflectDefense_containerName,
    dataIndex: 'containerNames',
    width: '32%',
    render: (attrVal: string) => {
      return <EllipsisPopover lineClamp={2}>{attrVal}</EllipsisPopover>;
    },
  },
];
type IPageCfg = typeof defPaginationExpand;

function ExpandTable(props: any) {
  const { record } = props;
  const navigate = useNavigate();
  const dataSource = useMemo(() => {
    return record.PathList || [];
  }, [record.Host]);

  const onClickRow = useCallback((rowItem: any) => {
    return {
      onClick: () => {
        navigate(Routes.AssetsWebsiteInfo + `${parseGetMethodParams({ websiteId: rowItem.id, domain: rowItem.host })}`);
      },
    };
  }, []);

  const [pageCfg, setPageCfg] = useState<IPageCfg>(defPaginationExpand)
  const onTableChange = useCallback((pageCfg: any) => {
    setPageCfg((oldVal: IPageCfg) => ({...oldVal, current: pageCfg.current, pageSize: pageCfg.pageSize}));
  }, []);

  return (
    <TzTable
      key="id"
      columns={ExpandTableColumn}
      dataSource={dataSource}
      pagination={pageCfg}
      onRow={onClickRow}
      onChange={onTableChange}
    />
  );
}

export default AssetWebSite;
