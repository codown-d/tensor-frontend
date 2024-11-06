import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import { tap } from 'rxjs/operators';
import AssetTopSpace from '../../../components/AssetModule/TopSpace';
import { TzTableKeyVal, TzTableServerPage } from '../../../components/tz-table';
import { TzInputSearch } from '../../../components/tz-input-search';
import { clusterGraphResources, getListClusters } from '../../../services/DataService';
import { map, tap } from 'rxjs/operators';
import './DetailTabInfo.scss';
import { SearchObj } from '../GraphResFilterHelper';
import { translations } from '../../../translations/translations';
import { Link } from 'react-router-dom';
import { Routes } from '../../../Routes';
import { WebResponse } from '../../../definitions';
import { Tittle } from '../../../components/ComponentsLibrary/Tittle';
import { JumpResource } from '../components';
import { Store } from 'services/StoreService';
import { TzTabs } from 'components/tz-tabs';
import { useMemoizedFn } from 'ahooks';
import { merge } from 'lodash';

interface IProps {
  children?: any;
  history?: any;
  paramData?: any;
  paramObj: SearchObj;
  initFatch?: (clusterID: string) => void;
}

const defPagination = {
  current: 1,
  pageSize: 5,
  hideOnSinglePage: true,
};

const DetailTabInfo = (props: IProps) => {
  const {
    paramData: { namespaceName = '' },
    paramObj: { Alias = '', Managers = [], type = '', ClusterID: clusterID = '', NSName },
  } = props;
  const tablelistRef = useRef<any>(null);
  const [search, setSearch] = useState('');
  const [clusterKeyToName, setClusterKeyToName] = useState<any>({});

  useEffect(() => {
    getListClusters({ offset: 0, limit: 1000 })
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.getItems();
          let objs: any = {};
          items.map((item) => {
            objs[item.key] = item.name;
            return item;
          });
          setClusterKeyToName(objs);
        }),
      )
      .subscribe();
  }, []);

  const tableObj = useMemo(() => {
    return {
      [translations.clusterGraphList_cluster]: clusterKeyToName?.[clusterID] || '-',
      [translations.clusterGraphList_alias]: Alias,
      [translations.clusterGraphList_managers]: (Managers || []).map((t: any) => {
        return <div>{typeof t === 'string' ? t : t.account}</div>;
      }),
    };
  }, [namespaceName, clusterKeyToName, Managers, Alias]);

  const onSearchResource = useCallback((value: string) => {
    setSearch(value);
    tablelistRef.current.initPage();
  }, []);

  const reqFunResource = useCallback(
    (pagination, filter) => {
      const { kind } = filter;
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams: any = {
        offset,
        limit: pageSize,
      };
      return clusterGraphResources(pageParams, {
        clusterID,
        namespace: NSName,
        name: search,
        kind: kind || '',
      }).pipe(
        map((res: WebResponse<any>) => {
          const items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems,
          };
        }),
      );
    },
    [clusterID, NSName, search],
  );

  const rowKeyResource = useCallback((item: any) => {
    return item.key;
  }, []);

  const columnsResource = useMemo(() => {
    return [
      {
        title: translations.clusterGraphList_resourceName,
        dataIndex: 'name',
        width: '25%',
        render: (item: any, row: any) => {
          let { namespace, cluster, resource_kind, kind } = row;
          return (
            <JumpResource
              name={item}
              kind={resource_kind || kind}
              namespace={namespace}
              clusterKey={cluster}
              title={item}
            />
          );
        },
      },
      {
        title: translations.clusterGraphList_tabInfo_containerType,
        dataIndex: 'kind',
        width: '25%',
        filters: [
          { text: 'Deployment', value: 'Deployment' },
          { text: 'StatefulSet', value: 'StatefulSet' },
          { text: 'ReplicaSet', value: 'ReplicaSet' },
          { text: 'Job', value: 'Job' },
          { text: 'DeamonSet', value: 'DeamonSet' },
          { text: 'Pod', value: 'Pod' },
          { text: 'CronJob', value: 'CronJob' },
          { text: 'ReplicationController', value: 'ReplicationController' },
        ],
      },
      {
        title: translations.clusterGraphList_alias,
        dataIndex: 'alias',
        width: '25%',
        render: (alias: any) => {
          return <>{alias || '-'}</>;
        },
      },
      {
        title: translations.clusterGraphList_managers,
        dataIndex: 'managers',
        width: '25%',
        render: (item: any) => {
          return <>{item ? (item || []).map((t: any) => <div>{t.account}</div>) : '-'}</>;
        },
      },
    ];
  }, []);

  return (
    <div className="details-info-case mt20">
      <AssetTopSpace type={type} data={merge(props.paramData, { namespace: NSName })} clusterID={clusterID} />
      <div className="details-content-case">
        <Tittle className={'mb16'} title={translations.clusterGraphList_tabInfo_basicInfo} />
        <TzTableKeyVal keyWidth="15%" valueWidth="35%" data={tableObj} />
        <Tittle className={'mb16 mt20'} title={translations.clusterGraphList_tabInfo_assetResource} />

        <div className="mb16 mt20">
          <TzInputSearch
            placeholder={translations.clusterGraphList_searchKey}
            enterButton={translations.clusterGraphList_search}
            onSearch={onSearchResource}
            suffix
          />
        </div>
        <TzTableServerPage
          columns={columnsResource}
          defaultPagination={defPagination}
          rowKey={rowKeyResource}
          reqFun={reqFunResource}
          ref={tablelistRef}
          equalServerPageAnyway={false}
        />
      </div>
    </div>
  );
};

export default DetailTabInfo;
