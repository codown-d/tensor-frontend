import React, { useEffect, useState } from 'react';
import { useMemoizedFn } from 'ahooks';
import { TzTag } from '../tz-tag';
import EllipsisPopover from '../ellipsisPopover/ellipsisPopover';
import { translateBuildInTag } from './context';
import { TzTooltip } from '../tz-tooltip';
import './index.scss';

export * from './batch';
export * from './context';

interface IProps {
  labels: string[];
}

type IDOM = HTMLElement;

// 资产标签表格列
export default function LabelCol(props: IProps) {
  const { labels } = props;
  const colWrapRef = React.useRef<any>(null);
  const [moreTagIdx, setMoreTag] = useState(-1);
  const [refresh, setRefresh] = useState(false);

  const refCb: any = useMemoizedFn((wrapNode: HTMLDivElement, setMore?: boolean) => {
    if (!colWrapRef.current) {
      colWrapRef.current = wrapNode;
    } else if (!wrapNode) {
      wrapNode = colWrapRef.current;
    }

    if (!wrapNode?.firstElementChild) return;
    const { offsetHeight: tagHeight, offsetTop: initOffTop } = wrapNode.firstElementChild as IDOM;

    // 是否超过2行
    const isOverflow = (_dom: any) => (_dom.offsetTop - initOffTop) / tagHeight > 2;
    const childNum = wrapNode.childElementCount;

    // 调整more
    // const isLog = labels.join('、') === '全部资产55、_______________、whegre、3546444355、rtrt、最长标签去去去去去去去去去前期、长标签标签标签标签标签标签标、tray、webapp015476443、r6i57、二胎、K8s assets';
    if (setMore) {
      const moreTipDom = [...(wrapNode.children as any)].filter((_node) => _node.classList.contains('residue_tip'))[0];
      if (isOverflow(moreTipDom)) {
        const preDom: any = moreTipDom.previousElementSibling;
        if (!preDom) return;
        const _w = Math.round(preDom.offsetWidth - moreTipDom.offsetWidth - 8);
        // 宽度太小
        if (_w < 36) {
          setMoreTag((pre) => pre - 1);
          setRefresh(true);
        } else {
          preDom.style.width = `${_w}px`;
        }
      }
      return;
    }
    if (childNum < 2 || !isOverflow(wrapNode.lastElementChild)) {
      return;
    }

    let index = 0;
    for (let _node of wrapNode.children as any) {
      if (isOverflow(_node)) {
        break;
      }
      ++index;
    }
    setMoreTag(index);
  });

  useEffect(() => {
    if (moreTagIdx !== -1) {
      refCb(null, true);
    }
  }, [moreTagIdx]);
  useEffect(() => {
    return () => {
      colWrapRef.current = null;
    };
  }, []);

  if (!labels || !labels.length) return <>-</>;
  const residueTags = moreTagIdx === -1 ? '' : labels.map(translateBuildInTag).join('，');
  const residueNum = moreTagIdx === -1 ? 0 : labels.length - moreTagIdx;

  return (
    <div className="tab_col_wrap_c2" ref={refCb} data-tag={labels.join('、')}>
      {labels.map((label: string, idx: number) => {
        const txt = translateBuildInTag(label);
        return (
          <>
            <TzTag
              className="ant-tag-gray small mt2 mb2"
              style={{ maxWidth: '120px' }}
              key={label + moreTagIdx + refresh}
            >
              <EllipsisPopover title={txt} placement="topRight">
                {txt}
              </EllipsisPopover>
            </TzTag>
            {idx === moreTagIdx - 1 && (
              <TzTag className="ant-tag-gray small mt2 mb2 residue_tip" key={label + moreTagIdx + refresh + 'more'}>
                <TzTooltip placement="topRight" arrowPointAtCenter title={residueTags}>
                  <span className="residue_tip_num">+{residueNum}</span>
                </TzTooltip>
              </TzTag>
            )}
          </>
        );
      })}
    </div>
  );
}
