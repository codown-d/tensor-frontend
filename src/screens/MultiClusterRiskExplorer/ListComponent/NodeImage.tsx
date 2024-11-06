import { merge } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ImagesScannerDataList, {
  fetchReport,
} from '../../ImagesScanner/components/ImagesScannerDataList';
import { tabType } from '../../ImagesScanner/ImagesScannerScreen';

export let fetchReportNode = (parameter: any, callback?: any) => {
  fetchReport(merge({ imageFromType: 'node' }, parameter), callback);
};
const NodeImage = (_props: any) => {
  return (
    <div className="mt24">
      <ImagesScannerDataList imageFromType={tabType.node} />
    </div>
  );
};
export default NodeImage;
