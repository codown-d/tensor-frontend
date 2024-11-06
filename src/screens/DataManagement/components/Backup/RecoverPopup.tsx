import { useMemoizedFn, useTimeout, useUpdate, useUpdateEffect } from 'ahooks';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TzModal } from '../../../../components/tz-modal';
import './recoverPopup.scss';
import { TzButton } from '../../../../components/tz-button';
import { TzUpload } from '../../../../components/tz-upload';
import {
  backupPoll,
  configsImport,
  getConfigsOperatorList,
} from '../../../../services/DataService';
import { ceil, flatten, isObject, keys } from 'lodash';
import { URL } from '../../../../helpers/config';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { LoadingOutlined } from '@ant-design/icons';
import {
  BackupPollData,
  BackupPollDataStatus,
  TConfigsOperator,
  WebResponse,
} from '../../../../definitions';
import { AuthorizationData } from '../../../../services/DataServiceHelper';
import { localLang, translations } from '../../../../translations/translations';
import classNames from 'classnames';
import { TzMessageSuccess } from '../../../../components/tz-mesage';

const DETAUL_DELAY = 400;
type TRecoverPopup = {
  open: boolean;
  onCancel: () => void;
  refresh: () => void;
};
type TResList = {
  value: string;
  name: string;
  status: BackupPollDataStatus;
};
function RecoverPopup({ open, onCancel, refresh }: TRecoverPopup) {
  const [uploading, setUploading] = useState<boolean>();
  const [delay, setDelay] = useState<number>();
  const [file, setFile] = useState<any>();
  const [list, setList] = useState<Omit<TConfigsOperator, 'child'>[]>();
  const [resList, setResList] = useState<TResList[]>();
  const fileCache = useRef<any>();

  const windowCloseFn = useMemoizedFn((e) => {
    e.preventDefault();
    e.returnValue = '';
  });

  const endPoll = useMemoizedFn(() => {
    setUploading(false);
    clear();
    return;
  });
  const clear = useTimeout(() => {
    backupPoll().subscribe((res: WebResponse<BackupPollData>) => {
      setDelay(undefined);
      if (res.error) {
        endPoll();
        return;
      }
      const { Status, Import } = res.getItem() || {};
      const n = keys(Status);
      if (!n.length) {
        endPoll();
        return;
      }
      const _rl = list
        ?.filter((v) => n.includes(v.Key) && Status?.[v.Key] !== 'wait')
        .map((v) => ({ value: v.Key, name: v.Name, status: Status?.[v.Key] }) as TResList);

      setResList(_rl);
      toEnd();
      if (Import === 'success') {
        endPoll();
        setTimeout(() => {
          TzMessageSuccess(translations.recover_successful);
          onCancel();
          refresh();
        }, 300);
        return;
      }
      setTimeout(() => {
        setDelay(DETAUL_DELAY);
      });
    });
  }, delay);
  const onOk = useMemoizedFn(() => {
    if (!file || file.status === 'success') {
      return;
    }
    fileCache.current = file;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    configsImport(formData).subscribe((res) => {
      if (res.error) {
        setUploading(false);
        setFile((prev: any) => ({ ...prev, status: 'error' }));
        return;
      }
      setFile((prev: any) => ({ ...prev, status: 'success' }));
      setDelay(DETAUL_DELAY);
    });
  });
  const propsUpload = useMemo((): any => {
    return {
      className: 'upload-container-accounts flex-r mb24',
      multiple: false,
      maxCount: 1,
      headers: {
        ...AuthorizationData(),
        'Accept-Language': localLang,
      },
      showUploadList: {
        showRemoveIcon: false,
      },
      itemRender: (_: any, f: any) => {
        const { status, name, size } = f;
        const { name: cacheName, size: sizeName } = fileCache.current || {};
        return (
          <div className="item-render">
            <div>
              <img src={`${URL}/images/uploadimg.png`} alt="" />
            </div>
            <div className="item-render-info">
              <div className="item-render-name">
                <EllipsisPopover title={name ?? cacheName}>{name ?? cacheName}</EllipsisPopover>
              </div>
              <div>
                <span>{ceil((size ?? sizeName ?? 0) / 1024, 2)}KB</span>&nbsp;{' '}
                {status === 'error' && (
                  <span className="upload-error">{translations.upload_failed}</span>
                )}
              </div>
            </div>
          </div>
        );
      },
      fileList: file ? [file] : null,
      beforeUpload: (file: any) => {
        setFile(file);
        return false;
      },
    };
  }, [file]);

  useEffect(() => {
    getConfigsOperatorList().subscribe((res) => {
      if (!res.error) {
        setList(flatten(res.getItems().map((v) => v.child)));
      }
    });

    window.GLOBAL_WINDOW.addEventListener?.('beforeunload', windowCloseFn);
    return () => {
      window.GLOBAL_WINDOW.removeEventListener?.('beforeunload', windowCloseFn);
    };
  }, []);
  const toEnd = useMemoizedFn(() => {
    if (isObject(document.querySelector('.recover-prepare'))) {
      (document.querySelector('.recover-prepare') as any).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  });
  useUpdateEffect(() => {
    setResList(undefined);
  }, [file?.uid]);

  return (
    <TzModal
      destroyOnClose
      maskClosable={false}
      okText={translations.recover}
      okType="primary"
      open={open}
      closable={!uploading}
      title={translations.recover}
      onCancel={onCancel}
      wrapClassName="recover-popup"
      centered
      width={560}
      bodyStyle={{ maxHeight: 600, overflow: 'auto' }}
      okButtonProps={{
        loading: uploading,
      }}
      footer={[
        <TzButton disabled={uploading || !file} key="submit" type="primary" onClick={onOk}>
          {uploading ? (
            <>
              <LoadingOutlined />
              &nbsp; {translations.inRecovery}
            </>
          ) : (
            translations.recover
          )}
        </TzButton>,
      ]}
    >
      <div>
        <TzUpload {...propsUpload} disabled={uploading}>
          <a className="required">{translations.select_file}</a>
        </TzUpload>
        {/* <div className="item-explain-error">请选择文件</div> */}
        {!!resList?.length && (
          <div className="recover-list">
            <ul>
              {resList.map((v) => (
                <li
                  className={classNames({
                    error: v.status === 'failed',
                    loading: v.status === 'backup',
                  })}
                >
                  {v.status === 'backup' ? (
                    <LoadingOutlined className="status" />
                  ) : (
                    <i
                      className={classNames('status icon iconfont', {
                        'icon-gou': v.status === 'success',
                        'icon-close': v.status === 'failed',
                      })}
                    />
                  )}
                  {v.name}
                </li>
              ))}
              {uploading && <li className="recover-prepare">......</li>}
            </ul>
          </div>
        )}
      </div>
    </TzModal>
  );
}

export default RecoverPopup;
