import React, { useMemo } from 'react';
import { Upload } from 'antd';
import { UploadProps } from 'antd/lib/upload/Upload';
import './index.less';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { ceil } from 'lodash';
import { TzProgress } from '../../components/tz-progress';
import { translations } from '../../translations';

export let UploadItemRender = (props: {
  name: string;
  size: number;
  status: any;
  percent?: number;
  actions: { download: Function; preview: Function; remove: Function };
}) => {
  let { name, size, status, percent, actions } = props;
  let getStatusDom = useMemo(() => {
    if (status === 'error') {
      return (
        <div className="pl4 f12" style={{ lineHeight: '20px' }}>
          <span>{ceil((size ?? 0) / 1024, 2)}KB</span>&nbsp;
          <span className="upload-error" style={{ lineHeight: '20px' }}>
            {translations.upload_failed}
          </span>
        </div>
      );
    } else if (status === 'done') {
      return (
        <>
          <span className="pl4 f12" style={{ lineHeight: '20px' }}>
            {ceil((size ?? 0) / 1024, 2)}KB
          </span>
        </>
      );
    } else if (status === 'uploading') {
      return (
        <TzProgress
          className="progressH10"
          percent={percent}
          format={() => `${percent?.toFixed(0)}%`}
          strokeColor={{
            '0%': 'rgba(33, 119, 209, 1)',
            '100%': 'rgba(45, 148, 255, 1)',
          }}
        />
      );
    } else {
      return (
        <div className={'flex-r-c file-upload-item f12'} style={{ lineHeight: '20px' }}>
          <span>{ceil((size ?? 0) / 1024, 2)}KB</span>
          <i className="icon iconfont  icon-lajitong remove" onClick={() => actions.remove()}></i>
        </div>
      );
    }
  }, [status, percent, actions]);
  return useMemo(() => {
    return (
      <div className="flex-r-c mb4" style={{ justifyContent: 'flex-start' }}>
        <img src={`/images/uploadimg.png`} alt="" style={{ width: '44px' }} />
        <div className="ml14" style={{ color: '#3E4653', flex: 1, width: 'calc(100% - 44px)' }}>
          <div style={{ paddingLeft: 4, maxWidth: '100%' }}>
            <EllipsisPopover title={name}>{name}</EllipsisPopover>
          </div>
          <div>{getStatusDom}</div>
        </div>
      </div>
    );
  }, [props]);
};
export const TzUpload = (props: UploadProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      className: `tz-upload ${props.className || ''}`,
    };
  }, [props]);
  return <Upload {...realProps} />;
};
