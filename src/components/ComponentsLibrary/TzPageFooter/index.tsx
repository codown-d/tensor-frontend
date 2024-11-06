import React from 'react';
import './index.scss';
const TzPageFooter = (props: any) => {
  let { children, style = {} } = props
  return <div style={{ height: ' 60px' }}>
    <div style={style} className={'tz-page-footer'} >
      <div className={'tz-page-footer-wraper'} >{children}</div>
    </div></div>
    ;
};

export default TzPageFooter;
