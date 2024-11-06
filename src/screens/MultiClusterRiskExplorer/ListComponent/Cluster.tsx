import { usePagination, useUpdateEffect } from 'ahooks';
import { isEqual } from 'lodash';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { map, tap } from 'rxjs/operators';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { TzTable } from '../../../components/tz-table';
import { TzTag } from '../../../components/tz-tag';
import { WebResponse } from '../../../definitions';
import { clusterRuleversion, getListClusters } from '../../../services/DataService';
import { translations } from '../../../translations/translations';
import LabelCol, { useBatchLabelContext, BatchButton } from '../../../components/label-col';

const ClusterList = (props: { rowKey: string }) => {
  const { rowKey = 'key' } = props;
  const [filters, setFilters] = useState<any>();
  const [clusterRuleversionList, setClusterRuleversionList] = useState<any>([]);
  // 批量操作hook
  const [{ rowSelection, isInLabelPage, onlyShowSelect, tagRelateAssetIds }, { setRefreshTable }] =
    useBatchLabelContext();

  const {
    data: dataSource,
    loading,
    pagination,
    refresh,
  } = usePagination(
    ({ current, pageSize }) => {
      const offset = (current - 1) * pageSize;
      const idList = isInLabelPage && !onlyShowSelect ? '' : tagRelateAssetIds;
      const param: any = {
        offset,
        limit: pageSize,
        hideTags: isInLabelPage,
        idList,
        ...filters,
      };
      return getListClusters(param)
        .pipe(
          map((res: WebResponse<any>) => ({
            list: res.getItems(),
            total: res.totalItems,
          })),
        )
        .toPromise();
    },
    {
      refreshDeps: [filters, onlyShowSelect],
    },
  );
  setRefreshTable(refresh);

  const columns = useMemo(() => {
    const cols = [
      {
        title: translations.clusterManage_key,
        dataIndex: 'key',
        key: 'key',
        width: '30%',
        ellipsis: true,
        render: (item: any, row: any) => {
          console.log(row);
          return (
            <>
              <p className={'flex-r dfac'} style={{ color: '#3e4653' }}>
                <span
                  className={'mr12 f16'}
                  style={{ color: '#3E4653', maxWidth: 'calc(100% - 108px)', height: '24px' }}
                >
                  <EllipsisPopover lineHeight={24}>{row.name}</EllipsisPopover>
                </span>
                <TzTag className={'small'} style={{ height: '24px', lineHeight: '24px', fontSize: '14px' }}>
                  {row.platForm}
                </TzTag>
              </p>
              <TzTag
                className={'small mt8 f-l dif '}
                style={{
                  color: '#6C7480',
                  maxWidth: '100%',
                  lineHeight: '22px',
                  alignItems: 'center',
                }}
              >
                key：
                <div style={{ maxWidth: '100%', height: '22px' }} className="dib ofh">
                  <EllipsisPopover title={item || '-'}>{item}</EllipsisPopover>
                </div>
              </TzTag>
            </>
          );
        },
      },
      {
        title: translations.clusterManage_aDescription,
        dataIndex: 'description',
        key: 'description',
        // width: '20%',
        render: (item: any, row: any) => {
          return <>{item || '-'}</>;
        },
      },
      {
        title: translations.aPI_server_address,
        dataIndex: 'apiServerAddr',
        key: 'apiServerAddr',
        width: '20%',
      },
      {
        title: translations.product_version,
        dataIndex: 'version',
        key: 'version',
      },
      {
        title: translations.rule_base_version,
        dataIndex: 'ruleVersion',
        key: 'ruleVersion',
      },
      {
        title: translations.asset_label,
        dataIndex: 'tags',
        render: (item: any, row: any) => {
          return <LabelCol labels={item} />;
        },
      },
    ] as any;
    if (isInLabelPage) {
      return cols.filter((item: any) => item.title !== translations.asset_label);
    }
    return cols;
  }, [isInLabelPage]);

  useEffect(() => {
    clusterRuleversion({ offset: 0, limit: 1000 })
      .pipe(
        tap((res: WebResponse<any>) => {
          const items = res.getItems();
          const list = items.map((item) => {
            return { label: item, value: item };
          });
          setClusterRuleversionList(list);
        }),
      )
      .subscribe();
  }, []);

  const configFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.scanner_report_clusterKey,
        name: 'key',
        type: 'input',
        icon: 'icon-jiqun',
      },
      {
        label: translations.clusterManage_name,
        name: 'name',
        type: 'input',
        icon: 'icon-jiqun',
      },
      {
        label: translations.api_server,
        name: 'api_server_addr',
        type: 'input',
        icon: 'icon-yunhangzhuangtai',
      },
      {
        label: translations.product_version,
        name: 'version',
        type: 'input',
        icon: 'icon-biaoji',
      },
      {
        label: translations.calico_cluster_type,
        name: 'platform',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          mode: 'multiple',
          options: [
            { label: 'kubernetes', value: 'kubernetes' },
            { label: 'openshifit', value: 'openshifit' },
          ],
        },
      },
      {
        label: translations.rule_base_version,
        name: 'rules_version',
        type: 'select',
        icon: 'icon-banben',
        props: {
          mode: 'multiple',
          options: clusterRuleversionList,
        },
      },
    ],
    [clusterRuleversionList],
  );

  const data = useTzFilter({ initial: configFilter });

  useUpdateEffect(() => {
    data.updateFilter(
      configFilter.map((item) => ({
        ...item,
        value: filters[item.name],
      })) as FilterFormParam[],
    );
  }, [clusterRuleversionList]);

  const handleChange = useCallback((values: any) => {
    setFilters((prev: any) => (isEqual(values, prev) ? prev : values));
  }, []);

  return (
    <div>
      <div className="mb12">
        <FilterContext.Provider value={{ ...data }}>
          <div className="data-list-case-bar">
            {!isInLabelPage && <span className="headTit">{translations.clusterGraphList_cluster}</span>}
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      <BatchButton />
      <TzTable
        className=" nohoverTable"
        loading={loading}
        dataSource={dataSource?.list}
        pagination={{ ...pagination, total: dataSource?.total }}
        sticky={true}
        rowKey={rowKey}
        columns={columns}
        rowSelection={rowSelection}
      />
    </div>
  );
};

export default memo(ClusterList);
