import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';

import './index.scss';
import { map } from 'rxjs/operators';
import { Store } from '../../../services/StoreService';
import { TzButton } from '../../../components/tz-button';
import { TablePaginationConfig } from 'antd/lib/table';
import { TzInputSearch } from '../../../components/tz-input-search';
import { TzSwitch } from '../../../components/tz-switch';
import { optionTags, optionTagsFilters, severityFilters } from '../eventDataUtil';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { translations } from '../../../translations/translations';
import { classNameTemp, setTemp, tampTit } from '../AlertCenterScreen';
import { TzTable, TzTableServerPage } from '../../../components/tz-table';
import {
  ATTCKRuleList,
  ATTCKRuleSwitch,
  ATTCKVersionList,
  ruleConfigsEdit,
  getHistory,
  customConfigs,
  customConfigsDelete,
  ATTCKRuleTemplates,
  ruleTemplatesApply,
  ruleTemplatesDelete,
  POSTATTCKRuleTemplates,
  ruleTemplatesRules,
} from '../../../services/DataService';
import { get, merge, remove } from 'lodash';
import { TzPrefixSelectNormal } from '../../../components/tz-select';
import { Routes } from '../../../Routes';
import { hthreatsFilters, RuleStatus } from './util';
import RuleConfigurationEdit from './Edit';
import { TzSpace } from '../../../components/tz-space';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TCustomConfigs, TRulefigEditReqParams } from '../../../definitions';
import useRuleConfig from '../hooks/useRuleConfig';
import { TzMessageSuccess } from '../../../components/tz-mesage';
import { onSubmitFailed, showFailedMessage } from '../../../helpers/response-handlers';
import useLayoutMainSearchWid from '../../../helpers/useLayoutMainSearchWid';
import { TzDrawerFn } from '../../../components/tz-drawer';
import { TzConfirm, TzModal } from '../../../components/tz-modal';
import moment from 'moment';
import TzPopconfirm from '../../../components/ComponentsLibrary/TzPopconfirm';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import Form from 'antd/lib/form';
import { TzInput } from '../../../components/tz-input';
import TzTextArea from '../../../components/ComponentsLibrary/TzTextArea';
import { BackIcon } from '../../../components/ComponentsLibrary/TzPageHeader';
import { RenderTag } from '../../../components/tz-tag';

const RuleConfiguration = () => {
  const navigate = useNavigate();
  const listComp = useRef(undefined as any);
  const listCompATTCKTemplate = useRef(undefined as any);
  const [search, setSearch] = useState<any>('');
  let [random, setRandom] = useState<any>(0);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [versionList, setVersionList] = useState<any>([]);
  const [openATTCKTemplate, setOpenATTCKTemplatet] = useState<any>(false);
  const [openPreviewTemplate, setOpenPreviewTemplate] = useState<any>(null);

  const [openSaveTemplate, setOpenSaveTemplate] = useState<any>(false);
  const [version1, setVersion1] = useState<any>('');
  let [tableOp, setTableOp] = useState(false);
  let [ruleConfig, setRuleConfig] = useState<TCustomConfigs[] | undefined>(undefined);

  const fitlerWid = useLayoutMainSearchWid({});
  const { ruleCustomConfig, configMergeWidthInitByRuleKey } = useRuleConfig();

  const ruleHasEdits = useMemo(() => ruleCustomConfig?.map((v) => get(v, ['rule', 'key'])), [ruleCustomConfig]);

  const reqFun = useCallback(
    (pagination: TablePaginationConfig, filters: any) => {
      if (!version1) {
        return getHistory().pipe(
          map(() => {
            return {
              data: [],
              total: [].length,
            };
          }),
        );
      }
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = {
        offset,
        query: search,
        limit: pageSize,
        severityFilter: filters && filters['severity'] ? filters['severity'].join(',') : '',
        hthreatsFilter: filters && filters['hthreats'] ? filters['hthreats'].join(',') : '',
        version1,
      };

      return ATTCKRuleList(pageParams).pipe(
        map((res: any) => {
          let items = res.getItems();
          setRandom(Math.random());
          return {
            data: items,
            total: res.data?.totalItems || 0,
          };
        }),
      );
    },
    [search, version1],
  );

  const handleEitBtn = useCallback(
    (rule: string) =>
      customConfigs({ rule })
        .pipe(
          map((res: any) => {
            let items = res.getItems();
            const _ruleCustomConfig = configMergeWidthInitByRuleKey(items);
            if (_ruleCustomConfig?.length) {
              setRuleConfig(_ruleCustomConfig);
            }
          }),
        )
        .subscribe(),
    [ruleCustomConfig],
  );

  let columns = useMemo(() => {
    const col = [
      {
        title: translations.originalWarning_rule,
        dataIndex: 'type',
        width: 150,
        ellipsis: {
          showTitle: false,
        },
        render: (text: string, row: any, index: number) => {
          return <EllipsisPopover lineClamp={2}>{row.adapter ? row.adapter.type : text}</EllipsisPopover>;
        },
      },
      {
        title: translations.originalWarning_ruleName,
        dataIndex: 'name',
        render: (text: string, row: any, index: number) => {
          return <EllipsisPopover lineClamp={2}>{row.adapter ? row.adapter.name : text}</EllipsisPopover>;
        },
      },
      {
        title: translations.notificationCenter_details_description,
        dataIndex: 'description',
        ellipsis: {
          showTitle: false,
        },
        render: (description: any, row: any) => {
          let text = row.adapter && row.adapter['description'] ? row.adapter.description : description;
          return <EllipsisPopover lineClamp={2}>{text}</EllipsisPopover>;
        },
      },
      {
        title: translations.notificationCenter_columns_severity,
        dataIndex: 'severity',
        className: 'th-center',
        align: 'center',
        filters: severityFilters,
        width: 120,
        render: (description: any, row: any) => {
          return (
            <div className={'btn-state ' + classNameTemp[setTemp(row.severity)]}>{tampTit[setTemp(row.severity)]}</div>
          );
        },
      },
      {
        title: translations.needEmergencyHandle,
        dataIndex: 'hthreats',
        width: 170,
        className: 'th-center',
        align: 'center',
        filters: hthreatsFilters,
        render: (description: any, row: any) => {
          let text = row['hthreats'];
          let node = hthreatsFilters.find((item) => item.value === text);
          return (
            <span className={text ? 'btn-high' : ''} style={{ background: 'transparent', border: '0px' }}>
              {node?.text}
            </span>
          );
        },
      },
      {
        title: translations.tensorSelect_operations,
        dataIndex: 'enabled',
        width: 130,
        render: (text: boolean, row: any, index: number) => {
          return (
            <div className="rule-configuration-operations">
              <TzSwitch
                checked={text}
                size={'small'}
                onChange={(checked) => {
                  postATTCKRuleSwitch(checked, [row.name]);
                }}
              />
              {ruleHasEdits?.includes(row.name) ? (
                <TzButton type="text" className="edit-button" onClick={() => handleEitBtn(row.name)}>
                  {translations.edit}
                </TzButton>
              ) : null}
            </div>
          );
        },
      },
    ];
    return col;
  }, [random, ruleHasEdits]);
  let selectedRowKeys = useMemo(() => {
    return selectedRows.map((item: { name: any }) => {
      return item.name;
    });
  }, [selectedRows]);
  let postATTCKRuleSwitch = useCallback(
    (enabled: boolean, selectedRowKeys) => {
      if (selectedRowKeys.length == 0) {
        return;
      }
      let items = selectedRowKeys.map((item: any) => {
        return {
          name: item,
          enabled,
        };
      });
      ATTCKRuleSwitch({
        version1,
        items,
      }).subscribe(({ error }) => {
        if (error) {
          error.message ? onSubmitFailed(error) : showFailedMessage(translations.updateFailed);
          return;
        }
        setTableOp(false);
        setSelectedRows([]);
        TzMessageSuccess(translations.updateSucceeded);
        listComp.current.refresh();
      });
    },
    [selectedRowKeys, version1],
  );
  let getATTCKVersionList = useCallback(() => {
    ATTCKVersionList().subscribe((res) => {
      let items = res.getItems().map((item) => {
        item['label'] = item.name;
        item['value'] = item.version1;
        return item;
      });
      setVersion1(items.length ? items[0].value : null);
      setVersionList(items);
    });
  }, []);
  useEffect(() => {
    getATTCKVersionList();
  }, []);
  const l = useLocation();
  let setHeader = useCallback(() => {
    Store.header.next({
      title: (
        <span className={'flex-r-c'}>
          <span className={'mr16'}>{translations.rule_management}</span>
          {versionList.length > 1 ? (
            <TzPrefixSelectNormal
              style={{ fontSize: '14px' }}
              value={version1}
              bordered={false}
              placeholder={translations.unStandard.str141}
              options={versionList}
              onChange={setVersion1}
              prefix={`${translations.rule_base_version}：`}
            />
          ) : null}
        </span>
      ),
      extra:
        version1 >= 3 ? (
          <>
            <TzButton
              className={'mr16'}
              onClick={async () => {
                setOpenATTCKTemplatet(true);
              }}
            >
              {translations.use_templates}
            </TzButton>
            <TzButton
              onClick={async () => {
                setOpenSaveTemplate(true);
              }}
            >
              {translations.save_template}
            </TzButton>
          </>
        ) : null,
      onBack: () => {
        navigate(-1);
      },
    });
  }, [versionList, version1, l]);
  useEffect(() => {
    setHeader();
  }, [setHeader]);
  useEffect(() => {
    Store.pageFooter.next(
      tableOp ? (
        <div>
          <span className="mr16 ml16">{`${translations.selected} ${selectedRowKeys.length} ${translations.items}`}</span>
          <TzButton
            className={'mr20'}
            disabled={!selectedRowKeys.length}
            onClick={() => postATTCKRuleSwitch(true, selectedRowKeys)}
          >
            {translations.deflectDefense_strat}
          </TzButton>
          <TzButton disabled={!selectedRowKeys.length} onClick={() => postATTCKRuleSwitch(false, selectedRowKeys)}>
            {translations.confirm_modal_close}
          </TzButton>
        </div>
      ) : null,
    );
  }, [tableOp, selectedRowKeys, l]);
  const handleRowSelection = useCallback((selected: boolean, selectedRows: any[]) => {
    setSelectedRows((pre: any) => {
      selectedRows.forEach((s: any) => {
        if (selected) {
          pre.push(s);
        } else {
          remove(pre, (item: any) => {
            return item.name === s.name;
          });
        }
      });
      return [...pre];
    });
  }, []);

  const rowSelection = useMemo(() => {
    if (!tableOp) return undefined;
    return {
      columnWidth: '32px',
      selectedRowKeys,
      onSelect: (record: any, selected: any, selectedRows: any, nativeEvent: any) => {
        nativeEvent.stopPropagation();
        handleRowSelection(selected, [record]);
      },
      onSelectAll: (selected: any, selectedRows: any, changeRows: any) => {
        handleRowSelection(selected, changeRows);
      },
    };
  }, [tableOp, selectedRowKeys, handleRowSelection]);
  let getInfoDom = useMemo(() => {
    return versionList.length > 1 ? (
      <div
        className="rule-jump mb16 flex-r"
        ref={(node) => {
          $(node)
            .find('#ruleJump')
            .click((e: any) => {
              navigate(Routes.MultiClusterManage);
            });
        }}
      >
        <i className={'icon iconfont icon-tishi mr8 mt4'}></i>
        <div
          dangerouslySetInnerHTML={{
            __html: translations.unStandard.str142(`<span id='ruleJump' >${translations.unStandard.str143}</span>`),
          }}
        ></div>
      </div>
    ) : null;
  }, [versionList]);

  const deleteRule = (id: number) => {
    customConfigsDelete(id).subscribe();
  };

  const handleConfigurationEdit = useCallback(
    (values) => {
      ruleConfigsEdit(values).subscribe(({ error }) => {
        if (error) {
          error.message ? onSubmitFailed(error) : showFailedMessage('saveFailed');
        } else {
          const saveIds = values.map((v: TRulefigEditReqParams) => v.id);
          ruleConfig?.forEach((v: TCustomConfigs) => v.id && !saveIds.includes(v.id) && deleteRule(v.id));
          TzMessageSuccess(`${translations.saveSuccess}`);
          listComp.current.refresh();
          setRuleConfig(undefined);
        }
      });
    },
    [ruleConfig],
  );

  const [form] = Form.useForm();

  let ATTCKTemplate = useCallback((props: any) => {
    const [dataSource, setDataSource] = useState<any>([]);
    const [templateSearch, setTemplateSearch] = useState('');
    const columns: any = useMemo(() => {
      return [
        {
          title: translations.template_name,
          dataIndex: 'name',
        },
        {
          title: translations.template_description,
          dataIndex: 'description',
          width: '28%',
          render(description: any) {
            return description ? <EllipsisPopover lineClamp={2}>{description}</EllipsisPopover> : '-';
          },
        },
        {
          title: translations.creator,
          dataIndex: 'creator',
          render(creator: any) {
            return creator || '-';
          },
        },
        {
          title: translations.clusterGraphList_detailContainer_createdAt,
          key: 'created_at',
          dataIndex: 'created_at',
          width: '14%',
          render: (attack_time: any, row: any) => {
            return row.builtin ? '-' : moment(attack_time).format('YYYY-MM-DD HH:mm:ss');
          },
        },
        {
          title: translations.clusterManage_operate,
          key: 'operate',
          width: '160px',
          render: (item: any, row: any) => {
            return (
              <div>
                <TzButton
                  onClick={() => {
                    setOpenPreviewTemplate(row);
                  }}
                  type="text"
                  className={'mr12'}
                >
                  {translations.preview}
                </TzButton>
                <TzButton
                  onClick={() => {
                    ruleTemplatesApply({
                      version1: props.version1,
                      id: row.id,
                    }).subscribe((res) => {
                      if (res.error) return;
                      setOpenATTCKTemplatet(false);
                      TzMessageSuccess(translations.successfully_used);
                      listComp.current.refresh();
                    });
                  }}
                  type="text"
                  className={'mr12'}
                >
                  {translations.use}
                </TzButton>
                {!row.builtin && (
                  <TzButton type="text" danger>
                    <TzPopconfirm
                      placement="topRight"
                      title={translations.unStandard.str39}
                      getPopupContainer={() => document.getElementById('layoutMain') || document.body}
                      onConfirm={() => {
                        ruleTemplatesDelete({
                          version1: props.version1,
                          id: row.id,
                        }).subscribe((res) => {
                          if (res.error) return;
                          TzMessageSuccess(translations.template_deleted_successfully);
                          getATTCKRuleTemplates();
                        });
                      }}
                      cancelButtonProps={{
                        type: 'text',
                        danger: true,
                      }}
                      okButtonProps={{
                        type: 'primary',
                        danger: true,
                      }}
                      okText={translations.delete}
                      cancelText={translations.cancel}
                    >
                      {translations.delete}
                    </TzPopconfirm>
                  </TzButton>
                )}
              </div>
            );
          },
        },
      ];
    }, []);
    let getATTCKRuleTemplates = useCallback(() => {
      ATTCKRuleTemplates({
        keyword: templateSearch,
        version1: props.version1,
      }).subscribe((res: any) => {
        if (res.error) return;
        let items = res.getItems();
        setDataSource(items);
      });
    }, [props.version1, templateSearch]);
    useEffect(() => {
      getATTCKRuleTemplates();
      props.callback(getATTCKRuleTemplates);
    }, [getATTCKRuleTemplates]);
    return (
      <div style={{ overflow: 'hidden', minHeight: '600px' }}>
        <p className={'mb12'} style={{ overflow: 'hidden' }}>
          <TzInputSearch
            style={{ width: '30%' }}
            placeholder={translations.unStandard.str242}
            className="f-r"
            allowClear
            onChange={(value: any) => setTemplateSearch(value)}
          />
        </p>
        <TzTable
          className={'nohoverTable'}
          tableLayout={'fixed'}
          dataSource={dataSource}
          pagination={false}
          columns={columns}
          scroll={{ y: 600 }}
        />
      </div>
    );
  }, []);
  let PreviewATTCKTemplate = useCallback((props: any) => {
    const [dataSource, setDataSource] = useState<any>([]);
    const [keyword, setKeyword] = useState('');
    const columns: any = useMemo(() => {
      return [
        {
          title: translations.originalWarning_rule,
          dataIndex: 'rule_type',
          filters: optionTagsFilters,
          onFilter: (value: string, record: any) => {
            let node = optionTags.filter((item) => {
              return record.rule_type === item.label || record.rule_type === item.value;
            });
            return node[0].value == value;
          },
          // render: (text: string, row: any, index: number) => {
          //   let node=optionTags.filter(item=>{
          //     return text===item.value
          //   })
          //   return (
          //     <EllipsisPopover lineClamp={2}>
          //       {node[0]?.label}
          //     </EllipsisPopover>
          //   );
          // },
        },
        {
          title: translations.originalWarning_ruleName,
          dataIndex: 'name',
          width: '32%',
          render: (text: string, row: any, index: number) => {
            return <EllipsisPopover lineClamp={2}>{text ? text : '-'}</EllipsisPopover>;
          },
        },
        {
          title: translations.notificationCenter_columns_severity,
          dataIndex: 'severity',
          className: 'th-center',
          align: 'center',
          filters: severityFilters,
          onFilter: (value: string, record: any) => {
            return value.indexOf(record.severity) != -1;
          },
          render: (description: any, row: any) => {
            return (
              <div className={'btn-state ' + classNameTemp[setTemp(row.severity)]}>
                {tampTit[setTemp(row.severity)]}
              </div>
            );
          },
        },
        {
          title: translations.needEmergencyHandle,
          dataIndex: 'urgency',
          className: 'th-center',
          align: 'center',
          filters: hthreatsFilters,
          onFilter: (value: string, record: any) => {
            return record.urgency === !!value;
          },
          render: (urgency: any, row: any) => {
            return (
              <span className={urgency ? 'btn-high' : ''} style={{ background: 'transparent', border: '0px' }}>
                {urgency ? translations.scanner_images_yes : translations.scanner_images_no}
              </span>
            );
          },
        },
        {
          title: translations.compliances_node_status,
          key: 'operate',
          width: '110px',
          align: 'center',
          className: 'th-center',
          filters: RuleStatus,
          onFilter: (value: string, record: any) => {
            return value === record.switch;
          },
          render: (item: any, row: any) => {
            return <RenderTag type={item.switch ? 'temp_open' : 'closed'} />;
          },
        },
      ];
    }, []);
    let getRuleTemplatesRules = useCallback(() => {
      ruleTemplatesRules({
        version1: props.version1,
        id: props.id,
      }).subscribe((res) => {
        if (res.error) return;
        let items = res
          .getItems()
          .filter((item) => !keyword || item.name.toLowerCase().indexOf(keyword.toLowerCase()) != -1);
        setDataSource(items);
      });
    }, [props.id, keyword]);
    useEffect(() => {
      getRuleTemplatesRules();
    }, [getRuleTemplatesRules]);
    return (
      <div style={{ overflow: 'hidden', minHeight: '600px' }}>
        <p className={'mb12'} style={{ overflow: 'hidden' }}>
          <TzInputSearch
            style={{ width: '30%' }}
            placeholder={translations.unStandard.str244}
            className="f-r"
            allowClear
            onChange={(value: any) => setKeyword(value)}
          />
        </p>
        <TzTable
          className={'nohoverTable'}
          dataSource={dataSource}
          pagination={false}
          columns={columns}
          scroll={{ y: 600 }}
        />
      </div>
    );
  }, []);
  return (
    <div className="rule-configuration mlr32">
      {getInfoDom}
      <div className={'mb12'}>
        <TzSpace size={16}>
          <TzButton
            onClick={() => {
              setTableOp((pre) => !pre);
            }}
          >
            {tableOp ? translations.cancel_batch_operation : translations.batch_operation}
          </TzButton>
          {!tableOp ? (
            <Link to={Routes.AttckRuleCustom}>
              <TzButton>{translations.rule_custom}</TzButton>
            </Link>
          ) : null}
        </TzSpace>
        <TzInputSearch
          allowClear
          className={'f-r'}
          placeholder={translations.unStandard.str35}
          style={{
            width: `${fitlerWid}px`,
          }}
          onChange={(val) => {
            setSearch(val);
          }}
        />
      </div>
      <TzTableServerPage
        className="nohoverTable"
        loading={undefined}
        rowSelection={rowSelection}
        tableLayout="fixed"
        columns={columns as any}
        rowKey="name"
        reqFun={reqFun}
        ref={listComp}
      />
      {ruleConfig ? (
        <RuleConfigurationEdit
          open={!!ruleConfig}
          onOk={handleConfigurationEdit}
          onCancel={() => setRuleConfig(undefined)}
          ruleConfig={ruleConfig}
        />
      ) : null}
      <TzModal
        open={openATTCKTemplate}
        destroyOnClose={true}
        title={translations.select_template}
        bodyStyle={{ paddingBottom: '20px' }}
        footer={null}
        width={1000}
        onCancel={() => {
          setOpenATTCKTemplatet(false);
        }}
      >
        <ATTCKTemplate
          version1={version1}
          callback={(fn: any) => {
            listCompATTCKTemplate.current = { refresh: fn };
          }}
        />
      </TzModal>
      <TzModal
        open={!!openPreviewTemplate}
        destroyOnClose={true}
        closable={false}
        bodyStyle={{ paddingBottom: '20px' }}
        title={
          <span className={'flex-r-c'} style={{ justifyContent: 'space-between' }}>
            <span className={'flex-r-c'}>
              <BackIcon
                onClick={() => {
                  setOpenPreviewTemplate(null);
                  listComp.current.refresh();
                }}
                className={'f-l'}
                style={{ fontSize: '24px' }}
              />
              <span className={'ml4'}>{openPreviewTemplate ? openPreviewTemplate.name : ''}</span>
            </span>
            <span>
              <TzButton
                onClick={() => {
                  ruleTemplatesApply({
                    version1: version1,
                    id: openPreviewTemplate.id,
                  }).subscribe((res) => {
                    if (res.error) return;
                    TzMessageSuccess(translations.successfully_used);
                    setOpenPreviewTemplate(false);
                    setOpenATTCKTemplatet(false);
                    listComp.current.refresh();
                  });
                }}
                className={'mr16'}
              >
                {translations.use}
              </TzButton>
              {openPreviewTemplate && !openPreviewTemplate.builtin && (
                <TzButton
                  danger
                  onClick={() => {
                    TzConfirm({
                      content: `${translations.unStandard.str246(openPreviewTemplate.name)}`,
                      okButtonProps: {
                        type: 'primary',
                        danger: true,
                      },
                      onOk: () => {
                        ruleTemplatesDelete({
                          version1: version1,
                          id: openPreviewTemplate.id,
                        }).subscribe((res) => {
                          if (res.error) return;
                          TzMessageSuccess(translations.template_deleted_successfully);
                          setOpenPreviewTemplate(null);
                          listCompATTCKTemplate.current.refresh();
                        });
                      },
                      okType: 'danger',
                      okText: translations.delete,
                    });
                  }}
                >
                  {translations.delete}
                </TzButton>
              )}
            </span>
          </span>
        }
        footer={null}
        width={1000}
      >
        <PreviewATTCKTemplate version1={version1} {...openPreviewTemplate} />
      </TzModal>

      <TzModal
        open={openSaveTemplate}
        title={translations.save_template}
        onCancel={() => {
          setOpenSaveTemplate(false);
        }}
        onOk={() => {
          return new Promise((resolve, reject) => {
            form?.validateFields().then((value: any) => {
              POSTATTCKRuleTemplates(merge({ version1 }, value)).subscribe((res) => {
                if (res.error) return;
                resolve(res);
                setOpenSaveTemplate(false);
                TzMessageSuccess(translations.saveSuccess);
              });
            }, reject);
          });
        }}
        destroyOnClose={true}
      >
        <TzForm form={form} validateTrigger={'onChange'} preserve={false}>
          <TzFormItem
            name="name"
            label={translations.template_name}
            rules={[{ required: true, message: translations.unStandard.str245 }]}
          >
            <TzInput placeholder={translations.unStandard.str242} />
          </TzFormItem>
          <TzFormItem name="description" label={translations.template_description} style={{ marginBottom: 0 }}>
            <TzTextArea placeholder={translations.unStandard.str243} maxLength={150} />
          </TzFormItem>
        </TzForm>
      </TzModal>
    </div>
  );
};

export default RuleConfiguration;
