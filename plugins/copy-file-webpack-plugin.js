/**
 * 自定义 webpack plugin，将 public 下的某些资源拷贝到指定目录
 * 需要在 compiler.run 之前执行
 * **/
const fs = require('fs-extra');

class CopyFileWebpackPlugin {
  static pluginName = 'CopyFileWebpackPlugin';
  constructor(envPaths) {
    this.envPaths = envPaths;
  }
  apply(compiler) {
    const { pluginName } = CopyFileWebpackPlugin;
    const AppSubject = process.env.REACT_APP_SUBJECT || 'tensor';

    if (AppSubject === 'tensor') {
      return;
    }
    compiler.hooks.beforeRun.tapPromise(
      pluginName,
      () => {
        return new Promise((resolve) => {
          const {appPublic, appBuild, appHtml} = this.envPaths;
          fs.copy(
            `${appPublic}/static/${AppSubject}`,
            `${appBuild}/images`,
            {
              dereference: true,
              filter: (file) => file !== appHtml,
            },
            (err) => {
              if (err) {
                console.error('\n============= 拷贝 public/static 失败 ===============\n%o', err);
              }
              resolve();
            }
          )
        });
      }
    );
  }
}

module.exports = CopyFileWebpackPlugin;