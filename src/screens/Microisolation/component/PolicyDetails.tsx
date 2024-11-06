import { TzCard } from '../../../components/tz-card';
import React, { useRef, useMemo, useState, useCallback } from 'react';
import { translations } from '../../../translations';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { columnsList } from '../lib';
import { useMemoizedFn, useSetState } from 'ahooks';
import { find, findIndex, merge, sortBy } from 'lodash';
import { TzTableServerPage } from '../../../components/tz-table';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { TablePaginationConfig } from 'antd';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { WebResponse } from '../../../definitions';
import { getHistory, microsegPolicies, policyrecreate } from '../../../services/DataService';
import { micrPriorityEnum } from '../PolicyManagement';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import { priorityOptions, sourceObjectEnum } from '../PolicyManagement/Manual';
import { getClusterName } from '../../../helpers/use_fun';
import { map } from 'rxjs/operators';
import { TzTag } from '../../../components/tz-tag';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { TzHeader } from '../../../components/ComponentsLibrary/TzHeader';
let PolicyDetails = (props: any) => {
  let { resourceInfo } = props;
  const [filters, setFilters] = useState<any>({});
  const [sorterable, setSorterable] = useSetState<any>({ matchTime: null, sortByPriority: null });
  const listComp = useRef(undefined as any);

  const dataInfoList = useMemo(() => {
    if (!resourceInfo) {
      return [];
    }
    const obj: any = {
      kind: translations.microseg_resources_res_kind + '：',
      segmentName: translations.microseg_segments_segment_title + '：',
      cluster: translations.clusterManage_key + '：',
      namespace: translations.onlineVulnerability_outerShapeMeaning + '：',
    };

    return Object.keys(obj)
      .filter((item) => {
        return resourceInfo[item];
      })
      .map((item) => {
        let o: any = {
          title: obj[item] || '-',
          content: resourceInfo[item],
        };
        if ('cluster' === item) {
          o['render'] = () => {
            return getClusterName(resourceInfo[item]);
          };
        }
        return o;
      });
  }, [resourceInfo]);

  let columns = useMemo(() => {
    let a = ['source_object', 'target_audience', 'matchTime'];
    let arr = columnsList
      .filter((item: any) => a.includes(item.dataIndex))
      .map((item: any) => {
        if (item.dataIndex === 'matchTime') {
          item['sorter'] = true;
        }
        return item;
      });
    let newArr = sortBy(arr, (x) => findIndex(a, (y) => x.dataIndex === y));
    newArr = [
      {
        title: 'ID',
        dataIndex: 'id',
        width: '50px',
      },
      ...newArr,
      {
        title: translations.active_status,
        dataIndex: 'status',
        width: '110px',
        align: 'center',
        render: (item: any, row: any) => {
          let { statusDetail, status } = row;
          let node = find(micrPriorityEnum, (item) => item.value == status);
          return node ? (
            <div>
              <TzTag
                className="flex-r-c"
                style={merge({ maxWidth: '100%' }, node?.style)}
                onClick={() => {
                  if (status === 3) {
                    policyrecreate({ id: row.id }).subscribe((res) => {
                      if (res.error) {
                        return;
                      }
                      listComp && listComp.current.refresh();
                    });
                  }
                }}
              >
                {status === 3 ? <i className={'iocn iconfont icon-refresh mr8'}></i> : null}
                <span style={{ maxWidth: `calc(100% - ${status === 3 ? 25 : 0}px)` }}>
                  <EllipsisPopover>{node?.label}</EllipsisPopover>
                </span>
              </TzTag>
              {statusDetail && status === 3 ? (
                <p>
                  <EllipsisPopover lineClamp={2}>{statusDetail}</EllipsisPopover>{' '}
                </p>
              ) : null}
            </div>
          ) : null;
        },
      },
    ];
    return newArr;
  }, [sorterable]);
  const reqFun = useCallback(
    (pagination: TablePaginationConfig, filter, sorter) => {
      if (!resourceInfo || !resourceInfo['id']) {
        return getHistory().pipe(
          map(() => {
            return {
              data: [],
              total: [].length,
            };
          }),
        );
      }
      let { field, order } = sorter;
      let newField = field;

      setSorterable((pre) => Object.assign({}, pre, { [newField]: order }));
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const params = {
        offset,
        limit: pageSize,
        sourceId: resourceInfo.id,
        ...filters,
        ...sorterable,
        [newField]: order,
      };
      return microsegPolicies(params).pipe(
        map((res: WebResponse<any>) => {
          const items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems || 0,
          };
        }),
      );
    },
    [filters],
  );
  const screenFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: 'ID',
        name: 'id',
        type: 'input',
        icon: 'icon-bianhao',
      },
      {
        label: translations.microseg_segments_policy_src_obj,
        name: 'srcName',
        type: 'input',
        icon: 'icon-lujing',
      },
      {
        label: translations.microseg_segments_policy_dst_obj,
        name: 'dstName',
        type: 'input',
        icon: 'icon-ip',
      },

      {
        label: translations.microseg_segments_policy_src_type,
        name: 'srcType',
        icon: 'icon-METHCO',
        type: 'select',
        props: {
          options: sourceObjectEnum,
        },
      },
      {
        label: translations.microseg_segments_policy_dst_type,
        name: 'dstType',
        icon: 'icon-METHCO',
        type: 'select',
        props: {
          options: sourceObjectEnum,
        },
      },
      {
        label: translations.active_status,
        name: 'status',
        icon: 'icon-celveguanli',
        type: 'select',
        props: {
          options: micrPriorityEnum.map(({ label, value }) => ({ label, value })),
        },
      },
    ],
    [],
  );
  const data = useTzFilter({ initial: screenFilter });
  const handleChange = useCallback((values: any) => {
    setFilters((pre: any) => merge({}, values));
  }, []);
  return (
    <>
      <TzHeader type={'line'} className="mt4 mb16">
        {translations.scanner_detail_tab_base}
      </TzHeader>
      <ArtTemplateDataInfo data={dataInfoList} span={2} rowProps={{ gutter: [0, 0] }} />

      <FilterContext.Provider value={{ ...data }}>
        <div className={'flex-r-c mb12 mt12'} style={{ justifyContent: 'space-between' }}>
          <TzHeader type={'line'}>{translations.rule_list}</TzHeader>
          <TzFilter />
        </div>
        <TzFilterForm onChange={handleChange} />
      </FilterContext.Provider>

      <TzTableServerPage columns={columns} tableLayout={'fixed'} rowKey="id" reqFun={reqFun} ref={listComp} />
    </>
  );
};
export default PolicyDetails;
