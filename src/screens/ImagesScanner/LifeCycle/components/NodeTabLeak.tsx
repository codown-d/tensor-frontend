import { TablePaginationConfig, Select } from 'antd';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { leakColumnsFn, VulnDetailInfo, NodePkgsInfo } from '..';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { TzCard } from '../../../../components/tz-card';
import { TzCheckbox } from '../../../../components/tz-checkbox';
import { TzDrawerFn } from '../../../../components/tz-drawer';
import TzInputSearch from '../../../../components/tz-input-search';
import { TzSelect } from '../../../../components/tz-select';
import { TzTableServerPage } from '../../../../components/tz-table';
import { RenderTag } from '../../../../components/tz-tag';
import { SelectItem } from '../../../../definitions';
import useLayoutMainSearchWid from '../../../../helpers/useLayoutMainSearchWid';
import { detailIssueOverview, imagesDetailVulns, imagesVulnDetail } from '../../../../services/DataService';
import { translations } from '../../../../translations/translations';
import { useViewConst } from '../../../../helpers/use_fun';
import { SeverityIcon } from '../../components/Image-scanner-detail/ImagesScannerDetail';
import { questionEnum } from '../../components/ImagesScannerDataList';
import { map } from 'rxjs/operators';
import { merge } from 'lodash';
import { useAnchorItem } from '../../../../components/ComponentsLibrary/TzAnchor';
import { tabType } from '../../../../screens/ImagesScanner/ImagesScannerScreen';
import useGetTagType from './useTagTypeHook';
export interface NodeTabLeakProps {
  title: string;
  filterkey: any;
  imageFromType: tabType;
  tagType?: 'unsafe' | 'safe';
  layerDigest?: string;
  [x: string]: any;
}
export const NodeTabLeak = forwardRef((props: NodeTabLeakProps, ref?: any) => {
  let { title = translations.scanner_images_vulnerabilities, filterkey } = props;
  const [filteredValue, setFilteredValue] = useState<any>({});
  const setLayout = useLayoutMainSearchWid({});
  const [type, setVulnType] = useState('vuln');
  const [exceptionVuln, setExceptionVuln] = useState(true);
  const [keyword, setSearch] = useState('');
  const [data, setData] = useState([]);
  const listComp = useRef<any>(null);
  let imageOptions: SelectItem[] = useMemo(() => {
    let obj: any = {
      vuln: translations.scanner_detail_leakperspective,
      pkg: translations.scanner_detail_softperspective,
      frame: translations.framePerspective,
      language: translations.languagePackPerspective,
      gobinary: translations.gobinaryPerspective,
    };
    return Object.keys(obj).map((item) => {
      return {
        label: obj[item],
        value: item,
      };
    });
  }, []);
  let constView = useViewConst({ constType: 'vulnAttackPath' });
  let vulnClass = useViewConst({ constType: 'vulnClass' });

  let leakColumns = useMemo(() => {
    return leakColumnsFn(type, filteredValue, { constView, vulnClass });
  }, [type, filteredValue, constView, vulnClass]);

  const reqFunOrder = useCallback(
    (pagination: TablePaginationConfig, filters: any) => {
      setFilteredValue(filters);
      let o = Object.keys(filters).reduce((pre: any, item) => {
        pre[item] = filters[item] ? filters[item].join(',') : '';
        return pre;
      }, {});
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = merge(
        {
          offset,
          limit: pageSize,
          ...o,
          type,
          keyword,
          exceptionVuln,
        },
        props,
      );
      return imagesDetailVulns(pageParams).pipe(
        map((res: any) => {
          let items = res.getItems().map((item: any) => {
            item['uuid'] = type + '_' + Math.random();
            return item;
          });
          return {
            data: items,
            total: res.data?.totalItems,
          };
        }),
      );
    },
    [type, keyword, exceptionVuln, props.imageUniqueID, props.securityPolicyIds],
  );
  const reqFunOrderAll = useCallback(() => {
    const pageParams = merge(
      {
        type: 'vuln',
      },
      props,
    );
    return imagesDetailVulns(merge(pageParams)).subscribe((res: any) => {
      let items = res.getItems();
      setData(items);
    });
  }, [props]);
  useEffect(() => {
    reqFunOrderAll();
  }, []);
  useEffect(() => {
    if (filterkey) {
      listComp?.current &&
        listComp.current.resetFilter({
          severity: [filterkey],
        });
    }
  }, [filterkey, listComp]);
  useImperativeHandle(
    ref,
    () => {
      return { show: setExceptionVuln };
    },
    [],
  );
  let { getPageKey } = useAnchorItem();
  let { tagType } = useGetTagType({ ...props, exceptionType: questionEnum.exceptionVuln });
  return (
    <TzCard
      id={getPageKey(questionEnum.exceptionVuln)}
      className={`mt20 ${title ? '' : 'layer-table'}`}
      title={
        <span>
          {title}
          {tagType ? <RenderTag type={tagType} className={'ml12 middle'} /> : null}
        </span>
      }
      extra={
        <TzInputSearch
          value={keyword}
          style={{ width: setLayout }}
          placeholder={translations.scanner_detail_leak_search_plh}
          onSearch={setSearch}
        />
      }
      bodyStyle={{ paddingTop: '0px' }}
    >
      <div className="flex-r-c mb8" style={{ justifyContent: 'space-between' }}>
        <div>
          <span style={{ color: '#6C7480' }} className={'mr12'}>
            {translations.switching_perspectives}:
          </span>
          <TzSelect
            style={{ width: '150px' }}
            defaultValue={'vuln'}
            placeholder={translations.scanner_config_chooseImage}
            onChange={(val) => {
              setSearch('');
              setVulnType(val);
            }}
          >
            {imageOptions.map((item) => {
              return (
                <Select.Option {...item}>
                  <p style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    {' '}
                    <EllipsisPopover>{item.label}</EllipsisPopover>
                  </p>
                </Select.Option>
              );
            })}
          </TzSelect>
          <TzCheckbox
            className={'ml20'}
            checked={exceptionVuln}
            onChange={(e) => {
              setExceptionVuln(e.target.checked);
            }}
          >
            {translations.unStandard.str239}
          </TzCheckbox>
        </div>
        <div style={{ marginRight: -8 }}>{type === 'vuln' ? <SeverityIcon data={data} /> : null}</div>
      </div>
      <TzTableServerPage
        columns={leakColumns}
        onRow={
          type === 'vuln'
            ? (record) => {
                return {
                  onClick: async (event) => {
                    let dw: any = await TzDrawerFn({
                      className: 'drawer-body0',
                      title: record.name,
                      children: <VulnDetailInfo {...record} getDataFn={imagesVulnDetail} />,
                    });
                    dw.show();
                  },
                };
              }
            : undefined
        }
        expandable={
          type !== 'vuln'
            ? {
                expandedRowRender: (record) => {
                  return (
                    <NodePkgsInfo
                      imageFromType={props.imageFromType}
                      imageUniqueID={props.imageUniqueID}
                      uniqueID={record.uniqueID}
                    />
                  );
                },
              }
            : undefined
        }
        rowKey={'uuid'}
        tableLayout={'fixed'}
        ref={listComp}
        reqFun={reqFunOrder}
      />
    </TzCard>
  );
});
