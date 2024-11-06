import fs from 'fs-extra';
import { normalizePath } from 'vite';

/**
 * 拷贝指定目录
 * *******/
let cfgBuf = null;
export default function () {
  return {
    name: 'vite-plugin-copy',
    configResolved(resolvedConfig) {
      const AppSubject = resolvedConfig.env.REACT_APP_SUBJECT || 'tensor';
      if (AppSubject === 'tensor') {
        return;
      }
      cfgBuf = resolvedConfig;
    },
    generateBundle() {
      if (!cfgBuf) return;
      const dir1 = normalizePath(`${cfgBuf.publicDir}/static/${cfgBuf.env.REACT_APP_SUBJECT}`)
      const dir2 = normalizePath(`${cfgBuf.root}/${cfgBuf.build.outDir}/images`);
      fs.copy(dir1, dir2,
        {
          dereference: true,
          // filter: (file) => /\.html$/.test(file),
        },
        (err) => {
          if (err) {
            console.error('\n============= 拷贝 public/static 失败 ===============\n%o', err);
          }
        }
      )
    },
    // writeBundle
  };
}
