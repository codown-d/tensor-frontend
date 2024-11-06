import { useBoolean, useMemoizedFn, useToggle, useUpdateEffect } from 'ahooks';
import React, { useCallback, useMemo, useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { resourceDetails, resourcesId } from '../../../services/DataService';
import { translations } from '../../../translations';
import { TzTag } from '../../../components/tz-tag';
import { getUid } from '../../../helpers/until';
import { GatewayInfoTag } from '../lib';
import { TzTable } from '../../../components/tz-table';
import { TzButton } from '../../../components/tz-button';
import { TzDrawerFn } from '../../../components/tz-drawer';
import ViewTrafficLogs from './ViewTrafficLogs';
import PolicyDetails from './PolicyDetails';
import '../index.less';
import { DetailProps } from './LinkDetail';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';

export let columns = [
  {
    title: translations.scanner_report_eventType,
    dataIndex: 'src_ip',
    render(item: any, row: any) {
      let { src_ip, src_res, src_kind } = row;
      return (
        <>
          <p style={{ color: '#6C7480' }}>{src_ip}</p>
          {src_kind === 'Unknown' ? null : (
            <p style={{ color: '#B3BAC6' }} className="f12">
              {src_res}
            </p>
          )}
        </>
      );
    },
  },
  {
    title: translations.scanner_report_eventType,
    dataIndex: 'src_ip',
    render(item: any, row: any) {
      let { counts, action = 'allow', proto, dst_port } = row;
      let arr = [proto];
      if (proto !== 'ICMP') {
        arr.push(dst_port);
      }
      return (
        <div className={`flow-rate-type t-c ${action.toLowerCase()}`}>
          <p className="f12" style={{ color: '#6C7480' }}>
            {arr.join('/')}
          </p>
          <p className="f12 mt2" style={{ color: '#B3BAC6' }}>
            {counts}
            {translations.superAdmin_times}
          </p>
        </div>
      );
    },
  },
  {
    title: translations.scanner_report_eventType,
    dataIndex: 'src_ip',
    render(item: any, row: any) {
      let { dst_ip, dst_res, dst_kind } = row;
      return (
        <>
          <p style={{ color: '#6C7480' }}>{dst_ip}</p>
          {dst_kind === 'Unknown' ? null : (
            <p style={{ color: '#B3BAC6' }} className="f12">
              {dst_res}
            </p>
          )}
        </>
      );
    },
  },
];
interface ResourceDetailProps extends DetailProps {
  id: any;
  idpath: any;
  cluster: any;
}
const ResourceDetail = (props: ResourceDetailProps) => {
  let { id, start_time, end_time, idpath, cluster, onClose } = props;
  let [info, setInfo] = useState<any>();
  let [dataSource, setDataSource] = useState<any>([]);
  let getResourceDetails = useMemoizedFn(() => {
    resourceDetails({ cluster, res_id: idpath, start_time, end_time }).subscribe((res) => {
      if (res.error) return;
      let items = res.getItems().map((item) => {
        item['_id'] = getUid();
        return item;
      });
      setDataSource(items);
    });
  });
  let getResourcesId = useMemoizedFn(() => {
    resourcesId({ id }).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setInfo(item);
    });
  });
  useEffect(() => {
    // set(id ? 'open' : 'close');
    if (!id) return;
    getResourcesId();
    getResourceDetails();
  }, [JSON.stringify(props)]);
  return (
    <div className={`resource-detail `} style={{ width: '389px' }}>
      <div className="flex-r-c mb16">
        <span
          className="mr8 f16"
          style={{ color: '#1E222A', fontWeight: 550, width: 0, flex: 1, display: 'inline-block' }}
        >
          <EllipsisPopover> {info?.name}</EllipsisPopover>
        </span>
        {info?.isInfra ? <TzTag className="ant-tag-gray">{translations.microseg_resources_rescfg_infirs}</TzTag> : null}
        <i
          className="icon iconfont  f-r icon-close f24 cursor-p"
          onClick={() => {
            onClose();
          }}
        ></i>
      </div>
      <div>
        <p className="flex-r-c mb16" style={{ justifyContent: 'flex-start' }}>
          <span>{translations.calico_dock_resourceType}：</span>
          <span style={{ color: '#3E4653' }}>{info?.kind}</span>
        </p>
        <p className="flex-r-c" style={{ justifyContent: 'flex-start' }}>
          <span>{translations.onlineVulnerability_outerShapeMeaning}：</span>
          <span style={{ color: '#3E4653' }}>{info?.namespace}</span>
        </p>
      </div>
      {dataSource.length ? (
        <>
          <p className="f14 mt16" style={{ fontWeight: 550, color: '#3E4653' }}>
            {translations.visiting_relationship}
          </p>

          <TzTable
            className="nohoverTable mlr-16"
            showHeader={false}
            scroll={{ y: 300 }}
            dataSource={dataSource}
            pagination={false}
            rowKey={'_id'}
            columns={columns}
          />
        </>
      ) : null}
      <div className="flex-r-c mt16">
        {dataSource.length ? (
          <TzButton
            style={{ flex: 1 }}
            className="mr4"
            onClick={async () => {
              let dw: any = await TzDrawerFn({
                title: null,
                headerStyle: { display: 'none', height: 0 },
                width: '80%',
                children: (
                  <ViewTrafficLogs
                    close={() => dw.hiden()}
                    title={
                      <>
                        {translations.traffic_log_c}
                        <span
                          className={'f14 ml12 fw400'}
                          style={{ color: '#6C7480', lineHeight: '28px', height: '20px' }}
                        >
                          {info.name}
                        </span>
                      </>
                    }
                    end_time={end_time}
                    res_id={idpath}
                    start_time={start_time}
                    cluster={cluster}
                    msg_type={1}
                  />
                ),
              });
              dw.show();
            }}
          >
            {translations.view_traffic_logs}
          </TzButton>
        ) : null}
        <TzButton
          style={{ flex: 1 }}
          className="ml4"
          onClick={async () => {
            let dw: any = await TzDrawerFn({
              title: `${info.name} ${translations.strategyDetails}`,
              width: '80%',
              children: <PolicyDetails resourceInfo={info} />,
            });
            dw.show();
          }}
        >
          {translations.strategyDetails}
        </TzButton>
      </div>
    </div>
  );
};

export default ResourceDetail;
