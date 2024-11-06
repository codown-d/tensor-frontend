import { en } from './translations/en';
import { zh } from './translations/zh';
import flat from 'flat';

// const flat = require('flat');
// const unflatten = require('flat').unflatten;

const flattenEn: any = Object.keys(flat(en));
const flattenZh: any = Object.keys(flat(zh));

export function debugLanguageKeys() {
  const missings: any = {};

  for (const item of flattenEn) {
    if (!flattenZh.includes(item)) {
      missings[item] = '';
    }
  }
  let missingsAttr = Object.keys(missings);
  if (missingsAttr.length !== 0) {
  }
}
