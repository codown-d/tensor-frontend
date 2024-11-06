import React from 'react';
import classNames from 'classnames';
import './StepsHelper.scss';
import { translations } from '../../../translations/translations';

interface IProps {
  active?: number | string;
  activeItems?: { value: number | string; label?: any }[];
  customClassName?: string;
}

const stepsItems = [
  { value: 1, label: translations.newUser_oneStep },
  { value: 2, label: translations.newUser_twoStep },
  { value: 3, label: translations.newUser_threeStep },
];

const Steps = (props: IProps) => {
  const { active = 3, customClassName, activeItems = stepsItems } = props;

  return (
    <>
      <div className={classNames('steps-case', 'steps', customClassName)}>
        {activeItems?.map((t: any, key: number) => {
          return (
            <div className="item-case" key={key}>
              <div className="item">
                <span
                  className={classNames(
                    'item-tit',
                    {
                      'item-tit_active': active === key + 1,
                    },
                    {
                      'item-tit_actived': key + 1 < active,
                    }
                  )}
                >
                  {t.value}
                </span>
                <span
                  className={classNames(
                    'item-label',
                    {
                      'item-label_active': active === key + 1,
                    },
                    {
                      'item-label_actived': active > key + 1,
                    }
                  )}
                >
                  {t.label ? t.label : translations.step + key}
                </span>
              </div>
              <div className={classNames('line')}></div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Steps;
