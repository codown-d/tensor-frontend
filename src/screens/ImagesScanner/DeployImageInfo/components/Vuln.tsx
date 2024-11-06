import { TablePaginationConfig } from 'antd';
import { find, merge } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { map } from 'rxjs/operators';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { TzCard } from '../../../../components/tz-card';
import { TzDrawerFn } from '../../../../components/tz-drawer';
import TzInputSearch from '../../../../components/tz-input-search';
import { TzTableServerPage } from '../../../../components/tz-table';
import { RenderTag, TzTag } from '../../../../components/tz-tag';
import { TzTooltip } from '../../../../components/tz-tooltip';
import useLayoutMainSearchWid from '../../../../helpers/useLayoutMainSearchWid';
import { imagesDetailVulns, imagesVulnDetail } from '../../../../services/DataService';
import { translations } from '../../../../translations/translations';
import { useViewConst } from '../../../../helpers/use_fun';
import {
  filtersOperation,
  filtersRepairable,
  SeverityIcon,
} from '../../components/Image-scanner-detail/ImagesScannerDetail';
import { questionEnum } from '../../components/ImagesScannerDataList';
import { VulnDetailInfo, WhiteListTag } from '../../LifeCycle';
import { useAnchorItem } from '../../../../components/ComponentsLibrary/TzAnchor';

export const Vuln = (props: any, ref?: any) => {
  let { title = translations.scanner_images_vulnerabilities, tagType = 'unknown' } = props;
  const [filteredValue, setFilteredValue] = useState<any>({});
  const setLayout = useLayoutMainSearchWid({});
  const [keyword, setSearch] = useState('');
  const [data, setData] = useState([]);
  const listComp = useRef<any>(null);
  let constView = useViewConst({ constType: 'vulnAttackPath' });
  let vulnClass = useViewConst({ constType: 'vulnClass' });
  let leakColumns = useMemo(() => {
    return [
      {
        title: translations.vulnerability_information,
        dataIndex: 'name',
        key: 'name',
        className: 'task-name',
        render(item: any, row: any) {
          let inWhite = row.policyDetect.inWhite;
          return (
            <div>
              <WhiteListTag flag={inWhite} />
              <p
                style={{
                  wordBreak: 'break-all',
                  color: '#3e4653',
                }}
              >
                {item}
              </p>
              <TzTag className={'ant-tag-gray small'} style={{ maxWidth: '100%' }}>
                <EllipsisPopover>
                  {translations.runtimePolicy_container_path}：{row.target || '-'}
                </EllipsisPopover>
              </TzTag>
            </div>
          );
        },
      },
      {
        title: translations.kubeScan_severity,
        dataIndex: 'severity',
        filters: filtersOperation,
        filteredValue: filteredValue.severity || null,
        className: 'th-center',
        align: 'center',
        render(item: any) {
          return <RenderTag type={item || 'CRITICAL'} className={'t-c'} />;
        },
      },
      {
        title: translations.pkg_info,
        dataIndex: 'pkgName',
        key: 'pkgName',
        render(pkgName: any, _row: any) {
          return (
            <span style={{ wordBreak: 'break-all' }}>
              {pkgName}
              <br />
              <span style={{ color: '#6C7480' }}>({_row.pkgVersion})</span>
            </span>
          );
        },
      },
      {
        title: translations.attack_path,
        dataIndex: 'attackPath',
        filters: constView,
        filteredValue: filteredValue.attackPath || null,
        render(attackPath: any, _row: any) {
          let node = constView.find((item) => {
            return item.value === attackPath;
          });
          return <span>{node?.label}</span>;
        },
      },
      {
        title: (
          <span className="flex-r-c" style={{ justifyContent: 'flex-start' }}>
            {translations.scanner_detail_leak_type}
            <TzTooltip title={translations.unStandard.str94}>
              <i className={'icon iconfont icon-wenhao ml4'}></i>
            </TzTooltip>
          </span>
        ),
        dataIndex: 'class',
        filters: vulnClass,
        render: (pkgVersion: any) => find(vulnClass, (item) => item.value === pkgVersion + '')?.label || '-',
      },
      {
        title: translations.kernel_vulnerability,
        dataIndex: 'kernelVuln',
        filters: filtersRepairable,
        filteredValue: filteredValue.kernelVuln || null,
        className: 'th-center',
        width: '14%',
        align: 'center',
        render: (text: any) => {
          let node = find(filtersRepairable, (item) => item.value === text + '');
          return node?.text || text;
        },
      },
      {
        title: translations.repairable,
        dataIndex: 'canFixed',
        align: 'center',
        className: 'th-center',
        filters: filtersRepairable,
        filteredValue: filteredValue.canFixed || null,
        render: (text: any) => {
          let node = find(filtersRepairable, (item) => item.value === text + '');
          return <span className="pr12">{node?.text || text}</span>;
        },
      },
    ];
  }, [filteredValue, constView, vulnClass]);

  const reqFunOrder = useCallback(
    (pagination: TablePaginationConfig, filters: any) => {
      setFilteredValue(filters);
      let o = Object.keys(filters).reduce((pre: any, item) => {
        pre[item] = filters[item] ? filters[item].join(',') : '';
        return pre;
      }, {});
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = merge({
        offset,
        limit: pageSize,
        ...o,
        ...props,
        type: 'vuln',
        keyword,
      });
      return imagesDetailVulns(pageParams).pipe(
        map((res: any) => {
          let items = res.getItems();
          return {
            data: items,
            total: res.data?.totalItems,
          };
        }),
      );
    },
    [keyword, props.deployRecordID, props.securityPolicyIds],
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
  let { getPageKey } = useAnchorItem();
  return (
    <TzCard
      id={getPageKey(questionEnum.exceptionVuln)}
      className={`mt20 ${title ? '' : 'layer-table'}`}
      title={
        <span>
          {title}
          <RenderTag type={tagType} className={'ml12 middle'} />
        </span>
      }
      extra={
        <div className="flex-r-c">
          <SeverityIcon data={data} />
          <TzInputSearch
            value={keyword}
            style={{ width: setLayout }}
            placeholder={translations.scanner_detail_leak_search_plh}
            onSearch={setSearch}
          />
        </div>
      }
      bodyStyle={{ paddingTop: '0px' }}
    >
      <TzTableServerPage
        columns={leakColumns as any}
        onRow={(record) => {
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
        }}
        rowKey={'uuid'}
        tableLayout={'fixed'}
        ref={listComp}
        reqFun={reqFunOrder}
      />
    </TzCard>
  );
};
