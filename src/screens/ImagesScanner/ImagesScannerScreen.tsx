import React from 'react';
import ImagesScannerOverview from './components/Image-scanner-overview/ImagesScannerOverview';
import ImagesScannerDataList from './components/ImagesScannerDataList/index';

export enum tabType {
  ci = 'ci',
  registry = 'registry',
  node = 'node',
  deploy = 'deploy',
}

const ImagesScannerScreen = () => {
  return (
    <div className="scan-result-case">
      <div className="mb24">
        <ImagesScannerOverview imageFromType={tabType.registry} />
      </div>
      <ImagesScannerDataList imageFromType={tabType.registry} />
    </div>
  );
};

export default ImagesScannerScreen;
