import React, { useState, useMemo, useCallback } from 'react';
import { localLang, translations } from '../../translations/translations';
import './FileUpload.scss';
import { TzUpload } from '../../components/tz-upload';
import { ceil, merge } from 'lodash';
import { AuthorizationData } from '../../services/DataServiceHelper';
import { TzButton } from '../../components/tz-button';
import { UploadProps } from 'antd/lib/upload/interface';
import { parseGetMethodParams } from '../../helpers/until';

interface FileUploadProps {
  uploadProps: UploadProps;
  formIns: any;
  callback: (r: any) => void;
  cancelToken?: (source: any) => void;
}

const FileUpload = (props: FileUploadProps) => {
  let { callback, cancelToken, formIns } = props;
  const [fileList, setFileList] = useState<any>([]);
  const [uploading, setUploading] = useState(false);
  let uploadProps = useMemo(() => {
    return merge({}, props.uploadProps, {
      maxCount: 1,
      iconRender: () => {
        return <img alt="" src={`/images/uploadimg.png`} style={{ width: '44px', height: '44px' }} />;
      },
      progress: {
        strokeColor: {
          '0%': '#2177D1',
          '100%': '#2D94FF',
        },
        strokeWidth: 10,
        format: (percent: number) => percent && `${parseFloat(percent.toFixed(2))}%`,
      },
      onRemove: (file: any) => {
        const index = fileList.indexOf(file);
        const newFileList = fileList.slice();
        newFileList.splice(index, 1);
        setFileList(newFileList);
      },
      beforeUpload: (file: any) => {
        setFileList([...fileList, file]);
        return false;
      },
    });
  }, [props.uploadProps]);
  let handleUpload = useCallback(
    (type: any) => {
      const formData = new FormData();
      fileList.forEach((file: File) => {
        formData.append('file', file);
      });
      setUploading(true);
      const CancelToken = (window as any).axios.CancelToken;
      const source = CancelToken.source();
      cancelToken?.(source);
      let data = formIns.getFieldValue();
      (window as any)
        .axios({
          timeout: 300000,
          url: `${props.uploadProps.action}${parseGetMethodParams({
            ...data,
            options: (props.uploadProps.action as any).indexOf('db/update/malicious') != -1 ? data.options : 'trivy',
          })}`,
          method: props.uploadProps.method || 'POST',
          cancelToken: source.token,
          headers: {
            ...AuthorizationData(),
            'Content-Type': 'multipart/form-data',
            'Accept-Language': localLang,
          },
          data: formData,
          onUploadProgress: function (progressEvent: any) {
            //原生获取上传进度的事件
            setFileList((pre: any[]) => {
              return pre.map((item) => {
                let progress = parseFloat((progressEvent.progress * 100).toFixed(2));
                item['percent'] = progress;
                item['status'] = progress === 100 ? 'done' : 'uploading';
                return item;
              });
            });
          },
        })
        .then((res: any) => {
          setFileList((pre: any[]) => {
            return pre.map((item) => {
              item['percent'] = 100;
              item['status'] = 'done';
              return item;
            });
          });
          callback({
            code: 0,
          });
        })
        .catch((res: any) => {
          setFileList((pre: any[]) => {
            return pre.map((item) => {
              item['status'] = 'error';
              return item;
            });
          });
          setTimeout(() => {
            let size = (parseFloat(fileList[0].size as any) / 1024).toFixed(2) + 'Kb';
            $(`#${props.uploadProps.id} .ant-upload-list-item-error`).append(
              `<div class='ant-upload-list-item-progress'>${size} <span class='status'>${translations.upload_failed}</span></div>`,
            );
          }, 0);
          let { status, statusText } = res.response;
          callback({ code: status, message: statusText });
        })
        .finally(function (res: any) {
          setUploading(false);
        });
    },
    [fileList, props],
  );
  return (
    <div className={'file-upload'} id={props.uploadProps?.id}>
      <TzUpload {...uploadProps} fileList={fileList}>
        <span className={'btn-click'}>{translations.select_file}</span>
      </TzUpload>
      <TzButton
        type="primary"
        className={'f-r'}
        onClick={handleUpload}
        disabled={fileList.length === 0}
        loading={uploading}
        style={{ marginTop: '28px' }}
      >
        {uploading ? translations.uploading : translations.upload}
      </TzButton>
    </div>
  );
};
export default FileUpload;
