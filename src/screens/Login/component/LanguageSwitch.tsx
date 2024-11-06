import React from 'react';
import { Resources } from '../../../Resources';
import { SupportedLangauges } from '../../../definitions';
import { TzButton } from '../../../components/tz-button';
import { setLanguage } from '../../../services/LanguageService';

function LanguageSwitch() {
  const languages = [
    {
      title: '简体中文',
      icon: Resources.FlagChaina,
      value: SupportedLangauges.Chinese,
    },
    {
      title: 'English',
      icon: Resources.FlagUsa,
      value: SupportedLangauges.English,
    },
  ];

  return (
    <div className="langauges-section">
      {languages.map((el, i) => (
        <TzButton
          type="text"
          key={i}
          onClick={() => {
            setLanguage(el.value);
          }}
        >
          {el.icon && <img alt="icon" src={el.icon} />}
          {el.title}
        </TzButton>
      ))}
    </div>
  );
}

export default LanguageSwitch;
