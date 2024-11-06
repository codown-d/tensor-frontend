import * as path from 'node:path';
import { defineConfig, loadEnv, PluginOption, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
// import { createStyleImportPlugin, AntdResolve } from 'vite-plugin-style-import';
import { createHtmlPlugin } from 'vite-plugin-html';
import { visualizer } from 'rollup-plugin-visualizer';
import svgr from '@svgr/rollup';
import externalGlobals from 'rollup-plugin-external-globals';
// import 'semver';
import copyFilePlugin from './plugins/vite-plugin-copy';
// const semver = require('semver');
// nodejs 版本超过 8.9.0
// if (semver.gte(process.version, '8.9.0'))

const NODE_ENV = process.env.NODE_ENV;
const IsDev = NODE_ENV === 'development';
const ISPro = NODE_ENV === 'production';
const IsAnalyzBundle = false; // 不想分析时设置为 false
const pathResolve = (_path) => path.resolve(__dirname, _path);
const IsLog = true; // 是否输出调试log
const log = (...args) => IsLog && console.log(...args);

log(`\n🚀 node version:${process.version}, ${NODE_ENV} 环境`);
// https://vitejs.dev/config/
export const getSiteTitle = (AppSubject) => {
  let str;
  switch (AppSubject) {
    case 'guoxin':
      str = '金融行业云原生安全检测系统';
      break;
    case 'zgyd':
      str = '观安 - 容器安全';
      break;
    case 'daoke':
      str = 'DaoCloud Security Suite';
      break;
    case 'wangan':
      str = '容器安全检测平台';
      break;
    case 'miaoyun':
      str = '秒云云原生安全平台';
      break;
    case 'dft':
      str = '东方通';
      break;
    case 'xishu':
      str = '喜数 - 容器安全';
      break;
    case 'cetc':
      str = '普天科技云原生安全平台';
      break;
    case 'chinamobile':
      str = '中国移动 - 容器安全平台';
      break;

    case 'tanyun':
      str = '探云容器安全扫描工具';
      break;
    case 'depsecure':
    case 'zstack':
    case 'rhzz':
    case 'blank':
      str = '容器安全平台';
      break;
    default:
      str = '领航 - 探真科技';
  }
  return str;
};
export default defineConfig(({ mode }) => {
  // 加载并兼容现有env使用方式
  const envPrefix = ['REACT_APP_', 'PUBLIC_'];
  const metaEnv = loadEnv(mode, process.cwd(), envPrefix);
  Object.keys(metaEnv).forEach((k) => {
    process.env[k] = metaEnv[k];
  });

  const htmlPlugin = createHtmlPlugin({
    minify: true,
    entry: 'src/index.tsx',
    // entry: 'src/debug/main.tsx',
    inject: {
      data: {
        title: getSiteTitle(metaEnv.REACT_APP_SUBJECT),
      },
    },
  });

  /*****
  // 与现有antd组件都是通过 antd/lib 形式导入的方式冲突
  const styleImportPlugin = createStyleImportPlugin({
    resolves: [AntdResolve()],
    // 如果没有你需要的resolve，可以在lib内直接写
    libs: [
      {
        libraryName: 'ant-design-vue',
        esModule: true,
        resolveStyle: (name) => {
          return `ant-design-vue/es/${name}/style/index`
        },
      },
    ],
  });
   **/

  // https://rollupjs.org/configuration-options/
  const rollupOptions = {
    // 不打包依赖
    external: ['react', 'react-dom', 'bizcharts', 'jquery', 'moment'],
    output: {
      // 单位:字节 压缩后10Kb
      experimentalMinChunkSize: 30 * 1024,
      globals: {
        jquery: '$',
      },
      manualChunks(id) {
        if (id.includes('lodash')) {
          return 'lodash';
        }
        if (id.includes('@antv/data-set')) {
          return '@antv/data-set';
        }
        if (id.includes('lottie-web')) {
          return 'lottie-web';
        }
      },
    },
    plugins: [
      // 不打包依赖映射的对象

      externalGlobals({
        react: 'React',
        'react-dom': 'ReactDOM',
        jquery: '$',
        moment: 'moment',
        bizcharts: 'BizCharts',
      }),
      copyFilePlugin(),
    ],
  };

  return {
    envPrefix,
    define: {
      'process.env': process.env,
    },
    resolve: {
      alias: {
        '@pages': pathResolve('./src/screens'),
        '@cmp': pathResolve('./src/components'),
        '@api': pathResolve('./src/services/DataService.ts'),
      },
    },
    plugins: [
      react({ jsxRuntime: 'classic' }), // 解决react16 react/jsx-dev-runtime 报错
      htmlPlugin,
      // styleImportPlugin,

      // svgr({
      //   svgrOptions: {
      //     exportType: 'named',
      //   },
      // }),
      svgr() as any as PluginOption,
      // eslint({ cache: false }),
      ISPro && splitVendorChunkPlugin(),
      IsAnalyzBundle && visualizer(),
    ],
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    // 依赖预构建
    optimizeDeps: {
      exclude: ['@tz/components'],
      include: [
        'antd/lib/segmented',
        'd3',
        '@antv/g6',
        'react-ace',
        'ace-builds/src-noconflict/ace',
        'ace-builds/src-noconflict/mode-text',
        'ace-builds/src-noconflict/mode-dockerfile',
        'ace-builds/src-noconflict/mode-yaml',
      ],
    },
    // css: {
    //   preprocessorOptions: {
    //     less: {
    //       modifyVars: {
    //         hack: `true;@import '${resolve('./src/vars.less')}';`,
    //         ...themeVariables,
    //       },
    //       javascriptEnabled: true,
    //     },
    //   },
    // },
    build: {
      rollupOptions,
      outDir: 'build',
    },
    server: {
      port: 3000,
      //   host: '172.21.208.1',
      proxy: {
        '/ws/v1': {
          //http://192.168.3.10:31080
          // target: 'ws://192.168.0.66:60601/',这是后端接口地址
          target: 'ws://192.168.3.10:31080/',
          changeOrigin: true,
          ws: true,
        },
        '/api': {
          // https://console-test-cn.tensorsecurity.cn/
          // https://console-local02.tensorsecurity.cn/
          target: 'https://console-test-cn.tensorsecurity.cn/',
          changeOrigin: true,
        },
      },
    },
    clearScreen: false,
  };
});

/**
 * 测试环境变量
 * **********
const env0 = process.env;
const env = Object.keys(env0).reduce((acc, k) => {
  if (/^REACT_/.test(k) || ['GENERATE_SOURCEMAP', 'PUBLIC_URL', 'NODE_ENV', 'BASE_URL'].includes(k)) {
    acc[k] = env0[k];
  }
  return acc;
}, {});
console.debug(`===========================================================
  env: ${JSON.stringify(env, null, 2)}
`);
*****/
