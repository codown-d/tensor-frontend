import Form from 'antd/lib/form';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './index.scss';
import { SupportedLangauges } from '../../../../definitions';
import { localLang, translations } from '../../../../translations/translations';

export let week = [
  translations.sunday,
  translations.monday,
  translations.tuesday,
  translations.wednesday,
  translations.thursday,
  translations.friday,
  translations.saturday,
];
export let monthDay = new Array(31).fill('').map((item, index) => {
  return {
    value: index + 1,
    label:
      index + 1 === 31
        ? 31 + (localLang === SupportedLangauges.Chinese ? '日' : 'th')
        : moment(index + 1, 'D').format(localLang === SupportedLangauges.Chinese ? 'D 日' : 'Do'),
  };
});
export let yearDay = (() => {
  let optionList: { value: string; label: string }[] = [];
  new Array(12).fill('').forEach((itme, index) => {
    let day30 = [4, 6, 9, 11],
      day28 = [2],
      day = 31;
    if (day30.includes(index + 1)) {
      day = 30;
    } else if (day28.includes(index + 1)) {
      day = 29;
    }
    new Array(day).fill('').forEach((it, i) => {
      optionList.push({
        value: `${index + 1}/${i + 1}`,
        label: moment(`${index + 1}/${i + 1}`, 'M/D').format(
          localLang === SupportedLangauges.Chinese ? 'M月D日' : 'MMM Do',
        ),
      });
    });
  });
  return optionList;
})();
