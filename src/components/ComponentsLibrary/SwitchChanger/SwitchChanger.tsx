import React, {
    forwardRef,
    PureComponent,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import './SwitchChanger.scss';
interface SwitchChangerProps {
    itemList: any[],
    callback: (arg: any) => void
}
const SwitchChanger = (props: SwitchChangerProps) => {
    let { itemList = [], callback = () => { } } = props
    let [active,setActive]=useState(itemList.length?itemList[0].key:'')
    return (
        <div className={'flex-r switch-changer'} style={{ width: '100%' }}>
            {itemList.map((item,index) => {
                return <>
                        <div onClick={() => { setActive(item.key);callback(item) }} className={`switch-item ${active===item.key?'switch-active':''}`}>
                            {item.label}
                        </div>
                        {index===itemList.length-1?null:<i className={'icon iconfont icon-guanbi'}></i>}
                </>
            })}

        </div>
    );
}

export default SwitchChanger