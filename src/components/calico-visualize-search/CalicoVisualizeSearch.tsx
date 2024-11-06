import React, { useEffect, useState } from 'react';
import { Resources } from '../../Resources';
import { translations } from '../../translations/translations';
import { TzButton } from '../tz-button';
import './CalicoVisualizeSearch.scss';
import { TzInput } from '../tz-input';

interface IProps {
  onChange?: (value: string) => void;
}

const CalicoVisualizeSearch = (props: IProps) => {
  const [input, setInput] = useState<string>('');

  useEffect(() => {
    function keyupHanlder(e: any) {
      if (e.keyCode === 27) {
        setInput('');
      }
    }

    window.addEventListener('keyup', keyupHanlder);
    return () => {
      window.addEventListener('keydown', keyupHanlder);
    };
  }, []);

  useEffect(() => {
    if (props.onChange) {
      props.onChange(input);
    }
  }, [input, props]);

  return (
    <div className="calico-visualize-search-wrapper">
      <div className="calico-visualize-search">
        <TzInput
          prefix={<i className={'icon iconfont icon-sousuo'} style={{fontSize: '16px',color:'rgb(179, 186, 198)'}}></i>}
          value={input}
          placeholder={translations.sidebar_calico_searchBoxPlaceholder}
          onChange={(e) => setInput(e.currentTarget.value)}
          allowClear
          style={{borderColor: 'transparent'}}
        />
      </div>
    </div>
  );
};

export default CalicoVisualizeSearch;
