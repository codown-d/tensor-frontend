import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './MultiClusterRiskExplorerGraphList.scss';
import { translations } from '../../translations/translations';
import GraphListNavi, { useAssetsModule } from '../../components/AssetModule/GraphListNavi';
import useNewSearchParams from '../../helpers/useNewSearchParams';
import { useMemoizedFn } from 'ahooks';
// import { Store } from '../../services/StoreService';
// import TzSegmented from '../../components/ComponentsLibrary/TzSegmented';
// import { useActivate } from 'react-activation';
import { BatchLabelProvider, useBatchLabelContext } from '../../components/label-col';

interface IProps {
  children: any;
  history: any;
}
const ClustersGraphListScreens = () => {
  const [{ assetType: selectAsset, assetTopTag }] = useBatchLabelContext();
  const { moduleList } = useAssetsModule();

  const getDom = useMemo(() => {
    const assetKeys = Object.getOwnPropertyNames(moduleList);
    const idx = assetKeys.findIndex((k) => moduleList[k].assetType === selectAsset);
    if (idx === -1) {
      // throw new Error(`未找到 ${selectAsset} 类型的资产`);
      return null;
    }
    return moduleList[assetKeys[idx]]?.children;
  }, [selectAsset, moduleList]);

  const [cardNum, setCardNum] = useState<number>(1);
  const onUpdateCardNum = useMemoizedFn((num: number) => {
    setCardNum(num || 0);
  });

  return (
    <div className="graph-list-case">
      <GraphListNavi moduleList={moduleList} className="graph-navi" onUpdateCard={onUpdateCardNum} />
      {cardNum > 0 ? (
        <div className="graph-list-tabs-case  mlr32 mt4" key={assetTopTag.id}>
          {getDom}
        </div>
      ) : null}
    </div>
  );
};

export default (props: any) => {
  return (
    <BatchLabelProvider>
      <ClustersGraphListScreens {...props} />
    </BatchLabelProvider>
  );
};
