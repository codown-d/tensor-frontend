import { useMemoizedFn } from 'ahooks';

// 目前只有角色鉴权，权限功能需求排期中。。。。
export const useAuth = () => {
  const hasAuth = useMemoizedFn((auth: string | string[]) => {
    // TODO
    return false;
  });
  return { hasAuth };
};
