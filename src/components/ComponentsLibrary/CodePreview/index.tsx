import Anchor from 'antd/lib/anchor';
import React, { useRef, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { getUid } from '../../../helpers/until';
import './index.scss';
const { Link } = Anchor;
type TypeCode = 'error' | 'normal' | 'success';
interface TzCodePreviewProps {
  className?: string;
  list: {
    id: string;
    type?: TypeCode;
    code: React.ReactNode;
  }[],
  leftAnchor?:{
    id: string;
    type?: TypeCode;
    code: React.ReactNode;
  }[]
}
const TzCodePreview = (props: TzCodePreviewProps) => {
  let id = useRef<any>(getUid());

  let list = useMemo(() => {
    return props.list
  }, [props.list])
  let leftAnchor = useMemo(() => {
    return props?.leftAnchor||props.list
  }, [props,list])
  useEffect(() => {
    setTimeout(() => {
      let h = $('#' + id.current).height()
    }, 0)
  }, [props, id])
  return <div className={`tz-code-preview ${props.className || ''}`}>
    <div className={'flex-r'} style={{ height: '100%' }}>
      <Anchor className={list.length<=13?'flex-start':'space-around'} affix={false} getContainer={() => {
        return document.getElementById(id.current) as HTMLElement
      }} onClick={(e) => {
        e.preventDefault()
      }}>
        {leftAnchor.map(item => {
          return <Link href={`#${item.id}`} title={item.code} className={item.type} />
        })}
      </Anchor>
      <div id={id.current} className={'code-preview-content'}>
        {list.map((item, index) => {
          return <p id={item.id} style={{ whiteSpace: 'nowrap',fontSize:'12px',paddingTop:'2px' }}>
            <span style={{ paddingRight: '32px', width: '32px', display: 'inline-block',color:'#8E97A3',fontSize:'12px' }}>{index + 1}</span>
            {item.type==='error'?
               <p className={item.type} style={{display:'inline-block',color:'#3E4653',fontSize:'12px'}} dangerouslySetInnerHTML={{__html:(item.code as any)}}></p>:
               <p className={item.type} style={{display:'inline-block',color:'#3E4653',fontSize:'12px'}} >{item.code}</p>
            }
          </p>
        })}
      </div>
    </div>

  </div>;
};

export default TzCodePreview;
