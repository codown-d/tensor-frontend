import { useMemoizedFn, useToggle, useUpdateEffect } from 'ahooks';
import React, { useCallback, useMemo, useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { flowDetails, resourceDetails, resourcesId } from '../../../services/DataService';
import { translations } from '../../../translations';
import { TzTag } from '../../../components/tz-tag';
import { getUid } from '../../../helpers/until';
import { GatewayInfoTag } from '../lib';
import { TzTable } from '../../../components/tz-table';
import { TzButton } from '../../../components/tz-button';
import { TzDrawerFn } from '../../../components/tz-drawer';
import ViewTrafficLogs from './ViewTrafficLogs';
import '../index.less';
import { columns } from './ResourceDetail';
import { TrafficType } from '../VisualizeChart';

export interface DetailProps {
  start_time: any;
  end_time: any;
  onClose: () => void;
}
interface LinkDetailProps extends DetailProps {
  lineInfo: any;
}
const LinkDetail = (props: LinkDetailProps) => {
  let { lineInfo, start_time, end_time, onClose } = props;
  let [dataSource, setDataSource] = useState<any>([]);
  //   const [state, { set }] = useToggle('close', 'open');
  let cluster = useMemo(() => {
    return lineInfo.cluster || lineInfo.dstDetail['cluster'] || lineInfo.srcDetail['cluster'];
  }, [lineInfo]);
  let getFlowDetails = useMemoizedFn(() => {
    flowDetails({
      cluster,
      src_obj: lineInfo.srcID,
      dst_obj: lineInfo.dstID,
      start_time,
      end_time,
    }).subscribe((res) => {
      if (res.error) return;
      let items = res.getItems().map((item) => {
        item['_id'] = getUid();
        return item;
      });
      setDataSource(items);
    });
  });
  useEffect(() => {
    // set(props.lineInfo ? 'open' : 'close');
    if (!props.lineInfo) return;
    getFlowDetails();
  }, [JSON.stringify(props)]);
  let { sourceName, targetName } = useMemo(() => {
    let { srcKind, srcDetail, dstDetail, dstKind, srcID, dstID } = lineInfo;
    let sourceName = '',
      targetName = '';
    let regex = /\/0$/;
    switch (srcKind) {
      case TrafficType.Internal:
        sourceName = srcDetail.name || (regex.test(srcID) ? translations.not_grouped : '-');
        break;
      case TrafficType.Unknown:
        sourceName = translations.unknown;
        break;
      case TrafficType.IPBlock:
        sourceName = translations.ip_group;
        break;
    }

    switch (dstKind) {
      case TrafficType.Internal:
        targetName = dstDetail.name || (regex.test(dstID) ? translations.not_grouped : '-');
        break;
      case TrafficType.Unknown:
        targetName = translations.unknown;
        break;
      case TrafficType.IPBlock:
        targetName = translations.ip_group;
        break;
    }
    return { sourceName, targetName };
  }, [props.lineInfo]);
  return (
    <div className={`resource-detail link-detail`} style={{ width: '389px' }}>
      <div>
        <span className="mr8 f16" style={{ color: '#1E222A', fontWeight: 550 }}>
          {translations.flow_line}
        </span>
        <i
          className="icon iconfont  f-r icon-close f24 cursor-p"
          onClick={() => {
            // set('close');
            onClose();
          }}
        ></i>
      </div>
      <p className="flex-r-c  mt16" style={{ justifyContent: 'flex-start' }}>
        <span>{translations.orientations}：</span>
        <span>
          {sourceName}&nbsp;&nbsp;→&nbsp;&nbsp;{targetName}
        </span>
      </p>
      <p className="f14 mt12" style={{ color: '#1E222A', fontWeight: 550 }}>
        {translations.visiting_relationship}
      </p>
      <TzTable
        className="nohoverTable"
        dataSource={dataSource}
        scroll={{ y: 300 }}
        pagination={false}
        showHeader={false}
        rowKey={'_id'}
        columns={columns}
      />
      <div className="flex-r-c mt16">
        <TzButton
          style={{ flex: 1 }}
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
                        {sourceName}&nbsp;&nbsp;→&nbsp;&nbsp;{targetName}
                      </span>
                    </>
                  }
                  src_obj={lineInfo.srcID}
                  src_id={lineInfo.srcID}
                  dst_obj={lineInfo.dstID}
                  dst_id={lineInfo.dstID}
                  start_time={start_time}
                  end_time={end_time}
                  cluster={cluster}
                  msg_type={2}
                />
              ),
            });
            dw.show();
          }}
        >
          {translations.view_traffic_logs}
        </TzButton>
      </div>
    </div>
  );
};

export default LinkDetail;
