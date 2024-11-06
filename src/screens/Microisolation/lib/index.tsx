import { translations } from '../../../translations';
import React from 'react';
import { RenderTag, TzTag } from '../../../components/tz-tag';
import { find, isArray, keys, merge, pick } from 'lodash';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { getClusterName } from '../../../helpers/use_fun';
import { protocolEnum, sourceObjectEnum } from '../PolicyManagement/Manual';
import { getTime } from '../../../helpers/until';
import { TrafficType } from '../VisualizeChart';
import { TzTooltip } from '../../../components/tz-tooltip';
import { innerTrustOp, strategicPatternOp } from '../ObjectManagement/ResourceGroup/Info';
export let allowGateway = [
  {
    label: translations.commonpro_Allow,
    value: 1,
    type: 'allow',
  },
  {
    label: translations.commonpro_Deny,
    value: 0,
    type: 'refuse',
  },
];
export const trafficStatusEnum = [
  { value: 'Allow', label: translations.commonpro_Allow, type: 'allow' },
  { value: 'Deny', label: translations.commonpro_Deny, type: 'deny' },
  { value: 'Alert', label: translations.imageReject_reject_type_alarm, type: 'alert' },
];
export const lineObjectsEnum = [
  { value: TrafficType.IPBlock, label: translations.ip_group },
  { value: TrafficType.Unknown, label: translations.unknown },
];
export let flag = ['Unknown', translations.unknown];

export let GatewayInfoTag = (props: { allowGateway: number }) => {
  let { allowGateway: value } = props;
  let node = find(allowGateway, (ite) => ite.value === value);
  return <RenderTag type={node?.type || 'allow'} />;
};
export const columnsList: any = [
  {
    title: translations.compliances_policyDetails_name,
    dataIndex: 'resource_group_name',
    render: (status: any, row: any) => {
      let { name, cluster, namespace } = row;
      row['clusterName'] = getClusterName(row.cluster);
      let o: any = {
        clusterName: translations.clusterManage_key,
        namespace: translations.onlineVulnerability_outerShapeMeaning,
      };
      return (
        <>
          <div>
            <EllipsisPopover>{name}</EllipsisPopover>
          </div>
          <div>
            {keys(o).map((item) => {
              return (
                <TzTag className={'ant-tag-gray small mt8 mr4'} style={{ maxWidth: '100%' }} key={item}>
                  <EllipsisPopover title={row[item]}>{`${o[item]}：${row[item]}`}</EllipsisPopover>
                </TzTag>
              );
            })}
          </div>
        </>
      );
    },
  },
  {
    title: translations.compliances_policyDetails_name,
    dataIndex: 'namespace_group_name',
    render: (namespace_group_name: any, row: any) => {
      return row.name;
    },
  },
  {
    title: translations.internal_mutual_trust,
    dataIndex: 'innerTrust',
    width: '10%',
    render: (innerTrust: any, row: any) => {
      let node = find(innerTrustOp, (item) => item.value + '' == innerTrust + '');
      return node?.label;
    },
  },
  {
    title: translations.microseg_namespace_strategyMode,
    dataIndex: 'mode',
    align: 'center',
    render: (mode: any, row: any) => {
      let node = find(strategicPatternOp, (item) => item.value === mode);
      return <RenderTag type={node?.value || 'warning'} />;
    },
  },

  {
    title: translations.microseg_segments_segment_title,
    dataIndex: 'segmentName',
    render: (item: any, row: any) => {
      return item || translations.not_grouped;
    },
  },
  {
    title: translations.microseg_namespace_sidetitle,
    dataIndex: 'nsgroupName',
    render: (item: any, row: any) => {
      return item || translations.not_grouped;
    },
  },

  {
    title: translations.number_resources,
    dataIndex: 'resourceNumber',
  },
  {
    title: translations.microseg_resources_res_kind,
    dataIndex: 'kind',
  },
  {
    title: translations.allow_gateway_access,
    dataIndex: 'allowGateway',
    render: (item: number, row: any) => {
      return <GatewayInfoTag allowGateway={item} />;
    },
  },
  {
    title: translations.compliances_policyDetails_name,
    dataIndex: 'ip_name',
    render: (ip_name: any, row: any) => {
      return row.name;
    },
  },
  {
    title: translations.ip_ranges,
    dataIndex: 'ipSet',
    render: (ipSet: any, row: any) => {
      return row.ipSet;
    },
  },
  {
    title: translations.imageReject_comment_title,
    dataIndex: 'comment',
    render: (comment: any, row: any) => <EllipsisPopover lineClamp={2}>{comment}</EllipsisPopover>,
  },
  {
    title: 'HOST',
    dataIndex: 'host',
    render: (host: any, row: any) => {
      return 'host';
    },
  },
  {
    title: 'METHOD',
    dataIndex: 'method',
    render: (method: any, row: any) => {
      return 'method';
    },
  },
  {
    title: 'PATH',
    dataIndex: 'path',
    render: (path: any, row: any) => {
      return 'path';
    },
  },

  {
    title: translations.microseg_segments_policy_src_obj,
    dataIndex: 'source_object',
    render: (source_object: any, row: any) => {
      let { srcType, protocol, portList, srcDetail } = row;
      let node = find(sourceObjectEnum, (item) => item.value === srcType);
      let obj: any = {
        cluster: translations.clusterManage_key,
        namespace: translations.onlineVulnerability_outerShapeMeaning,
        kind: translations.calico_cluster_type,
      };
      let newSrcDetail: any = pick(srcDetail, srcType === 'Segment' ? ['cluster', 'namespace', 'kind'] : ['cluster']);
      return (
        <>
          <div className="flex-r-c" style={{ justifyContent: 'flex-start' }}>
            <span className="mr8" style={{ color: flag.includes(srcType) ? 'rgb(243, 116, 45)' : '' }}>
              {srcDetail?.name}
            </span>
            <RenderTag
              className="small"
              type={flag.includes(srcType) ? 'Unknown' : 'running'}
              title={flag.includes(srcType) ? translations.unknown : node?.label}
            />
          </div>

          <div>
            {keys(newSrcDetail)
              .filter((item) => item !== 'name' && newSrcDetail[item])
              .map((item) => {
                return (
                  <TzTag
                    className="ant-tag-gray small mt4"
                    style={{ display: 'inline-flex', maxWidth: 'calc(50% - 8px)' }}
                    key={item}
                  >
                    <EllipsisPopover>
                      {`${obj[item]}：${item === 'cluster' ? getClusterName(srcDetail[item]) : srcDetail[item]}`}
                    </EllipsisPopover>
                  </TzTag>
                );
              })}
          </div>
        </>
      );
    },
  },
  {
    title: null,
    width: '9%',
    dataIndex: 'source_object',
    render: (source_object: any, row: any) => {
      let { protocol, portList } = row;
      return (
        <div className=" flex-c-c" style={{ minWidth: '40%', justifyContent: 'flex-start' }}>
          <EllipsisPopover>
            {[protocol, protocol == 'ANY' || protocol == 'ICMP' ? undefined : portList?.join(',')]
              .filter((item) => item)
              .join('/')}
          </EllipsisPopover>
          <img src="/images/arrow.png" alt="" style={{ width: '75px' }} />
        </div>
      );
    },
  },
  {
    title: translations.microseg_segments_policy_dst_obj,
    dataIndex: 'target_audience',
    render: (target_audience: any, row: any) => {
      let { dstType, dstDetail } = row;
      let node = find(sourceObjectEnum, (item) => item.value === dstType);
      let obj: any = {
        cluster: translations.clusterManage_key,
        namespace: translations.onlineVulnerability_outerShapeMeaning,
        kind: translations.calico_cluster_type,
      };
      let newDstDetail: any = pick(dstDetail, dstType === 'Segment' ? ['cluster', 'namespace', 'kind'] : ['cluster']);

      return (
        <div>
          <span className="mr8" style={{ color: flag.includes(dstType) ? 'rgb(243, 116, 45)' : '' }}>
            {dstDetail?.name}
          </span>
          <RenderTag
            className="small"
            type={flag.includes(dstType) ? 'Unknown' : 'running'}
            title={flag.includes(dstType) ? translations.unknown : node?.label}
          />
          <div>
            {keys(newDstDetail)
              .filter((item) => item !== 'name' && newDstDetail[item])
              .map((item) => {
                return (
                  <TzTag
                    className="ant-tag-gray small mt4"
                    style={{ display: 'inline-flex', maxWidth: 'calc(50% - 8px)' }}
                    key={item}
                  >
                    <EllipsisPopover>
                      {`${obj[item]}：${item === 'cluster' ? getClusterName(dstDetail[item]) : dstDetail[item]}`}
                    </EllipsisPopover>
                  </TzTag>
                );
              })}
          </div>
        </div>
      );
    },
  },

  {
    title: translations.priority,
    dataIndex: 'priority',
    width: '80px',
  },
  {
    title: translations.clusterManage_key,
    dataIndex: 'cluster',
    editable: true,
    render: (cluster: any, row: any) => getClusterName(row.cluster || row.cluster_key),
  },

  {
    title: translations.clusterManage_key,
    dataIndex: 'applicabl_clusters',
    render: (cluster: any, row: any) => {
      if (typeof row?.cluster === 'string') {
        return getClusterName(cluster);
      } else {
        return (
          row?.cluster
            ?.map((item: string) => {
              return getClusterName(item);
            })
            .join(',') || '-'
        );
      }
    },
  },
  {
    title: translations.last_hit_time,
    dataIndex: 'matchTime',
    width: '13%',
    render: (time: any, row: any) => getTime(time),
  },
  {
    title: translations.time,
    dataIndex: 'created_at',
    width: '11%',
    render: (time: any, row: any) => getTime(time),
  },
  {
    title: translations.source_IP,
    dataIndex: 'src_ip',
    render: (src_ip: any, row: any) => {
      let { src_res, src_res_name, src_res_kind, src_namespace } = row;
      let f = src_res_kind;
      return (
        <div>
          <div>
            <EllipsisPopover>{src_ip}</EllipsisPopover>
          </div>
          {src_res_name && src_res_name != TrafficType.Unknown ? (
            <div>
              <TzTag className="ant-tag-gray small mt4" style={{ maxWidth: '100%', display: 'inline-block' }}>
                <TzTooltip
                  title={
                    (f === 'IPBlock' ||f === 'Internal' ) && !src_namespace ? (
                      <>
                        {translations.ip_group}：{src_res_name}
                      </>
                    ) : f === 'Unknow' ? null : (
                      <>
                        {translations.resources}：{src_res_name}
                        <br />
                        {translations.onlineVulnerability_outerShapeMeaning}：{src_namespace}
                      </>
                    )
                  }
                >
                  <span title={src_res_name}>{src_res_name}</span>
                </TzTooltip>
              </TzTag>
            </div>
          ) : null}
        </div>
      );
    },
  },

  {
    title: translations.source_port,
    dataIndex: 'src_port',
    width: '8%',
    render: (port: any, row: any) => port || '-',
  },
  {
    title: translations.destination_IP,
    dataIndex: 'dst_ip',
    render: (dst_ip: any, row: any) => {
      let { dst_res, dst_res_name, dst_res_kind, dst_namespace } = row;
      let f = dst_res_kind;
      return (
        <div>
          <div>
            <EllipsisPopover>{dst_ip}</EllipsisPopover>
          </div>
          {dst_res_name && dst_res_name != TrafficType.Unknown ? (
            <div>
              <TzTag className="ant-tag-gray small mt4" style={{ maxWidth: '100%', display: 'inline-block' }}>
                <TzTooltip
                  title={
                    (f === 'IPBlock' ||f === 'Internal' )&& !dst_namespace ? (
                      <>
                        {translations.ip_group}：{dst_res_name}
                      </>
                    ) : f === 'Unknow' ? null : (
                      <>
                        {translations.resources}：{dst_res_name}
                        <br />
                        {translations.onlineVulnerability_outerShapeMeaning}：{dst_namespace}
                      </>
                    )
                  }
                >
                  <span title={dst_res_name}>{dst_res_name}</span>
                </TzTooltip>
              </TzTag>
            </div>
          ) : null}
        </div>
      );
    },
  },
  {
    title: translations.destination_port,
    dataIndex: 'dst_port',
    width: '8%',
    render: (port: any, row: any) => port || '-',
  },
  {
    title: translations.calico_protocol,
    dataIndex: 'proto_str',
    width: '8%',
    render: (proto: any, row: any) => {
      let node = find(protocolEnum, (item) => item.value === proto);
      return node?.label;
    },
  },
  {
    title: translations.compliances_breakdown_dotstatus,
    dataIndex: 'action_str',
    width: '8%',
    render: (status: any, row: any) => {
      let node = find(trafficStatusEnum, (item) => item.value.toLocaleLowerCase() === status.toLocaleLowerCase());
      return <RenderTag type={'flow' + node?.type} />;
    },
  },
  {
    title: translations.scanner_listColumns_namespace,
    dataIndex: 'namespace',
    render: (namespace: any, row: any) => {
      return namespace;
    },
  },
];

export let testPort = (value: string[] = []) => {
  let arr = value.map((item: string) => {
    if (item.includes('-')) {
      let result = item.split('-');
      if (result[0] === '' || result[1] === '') return false;
      return (
        Number(result[0]) <= 65535 && Number(result[0]) >= 0 && Number(result[1]) <= 65535 && Number(result[1]) >= 0
      );
    } else {
      return Number(item) <= 65535 && Number(item) >= 0;
    }
  });
  return arr.includes(false) ? Promise.reject(translations.incorrect_port_format) : Promise.resolve();
};
export let testIP = (value: string[] = []) => {
  let reg = {
    CIDR: /^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([1-9]|[1-2]\d|3[0-2])$/,
    IPRange:
      /^((?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)-(?:(?!\d{1,3}-\d{1,3})(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$/,
    IP: /^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/,
  };
  let arr = value.map((item: string) => {
    if (item.includes('-')) {
      return reg['IPRange'].test(item);
    } else if (item.includes('/')) {
      return reg['CIDR'].test(item);
    } else {
      return reg['IP'].test(item);
    }
  });
  return arr.includes(false) ? Promise.reject(translations.ip_format_incorrect) : Promise.resolve();
};
