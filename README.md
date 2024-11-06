# 环境配置

node@18.18.1 npm@9.8.1 或 yarn@1.22.19

## 本地开发

1. install

`npm install --legacy-peer-deps` 或 `yarn install`

2. 启动开发服务器

`npm run dev` 或 `yarn dev`

## 本地build

`npm run build:local`

`yarn build:local`

## 重要依赖版本

antd@4.24.6 react@16.8.5 react-scripts@5.0.1

# TODO

1. **react 等其他依赖升级**：2月+

升级依赖、解决报错保证正常运行构建发布

2. 在服务端推广使用 [apifox](https://apifox.com/) 作为 api 管理工具

3. 图表组件统一为echar：5天

4. table 组件 react-data-table-component：3天

5. 缓存

cspm：10天领航：待定，需要等依赖升级完成参考使用 [offscreen](https://react.docschina.org/blog/2022/06/15/react-labs-what-we-have-been-working-on-june-2022#offscreen)

6. [热更新](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react#consistent-components-exports)

jsx、tsx 文件中使用以下方式导出组件，修改组件代码不会触发热更新

```
const App = () => { // ... };
export default App;
```

改为这种形式可以触发热更新

```
export default () => { // ... };
```

7. 循环引用

8. @antv 按需引用

# 业务重构(优化)

不考虑需求变更，只考虑代码优化

- header 、面包屑优化

- 资产发现重构

- 轮训未销毁

# 开发规范

# 其他

- 公共可复用逻辑怎么让其他人知道？

# 升级记录

## 2023.10.25

- npm version 由 14.18.0 升级到 18.18.1
- webpack version 由 4 升级到 5.89.0
- 新增 path alias: @cmp、@pages、@api
- [react-loadable 只能在webpack中使用并且不再维护](https://github.com/gregberge/loadable-components/issues/833) [Note about react-loadable](https://loadable-components.com/docs/loadable-vs-react-lazy/#note-about-react-loadable)，改用 [@loadable/component](https://loadable-components.com/docs/getting-started/)

## 测量

- npm run dev: 1m40s => 5s 内
- build 耗时: 2m50s => 2m12s
- 编译后资源大小: 11.9M => 10.4M
