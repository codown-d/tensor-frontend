import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { translations } from '../../../translations';
import './index.scss';
import { find, merge } from 'lodash';
import {
  filterMicroseglog,
  getHistory,
  microsegPolicyId,
  policyhistory,
  policyLog,
} from '../../../services/DataService';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useMemoizedFn } from 'ahooks';
import { Store } from '../../../services/StoreService';
import { TzButton } from '../../../components/tz-button';
import { TzSwitch } from '../../../components/tz-switch';
import { TzCard } from '../../../components/tz-card';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import moment from 'moment';
import { getClusterName } from '../../../helpers/use_fun';
import { RenderTag, TzTag } from '../../../components/tz-tag';
import { deletePolicy, enablePolicyStatus, micrPriorityEnum } from '.';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { TzTable, TzTableServerPage } from '../../../components/tz-table';
import { TablePaginationConfig } from 'antd';
import { map } from 'rxjs/operators';
import { Routes } from '../../../Routes';
import { TzTooltip } from '../../../components/tz-tooltip';
import { LoadingOutlined } from '@ant-design/icons';
const PolicyDetail = () => {
  const [searchParams] = useSearchParams();
  let policyId: any = Number(searchParams.get('policyId'));
  const [info, setInfo] = useState<any>(undefined);
  const [dataSource, setDataSource] = useState<any>([]);
  let navigate = useNavigate();
  let setHeader = useMemoizedFn(() => {
    Store.header.next({
      title: (
        <span className="flex-r-c">
          {translations.strategyDetails}
          <TzSwitch
            className="ml12"
            checked={info?.enable}
            onChange={(val) =>
              enablePolicyStatus([policyId], val, () => {
                getMicrosegPolicyInfo();
                listComp.current.refresh();
              })
            }
            checkedChildren={translations.microseg_tenants_enabled}
            unCheckedChildren={translations.confirm_modal_isdisable}
          />
        </span>
      ),
      extra: (
        <>
          <TzButton
            onClick={() => {
              navigate(`${Routes.MicroisolationPolicyManagementEdit.replace(':id', policyId)}`);
            }}
            className="mr16"
          >
            {translations.edit}
          </TzButton>
          <TzButton
            danger
            onClick={() => {
              deletePolicy([policyId], '');
            }}
          >
            {translations.delete}
          </TzButton>
        </>
      ),
      onBack: () => {
        navigate(-1);
      },
    });
  });
  const l = useLocation();
  useEffect(() => {
    setHeader();
  }, [l, info]);
  let getMicrosegPolicyInfo = useCallback(() => {
    microsegPolicyId({ id: policyId }).subscribe((res) => {
      if (res.error) return;
      setInfo(res.getItem());
    });
  }, []);
  useEffect(() => {
    getMicrosegPolicyInfo();
    listComp.current.refresh();
  }, [getMicrosegPolicyInfo, l]);
  let columns = [
    {
      title: translations.time,
      dataIndex: 'created_at',
      render: (time: any, row: any) => {
        return moment(time).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: translations.source_ip,
      dataIndex: 'src_ip',
      render: (src_ip: any, row: any) => {
        let src_obj_type = row.src_obj_type;
        return (
          <div className="flex-r-c" style={{ justifyContent: 'flex-start' }}>
            <span>{src_ip}</span>
            {'Workload' === src_obj_type ? (
              <TzTooltip
                title={
                  <>
                    {`${translations.resources}:${row.src_res_name}`}
                    <br />
                    {`${translations.onlineVulnerability_outerShapeMeaning}:${row.src_namespace}`}
                  </>
                }
              >
                <TzTag className={'ant-tag-gray small ml8'}>{`${translations.resources}：${row.src_res_name}`}</TzTag>
              </TzTooltip>
            ) : 'IPBlock' === src_obj_type ? (
              <TzTag className={'ant-tag-gray small ml8'}>{`${translations.ip_group}：${row.src_res_name}`}</TzTag>
            ) : null}
          </div>
        );
      },
    },
    {
      title: translations.source_port,
      dataIndex: 'src_port',
    },
    {
      title: translations.destination_IP,
      dataIndex: 'dst_ip',
      render: (dst_ip: any, row: any) => {
        let dst_obj_type = row.dst_obj_type;
        return (
          <div className="flex-r-c" style={{ justifyContent: 'flex-start' }}>
            <span>{dst_ip}</span>
            {'Workload' === dst_obj_type ? (
              <TzTooltip
                title={
                  <>
                    {`${translations.resources}:${row.dst_res_name}`}
                    <br />
                    {`${translations.onlineVulnerability_outerShapeMeaning}:${row.dst_namespace}`}
                  </>
                }
              >
                <TzTag className={'ant-tag-gray small ml8'}>{`${translations.resources}：${row.dst_res_name}`}</TzTag>
              </TzTooltip>
            ) : 'IPBlock' === dst_obj_type ? (
              <TzTag className={'ant-tag-gray small ml8'}>{`${translations.ip_group}：${row.dst_res_name}`}</TzTag>
            ) : null}
          </div>
        );
      },
    },
    {
      title: translations.destination_port,
      dataIndex: 'dst_port',
    },
    {
      title: translations.protocol,
      dataIndex: 'proto_str',
    },
    {
      title: translations.compliances_breakdown_dotstatus,
      dataIndex: 'action',
      render: (time: any, row: any) => {
        return <RenderTag type="allow" title={translations.commonpro_Allow} />;
      },
    },
  ];
  let columnsHistory = [
    {
      title: translations.time,
      dataIndex: 'created_at',
      render: (time: any, row: any) => {
        return moment(time).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: translations.superAdmin_userName,
      dataIndex: 'user',
    },
    {
      title: translations.specific_behavior,
      dataIndex: 'description',
    },
  ];
  const dataInfoList = useMemo(() => {
    if (!info) return [];
    const obj: any = {
      id: 'ID：',
      cluster: translations.clusterManage_key + '：',
      srcDetail: translations.microseg_segments_policy_src_obj + '：',
      protocol: translations.protocol + '：',
      dstDetail: translations.microseg_segments_policy_dst_obj + '：',
      portList: translations.chart_map_port + '：',
      status: translations.active_status + '：',
      action: translations.originalWarning_rule + '：',
      matchTime: translations.last_hit_time + '：',
      updatedAt: translations.last_modified + '：',
    };

    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: info[item],
      };

      if ('srcDetail' === item || 'dstDetail' === item) {
        o['render'] = () => {
          if ('IPBlock' === info.dstType && 'dstDetail' === item) {
            return info.dstIPBlock;
          } else if ('IPBlock' === info.srcType && 'srcDetail' === item) {
            return info.srcIPBlock;
          } else {
            return `${info[item].namespace}/${info[item].name}(${translations.microseg_segments_segment_title}) `;
          }
        };
      }
      if ('portList' === item) {
        o['render'] = () => {
          return info['protocol'] == 'ANY' || info['protocol'] == 'ICMP' ? '-' : info[item]?.join(', ');
        };
      }
      if ('status' === item) {
        o['render'] = () => {
          let node = find(micrPriorityEnum, (ite) => ite.value == info[item]);
          return (
            <div className="flex-r-c">
              {info['status'] === 2 ? (
                <LoadingOutlined spin style={{ width: 14, height: 14, color: 'rgb(33, 119, 209)' }} />
              ) : null}
              <TzTag className="flex-r-c" style={merge({ maxWidth: '100%' }, node?.style)}>
                <EllipsisPopover>{node?.label}</EllipsisPopover>
              </TzTag>
            </div>
          );
        };
      }
      if ('action' === item) {
        o['render'] = () => {
          return <RenderTag type="allow" title={translations.commonpro_Allow} />;
        };
      }
      if ('cluster' === item) {
        o['render'] = () => {
          return getClusterName(info[item]);
        };
      }
      if ('matchTime' === item || 'updatedAt' === item) {
        o['render'] = () => {
          return info[item] > 0 ? moment(info[item]).format('YYYY-MM-DD HH:mm:ss') : '-';
        };
      }
      return o;
    });
  }, [info]);
  useEffect(() => {
    policyLog({ limit: 5, policy_name: policyId + '', msg_type: 3 }).subscribe((res) => {
      if (res.error) {
        return;
      }
      setDataSource(res.getItems());
    });
  }, [policyId]);
  const listComp = useRef(undefined as any);
  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      if (!policyId) {
        return getHistory().pipe(
          map(() => {
            return {
              data: [],
              total: [].length,
            };
          }),
        );
      }
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      return policyhistory({ offset, limit: pageSize, id: policyId }).pipe(
        map((res: any) => {
          let items = res.getItems();
          return {
            data: items,
            total: res.data.totalItems,
          };
        }),
      );
    },
    [policyId],
  );
  return (
    <div className="policy-detail mlr32 mb40">
      <TzCard title={translations.compliances_breakdown_taskbaseinfo} bodyStyle={{ paddingBottom: 0 }}>
        <ArtTemplateDataInfo data={dataInfoList} span={2} rowProps={{ gutter: [0, 0] }} />
      </TzCard>
      <TzCard
        title={
          <>
            {translations.hit_record}
            <span className="f14 ml8" style={{ color: '#8E97A3', fontWeight: 'lighter' }}>
              {translations.last_policy_hit_logs}
            </span>
          </>
        }
        className="mt20"
      >
        <TzTable dataSource={dataSource} columns={columns} pagination={false} />
      </TzCard>
      <TzCard title={translations.operationLog} className="mt20">
        <TzTableServerPage
          className="nohoverTable"
          columns={columnsHistory}
          reqFun={reqFun}
          rowKey={'id'}
          ref={listComp}
          defaultPagination={{
            pageSize: 5,
            hideOnSinglePage: false,
          }}
        />
      </TzCard>
    </div>
  );
};

export default PolicyDetail;
