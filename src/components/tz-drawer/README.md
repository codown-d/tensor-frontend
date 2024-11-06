# antd 弹框抽屉封装

用法参考 [antd](https://ant.design/components/overview-cn/) 文档，封装只修改样式

---

## TzDrawerFn 方法中 rootEl 属性

| 属性   | 说明                                         | 类型                             | 默认值 |
| ------ | -------------------------------------------- | -------------------------------- | ------ |
| rootEl | 指定 Drawer 挂载的 HTML 节点,同 getContainer | `HTMLElement、() => HTMLElement` | `body` |

```tsx
import React from 'react';
import { TzButton } from '../../components/tz-button';

<TzButton
  onClick={async () => {
    let dw: any = await TzDrawerFn({
      title: 'drawer测试',
      children: <>drawer - TzDrawerFn</>,
    });
    dw.show();
  }}
>
  drawer
</TzButton>;
```

## 关闭 icon 增加响应效果

## License

[MIT](/LICENSE)
