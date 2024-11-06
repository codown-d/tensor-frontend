import React, { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './index.scss';
import notification, { ArgsProps, NotificationApi } from 'antd/lib/notification';
import WebSocketContext from '../../screens/ImmuneDefense/Info/components/WebSocketContext';
import { useMemoizedFn } from 'ahooks';
import { Store } from '../../services/StoreService';
import { Spin } from 'antd';
import { TzProgress } from '../../components/tz-progress';
import { TzButton } from '../../components/tz-button';
import { translations } from '../../translations/translations';
import { merge } from 'lodash';

type IconProps = 'pending' | 'processing' | 'done' | 'error';
export interface TzNotificationProps extends ArgsProps {
  percentage?: number;
  state: IconProps;
  callback?: () => void;
}

export let getIcon = (type: IconProps) => {
  let obj: any = {
    pending: {
      icon: 'pending',
      style: {},
    },
    processing: {
      icon: 'processing',
      style: {},
    },
    done: {
      icon: 'icon-chenggong',
      style: { color: 'rgba(82, 196, 26, 1)' },
    },
    error: {
      icon: 'icon-jinggao',
      style: { color: 'rgba(255, 138, 52, 1)' },
    },
  };
  let { icon, style } = obj[type];
  return ['pending', 'processing'].includes(type) ? (
    <Spin style={{ height: '16px', marginTop: '-2px' }} size="small" />
  ) : (
    <i className={`icon iconfont ${icon} f16`} style={style}></i>
  );
}
let Description = (props: TzNotificationProps) => {
  let { message, description, percentage, state, callback } = props;
  let [showHeader, setShowHeader] = useState(true);
  let timer = useRef<any>(null);
  let setActionFn = useMemoizedFn(() => {
    clearTimeout(timer.current);
    if (['processing', 'pending'].includes(state)) {
      timer.current = setTimeout(() => {
        setShowHeader(false);
      }, 3000);
    } else {
      setShowHeader(true);
    }
  });
  let showContent = useMemo(() => {
    return ['done', 'error'].includes(state) && showHeader;
  }, [showHeader, state]);
  useEffect(() => {
    setActionFn();
    return () => {
      clearTimeout(timer.current);
    };
  }, [props]);
  return (
    <div className={showHeader ? 'notification-wrapper':'notification-hidden notification-wrapper' }>
      <div className='notification-desc'>
        <div
          className="f16 flex-r-c"
          style={{ justifyContent: 'flex-start' }}
          onMouseOver={() => {
            clearTimeout(timer.current);
            setShowHeader(true);
          }}
          onMouseLeave={setActionFn}
        >
          {getIcon(state)}
          {showHeader ? (
            <span style={{ color: '#3E4653' }} className="ml8">
              {message}
            </span>
          ) : null}
        </div>

        {showContent ? <div style={{ width: '360px', paddingLeft: '28px' }} className="mt6">
          <div
            className="f14"
            style={{ color: '#6C7480', marginTop: '-2px' }}
            dangerouslySetInnerHTML={{ __html: description + '' }}
          ></div>
          <TzProgress
            className="progressH10"
            percent={percentage}
            format={() => `${percentage}%`}
            strokeColor={{
              '0%': 'rgba(33, 119, 209, 1)',
              '100%': 'rgba(45, 148, 255, 1)',
            }}
          />
          {'error' === state ? (
            <TzButton onClick={() => callback?.()} className="mt10 f-r">
              {translations.retry_failed_item}
            </TzButton>
          ) : null}
        </div> : null}
      </div></div>
  );
};
export const TzNotification = () => {
  const { subscribe } = useContext(WebSocketContext);
  let showMicrPolicy = useMemoizedFn(() => {
    Store.micrPolicyCreate.subscribe((val) => {
      let { callback, ...postData } = val || {};
      if (val) {
        let policyKey = postData.taskID + '';
        notification.open({
          key: policyKey,
          className: 'micr-policy-notification',
          closeIcon: true,
          description: null,
          duration: 0,
          message: (
            <Description key={'policy'} message={translations.batch_policies_waiting} description={''} percentage={0} state={'processing'} />
          ),
        });
        subscribe &&
          subscribe({
            domain: 'microseg',
            scene: 'batch_add_status',
            type: 'control',
            command: 'start',
            data: postData,
            callback: (data: any) => {
              let { success, failed, percentage, total, failed_id } = data;
              let state: IconProps =
                percentage < 100 ? 'processing' : percentage == 100 && failed == 0 ? 'done' : 'error';
              let message =
                percentage < 100 ? translations.batch_add_strategy : translations.batch_add_strategy_completed;
              let description =
                percentage < 100
                  ? translations.unStandard.policy_processing(total)
                  : translations.unStandard.policy_processing_information(total, success, failed);
              const args = {
                key: policyKey,
                className: 'micr-policy-notification',
                closeIcon: state == 'processing',
                message: (
                  <Description key={'policy'} message={message} description={description} percentage={percentage} state={state} callback={()=>{callback(failed_id) }} />
                ),
                description: null,
                duration: 0,
              };
              notification.open(args);
            },
          });
      }
    });
  })
  useEffect(() => {
    showMicrPolicy()
  }, []);
  return null;
};
