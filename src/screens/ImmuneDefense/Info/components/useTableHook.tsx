import React from 'react';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { translations } from '../../../../translations/translations';
import { getTime } from '../../../../helpers/until';
import { find } from 'lodash';
import { ColumnsType } from 'antd/lib/table';
import { fillResourceIdOp, permissionOp } from './InModelBehavior';
import { getClusterName } from '../../../../helpers/use_fun';
import { LearnStatus } from '../useData';
import { TzButton } from '../../../../components/tz-button';
import { TzTag } from '../../../../components/tz-tag';
import { TzDrawerFn } from '../../../../components/tz-drawer';
import { PalaceDetailInfo } from '../../../../screens/AlertCenter/PalaceEvent';
const getTableColumns = (columnKeyList: string[], op?: any): ColumnsType<any> => {
  let learn_status = op?.learn_status;
  let col = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },

    {
      title: translations.process_path,
      dataIndex: 'path',
      key: 'path',
      render: (item: any, row: any) => <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover>,
    },
    {
      title: translations.scanner_detail_containerName,
      dataIndex: 'container_name',
      key: 'container_name',
      render: (item: any, row: any) => <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover>,
    },

    {
      title: translations.process_command_line,
      dataIndex: 'command',
      width: '30%',
      render: (item: any, row: any) => <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover>,
    },
    {
      title: translations.superAdmin_userModule_User,
      width: '10%',
      dataIndex: 'user',
      render: (item: any, row: any) => <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover>,
    },

    {
      title: translations.notificationCenter_placeEvent_updateTime,
      dataIndex: 'updated_at',
      render: (item: any, row: any) => getTime(item * 1000),
    },
    {
      title: translations.scanner_report_occurTime,
      dataIndex: 'occurTime',
      render: (item: any, row: any) => getTime(row.updated_at * 1000),
    },

    {
      title: translations.associated_alarms,
      dataIndex: 'event_id',
      width: '14%',
      render: (item: any, row: any) => {
        return item ? (
          <TzButton
            type={'text'}
            onClick={async () => {
              let dw: any = await TzDrawerFn({
                className: 'drawer-body0 detail-palace-case',
                width: '38.9%',
                title: (
                  <p className="ant-drawer-title df dfac">
                    {translations.warningInfo}
                    <TzTag>{item}</TzTag>
                  </p>
                ),
                children: <PalaceDetailInfo id={item} />,
                onCloseCallBack() {},
              });
              dw.show();
            }}
          >
            {item}
          </TzButton>
        ) : (
          '-'
        );
      },
    },

    {
      title: translations.scanner_detail_file_name,
      dataIndex: 'name',
      key: 'name',
      render: (item: any, row: any) => <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover>,
    },
    {
      title: translations.scanner_detail_file_path,
      dataIndex: 'path',
      key: 'path',
      render: (item: any, row: any) => <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover>,
    },
    {
      title: translations.scanner_detail_file_path,
      dataIndex: 'file_path',
      key: 'path',
      render: (item: any, row: any) => <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover>,
    },
    {
      title: translations.read_write_type,
      width: '12%',
      dataIndex: 'permission',
      key: 'permission',
      filters: learn_status === LearnStatus.learning ? undefined : permissionOp,
      render: (item: any, row: any) => {
        let node = find(permissionOp, (val) => {
          return val.value === item;
        });
        return node?.label || item;
      },
    },
    {
      title: translations.calico_cluster_type,
      dataIndex: 'stream_direction',
      key: 'stream_direction',
      filters: learn_status === LearnStatus.learning ? undefined : fillResourceIdOp,
      render: (item: any, row: any) => {
        let node = find(fillResourceIdOp, (val) => {
          return val.value === item;
        });
        return node?.label || item;
      },
    },
    {
      title: translations.source_target_resources,
      dataIndex: 'resource_name',
      key: 'resource_name',
      render: (item: any, row: any) => {
        if (!item || !row) return '-';
        let { cluster_key, namespace, resource_name, kind } = row;
        let name = getClusterName(cluster_key);
        let arr = [name, namespace, resource_name + `(${kind})`].filter((item) => !!item);
        return <EllipsisPopover lineClamp={2}>{arr.join('/')}</EllipsisPopover>;
      },
    },
    {
      title: translations.microseg_segments_policy_port_title,
      dataIndex: 'port',
      key: 'port',
      render: (item: any, row: any) => <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover>,
    },
    {
      title: translations.process_name,
      dataIndex: 'process_name',
      key: 'process_name',
      render: (item: any, row: any) => <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover>,
    },
  ];
  let columns = columnKeyList.reduce((pre: any[], item: string) => {
    let node = find(col, (ite) => ite.dataIndex === item);
    node && pre.push(node);
    return pre;
  }, []);
  return columns;
};

export default getTableColumns;
