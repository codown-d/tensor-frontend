import { useMemoizedFn } from 'ahooks';
import Form, { FormInstance } from 'antd/lib/form';
import { TablePaginationConfig } from 'antd/lib/table';
import classNames from 'classnames';
import { isArray, isEqual, merge } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ArtTemplateDataInfo from '../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import TzTextArea from '../../../components/ComponentsLibrary/TzTextArea';
import { TzButton } from '../../../components/tz-button';
import { TzCard, TzCardHeaderState } from '../../../components/tz-card';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { TzInput } from '../../../components/tz-input';
import TzInputSearch from '../../../components/tz-input-search';
import { TzConfirm } from '../../../components/tz-modal';
import { TzSelect } from '../../../components/tz-select';
import { TzTable } from '../../../components/tz-table';
import { showSuccessMessage } from '../../../helpers/response-handlers';
import useLayoutMainSearchWid from '../../../helpers/useLayoutMainSearchWid';
import { Routes } from '../../../Routes';
import {
  postYamlTemplates,
  putYamlTemplates,
  yamlRules,
  yamlTemplatesDetail,
} from '../../../services/DataService';
import { Store } from '../../../services/StoreService';
import { translations } from '../../../translations/translations';
import { yamlInitTypesFilters } from '../../ImageReject/ImageNewStrategy';
import { deleteYamlTemplatesFn } from '.';
import { RenderTag } from '../../../components/tz-tag';
import { flushSync } from 'react-dom';
export const BaselineManagementInfo = (props: any) => {
  const [result] = useSearchParams();
  let [query] = useState<any>({ id: result.get('id') || '' });
  const [info, setInfo] = useState<any>(null);
  const [search, setSearch] = useState('');
  const listComp = useRef(undefined as any);
  const navigate = useNavigate();
  const l = useLocation();
  const HeaderExtra = useMemo(() => {
    return (
      <>
        <TzButton
          className="mr16"
          onClick={() => {
            navigate(Routes.YamlScanBaselineManagementEdit + `?copyId=${info.id}`, {
              replace: true,
            });
          }}
        >
          {translations.create_a_copy}
        </TzButton>
        {!info?.builtin && (
          <TzButton
            className="mr16"
            onClick={() => {
              navigate(Routes.YamlScanBaselineManagementEdit + `?id=${info.id}`, {
                replace: true,
              });
            }}
          >
            {translations.edit}
          </TzButton>
        )}
        {!info?.builtin && (
          <TzButton
            danger
            onClick={(e) => {
              deleteYamlTemplatesFn(info, () => {
                navigate(-1);
                flushSync(() => {
                  navigate(Routes.YamlScanBaselineManagement, {
                    replace: true,
                    state: { keepAlive: true },
                  });
                });
              });
            }}
          >
            {translations.delete}
          </TzButton>
        )}
      </>
    );
  }, [info]);
  let setHeader = useMemoizedFn(() => {
    Store.header.next({
      title: info?.name || translations.baseline_details,
      extra: HeaderExtra,
    });
  });
  useEffect(setHeader, [info, l]);
  const dataInfoList = useMemo(() => {
    const obj: any = {
      creator: translations.creator + '：',
      created_at: translations.clusterManage_createtime + '：',
      updater: translations.updated_by + '：',
      updated_at: translations.notificationCenter_placeEvent_updateTime + '：',
      description: translations.imageReject_comment_title + '：',
    };
    if (!info) {
      return [];
    }
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: info[item],
      };
      if (item === 'created_at' || item === 'updated_at') {
        o['render'] = () => {
          return moment(info[item]).format('YYYY-MM-DD HH:mm:ss');
        };
      }
      return o;
    });
  }, [info]);
  let getyamlTemplatesDetail = useCallback(() => {
    if (!query.id) return;
    yamlTemplatesDetail(query).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setInfo(item);
    });
  }, [query]);
  useEffect(() => {
    getyamlTemplatesDetail();
  }, [getyamlTemplatesDetail]);
  const imageColumns: any = useMemo(() => {
    return [
      {
        title: 'ID',
        dataIndex: 'builtin_id',
        width: '20%',
      },
      {
        title: translations.notificationCenter_details_name,
        dataIndex: 'name',
        width: '30%',
      },
      {
        title: translations.notificationCenter_columns_description,
        dataIndex: 'description',
      },
      {
        title: translations.scanner_detail_severity,
        dataIndex: 'severity',
        className: 'th-center',
        align: 'center',
        width: '120px',
        filters: yamlInitTypesFilters,
        onFilter: (value: string, record: any) => {
          return value.indexOf(record.severity) != -1;
        },
        render(item: string) {
          return <RenderTag type={item.toLocaleUpperCase() || 'CRITICAL'} className={'t-c'} />;
        },
      },
    ];
  }, []);
  let getDataSource = useMemo(() => {
    return info?.rules.filter(
      (item: any) => item.name.toLowerCase().indexOf(search.toLowerCase()) != -1,
    );
  }, [info, search]);
  const fitlerWid = useLayoutMainSearchWid({});
  return (
    <div className={'yaml-baseline-management-info mlr32'}>
      <TzCard
        title={translations.runtimePolicy_detail_info_title}
        className={`mb20`}
        bodyStyle={{ paddingLeft: '25px', paddingRight: '25px' }}
        headStyle={{ paddingBottom: 4 }}
      >
        <ArtTemplateDataInfo
          data={dataInfoList.slice(0, -1)}
          span={2}
          rowProps={{ gutter: [0, 0] }}
        />
        <ArtTemplateDataInfo
          className={'mb0'}
          data={dataInfoList.slice(-1)}
          span={1}
          rowProps={{ gutter: [0, 0] }}
        />
      </TzCard>
      <TzCard
        className={`mb20`}
        title={
          <div className={'flex-r-c'}>
            <TzCardHeaderState
              title={translations.detection_item}
              subText={translations.unStandard.str148(info?.rules.length)}
            />
            <TzInputSearch
              allowClear
              className={'f-r'}
              placeholder={translations.unStandard.str244}
              style={{
                width: `${fitlerWid}px`,
              }}
              onChange={(value: any) => setSearch(value)}
            />
          </div>
        }
      >
        <TzTable
          className={'nohoverTable'}
          columns={imageColumns}
          tableLayout={'fixed'}
          pagination={false}
          rowKey="builtin_id"
          dataSource={getDataSource}
          ref={listComp}
        />
      </TzCard>
    </div>
  );
};

export default BaselineManagementInfo;
