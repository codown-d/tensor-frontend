import { TablePaginationConfig } from 'antd';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { WhiteListTag } from '..';
import { TzCard } from '../../../../components/tz-card';
import { TzCheckbox } from '../../../../components/tz-checkbox';
import TzInputSearch from '../../../../components/tz-input-search';
import { TzTableServerPage } from '../../../../components/tz-table';
import { RenderTag } from '../../../../components/tz-tag';
import useLayoutMainSearchWid from '../../../../helpers/useLayoutMainSearchWid';
import { imagesDetailEnv } from '../../../../services/DataService';
import { translations } from '../../../../translations/translations';
import { questionEnum } from '../../components/ImagesScannerDataList';
import { map } from 'rxjs/operators';
import { merge } from 'lodash';
import { TextHoverCopy } from '../../../AlertCenter/AlertCenterScreen';
import { useAnchorItem } from '../../../../components/ComponentsLibrary/TzAnchor';

export const NodeTabEnvPath = forwardRef((props: any, ref?: any) => {
  let { title = translations.scanner_detail_envPath, tagType = 'unknown' } = props;
  const [exceptionEnv, setNormal] = useState<any>(true);
  const [passwdEnv, setEnvVar] = useState<any>(true);
  const [detailEnvSearch, setDetailEnvSearch] = useState('');

  const setLayout = useLayoutMainSearchWid({});
  const listCompPkgs = useRef<any>(null);
  const envPathColumns = [
    {
      title: translations.variableName,
      dataIndex: 'key',
      width: '40%',
      className: 'task-name',
      render: (name: any, row: any) => {
        let { inWhite, exception } = row.policyDetect;
        return (
          <>
            <WhiteListTag flag={inWhite} />
            <TextHoverCopy
              text={name}
              style={{ color: row.policyDetect.exception ? 'rgba(233, 84, 84, 1)' : '#3e4653' }}
            />
          </>
        );
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
          keyword: detailEnvSearch,
          exceptionEnv,
          passwdEnv,
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
    [props.imageUniqueID, props.securityPolicyIds, detailEnvSearch, exceptionEnv, passwdEnv],
  );
  useImperativeHandle(
    ref,
    () => {
      return { show: setNormal };
    },
    [],
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
      <p className="flex-r-c mb8" style={{ justifyContent: 'flex-start' }}>
        <TzCheckbox
          className={'mr24'}
          checked={exceptionEnv}
          onChange={(e) => {
            setNormal(e.target.checked);
          }}
        >
          {translations.View_exception_environment_variables_only}
        </TzCheckbox>
        <TzCheckbox
          checked={passwdEnv}
          onChange={(e) => {
            setEnvVar(e.target.checked);
          }}
        >
          {translations.unStandard.str206}
        </TzCheckbox>
      </p>
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
