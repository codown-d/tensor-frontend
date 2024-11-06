import { Anchor, Form, Popconfirm } from 'antd';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { TzButton } from '../../components/tz-button';
import { TzCard } from '../../components/tz-card';
import { TzCheckbox, TzCheckboxGroup } from '../../components/tz-checkbox';
import { TzInput } from '../../components/tz-input';
import TzInputSearch from '../../components/tz-input-search';
import { TzInputTextArea } from '../../components/tz-input-textarea';
import { TzConfirm } from '../../components/tz-modal';
import { TzSwitch } from '../../components/tz-switch';
import { TzTable } from '../../components/tz-table';
import { TzTag } from '../../components/tz-tag';
import { formatGeneralTime, WebResponse } from '../../definitions';
import {
  checkExpr,
  delWhiteList,
  eventDetail,
  getScopeKind,
  getWhiteListDetail,
  holaRules,
  palaceRules,
  palaceSignals,
  signalDetail,
  submitWhiteList,
  whitelistContext,
} from '../../services/DataService';
import { Store } from '../../services/StoreService';
import { tap } from 'rxjs/operators';
import './WhiteListPolicyDetail.scss';
import { TzDrawerFn } from '../../components/tz-drawer';
import { TzForm, TzFormItem } from '../../components/tz-form';
import { TzSelect, TzSelectNormal } from '../../components/tz-select';
import { getSeverityTag, setTemp, tampTit, TzTableTzTdInfo } from './AlertCenterScreen';
import { Routes } from '../../Routes';
import { useLocation, useMatch, useMatches, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { showFailedMessage, showSuccessMessage } from '../../helpers/response-handlers';
import classNames from 'classnames';
import { localLang, translations } from '../../translations/translations';
import AddInfoBtn from '../../components/ComponentsLibrary/AddInfoBtn';
import { isArray, isUndefined, merge, remove, trim, uniq } from 'lodash';
import { severityFilters } from './EventData';
import TzPopconfirm from '../../components/ComponentsLibrary/TzPopconfirm';
import TzTextArea from '../../components/ComponentsLibrary/TzTextArea';
import { TzCol, TzRow } from '../../components/tz-row-col';
import { mergeWithId } from '../../helpers/until';
import { PageTitle } from '../ImagesScanner/ImagesCI/CI';
import { TzPaginationOther } from '../../components/ComponentsLibrary/TzPagination';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import ArtTemplateDataInfo from '../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { TRecords } from './component/whitePolicyConfig/interface';
import EffectObjectPopup from './component/whitePolicyConfig/EffectObjectPopup';
import { useMemoizedFn } from 'ahooks';
import { flushSync } from 'react-dom';
interface IProps {
  children?: any;
  match?: any;
  history?: any;
  breadcrumb: { children: string; href?: string }[];
}
export const allowWhitelist = ['ATT&CK', 'Watson', 'DriftPrevention', 'imageSecurity'];
export const getAllowWhitelist = (key: any) => {
  let f = false;
  if (isArray(key)) {
    while (key.length && !f) {
      f = allowWhitelist.some((item) => {
        let it = key.pop();
        return allowWhitelist.includes(it);
      });
    }
  } else {
    f = allowWhitelist.includes(key);
  }
  return f;
};
export let tagObjs: any = {
  enabled: {
    label: translations.superAdmin_loginLdapConfig_enable,
    style: {
      color: 'rgba(33, 119, 209, 1)',
      background: 'rgba(33, 119, 209, 0.05)',
    },
  },
  disabled: {
    label: translations.deflectDefense_disabled,
    style: {
      color: 'rgba(142, 151, 163, 1)',
      background: 'rgba(142, 151, 163, 0.05)',
    },
  },
};

const labelKeys: any = {
  scene: translations.object_type,
  cluster: translations.compliances_cronjobs_selectCluster,
  hostname: translations.vulnerabilityDetails_nodeName,
  namespace: translations.scanner_listColumns_namespace,
  resource: translations.resources,
  pod: 'Pod',
  container: translations.onlineVulnerability_innerShapeMeaning,
  registry: translations.library,
  repo: translations.scanner_detail_image + 'repo',
  tag: translations.image_tag,
};
const searchval: any = {
  scene: '',
  cluster: '',
  hostname: '',
  namespace: '',
  resource: '',
  pod: '',
  container: '',
  registry: '',
  repo: '',
  tag: '',
};
interface SProps {
  objs: any;
}

let addObjs = {};
const ScopeConfirm = (props: SProps) => {
  const { objs } = props;
  const [list, setList] = useState([]);
  const [all, setAll] = useState(false);
  const [sel, setSel] = useState<any>([]);

  useEffect(() => {
    getScopeKind('scene', { keyword: '' })
      .pipe(
        tap((res: any) => {
          const items = res.getItems();
          setList(items);
        }),
      )
      .subscribe();
  }, []);

  const reportContentOpts = useMemo(() => {
    return list.map((t: any) => {
      return {
        ...t,
        label: t.name,
        value: t.id,
      };
    });
  }, [list]);

  const TagsDom = useMemo(() => {
    return Object.keys(objs).map((t) => {
      const ct = objs[t].map((c: any) => {
        return c.name;
      });
      return (
        <TzTag
          style={{
            maxWidth: '100%',
          }}
          className="ofh"
        >{`${labelKeys[t]}：${ct.join(' , ')}`}</TzTag>
      );
    });
  }, [objs]);

  const txtScene = useMemo(() => {
    if (!list.length) return;
    const i = list.map((t: any) => t.name);
    return ` 对象范围包含${i.join('、')}，请确认白名单范围`;
  }, [list]);

  useEffect(() => {
    if (all) {
      addObjs = {
        scene: list,
      };
      return;
    }
    const items = list.filter((t: any) => !!sel.includes(t?.id));
    addObjs = {
      scene: items,
    };
  }, [sel, list, all]);
  return (
    <div className="df dfdc scope-confirm-group">
      <div className="tags-case">{TagsDom}</div>
      <span className="txt-des">{txtScene}</span>
      <div className="mt12 mb-4">
        <TzCheckbox
          checked={all}
          onChange={(e) => {
            setAll(e.target.checked);
          }}
        >
          {translations.all_alarms}
        </TzCheckbox>
        <TzCheckboxGroup
          className="df dfdc"
          disabled={all}
          value={sel}
          options={reportContentOpts}
          onChange={(val) => {
            setSel(val);
          }}
        />
      </div>
    </div>
  );
};

const scopeKinds = [
  {
    label: translations.object_type,
    value: 'scene',
  },
  {
    label: translations.compliances_cronjobs_selectCluster,
    value: 'cluster',
  },
  {
    label: translations.vulnerabilityDetails_nodeName,
    value: 'hostname',
  },
  {
    label: translations.scanner_listColumns_namespace,
    value: 'namespace',
  },
  {
    label: translations.resources,
    value: 'resource',
  },
  {
    label: 'Pod',
    value: 'pod',
  },
  {
    label: translations.commonpro_Container,
    value: 'container',
  },
  {
    label: translations.library,
    value: 'registry',
  },
  {
    label: translations.scanner_detail_image,
    value: 'repo',
  },
  {
    label: translations.image_tag,
    value: 'tag',
  },
];
let dw: any;
interface AProps {
  submit: (data: any, key: string, i?: number) => void;
  i?: number;
  row?: any;
}
export const AddEffectiveScopes = (props: AProps) => {
  const [sel, setSel] = useState<any[]>([]);
  const [fnData, setFnData] = useState<any>({});
  const [fnDataSearch, setFnDataSearch] = useState<any>({});
  const [fnDataStatus, setFnDataStatus] = useState<any>({});
  const [searchKey, setSearchKey] = useState<any>(searchval);
  const [selAll, setSelAll] = useState<boolean>(false);
  const [saveData, setSaveData] = useState<any>({});
  const setOptDataFn = useCallback(
    (data, k?: string) => {
      let objs = Object.assign({}, data);
      let add: any[] = [];
      if (k && saveData[k]?.length) {
        saveData[k].map((t: any) => {
          // 判断已有的选项中是否存在传入的选中的值
          if (objs[k]?.length) {
            let resArr = objs[k].filter((f: any) => f.id === t.id && f.name === t.name);
            if (resArr.length === 0) {
              add.push(t);
            }
          }
          return t;
        });
        objs[k] = [...add, ...objs[k]];
      }
      if (k && !searchKey[k]) {
        setFnData((pre: any) => {
          return Object.assign({}, pre, objs);
        });
      }
      setFnDataSearch((pre: any) => {
        return Object.assign({}, pre, objs);
      });
    },
    [saveData, searchKey],
  );

  const disFn = useCallback(
    (d) => {
      let obj = fnData;
      if (!d && !obj?.scene) return;
      obj.scene = (obj?.scene || []).map((t: any) => {
        if (t.id === 'all') {
          return t;
        }
        return Object.assign(t, {
          disabled: d,
        });
      });
      setOptDataFn(obj);
    },
    [fnData, setOptDataFn],
  );

  const setSaveDataFn = useCallback((data) => {
    setSaveData((pre: any) => {
      return Object.assign({}, pre, data);
    });
  }, []);

  const fnKindData = useCallback(
    (k, obj?: any) => {
      getScopeKind(k, { keyword: obj ? obj[k] : searchKey[k] })
        .pipe(
          tap((res: any) => {
            if (res.data) {
              let items = res.getItems().map((t: any, k: any) => {
                let obj = {
                  ...t,
                  value: t.name + t.id,
                  title: t.name,
                  label: t.name,
                  disabled: false,
                  key: `${t.name}_${k}`,
                };
                return obj;
              });
              if (k === 'scene') {
                items.unshift({
                  id: 'all',
                  key: `all`,
                  name: translations.scanner_images_all,
                  value: 'all',
                  title: translations.scanner_images_all,
                  label: translations.scanner_images_all,
                });
              }
              setOptDataFn({ [k]: items }, k);
              setFnDataStatus((pre: any) => {
                let obj = Object.assign({}, pre, { [k]: 'ok' });
                return obj;
              });
            }
          }),
        )
        .subscribe();
    },
    [setOptDataFn, searchKey],
  );

  const SelDom = useMemo(() => {
    return sel.slice(0).map((t) => {
      return (
        <TzFormItem label={`${labelKeys[t]}：`}>
          <TzSelectNormal
            showSearch
            disabled={!fnData[t]?.length}
            allowClear
            mode="multiple"
            placeholder={`${translations.superAdmin_loginLdapConfig_selectPlaPrefix}${labelKeys[t]}`}
            options={searchKey[t] ? fnDataSearch[t] : fnData[t]}
            value={saveData[t]}
            onSearch={(val) => {
              setSearchKey((pre: any) => {
                let obj = Object.assign({}, pre, {
                  [t]: val,
                });
                fnKindData(t, obj);
                return obj;
              });
              // fnKindData(t);
              return val;
            }}
            onChange={(val, obj) => {
              if (t === 'scene' && val.includes('all')) {
                let objAll = fnData[t].slice(0, 1);
                setSelAll(true);
                disFn(true);
                setSaveDataFn({ [t]: objAll });
              } else {
                if (selAll) {
                  disFn(false);
                  setSelAll(false);
                }
                setSaveDataFn({ [t]: obj });
              }
            }}
          />
        </TzFormItem>
      );
    });
  }, [fnData, fnDataSearch, saveData, sel, selAll, fnKindData, disFn]);

  useEffect(() => {
    if (!sel.length) return;
    for (const s of sel) {
      if (!fnDataStatus?.[s] || fnDataStatus?.[s] === 'fulfilled') {
        setFnDataStatus((pre: any) => {
          let obj = Object.assign({}, pre, { [s]: 'padding' });
          fnKindData(s);
          return obj;
        });
      }
      // fnData[s] || fnKindData(s);
    }
  }, [sel, fnDataStatus]);

  useEffect(() => {
    if (props.row) {
      const keys = Object.keys(props.row);
      let _data: any = {};
      keys.map((t) => {
        _data[t] = props.row[t].map((r: any, i: number) => {
          return {
            children: r.name,
            id: r.id,
            key: `${r.name}_${i}`,
            label: r.name,
            name: r.name,
            title: r.name,
            value: r.name + r.id,
            disabled: false,
          };
        });
        return t;
      });
      setSel(keys);
      setSaveData(_data);
    }
  }, [props.row]);

  const btnSubmit = useCallback(() => {
    let objs: any = {};
    sel.map((t: string) => {
      saveData[t]?.length &&
        (objs[t] = saveData[t].map((f: any) => {
          return {
            id: f.id,
            name: f.name,
          };
        }));
      return t;
    });
    if (objs['scene'] && objs['scene'].length === 1 && objs['scene'][0].id === 'all') {
      objs['scene'] = fnData['scene']
        .map((s: any) => {
          if (s.id === 'all') return null;

          return {
            id: s.id,
            name: s.name,
          };
        })
        .filter((l: any) => !!l);
    }
    const operate = props.i === undefined ? 'add' : 'edit';
    if (
      (objs.hostname && objs.cluster && Object.keys(saveData).length === 2) ||
      (objs.hostname && Object.keys(saveData).length === 1)
    ) {
      TzConfirm({
        title: translations.white_list_range_confirmation,
        content: <ScopeConfirm objs={objs} />,
        cancelText: translations.cancel,
        style: { width: 'auto' },
        okText: translations.submit,
        onOk: () => {
          objs = Object.assign(addObjs, objs);
          props.submit(objs, operate, props.i);
          dw && dw.hiden();
        },
      });
      return;
    }
    props.submit(objs, operate, props.i);
    dw && dw.hiden();
  }, [saveData, props.submit, props.i, sel, fnData]);

  return (
    <div className="scopes-sel-group mt8">
      <TzForm>
        <TzFormItem label={translations.object_scope + '：'}>
          <TzCheckboxGroup
            className="boxs-group"
            options={scopeKinds}
            value={sel}
            // defaultValue={sel}
            onChange={(val) => setSel(val)}
          />
        </TzFormItem>
        {SelDom}
        {!!sel.length && (
          <TzFormItem>
            <div className="dfc mt8">
              <TzButton
                className="mr24"
                onClick={(e) => {
                  e.stopPropagation();
                  dw && dw.hiden();
                }}
              >
                {translations.cancel}
              </TzButton>
              <TzButton
                type="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  btnSubmit();
                }}
              >
                {props?.i === undefined ? translations.add : translations.save}
              </TzButton>
            </div>
          </TzFormItem>
        )}
      </TzForm>
    </div>
  );
};
let getTitle = (key: any) => {
  let obj: any = {
    'ATT&CK': 'ATT&CK',
    Watson: translations.activeDefense_title,
    DriftPrevention: translations.deflectDefense_title,
    imageSecurity: translations.imageSecurity,
  };
  return obj[key];
};
export let RuleListDom = forwardRef((props: any, ref: any) => {
  let { rulesRes } = props;
  const [search, setSearch] = useState('');
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>({
    'ATT&CK': [],
    Watson: [],
    DriftPrevention: [],
    imageSecurity: [],
  });
  let newRulesRes = useMemo(() => {
    return [...rulesRes].map((item: any) => {
      let children: any[] = [];
      item['children'].forEach((e: any) => {
        if (props.selectedRowKeys[item.key]?.includes(e.key)) {
          children.unshift(e);
        } else {
          children.push(e);
        }
      });
      return Object.assign({}, item, { children });
    });
  }, [rulesRes, props.selectedRowKeys]);
  let getColumnsRule = useCallback((k) => {
    let key = ((k) => {
      return k;
    })(k);
    let pTitle = getTitle(key);
    let items: any = [
      {
        title: translations.originalWarning_rule,
        dataIndex: 'tag',
        key: 'tag',
        render(item: any, row: any) {
          return item ? `${item}/${pTitle}` : pTitle;
        },
      },
      {
        title: translations.notificationCenter_details_name,
        dataIndex: 'title',
        key: 'title',
        render(item: any, row: any) {
          k = row.pKey;
          return <>{item}</>;
        },
      },
      {
        title: translations.scanner_detail_severity,
        dataIndex: 'severity',
        key: 'severity',
        width: '100px',
        className: 'th-center',
        align: 'center',
        filters: severityFilters,
        onFilter: (value: string, record: any) => {
          return value.indexOf(record.severity) != -1;
        },
        render(item: any) {
          let type = setTemp(item);
          let str = tampTit[type];
          return <span className={`btn-state btn-${type.toLowerCase()}`}> {str} </span>;
        },
      },
    ];
    if (key === 'ATT&CK' || key === 'Watson') {
      items.push({
        title: translations.needEmergencyHandle,
        dataIndex: 'urgency',
        key: 'urgency',
        width: localLang == 'en' ? '100px' : '150px',
        align: 'center',
        filters: [
          { text: translations.yes, value: translations.yes },
          { text: translations.no, value: translations.no },
        ],
        onFilter: (value: string, record: any) => {
          return record.urgency == value;
        },
        render(item: any) {
          return (
            <span
              style={{
                color: `${item === translations.yes ? '#E95454' : '#3E4653'}`,
                paddingRight: '15px',
              }}
            >
              {item}
            </span>
          );
        },
      });
    }
    return items;
  }, []);
  const LinkRulesDom = useMemo(() => {
    if (!rulesRes.length) return null;
    const { Link } = Anchor;
    return (
      <Anchor
        affix={false}
        className="tz-anchor hasMessage"
        showInkInFixed
        onClick={(e: React.MouseEvent<HTMLElement>, link: any) => {
          e.preventDefault();
        }}
        getContainer={() => {
          return document.getElementById('tableCase_1') || window;
        }}
      >
        {rulesRes.map((t: any) => {
          let { key, title } = t;
          return (
            <Link
              href={`#${key}_1`}
              title={
                <div className="df dfac dfjb" style={{ width: '100%' }}>
                  <span className="tit-txt">{title}</span>
                  {selectedRowKeys[key]?.length ? (
                    <span className="round-pup mr4">{selectedRowKeys[key]?.length}</span>
                  ) : null}
                </div>
              }
            />
          );
        })}
      </Anchor>
    );
  }, [newRulesRes, selectedRowKeys]);
  let rulesResData = useMemo(() => {
    return [...newRulesRes].map((item: any) => {
      let children = item['children'].filter((ite: { title: string | string[]; tag: string | string[] }) => {
        return !search || ite.title.indexOf(search) != -1 || ite.tag.indexOf(search) != -1;
      });
      return Object.assign({}, item, { children });
    });
  }, [search, newRulesRes]);
  let getRowSelection = useCallback(
    (key) => {
      return {
        selectedRowKeys: selectedRowKeys[key],
        onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
          setSelectedRowKeys((pre: any) => {
            return Object.assign({}, pre, { [key]: uniq(pre[key].concat(selectedRowKeys)) });
          });
        },
        onSelect: (record: any, selected: any, selectedRows: any) => {
          setSelectedRowKeys((pre: any) => {
            if (!selected) {
              remove(pre[key], (it: any) => {
                return it == record.key;
              });
              pre[key] = [...pre[key]];
            }
            return Object.assign({}, pre);
          });
        },
        onSelectAll: (selected: any, selectedRows: any, changeRows: any) => {
          setSelectedRowKeys((pre: any) => {
            if (!selected) {
              let node = rulesResData.filter((item) => item.key === key).pop();
              node.children.forEach((element: { key: any }) => {
                remove(pre[key], (it: any) => {
                  return it == element.key;
                });
              });
              pre[key] = [...pre[key]];
            }
            return Object.assign({}, pre);
          });
        },
      };
    },
    [selectedRowKeys, rulesResData],
  );
  const TableRulesDom = useMemo(() => {
    let doms = rulesResData.map((t: any) => {
      return (
        <div id={`${t.key}_1`}>
          <TzTable
            className={'nohoverTable'}
            rowSelection={getRowSelection(t.key)}
            dataSource={t.children || []}
            pagination={false}
            onRow={(record) => {
              return {
                onClick: (event) => {
                  setSelectedRowKeys((pre: any) => {
                    let keyList = pre[t.key];
                    if (keyList.includes(record.key)) {
                      remove(keyList, (it: any) => {
                        return it == record.key;
                      });
                      return Object.assign({}, pre, { [t.key]: [...keyList] });
                    } else {
                      return Object.assign({}, pre, {
                        [t.key]: [...keyList, record.key],
                      });
                    }
                  });
                },
              };
            }}
            sticky={true}
            rowKey={'key'}
            columns={getColumnsRule(t.key)}
          />
        </div>
      );
    });
    return doms;
  }, [getColumnsRule, getRowSelection, rulesResData]);
  let getIndeterminate = useMemo(() => {
    let len1 = Object.values(selectedRowKeys).reduce((pre, item: any) => {
      return (pre += item.length);
    }, 0);
    let len2 = newRulesRes.reduce((pre: any, item: any) => {
      return (pre += item.children.length);
    }, 0);
    if (len1 == len2 && len2 != 0) {
      setCheckboxValue(true);
    } else {
      setCheckboxValue(false);
    }
    return !len1 ? undefined : len1 != len2;
  }, [selectedRowKeys, newRulesRes]);
  useEffect(() => {
    setSelectedRowKeys((pre: any) => Object.assign({}, pre, props.selectedRowKeys));
  }, [props.selectedRowKeys]);
  useImperativeHandle(ref, () => {
    return {
      getSelectedRowKeys() {
        return selectedRowKeys;
      },
      getCheckboxValue() {
        return checkboxValue;
      },
    };
  }, [selectedRowKeys]);
  return (
    <div className="rules-group">
      <div className="rule-menu-group">
        <div className="rule-type-group df dfac dfjb">
          <span className="title">{translations.originalWarning_rule}</span>
          <span>
            <TzCheckbox
              checked={checkboxValue}
              indeterminate={getIndeterminate}
              onChange={(e) => {
                if (e.target.checked) {
                  let a = rulesRes.find((item: { key: string }) => item.key === 'ATT&CK') || {
                    children: [],
                  };
                  let Watson = rulesRes.find((item: { key: string }) => item.key === 'Watson') || {
                    children: [],
                  };
                  let DriftPrevention = rulesRes.find((item: { key: string }) => item.key === 'DriftPrevention') || {
                    children: [],
                  };
                  let imageSecurity = rulesRes.find((item: { key: string }) => item.key === 'imageSecurity') || {
                    children: [],
                  };
                  setSelectedRowKeys(() => {
                    return {
                      'ATT&CK': a['children'].map((item: any) => {
                        return item.key;
                      }),
                      Watson: Watson['children'].map((item: any) => {
                        return item.key;
                      }),
                      DriftPrevention: DriftPrevention['children'].map((item: any) => {
                        return item.key;
                      }),
                      imageSecurity: imageSecurity['children'].map((item: any) => {
                        return item.key;
                      }),
                    };
                  });
                } else {
                  setSelectedRowKeys({
                    'ATT&CK': [],
                    Watson: [],
                    DriftPrevention: [],
                    imageSecurity: [],
                  });
                }
              }}
            >
              <span>{translations.onlineVulnerability_filters_selectAll}</span>
            </TzCheckbox>
          </span>
        </div>
        <div className="menu-case" style={{ flex: '1' }}>
          {LinkRulesDom}
        </div>
      </div>
      <div className="rule-content-group">
        <div className="rule-type-group df dfac dfjb">
          <span className="title">{translations.rule_list}</span>
          <TzInputSearch
            style={{ width: '30%' }}
            placeholder={translations.unStandard.str35}
            onChange={(val: any) => setSearch(val)}
          />
        </div>
        <div className="table-list-group" id="tableCase_1">
          {TableRulesDom}
        </div>
      </div>
    </div>
  );
});
export let InfoDetail = (props: any) => {
  let { type = 'event', ids = [] } = props;
  let [info, setInfo] = useState<any>({});
  let [token, setToken] = useState<any>({});
  let [signalInfo, setSignalInfo] = useState<any>(null);
  let [expand, setExpand] = useState<any>(false);
  let [tokenIndex, setTokenIndex] = useState(1);
  let [showInfo, setShowInfo] = useState(false);
  let [contextList, setContextList] = useState<any>({});
  let dataInfoList = useMemo(() => {
    if (!info || !info['context']) return [];
    return Object.keys(info['context']).map((item) => {
      let o: any = {
        title: (contextList[item] || item) + '：',
        content: info.context[item] || '-',
      };
      return o;
    });
  }, [info, contextList]);
  let signalDetailList = useMemo(() => {
    if (!signalInfo || !signalInfo['context']) return [];
    return Object.keys(signalInfo['context']).map((item) => {
      let o: any = {
        title: (contextList[item] || item) + '：',
        content: signalInfo.context[item] || '-',
      };
      return o;
    });
  }, [signalInfo, contextList]);
  let signalsCount: any = useMemo(() => {
    return info['signalsCount']
      ? Object.values(info.signalsCount).reduce((pre, item: any) => {
          return pre + item;
        }, 0)
      : 0;
  }, [info]);
  let getInfo = useCallback(
    (index = 1) => {
      let fn = type === 'event' ? eventDetail : signalDetail;
      let id = ids[index - 1];
      id &&
        fn({ id }).subscribe((res) => {
          let item = res.getItem();
          item && setInfo(item);
        });
    },
    [ids, type],
  );
  let getPalaceSignalsId = useCallback(
    (tokenIndex = 1) => {
      let params = {
        query: {
          eventID: info.id,
          createdAt: null,
        },
        page: { limit: 1, offset: 0, token: token[tokenIndex - 1] || '' },
      };
      palaceSignals(params).subscribe((res: any) => {
        if (res.erroe) return;
        const items = res.getItems();
        if (!items.length) return;
        setToken((pre: any) => merge({}, pre, { [tokenIndex]: res.data.pageToken }));
        getSignalDetail(items[0].id);
      });
    },
    [info, token],
  );
  let getSignalDetail = useCallback(
    (id) => {
      signalDetail({ id }).subscribe((res: any) => {
        let item = res.getItem();
        setSignalInfo(item);
      });
    },
    [props],
  );
  useEffect(() => {
    getInfo();
    holaRules({ domain: 'signal.context', type: 'key' }).subscribe((res) => {
      let item = res.getItem() || {};
      setContextList(merge({}, item, {}));
    });
  }, []);
  useEffect(() => {
    if (showInfo && document.body.clientWidth < 1640 && Store.policyDetail.value.type) {
      $('.magnetic-stickers').parents('.ant-modal-wrap').addClass('modal-t-r');
    } else {
      $('.magnetic-stickers').parents('.ant-modal-wrap').removeClass('modal-t-r');
    }
  }, [showInfo]);
  return (
    <>
      <div
        className={`magnetic-stickers ${showInfo ? 'onhover' : ''} ${localLang}`}
        onClick={() => {
          info['id'] && setShowInfo((pre) => !pre);
        }}
      >
        {showInfo && (
          <div
            className={'p-a'}
            style={{ right: 0, zIndex: 8 }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className={'info-detail'}>
              <div className={'content'}>
                <PageTitle
                  className={'mb8 f14'}
                  style={{ color: '#3E4653' }}
                  title={type === 'event' ? translations.whitelist_event_details : translations.whitelist_alert_details}
                  extra={
                    <>
                      {ids.length !== 1 ? (
                        <TzPaginationOther className={'info-pagination'} total={ids.length} onChange={getInfo} />
                      ) : null}
                      <i
                        className={'icon iconfont icon-close f24'}
                        onClick={() => {
                          setShowInfo((pre) => !pre);
                        }}
                      ></i>
                    </>
                  }
                />
                <ArtTemplateDataInfo
                  className={'magnetic-stickers-data-info noScrollbar f12 small'}
                  style={{
                    maxHeight: '180px',
                  }}
                  data={dataInfoList}
                  span={1}
                  rowProps={{ gutter: [0, 0] }}
                />
                {type === 'event' ? (
                  <span
                    className={'expand-icon f12'}
                    onClick={() => {
                      setExpand((pre: any) => {
                        !pre && getPalaceSignalsId(tokenIndex);
                        return !pre;
                      });
                    }}
                  >
                    {expand ? translations.collapse_alarms : translations.expand_the_alarm}
                    <i
                      className={'icon iconfont icon-arrow-double ml4 f-r'}
                      style={{
                        transform: expand ? 'rotate(180deg)' : 'rotate(0deg)',
                        marginTop: '-1px',
                      }}
                    ></i>
                  </span>
                ) : null}
              </div>
              {expand ? (
                <div style={{ overflow: 'hidden', borderRadius: '8px' }}>
                  <div
                    className={'content'}
                    style={{
                      borderTop: '2px dashed #A9B0BA',
                      borderRadius: '0px',
                    }}
                  >
                    <PageTitle
                      style={{ alignItems: 'flex-start' }}
                      title={
                        <span
                          style={{
                            textAlign: 'left',
                            lineHeight: '24px',
                            color: '#3E4653',
                            fontWeight: 400,
                          }}
                          className={'f14'}
                        >
                          <span className={'mr8'}>{signalInfo?.ruleDetail?.name}</span>
                          {getSeverityTag(signalInfo?.severity, 'small')}
                        </span>
                      }
                      extra={
                        <>
                          {signalsCount ? (
                            <TzPaginationOther
                              className={'info-pagination'}
                              total={signalsCount}
                              onChange={(current) => {
                                setTokenIndex(current);
                                getPalaceSignalsId(current);
                              }}
                            />
                          ) : null}
                        </>
                      }
                    />
                    <div
                      ref={(node) => {
                        let wh = window.innerHeight;
                        let top = $(node).offset()?.top || 0;
                        $(node).css({
                          'max-height': `${wh - top - 20 - 12}px`,
                        });
                      }}
                      className={'noScrollbar'}
                    >
                      {signalInfo && <TzTableTzTdInfo {...signalInfo} t={'detail'} />}
                      <PageTitle
                        className={'f12 mt8 mb4'}
                        style={{ color: '#3E4653', lineHeight: '20px' }}
                        title={translations.whitelist_alert_details}
                      />
                      <ArtTemplateDataInfo
                        className={'magnetic-stickers-data-info f12 small'}
                        data={signalDetailList}
                        span={1}
                        rowProps={{ gutter: [0, 0] }}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
        {type === 'event' ? translations.event_information : translations.alarm_information}
      </div>
    </>
  );
};
const PolicyDetail = (props: IProps) => {
  const { id: match_id = '' } = useParams();

  const [result] = useSearchParams();
  const [info, setInfo] = useState<any>({
    id: match_id == 'new' ? '' : match_id,
    name: undefined,
    remark: '',
    status: false,
    creator: '',
    createdAt: null,
    updatedAt: null,
    updater: '',
    scopes: [],
    rules: [],
    isAllRule: false,
  });
  const [isEdit, setIsEdit] = useState(result.get('type') !== 'info');
  const [keyStatus, setKeyStatus] = useState({
    nameStatus: false,
    scopesStatus: false,
    rulesStatus: false,
  });
  const ruleListRef = useRef<any>(null);
  const conditionDomRef = useRef<any>(null);
  const [rulesRes, setRulesRes] = useState<any>([]);
  const [showRulesRes, setShowRulesRes] = useState<any>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>({});
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // 只是获取宽度，用于计算对比
  const tagCaseWidth = useMemo(() => {
    const bw = $('#layoutMainContent').width();
    let i = isEdit ? 1 : 0;
    return bw - 32 * 2 - 24 * 2 - 4 - 68 - 30 - i * 120;
  }, [isEdit]);

  const fnRules = useCallback(() => {
    palaceRules().subscribe((res: any) => {
      const data = res.getItems();
      let items = data
        .filter((item: { key: string }) => {
          return allowWhitelist.includes(item.key);
        })
        .sort((a: any, b: any) => {
          return b.children.length - a.children.length;
        });
      setRulesRes(items);
    });
  }, []);
  const delDetail = useCallback(() => {
    delWhiteList({ id: Number(form.getFieldValue('id')) }).subscribe((res) => {
      if (!res.error) {
        showSuccessMessage(translations.activeDefense_delSuccessTip);
        // navigate(-1);
        onBack();
      }
    });
  }, []);
  const fnDetail = useCallback((id) => {
    getWhiteListDetail({ id })
      .pipe(
        tap((res: any) => {
          const data = res.getItem();
          if (data) {
            let obj = merge({}, data, { status: data.status === 'enabled' });
            setShowRulesRes(() => {
              let result = [];
              if (obj.isAllRule) {
                result = [
                  {
                    children: [
                      {
                        name: translations.scanner_images_all,
                        title: translations.scanner_images_all,
                        key: 'ALL',
                        conditionExpr: obj.conditionExpr,
                      },
                    ],
                    key: 'ALL',
                    title: translations.all_Rules,
                  },
                ];
              } else {
                let o: any = {};
                obj.rules.map((item: any) => {
                  if (o[item.category]) {
                    o[item.category].push(item);
                  } else {
                    o[item.category] = [item];
                  }
                });
                result = Object.keys(o).map((item) => {
                  return merge(
                    {},
                    {
                      key: item,
                      children: o[item].map((ite: any) => {
                        ite['key'] = ite.name;
                        return ite;
                      }),
                      category: item,
                      title: getTitle(item),
                    },
                  );
                });
              }
              return result;
            });
            setInfo(obj);
          }
        }),
      )
      .subscribe();
  }, []);
  useEffect(() => {
    fnRules();
  }, []);
  useEffect(() => {
    let id = match_id == 'new' ? '' : match_id;
    if (id) {
      fnDetail(id);
    } else {
      let { rules = {}, scopes = [] } = Store.policyDetail.value;
      if (Object.values(rules).length == 0 && Object.values(scopes).length == 0) return;
      let resultRules = rulesRes
        .reduce((pre: any, element: any) => {
          let arrRules = element.children.filter((item: any) => {
            return !rules[element.key] ? false : rules[element.key].indexOf(item.key) != -1;
          });
          pre.push(Object.assign({}, element, { children: arrRules }));
          return pre;
        }, [])
        .filter((item: any) => item.children.length);
      setShowRulesRes(resultRules);
      setInfo((pre: any) => {
        return merge({}, pre, { scopes });
      });
    }
  }, [rulesRes, match_id]);
  const [form] = Form.useForm();
  const operateSendDataFn = useCallback(
    (data, key, i?: number) => {
      let items = info.scopes.slice(0);
      if (key === 'del') {
        items.splice(i, 1);
      }
      if (key === 'edit') {
        items.splice(i, 1, data);
      }
      if (key === 'add') {
        items.push(data);
      }
      setInfo((pre: any) => {
        return Object.assign({}, pre, { scopes: items });
      });
    },
    [info.scopes],
  );
  const dataInfo = useMemo(() => {
    if (!info) return [];
    const obj: any = {
      creator: translations.creator + '：',
      createdAt: translations.imageReject_created_at + '：',
      updater: translations.updated_by + '：',
      updatedAt: translations.notificationCenter_placeEvent_updateTime + '：',
      remark: translations.imageReject_comment_title + '：',
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: info[item],
      };
      if (item === 'createdAt' || item === 'updatedAt') {
        o['render'] = () => {
          return formatGeneralTime(info[item]);
        };
      }
      return o;
    });
  }, [info]);
  const columns = useMemo(() => {
    let items = [
      {
        title: '',
        key: 'i',
        dataIndex: 'i',
        align: 'right',
        width: '68px',
        render(_: any, row: any, i: number) {
          return <>{i < 10 ? `0${i + 1}` : i + 1}&nbsp;&nbsp;&nbsp;</>;
        },
      },
      {
        title: translations.object_scope,
        key: 'obj',
        dataIndex: 'obj',
        render(_: any, row: any, i: number) {
          const is = Object.keys(row);
          if (!is.length) return '-';
          return (
            <div className="tags-scope-group df dfac dfw">
              {is.map((t) => {
                const ct = row[t].map((c: any) => c.name);
                return (
                  <TzTag style={{ display: 'inline-block' }}>
                    <EllipsisPopover>{`${labelKeys[t]}：${ct.join(' , ')}`}</EllipsisPopover>
                  </TzTag>
                );
              })}
            </div>
          );
        },
      },
    ] as any;
    if (isEdit) {
      items.push({
        title: translations.operation,
        key: 'operate',
        dataIndex: 'operate',
        width: '120px',
        render: (_: any, row: any, i: number) => {
          return (
            <>
              <TzButton
                type="text"
                className="ml-8"
                onClick={async () => {
                  dw = await TzDrawerFn({
                    className: 'add-scopes-group drawer-body0',
                    title: translations.edit_effective_object,
                    width: '38.9%',
                    destroyOnClose: true,
                    children: (
                      <EffectObjectPopup
                        onOk={(v: TRecords) => {
                          operateSendDataFn(v, 'edit', i);
                          dw?.hiden();
                        }}
                        onCancel={() => dw?.hiden()}
                        record={row}
                      />
                    ),
                  });
                  dw.show();
                }}
              >
                {translations.edit}
              </TzButton>
              <Popconfirm
                placement="topLeft"
                className="tz-ant-popconfirm configure"
                title={translations.unStandard.str39}
                getPopupContainer={() => document.getElementById('layoutMain') || document.body}
                onConfirm={() => operateSendDataFn(null, 'del', i)}
                cancelButtonProps={{
                  type: 'text',
                  danger: true,
                  className: 'configureCal',
                }}
                okButtonProps={{
                  type: 'primary',
                  danger: true,
                  className: 'configureOk',
                }}
                okText={translations.delete}
                cancelText={translations.cancel}
              >
                <TzButton type="text" danger onClick={(e) => e.stopPropagation()}>
                  {translations.delete}
                </TzButton>
              </Popconfirm>
            </>
          );
        },
      });
    }
    return items;
  }, [isEdit, operateSendDataFn, info.scopes, tagCaseWidth]);
  useEffect(() => {
    let keyList = showRulesRes.reduce((pre: any, item: any) => {
      pre[item.key] = item.children.map((ite: any) => ite.key);
      return pre;
    }, {});
    setSelectedRowKeys(keyList);
  }, [showRulesRes]);
  const infoTitDom = useMemo(() => {
    return (
      <>
        {translations.scanner_detail_tab_base}&nbsp;&nbsp;
        {keyStatus.nameStatus ? <span className="f12 fw lh20 dib">*{translations.unStandard.str37}</span> : null}
      </>
    );
  }, [keyStatus]);
  const rulesTitDom = useMemo(() => {
    return (
      <>
        {translations.rules_of_entry_into_force}&nbsp;&nbsp;
        {keyStatus.rulesStatus ? <span className="f12 fw lh20 dib"> *{translations.unStandard.str36} </span> : null}
      </>
    );
  }, [keyStatus]);
  const scopesTitDom = useMemo(() => {
    return (
      <>
        {translations.imageReject_used_for_obj}&nbsp;&nbsp;
        {keyStatus.scopesStatus ? <span className="f12 fw lh20 dib"> *{translations.unStandard.str147} </span> : null}
      </>
    );
  }, [keyStatus]);
  const HeaderTit = useMemo(() => {
    let breads = props.breadcrumb.slice(0);
    if (isEdit) {
      if (!info.id) {
        breads[2].children = translations.new_white_list_policy;
        Store.breadcrumb.next(breads);
        return translations.new_white_list_policy;
      } else {
        breads[2].children = translations.edit_white_list_policy;
        Store.breadcrumb.next(breads);
        return translations.edit_white_list_policy;
      }
    } else {
      breads[2].children = translations.white_list_policy_details;
      Store.breadcrumb.next(breads);
      let key = info.status ? 'enabled' : 'disabled';
      return (
        <>
          {info?.name}
          <TzTag className={'ml10 f14'} style={tagObjs[key].style}>
            {tagObjs[key].label}
          </TzTag>
        </>
      );
    }
  }, [isEdit, info, props.breadcrumb]);
  const HeaderExtra = useMemo(() => {
    if (isEdit) return null;
    return (
      <>
        <TzButton
          className="mr16"
          onClick={() => {
            setInfo((pre: any) => {
              return Object.assign({}, pre, {
                id: '',
                name: '',
                remark: '',
                scopes: info.scopes,
                rules: info.rules,
              });
            });
            setIsEdit(true);
            navigate(Routes.PalaceEventWhiteListDetail.replace('/:id', `/${'new'}?type=add`), {
              replace: true,
            });
          }}
        >
          {translations.create_a_copy}
        </TzButton>
        <TzButton
          className="mr16"
          onClick={() => {
            setIsEdit(true);
          }}
        >
          {translations.edit}
        </TzButton>
        <TzButton
          danger
          onClick={(e) => {
            TzConfirm({
              content: translations.unStandard.str41(info.name),
              onOk: delDetail,
              okButtonProps: {
                type: 'primary',
                danger: true,
              },
              okText: translations.delete,
            });
          }}
        >
          {translations.delete}
        </TzButton>
      </>
    );
  }, [isEdit, info]);
  const l = useLocation();
  useEffect(() => {
    Store.header.next({
      title: HeaderTit,
      extra: HeaderExtra,
      onBack: () => {
        navigate(-1);
        //setIsEdit(false);
      },
    });
  }, [HeaderTit, HeaderExtra, l]);
  const onBack = useMemoizedFn(() => {
    navigate(-1);
    flushSync(() => {
      navigate(Routes.PalaceEventSeting, {
        replace: true,
        state: { keepAlive: true },
      });
    });
  });
  useEffect(() => {
    isEdit
      ? Store.pageFooter.next(
          <div style={{ width: '100%' }}>
            <div className={'f-r'}>
              <TzButton
                onClick={() => {
                  TzConfirm({
                    content: translations.unStandard.str38,
                    cancelText: translations.breadcrumb_back,
                    onOk: () => {
                      setIsEdit(false);
                      !info.id && navigate(-1);
                    },
                  });
                }}
                className={'mr16'}
              >
                {translations.cancel}
              </TzButton>
              <TzButton
                onClick={() => {
                  let o = {
                    nameStatus: !info.name,
                    scopesStatus: !info.scopes.length && info.status,
                    rulesStatus: !showRulesRes[0]?.children.length && info.status,
                  };
                  setKeyStatus(() => o);
                  Object.values(o).some((item) => item) || form.submit();
                }}
                type="primary"
              >
                {info.id ? translations.save : translations.scanner_config_confirm}
              </TzButton>
            </div>
          </div>,
        )
      : Store.pageFooter.next(null);
  }, [isEdit, info, showRulesRes, l]);
  const LinkRulesDom = useMemo(() => {
    if (!showRulesRes.length) return null;
    const { Link } = Anchor;
    return (
      <Anchor
        affix={false}
        className="tz-anchor hasMessage"
        showInkInFixed
        onClick={(e: React.MouseEvent<HTMLElement>, link: any) => {
          e.preventDefault();
        }}
        getContainer={() => {
          return document.getElementById('tableCase') || window;
        }}
      >
        {showRulesRes.map((t: any) => {
          let { key, title } = t;
          if (selectedRowKeys && selectedRowKeys[key] && selectedRowKeys[key]?.length) {
            return (
              <Link
                href={`#${key}`}
                title={
                  <div className="df dfac dfjb" style={{ width: '100%' }}>
                    <span className="tit-txt">{title}</span>
                    {key != 'ALL' ? <span className="round-pup f-r mr4">{selectedRowKeys[key]?.length}</span> : null}
                  </div>
                }
              />
            );
          } else {
            return null;
          }
        })}
      </Anchor>
    );
  }, [showRulesRes, selectedRowKeys]);
  let ConditionDom = forwardRef((props: any, ref: any) => {
    const [formIns] = Form.useForm();
    let [data, setData] = useState<any>([]);
    let [error, setError] = useState<any>('');
    let [optionsKey1, setOptionsKey1] = useState<any>([]);
    let getHolaRules = () => {
      holaRules({ domain: 'signal.context', type: 'key' }).subscribe((res) => {
        let obj = res.getItem() || {};
        whitelistContext().subscribe((res: any) => {
          let data = res.getItems();
          let result = data.map((item: string | number) => {
            return {
              label: obj[item] || item,
              value: item,
            };
          });
          setOptionsKey1(result);
        });
      });
    };
    useEffect(() => {
      getHolaRules();
      setData([props.conditionExpr]);
    }, []);
    useEffect(() => {
      formIns.setFieldsValue({
        conditionExpr: data.filter((item: any) => item).join('\n&& '),
      });
    }, [data]);
    const key2 = Form.useWatch('key2', formIns);
    const key1 = Form.useWatch('key1', formIns);
    let getPlaceholder = useMemo(() => {
      if ((key2 == '==' || key2 == '!=') && key1 === 'file_path') {
        return translations.unStandard.str145;
      }
      return undefined;
    }, [key2, key1]);
    let getErrorMessage = useMemo(() => {
      let item = optionsKey1.find((item: { value: any }) => item.value == key1) || {
        label: undefined,
      };
      return item.label + translations.notEmpty;
    }, [key1, optionsKey1]);
    useImperativeHandle(ref, () => {
      return {
        getConditionExpr: async () => {
          return new Promise(function (resolve, reject) {
            if (!formIns.getFieldValue('conditionExpr')) {
              resolve(formIns.getFieldValue('conditionExpr'));
            } else {
              checkExpr({
                expr: formIns.getFieldValue('conditionExpr'),
              }).subscribe((res: WebResponse<any>) => {
                if (res.error) {
                  reject(res.error.message);
                  setError(res.error.message);
                } else {
                  setError('');
                  resolve(formIns.getFieldValue('conditionExpr'));
                }
              });
            }
          });
        },
      };
    }, []);
    return (
      <>
        <TzForm
          form={formIns}
          initialValues={{
            key1: 'proc_name',
            key2: '==',
            key3: null,
            conditionExpr: undefined,
          }}
          onFinish={(values) => {
            let { key1, key2, key3 } = values;
            let str = '';
            setData((pre: string[]) => {
              if (key2 == 'excluding') {
                str = `!(${key1} contains "${key3}")`;
              } else {
                str = `${key1} ${key2} "${key3}"`;
              }
              return [formIns.getFieldValue('conditionExpr'), str];
            });
            formIns.resetFields();
          }}
        >
          <TzRow gutter={8}>
            <TzCol flex={1}>
              <TzFormItem
                label={translations.the_condition_type}
                name={'key1'}
                rules={[
                  {
                    required: true,
                    message: '',
                  },
                ]}
              >
                <TzSelect
                  options={optionsKey1}
                  showSearch
                  filterOption={(input, option: any) => (option?.label ?? '').includes(input)}
                />
              </TzFormItem>
            </TzCol>
            <TzCol flex={1}>
              <TzFormItem label={' '} name={'key2'}>
                <TzSelect
                  options={[
                    {
                      label: translations.equal_to,
                      value: '==',
                    },
                    {
                      label: translations.not_equal_to,
                      value: '!=',
                    },
                    {
                      label: translations.regular_matching,
                      value: 'matches',
                    },
                    {
                      label: translations.contains,
                      value: 'contains',
                    },
                    {
                      label: translations.does_not_contain,
                      value: 'excluding',
                    },
                  ]}
                />
              </TzFormItem>
            </TzCol>
            <TzCol flex={3}>
              <TzFormItem
                label={' '}
                rules={[
                  {
                    validator: (val, value) => {
                      return !value ? Promise.reject() : Promise.resolve();
                    },
                    message: getErrorMessage,
                  },
                ]}
                name={'key3'}
              >
                <TzInput placeholder={getPlaceholder} />
              </TzFormItem>
            </TzCol>
            <TzCol style={{ width: '44px' }}>
              <TzFormItem label={' '}>
                <TzButton
                  type={'text'}
                  style={{ marginTop: '6px' }}
                  onClick={() => {
                    formIns.submit();
                  }}
                >
                  {translations.add}
                </TzButton>
              </TzFormItem>
            </TzCol>
          </TzRow>
          <TzFormItem
            className={'form-item-block'}
            style={{ marginBottom: 0 }}
            label={
              <>
                {translations.conditional_content + '：'}
                <TzButton
                  className={'f-r'}
                  type={'text'}
                  onClick={() => {
                    setData([]);
                  }}
                >
                  {translations.clear_all}
                </TzButton>
              </>
            }
            name={'conditionExpr'}
            extra={
              <p className={`form-item-tips`}>
                {error && (
                  <p className={`${error ? 'form-item-tips-error' : ''}`}>
                    {error} <br />
                  </p>
                )}
                {translations.unStandard.str144}{' '}
              </p>
            }
          >
            <TzTextArea autoSize={{ minRows: 4 }} />
          </TzFormItem>
        </TzForm>
        {Store.policyDetail.value.type && (
          <InfoDetail type={Store.policyDetail.value.type} ids={Store.policyDetail.value.ids} />
        )}
      </>
    );
  });
  useEffect(() => {
    let arr = showRulesRes.reduce((pre: any[], item: any) => {
      pre = pre.concat(
        item.children.map((ite: { key: any; conditionExpr: any }) => {
          return {
            category: item.key,
            name: ite.key,
            key: item.key,
            conditionExpr: ite.conditionExpr,
          };
        }),
      );
      return pre;
    }, []);
    let obj = {
      isAllRule: false,
      conditionExpr: '',
      rules: arr,
    };
    if (arr[0] && arr[0].key === 'ALL') {
      obj = Object.assign({}, obj, {
        isAllRule: true,
        conditionExpr: arr[0].conditionExpr,
      });
    }
    form.setFieldsValue({ ...info, ...obj });
    if (isEdit) {
      let o = {
        nameStatus: isUndefined(info.name) || info.name ? false : true,
        scopesStatus: !info.scopes.length && info.status,
        rulesStatus: !showRulesRes[0]?.children.length && info.status,
      };
      setKeyStatus(() => o);
    } else {
      setKeyStatus(() => {
        return {
          nameStatus: false,
          scopesStatus: false,
          rulesStatus: false,
        };
      });
    }
  }, [info, showRulesRes, isEdit]);
  let getColumnsRule = useCallback(
    (k) => {
      let key = ((k) => {
        return k;
      })(k);
      let pTitle = getTitle(key);
      let items: any = [
        {
          title: translations.originalWarning_rule,
          dataIndex: 'tag',
          key: 'tag',
          render(item: any, row: any) {
            return item ? `${item}/${pTitle}` : pTitle;
          },
        },
        {
          title: translations.notificationCenter_details_name,
          dataIndex: 'title',
          key: 'title',
          render(item: any, row: any) {
            return <>{item}</>;
          },
        },
        {
          title: translations.scanner_detail_severity,
          dataIndex: 'severity',
          key: 'severity',
          width: '100px',
          className: 'th-center',
          align: 'center',
          filters: severityFilters,
          onFilter: (value: string, record: any) => {
            return value.indexOf(record.severity) != -1;
          },
          render(item: any) {
            let type = setTemp(item);
            let str = tampTit[type];
            return <span className={`btn-state btn-${type.toLowerCase()}`}> {str} </span>;
          },
        },
      ];
      if (key === 'ATT&CK' || key === 'Watson') {
        items.push({
          title: translations.needEmergencyHandle,
          dataIndex: 'urgency',
          key: 'urgency',
          align: 'center',
          width: localLang == 'en' ? '100px' : '150px',
          filters: [
            { text: translations.yes, value: translations.yes },
            { text: translations.no, value: translations.no },
          ],
          onFilter: (value: string, record: any) => {
            return record.urgency == value;
          },
          render(item: any) {
            return (
              <span
                style={{
                  color: `${item === translations.yes ? '#E95454' : '#3E4653'}`,
                }}
              >
                {item}
              </span>
            );
          },
        });
      } else if (key === 'ALL') {
        items = [
          {
            title: translations.originalWarning_rule,
            dataIndex: 'title',
            key: 'title',
          },
          {
            title: translations.notificationCenter_details_name,
            dataIndex: 'title',
            key: 'title',
          },
        ];
      }
      if (isEdit) {
        items.push({
          title: translations.operation,
          dataIndex: 'urgency',
          key: 'urgency',
          width: '140px',
          render(item: any, row: any) {
            return (
              <div>
                <TzButton
                  type={'text'}
                  onClick={() => {
                    TzConfirm({
                      width: document.body.clientWidth < 1366 && Store.policyDetail.value.type ? '560px' : '800px', //20230213-TEN-776
                      title: translations.add_condition,
                      content: <ConditionDom ref={conditionDomRef} conditionExpr={row.conditionExpr} />,
                      okText: translations.add,
                      onOk: (close) => {
                        return new Promise((resolve, reject) => {
                          conditionDomRef.current
                            .getConditionExpr()
                            .then((conditionExpr: any) => {
                              setShowRulesRes((pre: any) => {
                                pre.map((item: any) => {
                                  if (item['key'] === key) {
                                    let children = item['children'];
                                    let index = children.findIndex((ite: { key: any }) => row.key === ite.key);
                                    children.splice(
                                      index,
                                      1,
                                      merge({}, children[index], {
                                        conditionExpr,
                                      }),
                                    );
                                    item['children'] = [...children];
                                    return item;
                                  }
                                });
                                return [...pre];
                              });
                              close();
                            })
                            .catch(function (reason: any) {
                              reject();
                            });
                        });
                      },
                    });
                  }}
                >
                  {translations.add_condition}
                </TzButton>
                <TzPopconfirm
                  title={translations.unStandard.str39}
                  placement="topLeft"
                  cancelButtonProps={{
                    type: 'text',
                    danger: true,
                    size: 'small',
                  }}
                  okButtonProps={{
                    type: 'primary',
                    danger: true,
                    size: 'small',
                  }}
                  onConfirm={() => {
                    setShowRulesRes((pre: any) => {
                      pre.map((item: any) => {
                        let children = item['children'];
                        remove(children, (it: any) => {
                          return row.key == it.key;
                        });
                        item['children'] = [...children];
                        return item;
                      });
                      return [...pre];
                    });
                  }}
                  okText={translations.delete}
                  cancelText={translations.cancel}
                >
                  <TzButton type={'text'} danger>
                    {translations.delete}
                  </TzButton>
                </TzPopconfirm>
              </div>
            );
          },
        });
      }
      return items;
    },
    [isEdit],
  );
  const TableRulesDom = useMemo(() => {
    let doms = null;
    let rulesResData = [...showRulesRes].map((item: any) => {
      let children = item['children'].filter((ite: any) => {
        return (
          !search ||
          ite?.title.indexOf(search) != -1 ||
          ite?.tag.indexOf(search) != -1 ||
          (ite.category && ite.category.indexOf(search) != -1)
        );
      });
      return Object.assign({}, item, { children });
    });
    if (rulesResData.length) {
      doms = rulesResData
        .filter((item) => item.children.length)
        .map((t: any) => {
          return (
            <div id={`${t.key}`}>
              <TzTable
                className={'table-expand-none nohoverTable'}
                tableLayout={'fixed'}
                expandable={{
                  columnWidth: 0,
                  expandIcon: () => <></>,
                  defaultExpandAllRows: true,
                  expandedRowKeys: t.children.map((item: any) => {
                    return item.conditionExpr ? item.key : null;
                  }),
                  expandedRowRender: (record) => <p className="expanded-content">{record.conditionExpr}</p>,
                }}
                dataSource={t.children || []}
                pagination={false}
                rowClassName={(record, index) => {
                  return record.conditionExpr ? 'td-border-none' : '';
                }}
                sticky={true}
                rowKey={'key'}
                columns={getColumnsRule(t.key)}
              />
            </div>
          );
        });
    } else {
      doms = (
        <TzTable
          className={'table-expand-none'}
          dataSource={[]}
          pagination={false}
          sticky={true}
          rowKey={'key'}
          columns={getColumnsRule('ATT&CK')}
        />
      );
    }
    return doms;
  }, [showRulesRes, getColumnsRule, search]);
  let getButtonDisabled = useMemo(() => {
    return showRulesRes.length == 0 ? false : showRulesRes[0].key == 'ALL' && showRulesRes[0].children.length != 0;
  }, [showRulesRes]);
  return (
    <>
      <div className="white-list-policy-detail">
        <TzCard
          title={infoTitDom}
          id="base"
          className={classNames({ 'error-info-case': keyStatus.nameStatus })}
          bodyStyle={{
            padding: '4px 0 0',
          }}
        >
          {!isEdit ? (
            <>
              <ArtTemplateDataInfo data={dataInfo.slice(0, -1)} span={2} />
              <ArtTemplateDataInfo data={dataInfo.slice(-1)} span={1} />{' '}
            </>
          ) : (
            <TzForm
              className="plr24"
              form={form}
              initialValues={info}
              onValuesChange={(val) => {
                setInfo((pre: any) => {
                  return Object.assign({}, pre, val);
                });
              }}
              onFinish={(values) => {
                let data = merge({}, values, {
                  status: values.status ? 'enabled' : 'disabled',
                  id: values.id ? Number(values.id) : '',
                });
                let type = data.id == '' ? 'POST' : 'PUT';
                submitWhiteList(data, type).subscribe((res: WebResponse<any>) => {
                  if (!res.error) {
                    showSuccessMessage(translations.activeDefense_updateSuccessTip);
                    setIsEdit(false);
                    // type == 'POST' && navigate(-1);
                    onBack();
                  }
                });
              }}
            >
              <TzFormItem label={translations.microseg_namespace_status} name={'status'} valuePropName="checked">
                <TzSwitch
                  checkedChildren={translations.microseg_tenants_enabled}
                  unCheckedChildren={translations.confirm_modal_isdisable}
                />
              </TzFormItem>
              <TzFormItem
                label={translations.policyName}
                name={'name'}
                rules={[
                  {
                    required: true,
                    message: translations.unStandard.str37,
                  },
                ]}
              >
                <TzInput
                  placeholder={translations.runtimePolicy_policy_name_place}
                  maxLength={30}
                  status={keyStatus.nameStatus ? 'error' : ''}
                />
              </TzFormItem>
              <TzFormItem label={translations.imageReject_comment_title} name={'remark'}>
                <TzInputTextArea placeholder={translations.unStandard.str40} rows={2} maxLength={100} />
              </TzFormItem>
              <TzFormItem hidden name={'id'}></TzFormItem>
              <TzFormItem hidden name={'scopes'}></TzFormItem>
              <TzFormItem hidden name={'rules'}>
                {' '}
              </TzFormItem>
              <TzFormItem hidden name={'isAllRule'}></TzFormItem>
              <TzFormItem hidden name={'conditionExpr'}>
                {' '}
              </TzFormItem>
            </TzForm>
          )}
        </TzCard>
        <TzCard
          title={scopesTitDom}
          id="effective"
          className={`mt20 ${classNames({ 'error-info-case': keyStatus.scopesStatus })}`}
          bodyStyle={{
            paddingBottom: '20px',
          }}
        >
          <TzTable
            dataSource={info.scopes}
            pagination={false}
            showHeader={!!info.scopes?.length}
            sticky={true}
            rowKey={'id'}
            columns={columns}
          />
          {isEdit && (
            <AddInfoBtn
              className={'mt6'}
              onClick={async () => {
                dw = await TzDrawerFn({
                  className: 'add-scopes-group drawer-body0',
                  title: translations.new_effective_object,
                  width: '38.9%',
                  destroyOnClose: true,
                  children: (
                    <EffectObjectPopup
                      onOk={(v: TRecords) => {
                        operateSendDataFn(v, 'add');
                        dw?.hiden();
                      }}
                      onCancel={() => dw?.hiden()}
                    />
                  ),
                });
                dw.show();
              }}
            />
          )}
        </TzCard>
        <TzCard
          title={rulesTitDom}
          extra={
            isEdit ? (
              <TzButton
                disabled={getButtonDisabled}
                onClick={async () => {
                  TzConfirm({
                    width: '1000px',
                    title: translations.select_specific_rule,
                    content: <RuleListDom ref={ruleListRef} rulesRes={rulesRes} selectedRowKeys={selectedRowKeys} />,
                    okText: translations.confirm_modal_sure,
                    onOk: () => {
                      let keyList = ruleListRef?.current.getSelectedRowKeys();
                      let checkboxValue = ruleListRef?.current.getCheckboxValue();
                      let result = [];
                      if (checkboxValue) {
                        TzConfirm({
                          title: <></>,
                          content: translations.unStandard.str146,
                          okText: translations.yes,
                          cancelText: translations.no,
                          onCancel() {
                            result = rulesRes.reduce(
                              (
                                pre: any,
                                element: {
                                  children: any[];
                                  key: string | number;
                                },
                              ) => {
                                let { children = [] } =
                                  showRulesRes.find((ite: { key: string | number }) => {
                                    return ite.key == element.key;
                                  }) || {};
                                let arrRules = children.filter((item: any) => {
                                  return keyList[element.key].indexOf(item.key) != -1;
                                });
                                let arr = element.children.filter((item: any) => {
                                  return keyList[element.key].indexOf(item.key) != -1;
                                });
                                pre.push(
                                  Object.assign({}, element, {
                                    children: mergeWithId(arrRules, arr, 'key'),
                                  }),
                                );
                                return pre;
                              },
                              [],
                            );
                            setShowRulesRes(result);
                          },
                          onOk() {
                            result = [
                              {
                                children: [
                                  {
                                    name: translations.scanner_images_all,
                                    title: translations.scanner_images_all,
                                    key: 'ALL',
                                  },
                                ],
                                key: 'ALL',
                                title: translations.scanner_images_all,
                              },
                            ];
                            setShowRulesRes(result);
                          },
                        });
                      } else {
                        result = rulesRes.reduce((pre: any, element: { children: any[]; key: string | number }) => {
                          let { children = [] } =
                            showRulesRes.find((ite: { key: string | number }) => {
                              return ite.key == element.key;
                            }) || {};
                          let arrRules = children.filter((item: any) => {
                            return keyList[element.key].indexOf(item.key) != -1;
                          });
                          let arr = element.children.filter((item: any) => {
                            return keyList[element.key].indexOf(item.key) != -1;
                          });
                          pre.push(
                            Object.assign({}, element, {
                              children: mergeWithId(arrRules, arr, 'key'),
                            }),
                          );
                          return pre;
                        }, []);
                      }
                      setShowRulesRes(result);
                    },
                  });
                }}
              >
                {translations.select_rules}
              </TzButton>
            ) : null
          }
          id="rules"
          className={`mt20 ${classNames({
            'error-info-case': keyStatus.rulesStatus,
          })}`}
        >
          <div className="rules-group">
            <div className="rule-menu-group">
              <div className="rule-type-group df dfac dfjb">
                <span className="title">{translations.originalWarning_rule}</span>
              </div>
              <div className="menu-case" style={{ flex: '1' }}>
                {LinkRulesDom}
              </div>
            </div>
            <div className="rule-content-group">
              <div className="rule-type-group df dfac dfjb">
                <span className="title">{translations.rule_list}</span>
                <TzInputSearch
                  style={{ width: '30%' }}
                  placeholder={translations.unStandard.str35}
                  onChange={(val: any) => setSearch(val)}
                />
              </div>
              <div className="table-list-group" id="tableCase">
                {TableRulesDom}
              </div>
            </div>
          </div>
        </TzCard>
      </div>
    </>
  );
};

export default PolicyDetail;
