import moment from 'moment';
import { SupportedLangauges } from '../definitions';
import { getCurrentLanguage } from '../services/LanguageService';
(() => {
  const localLang = getCurrentLanguage(); 
  let str = 'zh-cn';
  if (localLang === SupportedLangauges.Chinese) {
    str = 'zh-cn';
  } else {
    str = 'en';
  }
  moment.locale(str);
})();
