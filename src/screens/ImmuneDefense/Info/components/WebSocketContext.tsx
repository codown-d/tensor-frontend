import { useMemoizedFn, useSetState, useWebSocket } from 'ahooks';
import { Result } from 'ahooks/lib/useWebSocket';
import React, { useCallback, createContext, useEffect, useMemo, useRef, useState } from 'react';
import { getUserToken } from '../../../../services/AccountService';
import { keys, merge } from 'lodash';
type command = 'start';
type webSocketProps = {
  domain: string; // 业务领域domain
  scene: string; // 业务场景scene
  type: 'control'; // 消息类型 （目前只有 control）
  command: command; // 控制命令
  data: any;
  timestamp?: Number;
  callback?: () => void;
};
export const webSocket = () => {
  let [eventBus, setEventBus] = useSetState<any>({});
  let [wsMessage, setWsMessage] = useSetState<any>({});
  let timer = useRef<NodeJS.Timeout>();
  let protocol = document.location.protocol.indexOf('https') != -1 ? 'wss' : 'ws';
  let socketIns = useWebSocket(`${protocol}://${location.host}/ws/v1/biz?jwt=${getUserToken()}`, {
    onOpen: () => {
      clearInterval(timer.current);
      setTimeout(() => {
        keys(wsMessage)
          .filter((item) => item)
          .forEach((item) => {
            handle(wsMessage[item]);
          });
      }, 0);
      timer.current = setInterval(() => {
        handle({
          type: 'heartbeat',
          timestamp: new Date().getTime(),
        });
      }, 30000);
    },
    onClose: () => {
      clearInterval(timer.current);
    },
    onMessage: (msg: { data: string }) => {
      let message = JSON.parse(msg.data);
      let { data, domain, scene } = message;
      eventBus[domain + '_' + scene](data);
    },
    onError: () => {
      clearInterval(timer.current);
    },
    reconnectLimit: 3,
    reconnectInterval: 1000,
  });
  let handle = useMemoizedFn((otherArg: any) => {
    try {
      socketIns?.['sendMessage'] &&
        socketIns?.sendMessage(JSON.stringify(merge(otherArg, { timestamp: new Date().getTime() })));
    } catch (error) {}
  });
  const subscribe = useMemoizedFn((arg: webSocketProps) => {
    const { callback, ...otherArg } = arg;
    setEventBus({ [otherArg.domain + '_' + otherArg.scene]: callback });
    setWsMessage({ [otherArg.domain + '_' + otherArg.scene]: otherArg });
    handle(otherArg);
  });
  const unSubscribe = useMemoizedFn((arg: webSocketProps) => {
    const { ...otherArg } = arg;
    setEventBus({ [otherArg.domain + '_' + otherArg.scene]: () => {} });
    setWsMessage({ [otherArg.domain + '_' + otherArg.scene]: null });
    handle(otherArg);
  });

  return { ...socketIns, subscribe, unSubscribe };
};

export default createContext<any>({});
