import React from 'react';
import { Resources } from '../../../Resources';
import { translations } from '../../../translations/translations';

import './TzToast.scss';

interface IProps {
  active: boolean;
  onClose: (active: boolean) => void;
}

const TzToast = (props: IProps) => {
  const { active } = props;
  return active ? (
    <div className="TZToast-case">
      <img src={Resources.BlueLow} alt="!" className="blueIcon" />
      {translations.newUser_prompt}
      <div className="img-case" onClick={() => props.onClose(false)}>
        <img src={Resources.StopDark} alt="X" className="x-img" />
      </div>
    </div>
  ) : null;
};

export default TzToast; 
