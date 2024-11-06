import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { map, tap } from 'rxjs/operators';
import { TzTableServerPage } from '../../components/tz-table';
import {
  clusterRuleversion,
  deleteAssetsCluster,
  getListClusters,
  putAddCluster,
} from '../../services/DataService';
import { translations } from '../../translations/translations';
import './MultiClusterScreen.scss';
import { TzInput } from '../../components/tz-input';
import { TzButton } from '../../components/tz-button';
import EllipsisPopover from '../../components/ellipsisPopover/ellipsisPopover';
import { TzConfirm, TzModal } from '../../components/tz-modal';
import { TzForm, TzFormItem } from '../../components/tz-form';
import TzTextArea from '../../components/ComponentsLibrary/TzTextArea';
import { TzTag } from '../../components/tz-tag';
import Form from 'antd/lib/form';
import { isEqual, merge } from 'lodash';
import useTzFilter, {
  FilterContext,
} from '../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { TzFilter, TzFilterForm } from '../../components/ComponentsLibrary';
import { FilterFormParam } from '../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { Store } from '../../services/StoreService';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';

export const dealPlaceholder = (txt: string) => {
  return translations.clusterManage_placeholder + txt;
};

export const DrawerTitle = (props: {
  okFunc: () => void;
  cancelFunc: () => void;
  title: string;
  okTxt?: string;
}) => {
  const { okFunc, cancelFunc, title, okTxt } = props;
  const RightOper = () => {
    return (
      <span className="cluster-drawer-tit">
        <TzButton className="btn-submit" onClick={okFunc}>
          {okTxt || translations.submit}
        </TzButton>
        <TzButton className="btn-cancel" onClick={cancelFunc}>
          {translations.cancel}
        </TzButton>
      </span>
    );
  };

  return (
    <div
      className="title-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span className="title">{title}</span>
      <RightOper />
    </div>
  );
};

const defPagination = {
  current: 1,
  pageSize: 10,
  hideOnSinglePage: true,
};

const MultiClusterManage = () => {
  const [operateItem, setOperateItem] = useState(undefined as any);
  let [filters, setFilters] = useState<any>({});
  let [clusterRuleversionList, setClusterRuleversionList] = useState<any>([]);

  const [formIns] = Form.useForm();
  const tablelistRef = useRef(undefined as any);
  const reqFun = useCallback(
    (pagination) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      const pageParams = {
        offset,
        limit: pageSize,
        ...filters,
      };
      return getListClusters(pageParams).pipe(
        map((res) => {
          const items = res.getItems();
          return {
            data: items,
            total: res?.totalItems || 0,
          };
        }),
      );
    },
    [filters],
  );
  const columns = useMemo(() => {
    return [
      {
        title: translations.clusterManage_key,
        dataIndex: 'key',
        key: 'key',
        width: '30%',
        render: (key: any, row: any) => {
          return (
            <>
              <p className={'flex-r dfac'}>
                <span
                  className={'mr12 f16'}
                  style={{ color: '#3e4653', maxWidth: 'calc(100% - 108px)', height: '24px' }}
                >
                  <EllipsisPopover lineHeight={24}>{row.name}</EllipsisPopover>
                </span>
                <TzTag style={{ height: '24px', lineHeight: '24px', fontSize: '14px' }}>
                  {row.platForm}
                </TzTag>
              </p>
              <TzTag className={'small mt8 f-l'} style={{ color: '#6C7480', maxWidth: '100%' }}>
                <EllipsisPopover placement="topLeft" title={key}>
                  key：{key}
                </EllipsisPopover>
              </TzTag>
            </>
          );
        },
      },
      {
        title: translations.clusterManage_aDescription,
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: translations.aPI_server_address,
        dataIndex: 'apiServerAddr',
        key: 'apiServerAddr',
      },
      {
        title: translations.product_version,
        dataIndex: 'version',
        key: 'version',
        width: '9%',
      },
      {
        title: translations.rule_base_version,
        dataIndex: 'ruleVersion',
        key: 'ruleVersion',
        width: '12%',
      },
      {
        title: translations.clusterManage_operate,
        key: 'operate',
        width: '110px',
        render: (item: any, row: any) => {
          return (
            <>
              <TzButton
                onClick={() => {
                  formIns.setFieldsValue(
                    merge({}, item, {
                      cluster_key: item.key,
                      cluster_name: item.name,
                    }),
                  );
                  setOperateItem(
                    merge({}, item, {
                      cluster_key: item.key,
                      cluster_name: item.name,
                    }),
                  );
                }}
                type="text"
              >
                {translations.edit}
              </TzButton>
              <TzButton
                danger
                onClick={() => {
                  TzConfirm({
                    content: translations.unStandard.str139(`${row.platForm}（${row.key}）`),
                    okText: translations.delete,
                    okType: 'danger',
                    okButtonProps: { type: 'primary' },
                    cancelText: translations.cancel,
                    onOk() {
                      deleteAssetsCluster({ cluster_key: row.key }).subscribe((res) => {
                        if (!res.error) {
                          tablelistRef.current.refresh();
                        }
                      });
                    },
                  });
                }}
                type="text"
              >
                {translations.delete}
              </TzButton>
            </>
          );
        },
      },
    ];
  }, []);

  let cluster_type_op = [
    { label: 'kubernetes', value: 'kubernetes' },
    { label: 'openshifit', value: 'openshifit' },
  ];

  const l = useLocation();
  let setHeader = useCallback(() => {
    Store.header.next({
      extra: <div id="filterBtnId"></div>,
    });
  }, [l]);
  useEffect(() => {
    setHeader();
  }, [setHeader]);
  useEffect(() => {
    clusterRuleversion({ limit: 99999, offset: 0 }).subscribe((res) => {
      setClusterRuleversionList(
        res.getItems().map((item) => {
          return { label: item, value: item };
        }),
      );
    });
  }, []);
  const multiClusterManageFilter: FilterFormParam[] = useMemo(
    () => [
      {
        label: translations.scanner_report_clusterKey,
        name: 'key',
        type: 'input',
        icon: 'icon-jiqun',
      },
      {
        label: translations.clusterManage_name,
        name: 'name',
        type: 'input',
        icon: 'icon-jiqun',
      },
      {
        label: translations.api_server,
        name: 'api_server_addr',
        type: 'input',
        icon: 'icon-yunhangzhuangtai',
      },
      {
        label: translations.product_version,
        name: 'version',
        type: 'input',
        icon: 'icon-biaoji',
      },
      {
        label: translations.calico_cluster_type,
        name: 'platform',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          mode: 'multiple',
          options: cluster_type_op,
        },
      },
      {
        label: translations.rule_base_version,
        name: 'rules_version',
        type: 'select',
        icon: 'icon-banben',
        props: {
          mode: 'multiple',
          options: clusterRuleversionList,
        },
      },
    ],
    [clusterRuleversionList, cluster_type_op],
  );

  const data = useTzFilter({ initial: multiClusterManageFilter });

  const handleChange = useCallback((values: any) => {
    setFilters((prev: any) => (isEqual(values, prev) ? prev : values));
  }, []);
  return (
    <>
      <div className="multi-cluster-case mlr32 mt4">
        <FilterContext.Provider value={{ ...data }}>
          {document.getElementById('filterBtnId') &&
            createPortal(<TzFilter />, document.getElementById('filterBtnId') as HTMLDivElement)}
          <TzFilterForm className="mb12" onChange={handleChange} />
        </FilterContext.Provider>
        <TzTableServerPage
          tableLayout={'fixed'}
          className={'nohoverTable'}
          columns={columns}
          defaultPagination={defPagination}
          rowKey={(item) => item.key}
          reqFun={reqFun}
          ref={tablelistRef}
          equalServerPageAnyway={false}
        />
      </div>
      <TzModal
        open={!!operateItem}
        onCancel={() => {
          setOperateItem(undefined);
        }}
        onOk={formIns.submit}
        destroyOnClose={true}
        title={translations.clusterManage_editCluster}
        cancelButtonProps={{ className: 'cancel-btn' }}
      >
        <TzForm
          form={formIns}
          onFinish={(values) => {
            putAddCluster(values)
              .pipe(
                tap((res: any) => {
                  if (res?.data) {
                    setOperateItem(undefined);
                    tablelistRef.current.refresh();
                  }
                }),
              )
              .subscribe();
          }}
        >
          <TzFormItem hidden name="cluster_key">
            <TzInput />
          </TzFormItem>
          <TzFormItem label={`${translations.clusterManage_aName}：`} colon name="cluster_name">
            <TzInput placeholder={dealPlaceholder(translations.clusterManage_aName)} />
          </TzFormItem>
          <TzFormItem
            label={`${translations.clusterManage_aDescription}：`}
            name="description"
            style={{ marginBottom: '0px' }}
          >
            <TzTextArea placeholder={dealPlaceholder(translations.clusterManage_aDescription)} />
          </TzFormItem>
        </TzForm>
      </TzModal>
    </>
  );
};

export default MultiClusterManage;
