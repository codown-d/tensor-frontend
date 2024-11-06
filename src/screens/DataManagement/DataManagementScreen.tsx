import React, { PureComponent } from 'react';
import GCConfig from '../../components/GCConfig/GCConfig';
import WaterlineConfig from '../../components/GCConfig/GCConfigWaterline';
import { translations } from '../../translations/translations';

interface IProps {
  children: any;
  history: any;
}

const data = [
  {
    type: 'cold',
    title: translations.auditConfig_title,
    description: translations.auditConfig_description,
    label: translations.auditConfig_label,
    available: translations.auditConfig_available,
    labelDes: translations.auditConfig_des,
  },
  {
    type: 'hotLogic',
    label: translations.hotStorage_label,
    available: translations.hotStorage_available,
    labelDes: translations.hotStorage_des,
  },
  {
    type: 'hotOffline',
    label: translations.hotOffline_label,
    available: translations.hotOffline_available,
    labelDes: translations.hotOffline_des,
  },
];
class DataManagementScreen extends PureComponent<IProps> {
  render() {
    return (
      <div className={"mb40"}>
        {data.map((t: any, key: number) => {
          return (
            <GCConfig
              key={key}
              title={t?.title}
              description={t?.description}
              lineMark={true}
              type={t.type}
              label={t.label}
              available={t.available}
              labelDes={t.labelDes}
            />
          );
        })}
        <WaterlineConfig type="water" />
      </div>
    );
  }
}

export default DataManagementScreen;
