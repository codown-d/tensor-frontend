import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { TzCard } from '../../../../components/tz-card';
import { detailLayers } from '../../../../services/DataService';
import { translations } from '../../../../translations/translations';
import { LayerBtn } from '../../LifeCycle';
import moment from 'moment';
import { TzTimelineNoraml } from '../../../../components/tz-timeline';
import { merge } from 'lodash';
import { useAnchorItem } from '../../../../components/ComponentsLibrary/TzAnchor';

export const Layer = forwardRef((props: any, ref?: any) => {
  const [imagesDigest, setImagesDigest] = useState<any>([]);

  let actionsList = useMemo(() => {
    if (!imagesDigest) return undefined;
    return imagesDigest.map((item: any, index: number) => {
      let { created, createdBy, digest, ...otherItem } = item;
      return merge(
        {
          children: (
            <>
              <div>
                <p className={'mb8'} style={{ fontSize: '16px', fontWeight: 550, color: '#3e4653' }}>
                  {created ? moment(created).format('YYYY-MM-DD HH:mm:ss') : '-'}
                </p>
                <p>
                  {translations.scanner_detail_image_digest}：{digest}
                </p>
                <p>
                  {translations.scanner_detail_created_by}：{createdBy}
                </p>
                <LayerBtn {...otherItem} digest={digest} {...props} />
              </div>
            </>
          ),
        },
        item,
      );
    });
  }, [imagesDigest]);
  const getScannerImagesDigestLayers = useCallback(() => {
    detailLayers(props).subscribe((res) => {
      let items = res.getItems().map((item, index) => {
        let { securityIssue = [], digest } = item;
        return merge(item, {
          ...props,
          layerDigest: digest,
          value: securityIssue.map((it: { value: any }) => it.value),
        });
      });
      setImagesDigest(items);
    });
  }, [props]);
  useEffect(() => {
    getScannerImagesDigestLayers();
  }, [getScannerImagesDigestLayers]);
  let { getPageKey } = useAnchorItem();
  return (
    <TzCard
      className={'layer mt20'}
      title={translations.risk_backtracking}
      id={getPageKey('layer')}
      bodyStyle={{ paddingTop: '7px', paddingLeft: '24px' }}
    >
      <TzTimelineNoraml timeList={actionsList} />
    </TzCard>
  );
});
