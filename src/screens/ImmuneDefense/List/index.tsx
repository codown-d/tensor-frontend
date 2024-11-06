import { useMemoizedFn } from 'ahooks';
import { ColumnProps, TablePaginationConfig } from 'antd/lib/table';
import { cloneDeep, find, keys, set } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { map } from 'rxjs/operators';
import TzFilter from '../../../components/ComponentsLibrary/TzFilter';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import TzFilterForm from '../../../components/ComponentsLibrary/TzFilterForm';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { EllipsisPopover } from '../../../components/ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../../components/tz-button';
import { TzTableServerPage } from '../../../components/tz-table';
import { RenderTag, TzTag } from '../../../components/tz-tag';
import { Routes } from '../../../Routes';
import { fetchBehavioralLearn } from '../../../services/DataService';
import { Store } from '../../../services/StoreService';
import { translations } from '../../../translations/translations';
import './index.scss';
import { useActivate } from 'react-activation';
import { LEARNING_STATUS } from '../util';
import { useAssetsClusterList, useRresourcesTypes } from '../../../helpers/use_fun';
import { TextHoverCopy } from '../../AlertCenter/AlertCenterScreen';
import { TzSpace } from '../../../components/tz-space';
import { BehavioralLearnListItem, BehavioralLearnListReq } from '../../../definitions';
import useLearnOpr, { OprBasicType, OprType } from '../hooks/useLearnOpr';
import { useNavigatereFresh } from '../../../helpers/useNavigatereFresh';
import { getTime } from '../../../helpers/until';
const TOOLBAR_BTN: OprBasicType[] = ['study', 'enable', 'deactivate'];
export default function () {
  let [showPageFooter, setShowPageFooter] = useState<boolean>();
  let [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const { handleOprClick } = useLearnOpr();

  const [filters, setFilters] = useState<Omit<BehavioralLearnListReq, 'limit' | 'offset'>>();
  const listComp = useRef(undefined as any);
  const navigate = useNavigate();
  const l = useLocation();
  let setHeader = useMemoizedFn(() => {
    listComp.current.refresh();
    Store.header.next({
      extra: (
        <>
          <TzButton
            className="ml16"
            icon={<i className="icon iconfont icon-jingxiangsaomiao-peizhi f16"></i>}
            onClick={() => {
              navigate(Routes.ImmuneDefenseConfig);
            }}
          >
            {translations.config}
          </TzButton>
        </>
      ),
    });
  });
  useEffect(setHeader, [l]);
  const clusterList = useAssetsClusterList();
  const resourcetypeList = useRresourcesTypes();
  const tableFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.microseg_resources_res_name,
        name: 'resource_name',
        type: 'input',
        icon: 'icon-ziyuan',
      },
      {
        label: translations.onlineVulnerability_outerShapeMeaning,
        name: 'namespace',
        type: 'input',
        icon: 'icon-mingmingkongjian',
      },
      {
        label: translations.clusterGraphList_detailContainer_imageName,
        name: 'image_name',
        type: 'input',
        icon: 'icon-jingxiang',
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
        label: translations.microseg_resources_res_kind,
        name: 'resource_kind',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          mode: 'multiple',
          options: resourcetypeList,
        },
      },
      {
        label: translations.compliances_node_status,
        name: 'learn_status',
        type: 'select',
        icon: 'icon-celveguanli',
        props: {
          mode: 'multiple',
          options: LEARNING_STATUS.map((v, idx) => ({ label: v.label, value: `` + idx })),
        },
      },
      {
        label: translations.recent_study_time,
        name: 'learn_time',
        type: 'rangePickerCt',
        icon: 'icon-shijian',
        props: {
          showTime: true,
          format: 'YYYY/MM/DD HH:mm:ss',
        },
      },
    ],
    [clusterList, resourcetypeList],
  );

  const data = useTzFilter({ initial: tableFilter });
  const handleChange = useCallback((values: any) => {
    const temp = {};
    keys(values).forEach((key) => {
      let _val = cloneDeep(values[key]);
      if (key === 'learn_time') {
        _val[0] && set(temp, 'start_time', _val[0]);
        _val[1] && set(temp, 'end_time', _val[1]);
        return;
      }
      set(temp, [key], _val);
    });
    setFilters(temp);
  }, []);
  let handleRowSelection = (selected: boolean, selectedRows: BehavioralLearnListItem[]) => {
    setSelectedRowKeys((pre) => {
      selectedRows.forEach(({ ResourceUUID: id }) => {
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
    if (!showPageFooter) return undefined;
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
    };
  }, [showPageFooter, selectedRowKeys]);

  const refreshListFn = useMemoizedFn(() => {
    listComp.current.refresh();
    setSelectedRowKeys([]);
    setShowPageFooter(false);
  });
  const imageColumns: ColumnProps<BehavioralLearnListItem>[] = [
    {
      title: translations.imageReject_used_for_obj,
      dataIndex: 'Name',
      ellipsis: true,
      width: '30%',
      render: (resource_name: string, row) => {
        const { namespace, cluster_key, Kind } = row;
        const node = find(clusterList, (item) => item.value === cluster_key);
        return (
          <>
            <p className={'flex-r'}>
              <span style={{ display: 'inline-block', maxWidth: 'calc(100% - 96px)', fontSize: 16 }}>
                <TextHoverCopy text={resource_name} lineClamp={2} />
              </span>
              <TzTag className={'middle ml12 ant-tag-gray'}>{Kind}</TzTag>
            </p>

            <p className={'flex-r-c mt8'} style={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}>
              <TzTag className={'small mr4 ant-tag-gray mb4'}>
                {translations.clusterManage_key}：{node?.label ?? cluster_key}
              </TzTag>
              <TzTag className={'small mb4 ant-tag-gray'}>
                {translations.onlineVulnerability_outerShapeMeaning}：{namespace}
              </TzTag>
            </p>
          </>
        );
      },
    },
    {
      title: translations.clusterGraphList_navImage,
      dataIndex: 'images',
      render: (text: string[]) => {
        if (!text?.length) {
          return '-';
        }
        return <EllipsisPopover lineClamp={2}>{text.join('，')}</EllipsisPopover>;
      },
    },
    {
      title: translations.compliances_breakdown_dotstatus,
      dataIndex: 'behavioral_learn_status',
      align: 'center',
      render: (status) => {
        const learnStatusObj = LEARNING_STATUS[status ?? -1];
        const { type } = learnStatusObj || {};
        return <RenderTag type={type} />;
      },
    },
    {
      title: translations.number_out_of_model_behaviors,
      dataIndex: 'NotInModelCount',
    },
    {
      title: translations.recent_study_time,
      dataIndex: 'behavioral_learn_start_time',
      render: (behavioral_learn_start_time: number) => {
        return getTime(behavioral_learn_start_time * 1000);
      },
    },
    {
      title: translations.clusterManage_operate,
      width: '11%',
      dataIndex: 'ResourceUUID',
      className: 'td-center',
      render: (id, row) => {
        const { behavioral_learn_status: status, is_can_learn } = row;
        if (!is_can_learn) return '-';
        if ((status ?? -1) < -1) {
          return '-';
        }
        const { oprKeys } = LEARNING_STATUS[status];
        return oprKeys.map((v, index) => (
          <TzButton
            type={'text'}
            key={index}
            onClick={(e) => handleOprClick({ type: v, resource_ids: id, learn_status: status }, refreshListFn, e)}
          >
            {(translations as any)[v]}
          </TzButton>
        ));
      },
    },
  ];
  const reqFun = useCallback(
    (pagination?: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination || {};
      const offset = (current - 1) * pageSize;
      const pageParams: BehavioralLearnListReq = {
        offset,
        limit: pageSize,
        ...filters,
      };
      return fetchBehavioralLearn(pageParams).pipe(
        map((res) => {
          let items = res.getItems();
          return {
            data: items,
            total: res.data?.totalItems,
          };
        }),
      );
    },
    [filters],
  );
  let Btns = (props: { type?: 'oneKey'; selectedRowKeys: number[] }) => {
    let { type = '', selectedRowKeys } = props;
    return (
      <>
        {TOOLBAR_BTN.map((v, index) => (
          <TzButton
            key={index}
            disabled={type ? false : !selectedRowKeys?.length}
            className="ml16"
            onClick={(e) =>
              handleOprClick({ type: (type + v) as OprType, resource_ids: selectedRowKeys }, refreshListFn, e)
            }
          >
            {(translations as any)[v]}
          </TzButton>
        ))}
      </>
    );
  };
  let setFooter = useCallback(() => {
    Store.pageFooter.next(
      showPageFooter ? (
        <TzSpace size={16}>
          <span className="ml16">{`${translations.selected} ${selectedRowKeys.length} ${translations.items}`}</span>
          <Btns selectedRowKeys={selectedRowKeys} />
        </TzSpace>
      ) : null,
    );
  }, [showPageFooter, selectedRowKeys]);
  useEffect(() => {
    setFooter();
  }, [setFooter]);

  let { jump } = useNavigatereFresh();
  return (
    <div className={'immune-defense mlr32 mt4'}>
      <div className="mb12">
        <FilterContext.Provider value={{ ...data }}>
          <div className={'flex-r-c'}>
            <div>
              <TzButton
                onClick={() => {
                  setShowPageFooter((pre) => {
                    if (!pre) {
                      setSelectedRowKeys([]);
                    }
                    return !pre;
                  });
                }}
              >
                {showPageFooter ? translations.cancel_batch_operation : translations.batch_operation}
              </TzButton>
              {!showPageFooter ? <Btns type="oneKey" selectedRowKeys={[]} /> : null}
            </div>
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>

      <TzTableServerPage
        rowSelection={rowSelection}
        columns={imageColumns}
        tableLayout={'fixed'}
        rowKey="ResourceUUID"
        reqFun={reqFun}
        onRow={(record) => {
          return {
            onClick: () => {
              jump(Routes.ImmuneDefenseInfo + `?id=${record.ResourceUUID}`, 'ImmuneDefenseInfo');
            },
          };
        }}
        ref={listComp}
      />
    </div>
  );
}
