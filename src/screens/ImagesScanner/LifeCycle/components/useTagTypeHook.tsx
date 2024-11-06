import { useMemoizedFn } from 'ahooks';
import React, { useEffect, useMemo, useState } from 'react';
import { questionEnum } from '../../../../screens/ImagesScanner/components/ImagesScannerDataList';
import { detailIssueOverview } from '../../../../services/DataService';
import { NodeTabLeakProps } from './NodeTabLeak';
interface TagTypeProps extends NodeTabLeakProps {
  exceptionType: questionEnum;
}
const useGetTagType = (props: TagTypeProps) => {
  let [tagType, setTagType] = useState<any>(props.tagType);
  useEffect(() => {
    if (!props.tagType && props.layerDigest) {
      getImagesDetailIssueStatistic();
    }
  }, [props.tagType, props.layerDigest]);
  let getImagesDetailIssueStatistic = useMemoizedFn(() => {
    detailIssueOverview(props).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setTagType(item[props.exceptionType]);
    });
  });
  return { tagType };
};

export default useGetTagType;
