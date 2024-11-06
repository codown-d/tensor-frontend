const fs = require('fs-extra');

// craco 会重复执行
let cacheVal = null;
function parseFile (filePath) {
  if (cacheVal) {
    // console.log('\n🚀 解析antd 自定义 less 变量时命中缓存\n')
    return cacheVal;
  }

  const str = fs.readFileSync(filePath, {encoding: 'utf-8'});
  const results = str.match(/^@[\w\d\-]+:.+;/gm) || [];
  cacheVal = results.reduce((acc, item) => {
    let [k, val] = item.split(':');
    k = k.replace('@', '');
    acc[k] = val.replace(';', '');
    return acc;
  }, {});
  cacheVal = cacheVal || {};

  // console.log(`\n=========  解析到 ${results.length} 个 自定义 less 变量 =========`);
  return cacheVal;
}

module.exports = parseFile;
