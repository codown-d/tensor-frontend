import { BehaviorSubject, Subject } from 'rxjs';
import { LoggedInUserInformation } from '../definitions';

const userInformation: BehaviorSubject<LoggedInUserInformation> = new BehaviorSubject(
  JSON.parse(localStorage.getItem('userInformation') || '{}'),
);

export function setUserToken(token: string): void {
  // 不能清除token不然会导致磐基中移postmessage监听循环处理;
  localStorage.setItem('token', token);
}
export function getUserToken() {
  return localStorage.getItem('token') || '';
}
export function setUserInformation(data: LoggedInUserInformation): void {
  userInformation.next(data);
  localStorage.setItem('userInformation', JSON.stringify(data));
}

export function getUserInformation(): LoggedInUserInformation {
  return userInformation.value;
}

export function setKeepPath(data: { path?: string; scrollTop?: number }) {
  localStorage.setItem('keepaliveInfo', JSON.stringify(data));
}

export function getKeepPath() {
  return JSON.parse(localStorage.getItem('keepaliveInfo') || '{}');
}

export function cleanKeepPath() {
  localStorage.setItem('keepaliveInfo', JSON.stringify({}));
}

export function setKeepaliveList(data: { path?: string; scrollTop?: boolean }) {
  localStorage.setItem('keepaliveList', JSON.stringify(data));
}

export function getKeepaliveList() {
  return JSON.parse(localStorage.getItem('keepaliveList') || '{}');
}

export function clearStorage() {
  localStorage.clear();
  sessionStorage.clear();
}
