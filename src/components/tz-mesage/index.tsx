import { message } from 'antd';
import React from 'react';

import './index.scss';
export const TzMessageSuccess = (content: React.ReactNode | string) => {
  message.success({
    content,
    className: 'tz-message tz-message-success',
  });
};

export const TzMessageError = (content: React.ReactNode | string) => {
  message.error({
    content,
    className: 'tz-message tz-message-error',
  });
};

export const TzMessageInfo = (content: React.ReactNode | string) => {
  message.info({
    content,
    className: 'tz-message tz-message-info',
  });
};

export const TzMessageWarning = (content: React.ReactNode | string) => {
  message.warning({
    content,
    className: 'tz-message tz-message-warning',
  });
};

export const TzMessageLoading = (content: React.ReactNode | string) => {
  return message.loading({
    content,
    className: 'tz-message tz-message-loading',
  });
};
