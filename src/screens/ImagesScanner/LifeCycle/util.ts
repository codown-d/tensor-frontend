// 需求：从风险探索跳转镜像详情后需要滚动到对应tab
// 等待接口返回数据后，再滚动页面距离。

export const baseFn = false;
export const leakFn = false;
export const sensitiveFn = false;
export const virusFn = false;
export const webshellFn = false;

export const fnBool = {
  baseFn: false,
  leakFn: false,
  sensitiveFn: false,
  virusFn: false,
  webshellFn: false,
};

type vFn = (obj: { [k: string]: boolean }) => boolean;
export const verifyBool: vFn = (obj) => {
  let r = false;
  let items = Object.keys(obj);
  let t = 0;
  items.forEach((f) => {
    if (obj[f]) t += 1;
  });
  return items.length === t ? (r = true) : r;
};
