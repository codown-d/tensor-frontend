import React, { useEffect, useMemo, useState } from 'react';

import './index.scss';
import { localLang, translations } from '../../translations/translations';
import Modal, { ModalFuncProps, ModalProps } from 'antd/lib/modal';
import ConfigProvider from 'antd/lib/config-provider';
import { SupportedLangauges } from '../../definitions';
import zh_CN from 'antd/lib/locale/zh_CN';
import en_US from 'antd/lib/locale/en_US';
import { merge } from 'lodash';

const { confirm, warning, success, info } = Modal;

export interface TzModalProps extends ModalProps {
  children?: any;
}

export const TzModal = (props: TzModalProps) => {
  const realProps = useMemo(() => {
    return {
      ...props,
      focusTriggerAfterClose: false,
      okText: props.okText || translations.confirm_modal_sure,
      cancelText: props.cancelText || translations.cancel,
      cancelButtonProps: {
        className: props?.cancelText === translations.cancel || !props?.cancelText ? 'cancel-btn' : '',
      },
      closeIcon: <i className={'icon iconfont icon-lansexiaocuohao f24'}></i>,
      width: props.width || 560,
      centered: true,
      className: `tz-modal ${props.className || ''}`,
    };
  }, [props]);
  return <Modal {...realProps} />;
};

export const TzConfirm = (props: ModalFuncProps) => {
  let className = 'cancel-btn ' + props.cancelButtonProps?.className;
  $('#layoutMain').css('overflow-y', 'hidden');
  return confirm(
    Object.assign(
      {
        destroyOnClose:true,
        closeIcon: <i className={'icon iconfont icon-lansexiaocuohao f24'}></i>,
        closable: true,
        autoFocusButton: null,
        width: 520,
        icon: <></>,
        focusTriggerAfterClose: false,
        centered: true,
        okText: props.okText || translations.confirm_modal_sure,
        cancelText: props.cancelText || translations.cancel,
      },
      props,
      {
        afterClose: () => {
          $('#layoutMain').css('overflow-y', 'overlay');
          props.afterClose?.();
        },
        cancelButtonProps: Object.assign({}, props.cancelButtonProps, {
          className,
        }),
        className: `tz-confirm-modal ${props.className || ''}`,
        content: React.createElement(
          ConfigProvider,
          { locale: localLang === SupportedLangauges.Chinese ? zh_CN : en_US },
          props.content,
        ),
      },
    ),
  );
};
export const TzConfirmDelete = (props: ModalFuncProps) => {
  TzConfirm(
    merge(
      {
        content: translations.scanner_config_deleteConfirmContent,
        okText: translations.delete,
        okButtonProps: {
          type: 'primary',
          danger: true,
        },
      },
      props,
    ),
  );
};
export const TzWarning = (props: ModalFuncProps) => {
  return warning(
    Object.assign({}, props, {
      className: `tz-confirm-modal ${props.className || ''}`,
    }),
  );
};
export const TzSuccess = (props: ModalFuncProps) => {
  return success(
    Object.assign({}, props, {
      icon: <></>,
      style: { top: '50%', marginTop: '-165px' },
      className: `tz-confirm-modal ${props.className || ''}`,
    }),
  );
};
export const TzModalInfo = (props: ModalFuncProps) => {
  return info(
    Object.assign({}, props, {
      icon: <></>,
      className: `${props.className || ''}`,
    }),
  );
};
