import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useMemoizedFn, usePagination } from 'ahooks';
// import { useActivate } from 'react-activation';
import { map } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { translations } from '../../translations';
import { Store } from '../../services/StoreService';
import { TzButton } from '../../components/tz-button';
import { TzTable } from '../../components/tz-table';
import { delAssetsLabel, getAssetsLabels, setAssetsLabelSwitch } from '../../services/DataService';
import { WebResponse } from '../../definitions';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { Routes } from '../../Routes';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTime } from '../../helpers/until';
import { useNavigatereFresh } from '../../helpers/useNavigatereFresh';
import { TzSwitch } from '../../components/tz-switch';
import { TzConfirm } from '../../components/tz-modal';
import { TzTooltip } from '../../components/tz-tooltip';
import { useBatchAction, BatchButton } from './batch';
import { TzMessageSuccess } from '../../components/tz-mesage';
import { translateBuildInTag } from '../../components/label-col';
// import useTzFilter, {FilterContext} from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
// import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
// import TzFilter from '../../components/ComponentsLibrary/TzFilter';
// import TzFilterForm from '../../components/ComponentsLibrary/TzFilterForm';
// import SearchInputCom from '../../components/search-input/SearchInputComponent';
import TzInputSearch from '../../components/tz-input-search';
import './index.scss';

const RowId = 'id';
export default function LabelManagList() {
  const navigate = useNavigate();
  const { jump } = useNavigatereFresh();

  const [filters, setFilters] = useState<any>('');
  // 开关loading
  const [switchLoading, setSwitchLoading] = useState<Record<string, boolean>>({});
  // 切换开关
  const onToggle = useMemoizedFn(async (type: 'open' | 'close', ids: any[]) => {
    const req: any = { enableTagIds: [], disableTagIds: [] };
    if (type === 'open') {
      req.enableTagIds = ids;
    } else {
      req.disableTagIds = ids;
    }
    const msg =
      type === 'open' ? translations.enablement_success : translations.shutdown_successful;
    return setAssetsLabelSwitch(req).subscribe((res) => {
      if (res.error) {
        return;
      }
      TzMessageSuccess(msg);
      refreshAsync();
      dispatchs.setActive(false);
    });
  });
  // 批量操作hook
  const [{ active, rowSelection }, dispatchs] = useBatchAction(RowId, onToggle);

  const {
    data: dataSource,
    loading,
    pagination,
    refreshAsync,
    run,
  } = usePagination(
    ({ current, pageSize }) => {
      const currentPage = Math.max(1, current);
      const offset = (currentPage - 1) * pageSize;
      const req = {
        offset,
        limit: pageSize,
        tagName: filters,
      };

      return getAssetsLabels(req)
        .pipe(
          map((res: WebResponse<any>) => ({
            list: res.getItems(),
            total: res.totalItems,
          })),
        )
        .toPromise();
    },
    {
      refreshDeps: [filters],
    },
  );

  /*****
  const initialFilterVal: FilterFormParam[] = useMemo(() => [
    {
      label: translations.tag_name,
      name: 'name',
      type: 'input',
      icon: 'icon-chengdu',
    }],
    [],
  );
  const filterContext = useTzFilter({ initial: initialFilterVal });

  const onChangeFilter = useCallback((values: any) => {
    setFilters((prev: any) => (isEqual(values, prev) ? prev : values));
  }, []);

  const onUpdateFilter = useMemoizedFn((e) => {
    setFilters(e.target.value.trim())
  });
  *******/

  const onToggleSwitch = useCallback(
    async (rowItem: any, status: any) => {
      const id = rowItem.id;
      setSwitchLoading((pre) => ({ ...pre, [id]: true }));
      await onToggle(status ? 'open' : 'close', [id]);
      setSwitchLoading((pre) => ({ ...pre, [id]: false }));
    },
    [onToggle],
  );

  const onDel = useMemoizedFn((id) => {
    delAssetsLabel(id).subscribe((res) => {
      if (res.error) return;
      TzMessageSuccess(translations.delete_success_tip);
      refreshAsync().then((res) => {
        if (res.total > 0 && !res.list?.length) {
          run({ current: pagination.current - 1, pageSize: pagination.pageSize });
        }
      });
    });
  });
  const columns = useMemo(
    () => [
      {
        title: translations.tag_name,
        dataIndex: 'name',
        key: 'name',
        width: '20%',
        render: (indexVal: string) => {
          const tagName = translateBuildInTag(indexVal) || '-';
          return (
            <div style={{ maxWidth: '100%' }} className="ofh">
              <EllipsisPopover title={tagName}>{tagName}</EllipsisPopover>
            </div>
          );
        },
      },
      {
        title: translations.tag_note,
        dataIndex: 'desc',
        key: 'desc',
        render: (item: string) => {
          const desc = item || '-';
          return (
            <div style={{ maxWidth: '100%' }} className="ofh">
              <EllipsisPopover title={desc}>{desc}</EllipsisPopover>
            </div>
          );
        },
      },
      {
        title: translations.asset_number,
        dataIndex: 'count',
        key: 'count',
        render: (v: string) => v ?? '-',
      },
      {
        title: (
          <div>
            {translations.tag_display}
            <TzTooltip title={translations.unStandard.asset_discovery_label_switch_tip}>
              <i
                className="icon iconfont icon-wenhao ml4"
                style={{ lineHeight: '16px', height: '16px', width: '16px' }}
              ></i>
            </TzTooltip>
          </div>
        ),
        dataIndex: 'status',
        key: 'status',
        // width: 120,
        render: (indexVal: number, row: any) => (
          <TzSwitch
            checkedChildren={translations.microseg_segments_isable}
            unCheckedChildren={translations.deactivateC}
            checked={indexVal === 0}
            disabled={!!switchLoading[row.id]}
            loading={switchLoading[row.id]}
            onChange={(newVal: boolean) => {
              onToggleSwitch(row, newVal);
            }}
          />
        ),
      },
      {
        title: translations.update_time,
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (item: number) => getTime(item),
      },
      {
        title: translations.operation,
        key: 'action',
        width: 120,
        render: (_: any, record: any) =>
          record.type !== 0 ? (
            '-'
          ) : (
            <div onClick={(e) => e.stopPropagation()}>
              <TzButton
                type="text"
                onClick={() => {
                  jump(Routes.LabelManagEdit + `?id=${record.id}`, 'LabelManagEdit');
                }}
              >
                {translations.edit}
              </TzButton>
              <TzButton
                danger
                type="text"
                className="ml4"
                onClick={() => {
                  TzConfirm({
                    content: translations.unStandard.del_label_tip(record?.name),
                    okButtonProps: {
                      type: 'primary',
                      danger: true,
                    },
                    okText: translations.delete,
                    onOk: () => onDel(record.id),
                  });
                }}
              >
                {translations.delete}
              </TzButton>
            </div>
          ),
      },
    ],
    [switchLoading, onDel],
  );

  const l = useLocation();
  // 设置header
  const setHeader = useMemoizedFn(() => {
    Store.header.next({
      title: translations.label_management,
      onBack() {
        navigate(-1);
      },
    });
  });
  useEffect(() => {
    setHeader();
    refreshAsync();
  }, [l]);
  // useActivate(() => {
  //   setHeader();
  //   refreshAsync();
  // });

  return (
    <div className={'mlr32 mt4 p_lable_manag'}>
      <div className="mb12">
        <div className={'flex-r-c'}>
          <div>
            <TzButton
              style={{ marginRight: '16px' }}
              type="primary"
              onClick={() => jump(Routes.LabelManagCreate, 'LabelManagCreate')}
            >
              {translations.newAdd}
            </TzButton>
            <BatchButton style={{ margin: '0' }} active={active} {...dispatchs} />
          </div>
          <TzInputSearch
            className="h36"
            style={{ width: '375px' }}
            placeholder={translations.unStandard.input_tag_name_tip1}
            onChange={setFilters}
          />
        </div>

        {/*
        <FilterContext.Provider value={filterContext}>
          <div className={'flex-r-c'}>
            <div>
              <TzButton
                style={{marginRight: '16px'}}
                type="primary"
                onClick={() => jump(Routes.LabelManagCreate, 'LabelManagCreate')}
              >
                {translations.newAdd}
              </TzButton>
              <BatchButton style={{margin: '0'}} active={active} {...dispatchs} />
            </div>
            <TzFilter className="label_manag_filter_k1" />
          </div>
          <TzFilterForm onChange={onChangeFilter}/>
        </FilterContext.Provider>
        */}
      </div>

      <TzTable
        className="table-ao91"
        columns={columns}
        loading={loading}
        dataSource={dataSource?.list}
        pagination={{ ...pagination, total: dataSource?.total }}
        sticky={true}
        rowKey={RowId}
        rowSelection={rowSelection}
      />
    </div>
  );
}
