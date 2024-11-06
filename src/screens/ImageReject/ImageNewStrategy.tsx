import { translations } from '../../translations/translations';
export const initTypes = [
  { value: 'CRITICAL', label: translations.notificationCenter_columns_Critical, disabled: false },
  { value: 'HIGH', label: translations.severity_High, disabled: false },
  { value: 'MEDIUM', label: translations.severity_Medium, disabled: false },
  { value: 'LOW', label: translations.severity_Low, disabled: false },
  { value: 'UNKNOWN', label: translations.severity_Unknown, disabled: false },
];
export const initTypesFilters = initTypes.map((item: any) => {
  item['text'] = item['label'];
  return item;
});
export const yamlInitTypesFilters = initTypes.slice(0, -1).map((item: any) => {
  item['text'] = item['label'];
  return item;
});
export const riskLevel = [
  {
    text: translations.pagination_sure,
    label: translations.pagination_sure,
    value: 'certainly',
  },
  {
    text: translations.suspected,
    label: translations.suspected,
    value: 'maybe',
  },
];
