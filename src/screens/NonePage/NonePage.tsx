import React, { useCallback } from 'react';
import { Resources } from '../../Resources';
import { translations } from '../../translations/translations';
import './NonePage.scss';
const NonePage = () => {
  return (
    <div className="nonepage">
      <img src={Resources.NonePage} alt="NonePage" />
      <span>{translations.nonePage_nonePageTip1}</span>
    </div>
  );
};

export default NonePage;
