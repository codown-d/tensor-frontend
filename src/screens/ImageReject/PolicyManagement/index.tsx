import React, {
  forwardRef,
  PureComponent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';
import { TzButton } from '../../../components/tz-button';
import { TzTableServerPage } from '../../../components/tz-table';
import { deleteSecurityPolicy, detectPolicyList, putSecurityPolicy } from '../../../services/DataService';
import { map } from 'rxjs/operators';
import { TzInputSearch } from '../../../components/tz-input-search';
import { Routes } from '../../../Routes';
import { TzConfirm } from '../../../components/tz-modal';
import { WebResponse } from '../../../definitions';
import { Store } from '../../../services/StoreService';
import { translations } from '../../../translations/translations';
import { getTime } from '../../../helpers/until';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { useAssetsClusterList } from '../../../helpers/use_fun';
import { TzMessageSuccess } from '../../../components/tz-mesage';
import { onSubmitFailed, showSuccessMessage } from '../../../helpers/response-handlers';
import useNewSearchParams from '../../../helpers/useNewSearchParams';
import useLayoutMainSearchWid from '../../../helpers/useLayoutMainSearchWid';
import { find, isEqual, merge } from 'lodash';
import { useGetLibrary } from '../../../services/ServiceHook';
import { policyType } from '../../ImagesScanner/ImageConfig/ImageScanConfig';
import { RenderTag } from '../../../components/tz-tag';
import { deployModOp } from '../../ImagesScanner/SecurityPolicy/component/BaseInfo';
import { FilterFormParam } from '../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import { TzFilter, TzFilterForm } from '../../../components/ComponentsLibrary';
import useTzFilter, { FilterContext } from '../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { TzTooltip } from '../../../components/tz-tooltip';
import { getUserInformation } from '../../../services/AccountService';
export const deleteStrategy = (info: { id: any; name: any }, callback?: () => void) => {
  let { id, name } = info;
  TzConfirm({
    content: translations.unStandard.str57(name),
    okText: translations.delete,
    okButtonProps: { danger: true },
    cancelText: translations.cancel,
    onOk() {
      deleteSecurityPolicy(id).subscribe(({ error }) => {
        if (error) {
          onSubmitFailed(error);
        } else {
          TzMessageSuccess(translations.activeDefense_delSuccessTip);
          callback && callback();
        }
      });
    },
  });
};
export const enableOp = [
  {
    value: 'true',
    label: translations.superAdmin_loginLdapConfig_enable,
  },
  { value: 'false', label: translations.deactivateC },
];
const PolicyManagement = (props: any) => {
  const { breadcrumb } = props;
  const clusterList = useAssetsClusterList();
  const libraryList = useGetLibrary();
  const navigate = useNavigate();
  let { allSearchParams } = useNewSearchParams();
  let { imageFromType } = allSearchParams;
  const tablelistRef = useRef<any>(undefined);
  const [filters, setFilters] = useState<any>({});
  const putSecurityPolicyFn = useCallback((row) => {
    putSecurityPolicy(row).subscribe((res) => {
      if (res.error && res.error.message) {
        onSubmitFailed(res.error);
      } else {
        showSuccessMessage(row.enable ? translations.security_policy_enabled : translations.security_policy_closed);
        tablelistRef.current.refresh();
      }
    });
  }, []);
  const columns: any = useMemo(
    () => [
      {
        title: translations.policyName,
        dataIndex: 'name',
        width: '20%',
        ellipsis: {
          showTitle: false,
        },
        render: (text: any) => {
          return !text ? '-' : <EllipsisPopover lineClamp={2}>{text}</EllipsisPopover>;
        },
      },
      {
        title: translations.effectiveness_scope,
        dataIndex: ['scope', 'imageRegexp'],
        width: '20%',
        render: (item: string[], row: any) =>
          item.length ? <EllipsisPopover lineClamp={2}>{item.join(' , ')}</EllipsisPopover> : '-',
      },
      {
        title: (
          <span className="flex-r-c" style={{ justifyContent: 'flex-start' }}>
            {translations.microseg_namespace_strategyMode}
            <TzTooltip title={translations.unStandard.str291}>
              <i className={'iconfont icon-wenhao ml4 f16'} style={{ color: '##B3BAC6' }}></i>
            </TzTooltip>
          </span>
        ),
        dataIndex: 'deployMod',
        width: '13%',
        render: (deployMod: string) => {
          let node = find(deployModOp, (item) => deployMod === item.value);
          return node?.label;
        },
      },
      {
        title: translations.updated_by,
        dataIndex: 'updater',
      },
      {
        title: translations.update_time,
        dataIndex: 'updatedAt',
        render: (item: number) => getTime(item),
      },

      {
        title: translations.compliances_breakdown_dotstatus,
        dataIndex: 'enable',
        align: 'center',
        render: (enable: boolean) => {
          let node = find(enableOp, (ite) => ite.value === enable + '')?.label;
          return <RenderTag type={enable ? 'not_disable' : 'disable'} title={node} />;
        },
      },
      {
        title: translations.operation,
        dataIndex: 'id',
        render: (id: number, record: any) => (
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <TzButton
              type="text"
              className="mr12"
              onClick={() => {
                TzConfirm({
                  content: record.enable
                    ? translations.microseg_namespace_disableConfirmContent
                    : translations.microseg_namespace_enableConfirmContent,
                  onOk() {
                    putSecurityPolicyFn(
                      merge({}, record, {
                        enable: !record.enable,
                        updater: getUserInformation().username,
                      }),
                    );
                  },
                });
              }}
            >
              {record.enable ? translations.deactivate : translations.enable}
            </TzButton>
            <TzButton
              type="text"
              className="mr12"
              onClick={(e) => {
                navigate(Routes.SecurityPolicyEdit + `?id=${id}&imageFromType=${imageFromType}`);
              }}
            >
              {translations.edit}
            </TzButton>
            <TzButton
              danger
              type="text"
              onClick={(e) => {
                deleteStrategy(record, () => {
                  tablelistRef.current.refresh();
                });
              }}
            >
              {translations.delete}
            </TzButton>
          </div>
        ),
      },
    ],
    [clusterList, libraryList],
  );
  const reqFun = useCallback(
    (pagination) => {
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;

      const params = {
        offset,
        limit: pageSize,
        ...filters,
        policyType: 'deploy',
      };
      return detectPolicyList(params).pipe(
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
        label: translations.policyName,
        name: 'keyword',
        type: 'input',
        icon: 'icon-jingxiang',
      },
      {
        label: translations.microseg_namespace_strategyMode,
        name: 'deployMod',
        type: 'select',
        icon: 'icon-leixing',
        props: {
          mode: 'multiple',
          options: deployModOp,
        },
      },
      {
        label: translations.compliances_breakdown_dotstatus,
        name: 'enable',
        type: 'select',
        icon: 'icon-yunhangzhuangtai',
        props: {
          mode: 'multiple',
          options: enableOp,
        },
      },
    ],
    [deployModOp],
  );
  const data = useTzFilter({ initial: imagesScannerScreenFilter });

  const handleChange = useCallback((values: any) => {
    setFilters((prev: any) => (isEqual(values, prev) ? prev : values));
  }, []);
  return (
    <div className={'mlr32 policy-management mt4'}>
      <div className="mb12">
        <FilterContext.Provider value={{ ...data }}>
          <div className={'flex-r-c'}>
            <TzButton
              type="primary"
              onClick={() => navigate(Routes.SecurityPolicyEdit + `?imageFromType=${imageFromType}`)}
            >
              {translations.newAdd}
            </TzButton>
            <TzFilter />
          </div>
          <TzFilterForm onChange={handleChange} />
        </FilterContext.Provider>
      </div>
      <TzTableServerPage
        onRow={(record) => ({
          onClick: () => navigate(Routes.SecurityPolicyDetail + `?id=${record.id}&imageFromType=${imageFromType}`),
        })}
        columns={columns}
        rowKey="id"
        reqFun={reqFun}
        ref={tablelistRef}
      />
    </div>
  );
};
export default PolicyManagement;
