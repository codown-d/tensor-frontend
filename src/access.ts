export const hasAuth = (route: any, roleId?: string) => {
  return route.roles ? route.roles.includes(roleId) : true;
};
export const ROLES = {
  SUPER_ADMIN: 'super-admin', // 超管
  PLATFORM_ADMIN: 'platform-admin', // 平台管理员
  ADMIN: 'admin', // 管理员
  AUDIT: 'audit', // 审计员
  NORMAL: 'normal', // 普通用户
};
export default function access(currentUser: any) {
  // const {currentUser} = initialState||{}
  return {
    auth: (route: any) => hasAuth(route, currentUser?.roleId),
  };
}
