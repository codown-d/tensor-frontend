import { TablePaginationConfig } from 'antd/lib/table';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { map, tap } from 'rxjs/operators';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../../../components/tz-button';
import TzInputSearch from '../../../../components/tz-input-search';
import { TzConfirm } from '../../../../components/tz-modal';
import { TzTableServerPage } from '../../../../components/tz-table';
import { WebResponse } from '../../../../definitions';
import { onSubmitFailed, showSuccessMessage } from '../../../../helpers/response-handlers';
import { getTime } from '../../../../helpers/until';
import { Routes } from '../../../../Routes';
import { getTrustedImagesRsa, deleteTrustedImagesRsa } from '../../../../services/DataService';
import { translations } from '../../../../translations/translations';
import { IRepoItem } from '../../definition';
import useLayoutMainSearchWid from '../../../../helpers/useLayoutMainSearchWid';
// import { useActivate } from 'react-activation';

export const onDeleteTrustedImagesRsa = (id: string, callback?: () => void) => {
  deleteTrustedImagesRsa({ id }).subscribe((res) => {
    if (res.error && res.error.message) {
      onSubmitFailed(res.error);
    } else {
      showSuccessMessage(translations.scanner_images_removeSuccess);
      callback && callback();
    }
  });
};
export const KeyManagement = (props: any) => {
  const [search, setSearch] = useState('');
  let navigate = useNavigate();
  const listRef = useRef<any>(null);
  const fetchRepoList = useCallback(
    (pagination?: TablePaginationConfig, tableFilters?: any) => {
      const { current = 1, pageSize = 10 } = pagination || {};
      const offset = (current - 1) * pageSize;
      const pageParams = {
        offset,
        limit: pageSize,
        search,
      };
      return getTrustedImagesRsa(pageParams).pipe(
        map((resp: WebResponse<any>) => {
          let items = resp.getItems();
          let f = items.some((item) => item.status === 'abnormal');
          if (f) {
            listRef.current &&
              setTimeout(() => {
                listRef.current?.refresh();
              }, 5000);
          }
          return {
            data: items,
            total: resp.data?.totalItems,
          };
        }),
      );
    },
    [search],
  );

  const fitlerWid = useLayoutMainSearchWid({});
  const repoColumns = useMemo(() => {
    return [
      {
        title: translations.keyID,
        dataIndex: 'rsa_id',
        ellipsis: {
          showTitle: false,
        },
        render: (text: string) => {
          return <EllipsisPopover preHidden={true}>{text}</EllipsisPopover>;
        },
      },
      {
        title: translations.keyName,
        dataIndex: 'name',
        ellipsis: {
          showTitle: false,
        },
        render: (text: string) => {
          return <EllipsisPopover>{text}</EllipsisPopover>;
        },
      },
      {
        title: translations.clusterManage_createtime,
        dataIndex: 'created_at',
        align: 'center',
        ellipsis: {
          showTitle: false,
        },
        render: (created_at: number) => {
          return getTime(created_at);
        },
      },
      {
        title: translations.scanner_config_operation,
        key: 'action',
        width: '16%',
        render: (_: any, row: IRepoItem) => {
          return (
            <>
              <TzButton
                type={'text'}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`${Routes.KeyManagementEdit}?id=${row.id}`);
                }}
              >
                {translations.edit}{' '}
              </TzButton>
              <TzButton
                type={'text'}
                danger
                onClick={(e) => {
                  e.stopPropagation();
                  TzConfirm({
                    content: translations.unStandard.str34(translations.trusted_key + row.name),
                    okText: translations.delete,
                    okButtonProps: {
                      type: 'primary',
                      danger: true,
                    },
                    onOk() {
                      onDeleteTrustedImagesRsa(row.id, () => {
                        listRef.current.refresh();
                      });
                    },
                  });
                }}
              >
                {translations.delete}
              </TzButton>
            </>
          );
        },
      },
    ];
  }, []);
  // useActivate(() => {
  //   listRef.current.refresh();
  // });
  return (
    <div className="key-management">
      <div className={'flex-r-c mb12'}>
        <TzButton
          type={'primary'}
          onClick={() => {
            navigate(`${Routes.KeyManagementEdit}`);
          }}
        >
          {translations.scanner_config_confirm}
        </TzButton>
        <TzInputSearch
          placeholder={translations.please_enter_key_name}
          style={{ width: fitlerWid }}
          onSearch={setSearch}
        />
      </div>
      <TzTableServerPage
        columns={repoColumns as any}
        rowKey="id"
        reqFun={fetchRepoList}
        ref={listRef}
        onRow={(record) => {
          return {
            onClick: () => {
              navigate(`${Routes.KeyManagementInfo}?id=${record.id}`);
            },
          };
        }}
      />
    </div>
  );
};
