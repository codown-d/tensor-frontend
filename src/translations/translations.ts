import { en } from './en';
import { zh } from './zh';
import { getCurrentLanguage } from '../services/LanguageService';
const dic = { en, zh };
export const localLang = getCurrentLanguage();
export const translations = dic[localLang];
