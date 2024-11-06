import { TablePaginationConfig } from 'antd/lib/table';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { map } from 'rxjs/operators';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../../components/tz-button';
import TzInputSearch from '../../../components/tz-input-search';
import { TzConfirm } from '../../../components/tz-modal';
import { TzTableServerPage } from '../../../components/tz-table';
import { showSuccessMessage } from '../../../helpers/response-handlers';
import { deleteYamlTemplates, templatesDeleteConfirm, yamlTemplates } from '../../../services/DataService';
import { translations } from '../../../translations/translations';
import { useAssetsClusterList } from '../../../helpers/use_fun';
import { Routes } from '../../../Routes';
import useLayoutMainSearchWid from '../../../helpers/useLayoutMainSearchWid';
export let yamlStatus = [
  {
    label: translations.severity_Unknown,
    value: `unknown`,
  },
  {
    label: translations.risk,
    value: `inThreat`,
  },
  {
    label: translations.security,
    value: `secure`,
  },
];
export let deleteYamlTemplatesFn = (data: { id: any; name?: any }, callback?: () => void) => {
  let { id, name } = data;
  templatesDeleteConfirm({ id }).subscribe((res) => {
    if (res.error) return;
    let item = res.getItem();
    TzConfirm({
      content: item.text,
      onOk: () => {
        deleteYamlTemplates({ id }).subscribe((res) => {
          if (res.error) return;
          showSuccessMessage(translations.activeDefense_delSuccessTip);
          callback && callback();
        });
      },
      okButtonProps: {
        type: 'primary',
        danger: true,
      },
      okText: translations.delete,
    });
  });
};
const BaselineManagement = (props: any) => {
  const [filters, setFilters] = useState<any>({});
  const listComp = useRef(undefined as any);
  let clusterList = useAssetsClusterList();

  const navigate = useNavigate();
  const imageColumns = useMemo(() => {
    return [
      {
        title: translations.baseline_name,
        dataIndex: 'name',
        ellipsis: true,
        render: (name: any, row: any) => {
          return <EllipsisPopover lineClamp={2}>{name}</EllipsisPopover>;
        },
      },
      {
        title: translations.updated_by,
        dataIndex: 'updater',
        render: (updater: any, row: any) => {
          return updater || '-';
        },
      },
      {
        title: translations.update_time,
        dataIndex: 'updated_at',
        render: (updated_at: any, row: any) => {
          return row.builtin ? '-' : moment(updated_at).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: translations.clusterManage_operate,
        width: '120px',
        className: 'td-center',
        render: (record: any, row: any) => {
          return row.builtin ? (
            '-'
          ) : (
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <TzButton
                type={'text'}
                onClick={() => {
                  navigate(Routes.YamlScanBaselineManagementEdit + `?id=${record.id}`);
                }}
              >
                {translations.edit}
              </TzButton>
              <TzButton
                type={'text'}
                danger
                className={'ml4'}
                onClick={() => {
                  deleteYamlTemplatesFn(row, () => {
                    listComp.current.refresh();
                  });
                }}
              >
                {translations.delete}
              </TzButton>
            </div>
          );
        },
      },
    ];
  }, [clusterList]);
  const reqFun = useCallback(
    (pagination?: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination || {};
      const offset = (current - 1) * pageSize;
      const pageParams = {
        offset,
        limit: pageSize,
        ...filters,
      };
      return yamlTemplates(pageParams).pipe(
        map((res: any) => {
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
  const fitlerWid = useLayoutMainSearchWid({});
  return (
    <div className={'baseline-management mlr32'}>
      <div className={'flex-r-c mb12 mt4'}>
        <TzButton
          onClick={() => {
            navigate(Routes.YamlScanBaselineManagementEdit + '?type=add');
          }}
          type={'primary'}
        >
          {translations.newAdd}
        </TzButton>
        <TzInputSearch
          style={{
            width: `${fitlerWid}px`,
          }}
          placeholder={translations.unStandard.str43}
          allowClear
          onChange={(value: any) => setFilters({ name: value })}
        />
      </div>

      <TzTableServerPage
        columns={imageColumns}
        tableLayout={'fixed'}
        rowKey="id"
        reqFun={reqFun}
        onRow={(record) => {
          return {
            onClick: () => {
              navigate(Routes.YamlScanBaselineManagementInfo + `?id=${record.id}`);
            },
          };
        }}
        ref={listComp}
      />
    </div>
  );
};

export default BaselineManagement;
