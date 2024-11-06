import React from 'react';
import classNames from 'classnames';
import './pwdStrengthBar.scss';
import { translations } from '../../../../translations/translations';

type TLevel = {
  label: string;
  value: string;
  class: string;
};
export const PWD_LEVEL: TLevel[] = [
  { value: 'WEEK', label: translations.weak, class: 'weak' },
  { value: 'AVERAGE', label: translations.general, class: 'general' },
  { value: 'STRONG', label: translations.strong, class: 'strong' },
  { value: 'VerySTRONG', label: translations.veryStrong, class: 'veryStrong' },
];
type TPwdStrengthBar = {
  strength: number;
};
export default function PwdStrengthBar({ strength }: TPwdStrengthBar) {
  const show = strength > -1;
  return (
    <div className="pwd-strength-bar">
      {show && (
        <>
          <span className="pwd-strength-bar-name">{PWD_LEVEL[strength].label}</span>
          {PWD_LEVEL.map((item, index) => (
            <div
              className={classNames('pwd-strength-bar-item', {
                [item.class]: strength > index - 1,
              })}
            />
          ))}
        </>
      )}
    </div>
  );
}
