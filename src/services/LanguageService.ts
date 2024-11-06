import { SupportedLangauges } from '../definitions';

export function setLanguage(language: SupportedLangauges, isLoginOut?: boolean) {
  localStorage.setItem('language', language || SupportedLangauges.Chinese);
  isLoginOut || window.GLOBAL_WINDOW.location.reload();
}

export function getCurrentLanguage(): SupportedLangauges {
  return (
    (localStorage.getItem('language') as SupportedLangauges) ||
    (navigator.languages.includes(SupportedLangauges.Chinese) ||
    navigator.languages.includes('zh-CN')
      ? SupportedLangauges.Chinese
      : SupportedLangauges.English)
  );
}
