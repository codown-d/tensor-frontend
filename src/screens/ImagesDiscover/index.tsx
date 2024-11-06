import React, { useCallback, useMemo, useRef, useState } from 'react';
import { WebResponse } from '../../definitions';
import { vulnsList } from '../../services/DataService';
import { translations } from '../../translations/translations';
import ImagesDiscoverChart from './imgeDiscoverChart';
import { TzTableServerPage } from '../../components/tz-table';
import { TzTooltip } from '../../components/tz-tooltip';
import { map } from 'rxjs/operators';
import { isEqual } from '../../helpers/until';
import { RenderTag } from '../../components/tz-tag';
import { TzFilter, TzFilterForm } from '../../components/ComponentsLibrary';
import useTzFilter, { FilterContext } from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { TablePaginationConfig } from 'antd/lib/table';
import './index.scss';
import { Routes } from '../../Routes';
import { filtersRepairable } from '../ImagesScanner/components/Image-scanner-detail/ImagesScannerDetail';
import { find } from 'lodash';
import { useViewConst } from '../../helpers/use_fun';
import { PageTitle } from '../ImagesScanner/ImagesCI/CI';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { useNavigatereFresh } from '../../helpers/useNavigatereFresh';

const ImagesDiscover = () => {
  const tablelistRef = useRef<any>(undefined);
  const [filters, setFilters] = useState<any>({});
  let vulnClass = useViewConst({ constType: 'vulnClass' });
  let vulnSeverity = useViewConst({ constType: 'vulnSeverity' });
  let vulnAttackPath = useViewConst({ constType: 'vulnAttackPath' });

  const columns = useMemo((): any => {
    return [
      {
        title: translations.vulnerability_information,
        key: 'name',
        dataIndex: 'name',
        render: (item: any, row: any) => {
          return <EllipsisPopover>{item}</EllipsisPopover>;
        },
      },
      {
        title: translations.scanner_report_eventLevel,
        dataIndex: 'severity',
        align: 'center',
        render(item: string) {
          return <RenderTag type={item.toLocaleUpperCase() || 'CRITICAL'} className={'t-c'} />;
        },
      },
      {
        title: translations.attack_path,
        dataIndex: 'attackPath',
        render: (attackPath: any) => find(vulnAttackPath, (item) => item.value === attackPath + '')?.label || '-',
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
        render: (pkgVersion: any) => find(vulnClass, (item) => item.value === pkgVersion + '')?.label || '-',
      },
      {
        title: translations.whether_kernel_vulnerability,
        dataIndex: 'kernelVuln',
        render: (text: any) => {
          let node = find(filtersRepairable, (item) => item.value === text + '');
          return node?.text || text;
        },
      },
      {
        title: translations.repairable,
        dataIndex: 'canFixed',
        render: (text: any) => {
          let node = find(filtersRepairable, (item) => item.value === text + '');
          return node?.text || text;
        },
      },
    ];
  }, [vulnSeverity, vulnAttackPath, vulnClass]);
  const reqFun = useCallback(
    (pagination: TablePaginationConfig) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const params = {
        offset,
        limit: pageSize,
        ...filters,
        online: true,
      };
      return vulnsList(params).pipe(
        map((res: WebResponse<any>) => {
          const items = res.getItems();
          return {
            data: items,
            total: res?.data?.totalItems || 0,
          };
        }),
      );
    },
    [filters],
  );
  const imagesScannerScreenFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.scanner_detail_container_name,
        name: 'vulnKeyword',
        type: 'input',
        icon: 'icon-jingxiang',
      },
      {
        label: translations.scanner_report_eventLevel,
        name: 'severity',
        type: 'select',
        icon: 'icon-chengdu',
        props: {
          mode: 'multiple',
          options: vulnSeverity,
        },
      },
      {
        label: translations.attack_path,
        name: 'attackPath',
        type: 'select',
        icon: 'icon-xiangyingzhuangtai',
        props: {
          mode: 'multiple',
          options: vulnAttackPath,
        },
      },
      {
        label: translations.scanner_detail_leak_type,
        name: 'class',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          mode: 'multiple',
          options: vulnClass,
        },
      },
      {
        label: translations.whether_kernel_vulnerability,
        name: 'kernelVuln',
        type: 'select',
        icon: 'icon-celveguanli',
        props: {
          mode: 'multiple',
          options: filtersRepairable,
        },
      },
      {
        label: translations.repairable,
        name: 'canFixed',
        type: 'select',
        icon: 'icon-yunhangzhuangtai',
        props: {
          mode: 'multiple',
          options: filtersRepairable,
        },
      },
    ],
    [vulnClass, vulnSeverity, vulnAttackPath],
  );

  const data = useTzFilter({ initial: imagesScannerScreenFilter });
  const handleChange = useCallback((values: any) => {
    setFilters((prev: any) => (isEqual(values, prev) ? prev : values));
  }, []);
  let { jump } = useNavigatereFresh();
  return (
    <div className="discover-chart-wraper mlr32">
      <div className="mb24">
        <ImagesDiscoverChart />
      </div>
      <div className="img_discover_content radius8">
        <div className="mb12">
          <FilterContext.Provider value={{ ...data }}>
            <div className={'flex-r-c'}>
              <PageTitle title={translations.list_vuln} className="f16" />
              <TzFilter />
            </div>
            <TzFilterForm onChange={handleChange} />
          </FilterContext.Provider>
        </div>
        <TzTableServerPage
          columns={columns}
          rowKey={'id'}
          tableLayout={'fixed'}
          reqFun={reqFun}
          ref={tablelistRef}
          onRow={(record) => {
            return {
              onClick: () => {
                jump(Routes.ImagesDiscoverDetail + `?uniqueID=${record.uniqueID}`, 'ImagesDiscoverDetail');
              },
            };
          }}
        />
      </div>
    </div>
  );
};
export default ImagesDiscover;
