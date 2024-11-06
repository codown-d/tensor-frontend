import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TzTableServerPage } from '../../components/tz-table';
import { getHistory, getHunterStatus, getKubeHunter, startHunterScan } from '../../services/DataService';
import { map, tap } from 'rxjs/operators';
import TzInputSearch from '../../components/tz-input-search';
import { Store } from '../../services/StoreService';
import { WebResponse } from '../../definitions';
import { localLang, translations } from '../../translations/translations';
import './KubeScannerScreen.scss';
import KubeSpace from '../../components/AssetModule/KubeSpace';
import { TzButton } from '../../components/tz-button';
import { categoryTypeList, severityTypeList } from './KubeHelper';
import { Subscription } from 'rxjs';
import { FilterDropdownProps } from 'antd/lib/table/interface';
import { Tree } from 'antd';
import { Resources } from '../../Resources';
import { classNameTemp, tampTit } from '../AlertCenter/AlertCenterScreen';
import { TzTooltip } from '../../components/tz-tooltip';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import ArtTemplateDataInfo from '../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { TzCard } from '../../components/tz-card';
import { renderTableDomTemplate } from '../AlertCenter/AlertRulersScreens';

interface IProps {
  children: any;
  history: any;
}

const defPagination = {
  current: 1,
  pageSize: 10,
  hideOnSinglePage: true,
};

export function setScanTemp(str: string) {
  let severity = undefined;
  switch (str) {
    case translations.severity_Low:
      severity = 'Low';
      break;
    case 'low':
      severity = 'Low';
      break;
    case translations.severity_Medium:
      severity = 'Medium';
      break;
    case 'medium':
      severity = 'Medium';
      break;
    case translations.severity_High:
      severity = 'High';
      break;
    case 'high':
      severity = 'High';
      break;
    default:
      severity = 'Undefined';
  }
  return severity;
}

let fatchTimer: Subscription | null = null;

const RecordTableScreen = (props: { record: any; tablelistRef?: any }) => {
  let { record = {} } = props;
  let dataInfoList = useMemo(() => {
    if (!props) return [];
    let obj: any = {
      issueDetail: translations.kubeScan_recordDes + ':',
      remediation: translations.kubeScan_recordSug + ':',
      evidence: translations.kubeScan_recordEvi + ':',
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: record[item],
      };
      o['render'] = () => {
        return <EllipsisPopover lineClamp={2}>{record[item]}</EllipsisPopover>;
      };
      return o;
    });
  }, [record]);
  return renderTableDomTemplate(dataInfoList, 'details-content-large');
};

const KubeScannerScreen = (props: IProps) => {
  const selectorRef = useRef<any>();
  const tablelistRef = useRef<any>(undefined);

  const [clusterId, setCId] = useState('');
  const [search, setSearch] = useState('');
  const [hunterData, setHunterData] = useState<any>([]);
  const [scanStatus, setScanStatus] = useState<number>(0);

  const filterCategory = useMemo(() => {
    const typeList = categoryTypeList.slice(0);
    return typeList.map((t, tkey) => {
      let item: any = {
        text: localLang === 'zh' ? t.zh : t.en,
        value: localLang === 'zh' ? t.zh : t.en,
        title: localLang === 'zh' ? t.zh : t.en,
        key: '0-' + tkey,
      };
      if (t.children) {
        item.children = t.children.map((child, ckey) => {
          return {
            text: localLang === 'zh' ? child.zh : child.en,
            value: localLang === 'zh' ? child.zh : child.en,
            title: localLang === 'zh' ? child.zh : child.en,
            key: '0-' + tkey + '-' + ckey,
          };
        });
      }
      return item;
    });
  }, [localLang]);

  const filterSeverity = useMemo(() => {
    const typeList = severityTypeList.slice(0);
    return typeList.map((t) => {
      return {
        text: localLang === 'zh' ? t.zh : t.en,
        value: localLang === 'zh' ? t.zh : t.en,
      };
    });
  }, [localLang]);

  useEffect(() => {
    const fetchGetclusterID = Store.clusterID
      .pipe(
        tap((clusterID: string) => {
          setCId(clusterID);
        }),
      )
      .subscribe();
    return () => fetchGetclusterID.unsubscribe();
  }, []);

  const fatchHunter = useCallback(() => {
    if (!clusterId) {
      return;
    }
    getKubeHunter(clusterId)
      .pipe(
        tap((res: WebResponse<any>) => {
          const item = res.getItem();
          setHunterData(item);
        }),
      )
      .subscribe();
  }, [clusterId]);

  useEffect(() => {
    fatchHunter();
  }, [clusterId, fatchHunter]);

  const fatchScanStatus = useCallback(() => {
    if (!clusterId) {
      return;
    }

    fatchTimer && fatchTimer.unsubscribe();

    fatchTimer = getHunterStatus(clusterId)
      .pipe(
        tap((res: WebResponse<any>) => {
          if (res.error && res.error.code === '401') {
            fatchTimer && fatchTimer.unsubscribe();
            fatchTimer = null;
            return;
          }
          const item = res.getItem();
          setScanStatus(item?.status || 0);
          if (item?.status === 0) {
            fatchTimer && fatchTimer.unsubscribe();
            fatchTimer = null;
            tablelistRef && tablelistRef.current.refresh();
            fatchHunter();
          }
        }),
      )
      .subscribe();
  }, [clusterId, fatchHunter]);

  useEffect(() => {
    fatchScanStatus();
  }, [clusterId, fatchScanStatus]);

  const fatchStartScan = useCallback(() => {
    if (!clusterId) {
      return;
    }
    startHunterScan({ cluster: clusterId })
      .pipe(
        tap((res: WebResponse<any>) => {
          if (res.data) {
            fatchScanStatus();
          }
        }),
      )
      .subscribe();
  }, [clusterId, fatchScanStatus]);

  const expandable = useMemo(() => {
    return {
      expandedRowRender: (record: any) => {
        return <RecordTableScreen record={record} tablelistRef={tablelistRef}></RecordTableScreen>;
      },
    };
  }, [tablelistRef]);

  const reqFun = useCallback(
    (pagination, filter) => {
      const { category, severity } = filter;
      if (!clusterId || !hunterData?.cluster) {
        return getHistory().pipe(
          map(() => {
            return {
              data: [],
              total: [].length,
            };
          }),
        );
      }
      return getHistory().pipe(
        map(() => {
          const reg = new RegExp('^[\u4e00-\u9fa5]');
          const itemsZH = hunterData.vulnerabilities
            .filter((t: any) => reg.test(t.name))
            .sort((a: any, b: any) => {
              return a.name.localeCompare(b.name, 'zh');
            });
          const itemsEN = hunterData.vulnerabilities
            .filter((t: any) => !reg.test(t.name))
            .sort((a: any, b: any) => {
              return a.name.localeCompare(b.name, 'en');
            });

          const items = [...itemsEN, ...itemsZH]
            .slice(0)
            .filter((t: any) => t.name.includes(search) || t.location.includes(search) || !search)
            .filter((t: any) => !category || category.includes(t.category) || category.includes(t.subCategory))
            .filter((t: any) => !severity || severity.includes(t.severity));
          return {
            data: items,
            total: items.length,
          };
        }),
      );
    },
    [search, clusterId, hunterData],
  );

  const [checkKey, setCheckKeys] = useState<React.Key[]>([]);
  const [checkValue, setCheckValue] = useState<React.Key[]>([]);
  const [treeVisible, setTreeVisible] = useState<boolean>(false);

  const onCheck = useCallback((checkedKeys: React.Key[], info: any) => {
    const itemsSelect = info.checkedNodes.map((t: any) => {
      return t.value;
    });
    setCheckKeys(checkedKeys);
    setCheckValue(itemsSelect);
  }, []);

  const cancelSelect = useCallback((props) => {
    const { clearFilters } = props;
    clearFilters && clearFilters();
    setCheckKeys([]);
    setCheckValue([]);
  }, []);

  const treeRefresh = useCallback(
    (props) => {
      const { confirm, setSelectedKeys } = props;
      setSelectedKeys && setSelectedKeys(checkValue.slice(0));
      confirm && confirm(checkValue.slice(0));
      setTreeVisible(false);
    },
    [checkValue],
  );

  const filterTree = useCallback(
    (props: any) => {
      return (
        <div className="tree-case">
          <Tree
            checkable
            defaultExpandAll={false}
            checkedKeys={checkKey}
            onCheck={(checkedKeys: any, info) => onCheck(checkedKeys, info)}
            treeData={filterCategory}
          />
          <div className="confirm-case">
            <TzButton
              className="tree-cancel"
              type="link"
              size="small"
              disabled={!checkKey.length}
              onClick={() => cancelSelect(props)}
            >
              {translations.superAdmin_reset}
            </TzButton>
            <TzButton type="primary" className="tree-confirm" size="small" onClick={() => treeRefresh(props)}>
              {translations.pagination_sure}
            </TzButton>
          </div>
        </div>
      );
    },
    [onCheck, checkKey, confirm],
  );

  const rowKey = useCallback((item: any) => {
    return item.name;
  }, []);

  const columns = useMemo(() => {
    return [
      {
        title: translations.kubeScan_vulneName,
        dataIndex: 'name',
        key: 'name',
        width: '15%',
        ellipsis: true,
        render: (item: any) => {
          return (
            <>
              <EllipsisPopover placement="topLeft" lineClamp={2}>
                {item}
              </EllipsisPopover>
            </>
          );
        },
      },
      {
        title: translations.kubeScan_vulneType,
        dataIndex: 'category',
        key: 'category',
        filters: filterCategory,
        width: '20%',
        filterDropdownVisible: treeVisible,
        filterDropdown: (props: FilterDropdownProps) => filterTree(props),
        onFilterDropdownVisibleChange: (visible: boolean) => setTreeVisible(visible),
        render: (item: any, row: any) => {
          return (
            <>
              {item}/{row.subCategory}
            </>
          );
        },
      },
      {
        title: translations.kubeScan_location,
        dataIndex: 'location',
        key: 'location',
        ellipsis: true,
        width: '25%',
        render: (item: any) => {
          return (
            <>
              <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover>
            </>
          );
        },
      },
      {
        title: translations.kubeScan_vulneDes,
        dataIndex: 'description',
        key: 'description',
        width: '25%',
        ellipsis: true,
        render: (item: any) => {
          return (
            <>
              <EllipsisPopover lineClamp={2}>{item}</EllipsisPopover>
            </>
          );
        },
      },
      {
        title: translations.kubeScan_severity,
        dataIndex: 'severity',
        key: 'severity',
        width: 110,
        filters: filterSeverity,
        render: (item: any) => {
          return <div className={'btn-state ' + classNameTemp[setScanTemp(item)]}>{item}</div>;
        },
      },
    ];
  }, [filterCategory, filterSeverity, filterTree, treeVisible]);

  const assignTypeData = useMemo(() => {
    return [
      { type: 'server', ikey: 0, num: hunterData?.serviceCount },
      { type: 'nodes', ikey: 1, num: hunterData?.nodeCount },
      { type: 'loophole', ikey: 2, num: hunterData?.vulnerabilityCount },
    ];
  }, [hunterData]);

  return (
    <>
      <KubeSpace assignType={assignTypeData}></KubeSpace>
      <div className="kube-scanner-case mlr32">
        <div className="data-history-case mt20">
          <div className="search-input">
            <TzInputSearch onChange={(value: any) => setSearch(value)} placeholder={'Search...'} />
            <div className="">
              <span className="round-num high">{hunterData?.severities?.high || 0}</span>
              <span className="round-num medium">{hunterData?.severities?.medium || 0}</span>
              <span className="round-num low">{hunterData?.severities?.low || 0}</span>
              <TzButton
                className={'ml8'}
                disabled={!clusterId || !!scanStatus}
                onClick={() => fatchStartScan()}
                icon={<i className={'icon iconfont icon-jingxiangsaomiao-saomiaoquanbu'} />}
              >
                {!!scanStatus ? translations.kubeScan_scanning : translations.kubeScan_scann}
              </TzButton>
            </div>
          </div>
          <TzTableServerPage
            columns={columns as any}
            defaultPagination={defPagination}
            rowKey={rowKey}
            reqFun={reqFun}
            ref={tablelistRef}
            expandable={expandable}
            equalServerPageAnyway={false}
          />
        </div>
      </div>
    </>
  );
};

export default KubeScannerScreen;
