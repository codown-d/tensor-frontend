import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Link, Routes, useNavigate, useSearchParams } from 'react-router-dom';
import { TzCard } from '../../../components/tz-card';
import { map, tap } from 'rxjs/operators';
import {
  assetsEndpoints,
  assetsIngresses,
  assetsPvcs,
  assetsServices,
  getListClusters,
} from '../../../services/DataService';
import { translations } from '../../../translations/translations';
import { TzTableServerPage } from '../../../components/tz-table';
import { getClusterName, useAssetsClusterList } from '../../../helpers/use_fun';
import { getTime } from '../../../helpers/until';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { merge } from 'lodash';
import { TzTooltip } from '../../../components/tz-tooltip';
import { useFiltersFn } from '../AssetService';
import { accessModeOp, pvStatusOp, volumeModeOp } from '../AssetPV';
import { RenderTag, TzTag } from '../../../components/tz-tag';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import LabelCol, { BatchButton, useBatchLabelContext } from '../../../components/label-col';

let pvcStatusOp = [
  {
    label: 'Pending',
    value: 'Pending',
  },
  {
    label: 'Bound',
    value: 'Bound',
  },
  {
    label: 'Lost',
    value: 'Lost',
  },
];

const AssetPVC = (props: any) => {
  let { title = '', rowKey = 'id' } = props;
  const navigate = useNavigate();
  // 批量操作hook
  const [{ rowSelection, isInLabelPage, onlyShowSelect, tagRelateAssetIds }, { setRefreshTable }] =
    useBatchLabelContext();

  const tableRef = useRef<any>(null);
  setRefreshTable(tableRef.current?.refresh);

  const [filters, setFilters] = useState<any>({});
  let clusterList = useAssetsClusterList();
  const reqFun = useCallback(
    (pagination) => {
      const { current = 1, pageSize = 10 } = pagination;
      let { start_time, end_time } = filters?.updatedAt || {};
      const offset = (current - 1) * pageSize;
      const idList = isInLabelPage && !onlyShowSelect ? '' : tagRelateAssetIds;
      let params = {
        offset,
        limit: pageSize,
        ...filters,
        start_time,
        end_time,
        hideTags: isInLabelPage,
        idList,
      };
      return assetsPvcs(params).pipe(
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
  const columns: any = useMemo(() => {
    const items = [
      {
        title: translations.pvc_information,
        dataIndex: 'name',
        width: '18%',
        render: (name: string, row: any) => {
          return (
            <>
              <EllipsisPopover lineClamp={2} className="f16">
                {name}
              </EllipsisPopover>
              <div className="mt8">
                <TzTag className={'small mr4 ant-tag-gray'} style={{ maxWidth: '100%' }}>
                  <EllipsisPopover>
                    {translations.clusterManage_key}：{getClusterName(row.clusterKey)}
                  </EllipsisPopover>
                </TzTag>
                <TzTag className={'small mt4 ant-tag-gray '} style={{ maxWidth: '100%' }}>
                  <EllipsisPopover>
                    {translations.onlineVulnerability_outerShapeMeaning}：{row.namespace}
                  </EllipsisPopover>
                </TzTag>
              </div>
            </>
          );
        },
      },
      {
        title: (
          <>
            {translations.access_mode}
            <TzTooltip title={translations.unStandard.str270}>
              <i className={'icon iconfont icon-wenti ml4'}></i>
            </TzTooltip>
          </>
        ),
        dataIndex: 'accessMode',
      },
      {
        title: translations.storage_class_name,
        dataIndex: 'storageClassName',
        render: (item: string, row: any) => {
          return item ? <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover> : '-';
        },
      },
      {
        title: translations.volume_mode,
        dataIndex: 'volumeMode',
        render: (item: string, row: any) => {
          return item ? <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover> : '-';
        },
      },
      {
        title: translations.storage_capacity,
        dataIndex: 'storage',
        width: '8%',
        render: (item: string, row: any) => {
          return item ? <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover> : '-';
        },
      },
      {
        title: translations.compliances_breakdown_dotstatus,
        align: 'center',
        dataIndex: 'pvcStatus',
        render: (pvStatus: string, row: any) => {
          return <RenderTag type={'pvc' + pvStatus} />;
        },
      },
      {
        title: translations.associating_pvs,
        dataIndex: 'PVNames',
        render: (item: string, row: any) => {
          return item ? <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover> : '-';
        },
      },
      {
        title: translations.asset_label,
        dataIndex: 'tags',
        render: (item: any, row: any) => {
          return <LabelCol labels={item} />;
        },
      },
      {
        title: translations.clusterManage_createtime,
        dataIndex: 'CreatedAt',
        width: '14%',
        render: (CreatedAt: number, row: any) => {
          return getTime(CreatedAt);
        },
      },
    ];
    if (isInLabelPage) {
      return items.filter((col: any) => col.title !== translations.asset_label);
    }
    return items;
  }, [isInLabelPage]);
  const screenFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.pvc_name,
        name: 'name',
        type: 'input',
        icon: 'icon-ziyuan',
      },
      {
        label: translations.storage_class_name,
        name: 'storage_cluass_name',
        type: 'input',
        icon: 'icon-leixing',
      },
      {
        label: translations.onlineVulnerability_outerShapeMeaning,
        name: 'namespace',
        type: 'input',
        icon: 'icon-mingmingkongjian',
      },
      {
        label: translations.access_mode,
        name: 'access_mode',
        type: 'select',
        icon: 'icon-yunhangzhuangtai',
        props: {
          mode: 'multiple',
          options: accessModeOp,
        },
      },

      {
        label: translations.volume_mode,
        name: 'volume_mode',
        type: 'select',
        icon: 'icon-shuxing_1',
        props: {
          mode: 'multiple',
          options: volumeModeOp,
        },
      },

      {
        label: translations.compliances_breakdown_dotstatus,
        name: 'pv_status',
        type: 'select',
        icon: 'icon-celveguanli',
        props: {
          mode: 'multiple',
          options: pvcStatusOp,
        },
      },

      {
        label: translations.clusterManage_key,
        name: 'cluster_key',
        type: 'select',
        icon: 'icon-jiqun',
        props: {
          mode: 'multiple',
          options: clusterList,
        },
      },
      {
        label: translations.clusterManage_createtime,
        name: 'updatedAt',
        type: 'rangePickerCt',
        icon: 'icon-shijian',
        props: {
          showTime: true,
          format: 'YYYY/MM/DD HH:mm:ss',
        },
      },
    ],
    [clusterList],
  );
  const data = useTzFilter({ initial: screenFilter });
  const handleChange = useCallback((values: any) => {
    useFiltersFn(values, setFilters);
  }, []);

  return (
    <div className="asset-pvc">
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
        tableLayout={'fixed'}
        columns={columns}
        className={'nohoverTable'}
        rowKey={rowKey}
        reqFun={reqFun}
        rowSelection={rowSelection}
        onRow={(record) => {
          return {
            onClick: () => {
              //navigate(Routes.YamlScanInfo + `?id=${record.id}`);
            },
          };
        }}
      />
    </div>
  );
};

export default AssetPVC;
