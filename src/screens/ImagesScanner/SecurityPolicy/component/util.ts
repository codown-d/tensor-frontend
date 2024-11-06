import { curry, get } from 'lodash';
export const getFormItemLabel = (mapLabels: any, fieldName: string) => get(mapLabels, fieldName);
export const curriedFormItemLabel = curry(getFormItemLabel);
