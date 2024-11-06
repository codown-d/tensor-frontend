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
import { deleteSecurityPolicy, detectPolicyList } from '../../../services/DataService';
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
import { onSubmitFailed } from '../../../helpers/response-handlers';
import useNewSearchParams from '../../../helpers/useNewSearchParams';
import useLayoutMainSearchWid from '../../../helpers/useLayoutMainSearchWid';
import { TSecurityPolicy } from './interface';
import { policyType } from '../ImageConfig/ImageScanConfig';
import { tabType } from '../ImagesScannerScreen';
import { find } from 'lodash';
import { useGetLibrary } from '../../../services/ServiceHook';
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
const SecurityPolicy = (props: any) => {
  const { breadcrumb } = props;
  const clusterList = useAssetsClusterList();
  const libraryList = useGetLibrary();
  const navigate = useNavigate();
  let { allSearchParams } = useNewSearchParams();
  let { imageFromType } = allSearchParams;
  const [search, setSearch] = useState<string>();
  const tablelistRef = useRef<any>(undefined);
  const fitlerWid = useLayoutMainSearchWid();
  const columns: any = useMemo(
    () => [
      {
        title: translations.policyName,
        dataIndex: 'name',
        key: 'name',
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
        dataIndex: ['scope', 'scopeType'],
        width: '20%',
        render: (text: string, record: TSecurityPolicy) => {
          let _text;
          if (text === 'image') {
            _text = record?.scope?.imageRegexp?.join(' , ');
          } else if (record.policyType === policyType.node) {
            const allCluster = record?.scope?.allCluster;
            if (allCluster) {
              return translations.all_clusters;
            }
            const clusterKey = record?.scope?.clusterKey;
            if (!clusterKey?.length) {
              return '-';
            }
            _text = clusterKey
              .map((str: string) => clusterList.find((v) => v.value === str)?.label || null)
              .filter((v: string | null) => !!v)
              .join(' , ');
          } else if (record.policyType === policyType.registry) {
            const allReg = record?.scope?.allReg;
            if (allReg) {
              return translations.all_warehouses;
            }
            _text = record?.scope?.regName?.join(' , ');
          }

          return (
            <EllipsisPopover lineClamp={2} title={_text}>
              {_text}
            </EllipsisPopover>
          );
        },
      },
      {
        title: translations.update_time,
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (item: number) => getTime(item),
      },
      {
        title: translations.updated_by,
        dataIndex: 'updater',
        key: 'updater',
      },
      {
        title: translations.operation,
        dataIndex: 'id',
        key: 'id',
        width: 120,
        render: (id: number, record: any) =>
          record.isDefault ? (
            '-'
          ) : (
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <TzButton
                type="text"
                onClick={(e) => {
                  navigate(Routes.SecurityPolicyEdit + `?id=${id}&imageFromType=${imageFromType}`);
                }}
              >
                {translations.edit}
              </TzButton>
              <TzButton
                danger
                type="text"
                className="ml4"
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
        keyword: search,
        policyType: policyType[imageFromType],
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
    [search],
  );
  useEffect(() => {
    if (!imageFromType) return;
    breadcrumb.splice(1, 1, {
      children:
        imageFromType === tabType.registry
          ? translations.scanner_report_repoImage
          : imageFromType === tabType.node
            ? translations.scanner_report_nodeImage
            : translations.imageReject_toonline,
      href: `${Routes.ImagesCILifeCycle}?tab=${imageFromType}`,
    });
    Store.breadcrumb.next(breadcrumb);
  }, [imageFromType]);
  return (
    <div className={'mlr32 security-policy mt4'}>
      <p className={'mb12'}>
        <TzButton
          type="primary"
          onClick={() => navigate(Routes.SecurityPolicyEdit + `?imageFromType=${imageFromType}`)}
        >
          {translations.newAdd}
        </TzButton>
        <TzInputSearch
          style={{ width: fitlerWid }}
          className={'f-r'}
          onChange={setSearch as any}
          placeholder={translations.unStandard.securityPolicySearchTip}
        />
      </p>
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
export default SecurityPolicy;
