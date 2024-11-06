import React, { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './index.scss';
import notification, { ArgsProps, } from 'antd/lib/notification';
import { useMemoizedFn } from 'ahooks';
import { TzProgress } from '../../../../components/tz-progress';
import { Subscription } from 'rxjs';
import { getUserInformation } from '../../../../services/AccountService';
import { translations } from '../../../../translations';
import { taskStatus } from '../../../../services/DataService';
import { getIcon } from '../../../../components/tz-notification';

type IconProps = 'pending' | 'processing' | 'done' | 'error';
interface TzNotificationProps extends ArgsProps {
  percentage?: number;
  state: IconProps;
}

let Description = (props: TzNotificationProps) => {
  let { message, description, percentage, state } = props;
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
    <div className={!showHeader ? 'notification-hidden notification-wrapper' : 'notification-wrapper'}>
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
        {showContent ? (
          <div style={{ width: '360px', paddingLeft: '28px' }} className="mt6">
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
          </div>
        ) : null}
      </div>

    </div>
  );
};
export const MarkLoading = () => {
  let [taskInfo, setTaskInfo] = useState<any>();
  let [preStatus, setPreStatus] = useState<string>();
  let timer = useRef<Subscription>();
  let showMarkLoading = useMemoizedFn(() => {
    switch (preStatus) {
      case '_pending':
      case 'pending_pending':
      case 'pending_process':
      case 'pending_finish':
      case 'pending_failed':

      case '_process':
      case 'process_process':
      case 'process_finish':
      case 'process_failed':

      case 'finish_pending':
      case 'finish_process':
      case 'failed_pending':
      case 'failed_process':

      case 'finish_failed':
        return true;
        break;
    }
    return false;
  });
  let handleTaskStatus = useMemoizedFn(() => {
    if (!taskInfo) return;
    let { status, creator, failed_num, success_num, total_num } = taskInfo;
    const loginUser = getUserInformation().username;
    if (creator === loginUser) {
      let obj: any = {
        pending: 'pending',
        process: 'processing',
        finish: 'done',
        failed: 'done',
      };
      let state = obj[status];
      let percentage = total_num == 0 ? 0 : Math.ceil(((success_num + failed_num) / total_num) * 100);
      let description =
        state == 'processing'
          ? translations.unStandard.str151(total_num)
          : translations.unStandard.str152(total_num, success_num, failed_num);
      let messageStr: any = {
        pending: translations.bulk_tagging_pending,
        processing: translations.unStandard.str149,
        done: translations.unStandard.str150,
      };
      let message = messageStr[state];
      const args = {
        key: 'mark',
        className: 'mark-loading-notification',
        closeIcon: ['processing', 'pending'].includes(state),
        message: (
          <Description key={'mark'} message={message} description={description} percentage={percentage} state={state} />
        ),
        description: null,
        duration: 0,
      };
      notification.open(args);
    }
  });
  let getTaskStatus = useMemoizedFn(() => {
    timer.current?.unsubscribe();
    timer.current = taskStatus({}).subscribe((res) => {
      if (res.error) {
        return;
      }
      let item = res.getItem();
      setTaskInfo((pre) => {
        setPreStatus(`${pre?.status}_${item.status}`);
        return item;
      });
      setTimeout(() => {
        getTaskStatus();
      }, 5000);
    });
  });
  useEffect(() => {
    if (!showMarkLoading()) return;
    handleTaskStatus();
  }, [preStatus]);
  useEffect(() => {
    getTaskStatus();
    return () => {
      timer.current?.unsubscribe();
    };
  }, []);
  return null;
};
