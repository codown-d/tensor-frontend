# antd 按钮封装

用法参考 [antd](https://ant.design/components/overview-cn/) 文档，封装只修改样式

---

## type 属性类型

| 属性 | 说明         | 类型                                          | 默认值    |
| ---- | ------------ | --------------------------------------------- | --------- |
| type | 设置按钮类型 | `primary、ghost、dashed、link、text、default` | `default` |

```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { TzButton } from '../../components/tz-button';

<div id="example"></div>;

ReactDOM.render(
  <span>
    <TzButton type={'primary'}>primary</TzButton>
    <TzButton type={'ghost'}>ghost</TzButton>
    <TzButton type={'dashed'}>dashed</TzButton>
    <TzButton type={'link'}>link</TzButton>
    <TzButton type={'text'}>text</TzButton>
    <TzButton type={'default'}>default</TzButton>
  </span>,
  document.getElementById('example')
);
```

![TzButton](/public/components/TzButton/tz-button.png)

default:

> `color`: `#2177D1`
>
> > `:hover`:
> >
> > > `background`: `#F3F5F8`
>
> > `:active`:
> >
> > > `background`: `#EFF0F2`

## 字体颜色

默认为:#2177d1，如果要改为灰色(取消按钮)，可添加属性 gray 或者添加类名`cancel-btn`

```tsx
import { TzButton } from '../../components/tz-button';

<TzButton className="cancel-btn">cancel</TzButton>
<TzButton gray>cancel</TzButton>
```

## 圆角

默认为`8px`的圆角，属性 ~~cancel~~ 弃用

## License

[MIT](/LICENSE)
