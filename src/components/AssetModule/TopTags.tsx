import React, { useEffect, useMemo, useState } from 'react';
import { useMemoizedFn, useSize } from 'ahooks';
import TzSegmented from '../ComponentsLibrary/TzSegmented';
import './TopTags.scss';
import EllipsisPopover from '../ellipsisPopover/ellipsisPopover';

const styles = {
  arrowL: {
    color: '#6c7480',
    transform: 'rotateZ(90deg)',
  },
  arrowR: {
    color: '#6c7480',
    transform: 'rotateZ(-90deg)',
  },
};

// 比较两个数组是否相同
function compareArray(arr1: any[], arr2: any[]): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

// 含端点
function sum(arr: number[], start: number, end: number): number {
  return arr.slice(start, end + 1).reduce((acc, cur) => acc + cur, 0);
}

const overflowCls = 'overflow';
type IUseOverflow = [
  {
    isOverflow: boolean;
    canLeftRoll: boolean;
    canRightRoll: boolean;
  },
  {
    onRoll: any;
    truncated: any;
  },
];

function useOverflow(isHomePage: boolean): IUseOverflow {
  const viewDom = document.querySelector(
    `#layoutMain .layout-main-container ${isHomePage ? '.graph-navi-case > :first-child' : '.ant-page-header-heading'}`,
  ) as HTMLElement;
  const segmentDom = document.querySelector(
    '#layoutMain .layout-main-container .asset_top_tags .tz-segmented',
  ) as HTMLElement;
  const tagGroup = segmentDom?.querySelector('.ant-segmented-group') as HTMLElement;

  const wrapMaxWidth = Math.round((useSize(viewDom)?.width ?? 0) * 0.6);
  // 容器宽度
  const containerWd = useSize(segmentDom)?.width ?? 0;
  // 列表实际总宽
  const tagsRelWd = useSize(tagGroup)?.width ?? 0;
  // 每个tag的宽度
  const [tagsWd, setTagsWd] = useState<number[]>([]);
  // 向左边滚动 tagIndex+1 个tag
  const [tagIndex, setTagIndex] = useState(0);

  const isOverflow = tagsRelWd - containerWd > 2;

  const [canLeftRoll, canRightRoll] = useMemo(() => {
    const _canRightRoll = sum(tagsWd, tagIndex + 1, tagsWd.length - 1) > containerWd;
    return [tagIndex > 0, _canRightRoll];
  }, [tagIndex, tagsWd, containerWd]);

  const updateTagIndex = useMemoizedFn((newTagIdx: number) => {
    newTagIdx = Math.min(tagsWd.length - 1, Math.max(0, newTagIdx));
    setTagIndex(newTagIdx);
    const leftOffset = newTagIdx === 0 ? 0 : -1 * sum(tagsWd, 0, newTagIdx);
    tagGroup.style.left = `${leftOffset + 2}px`;
  });

  const onRoll = useMemoizedFn((direc: 'left' | 'right', step?: number) => {
    let newTagIdx = tagIndex;
    const maxInd = tagsWd.length - 1;
    if (direc === 'left') {
      if (!canLeftRoll) return;
      if (step) {
        newTagIdx -= 2;
      } else {
        while (newTagIdx >= 0 && sum(tagsWd, newTagIdx, tagIndex) <= containerWd) {
          newTagIdx--;
        }
        newTagIdx++;
      }
    } else {
      // 不需要再向右移
      if (!canRightRoll) return;
      if (step) {
        newTagIdx += 2;
      } else {
        while (newTagIdx <= maxInd && sum(tagsWd, tagIndex, newTagIdx) <= containerWd) {
          newTagIdx++;
        }
        newTagIdx--;
      }
    }
    updateTagIndex(newTagIdx);
  });

  const truncated = useMemoizedFn((idx: number) => {
    const { left: tagLeft, right: tagRight } = tagGroup.children[idx].getBoundingClientRect();
    const { left: wrapLeft, right: wrapRight, width: wrapWidth } = segmentDom.getBoundingClientRect();
    const leftOff = tagLeft - wrapLeft;
    const rightOff = tagRight - wrapRight;
    if (leftOff < 0) {
      updateTagIndex(tagIndex - 1);
    } else if (rightOff > 16) {
      updateTagIndex(tagIndex + 1);
    }
  });

  // 设置最大宽度
  useEffect(() => {
    if (wrapMaxWidth && segmentDom) {
      segmentDom.parentElement!.style.maxWidth = `${wrapMaxWidth}px`;
    }
  }, [wrapMaxWidth, containerWd]);

  useEffect(() => {
    let headerDom: any = null;
    if (!isHomePage) {
      headerDom = document.querySelector(`.ant-page-header-heading-title > :first-child`) as HTMLElement;
      headerDom?.classList.add('top_tag_z1');
    }
    return !isHomePage ? () => headerDom?.classList.remove('top_tag_z1') : undefined;
  }, []);

  useEffect(() => {
    if (segmentDom) {
      // canRightRoll ? segmentDom.classList.add(overflowCls) : segmentDom.classList.remove(overflowCls);
      const tagDoms = Array.from(segmentDom.querySelectorAll('.ant-segmented-item') || []);
      const _tagsWd = tagDoms.map((dom: any) => Math.ceil(dom.offsetWidth));
      if (!compareArray(_tagsWd, tagsWd)) {
        setTagsWd(_tagsWd);
      }
    }
    // 标签溢出
    if (isOverflow && segmentDom) {
      segmentDom.onwheel = !isOverflow
        ? null
        : (e) => {
            e.preventDefault();
            e.stopPropagation();
            const _diect = e.deltaY > 0 ? 'right' : 'left';
            let step = Math.round(e.deltaY);
            onRoll(_diect, step);
          };
    }
  }, [isOverflow]);

  return [
    { isOverflow, canLeftRoll, canRightRoll },
    { onRoll, truncated },
  ];
}

const TopTags = (props: any) => {
  let { isHomePage, ...otherProps } = props;
  const [{ isOverflow, canLeftRoll, canRightRoll }, { onRoll: roll, truncated }] = useOverflow(isHomePage);

  const onRoll = useMemoizedFn((dire: any) => {
    if (isOverflow) {
      roll(dire);
    }
  });

  const options = useMemo(() => {
    return (props.options || []).map((_opt: any) => {
      const label = (
        <span style={{ maxWidth: '104px', display: 'inline-block', verticalAlign: 'top' }} key={_opt.label}>
          <EllipsisPopover title={_opt.label}>{_opt.label}</EllipsisPopover>
        </span>
      );
      return { ..._opt, label };
    });
  }, [props.options]);

  const onChange = useMemoizedFn((id: string) => {
    props?.onChange && props?.onChange(id);
    const idx = options.findIndex((item: any) => id === item.value);
    if (idx !== -1) {
      truncated(idx);
    }
  });

  return (
    <div className="flex-r asset_top_tags">
      {canLeftRoll && <i className="iconfont icon-arrow f16" style={styles.arrowL} onClick={() => onRoll('left')}></i>}
      <TzSegmented {...otherProps} options={options} onChange={onChange} />
      {canRightRoll && (
        <i className="iconfont icon-arrow f16" style={styles.arrowR} onClick={() => onRoll('right')}></i>
      )}
    </div>
  );
};

export default TopTags;
