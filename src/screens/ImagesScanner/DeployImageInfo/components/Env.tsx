import { TablePaginationConfig } from 'antd';
import { merge } from 'lodash';
import React, { forwardRef, useCallback, useRef, useState } from 'react';
import { map } from 'rxjs/operators';
import { TzCard } from '../../../../components/tz-card';
import TzInputSearch from '../../../../components/tz-input-search';
import { TzTableServerPage } from '../../../../components/tz-table';
import { RenderTag } from '../../../../components/tz-tag';
import useLayoutMainSearchWid from '../../../../helpers/useLayoutMainSearchWid';
import { imagesDetailEnv } from '../../../../services/DataService';
import { translations } from '../../../../translations/translations';
import { TextHoverCopy } from '../../../AlertCenter/AlertCenterScreen';
import { questionEnum } from '../../components/ImagesScannerDataList';
import { useAnchorItem } from '../../../../components/ComponentsLibrary/TzAnchor';

export const Env = forwardRef((props: any, ref?: any) => {
  let { title = translations.scanner_overview_envs, tagType = 'unknown' } = props;
  const [keyword, setDetailEnvSearch] = useState('');
  const setLayout = useLayoutMainSearchWid({});
  const listCompPkgs = useRef<any>(null);
  const envPathColumns = [
    {
      title: translations.variableName,
      dataIndex: 'key',
      width: '40%',
      render: (name: any, row: any) => {
        return <TextHoverCopy text={name} />;
      },
    },
    {
      title: translations.variableValue,
      dataIndex: 'value',
      render: (name: any, row: any) => {
        return <TextHoverCopy text={name} lineClamp={2} />;
      },
    },
  ];
  const reqFunDetailEnv = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = merge(
        {
          offset,
          limit: pageSize,
          keyword,
        },
        props,
      );
      return imagesDetailEnv(pageParams).pipe(
        map((res: any) => {
          let items = res.getItems();
          return {
            data: items,
            total: res.data ? res.data.totalItems : 0,
          };
        }),
      );
    },
    [props.securityPolicyIds, props.deployRecordID, keyword],
  );
  let { getPageKey } = useAnchorItem();
  return (
    <TzCard
      id={getPageKey(questionEnum.exceptionEnv)}
      title={
        <span>
          {title}
          <RenderTag type={tagType} className={'ml12 middle'} />
        </span>
      }
      extra={
        <TzInputSearch
          style={{ width: setLayout }}
          placeholder={translations.unStandard.str93}
          onSearch={(val) => {
            setDetailEnvSearch(val);
          }}
        />
      }
      className={'mt20'}
      bodyStyle={{ paddingTop: '0px' }}
    >
      <TzTableServerPage
        tableLayout={'fixed'}
        className={'nohoverTable'}
        columns={envPathColumns}
        ref={listCompPkgs}
        reqFun={reqFunDetailEnv}
      />
    </TzCard>
  );
});
