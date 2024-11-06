import React, { forwardRef, PureComponent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import './index.scss';
import { TzButton } from '../../../components/tz-button';
import { TzTableServerPage } from '../../../components/tz-table';
import { TablePaginationConfig } from 'antd/lib/table';
import { whitelistDelete, driftWhitelists, whitelistCreate, whitelistUpdate } from '../../../services/DataService';
import { map } from 'rxjs/operators';
import moment from 'moment';
import { TzInputSearch } from '../../../components/tz-input-search';
import { TzConfirm } from '../../../components/tz-modal';
import { WebResponse } from '../../../definitions';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { TzDatePicker } from '../../../components/tz-date-picker';
import { Form } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { onSubmitFailed, showSuccessMessage } from '../../../helpers/response-handlers';
import { Store } from '../../../services/StoreService';
import { TzRangePicker } from '../../../components/tz-range-picker';
import { TzInput } from '../../../components/tz-input';
import { getUserInformation } from '../../../services/AccountService';
import { TzRadioGroupNormal } from '../../../components/tz-radio';
import { translations } from '../../../translations/translations';
import { useLocation, useNavigate } from 'react-router-dom';

export const deleteWhiteList = (row: any, callback?: (arg0: WebResponse<any>) => void) => {
  let { id, path } = row;
  TzConfirm({
    content: translations.unStandard.str49(path),
    okText: translations.delete,
    okButtonProps: { danger: true },
    cancelButtonProps: {},
    cancelText: translations.cancel,
    onOk() {
      whitelistDelete({ id }).subscribe((res) => {
        !callback || callback(res);
      });
    },
  });
};

const addWhiteList = (type = 'add', d: any, callback?: (arg0: WebResponse<any>) => void) => {
  let data = Object.assign({}, d, {
    updater: getUserInformation().username,
    expire_at: d?.expire_at ? moment(d.expire_at) : moment(),
  });
  let refDom: FormInstance<any>;
  let ContentModal = (props: any) => {
    let { data } = props;
    let [errorFields, setErrorFields] = useState<any>([]);
    const [form] = Form.useForm();
    const is_forever = Form.useWatch('is_forever', form);
    useEffect(() => {
      refDom = form;
    }, []);
    return (
      <TzForm
        form={form}
        initialValues={Object.assign({}, data)}
        autoComplete="off"
        onFinishFailed={({ values, errorFields, outOfDate }) => {
          setErrorFields(
            errorFields.reduce((pre, value: any) => {
              return pre.concat(value.name);
            }, []),
          );
        }}
        onFinish={(res) => {
          setErrorFields([]);
          let value = Object.assign({}, res, {
            creator: res.id ? res.creator : getUserInformation().username,
            expire_at: moment(res.expire_at).valueOf(),
          });
          type === 'edit'
            ? whitelistUpdate(value).subscribe((res) => {
                if (res.error) {
                  return onSubmitFailed(res.error);
                }
                showSuccessMessage(translations.white_list_edited_successfully);
                !callback || callback(res);
              })
            : whitelistCreate(value).subscribe((res) => {
                if (res.error) {
                  return onSubmitFailed(res.error);
                }
                showSuccessMessage(translations.white_list_added_successfully);

                !callback || callback(res);
              });
        }}
      >
        <TzFormItem name="id" hidden>
          <TzInput />
        </TzFormItem>
        <TzFormItem name="creator" hidden>
          <TzInput />
        </TzFormItem>
        <TzFormItem name="updater" hidden>
          <TzInput />
        </TzFormItem>
        <TzFormItem
          style={{ marginBottom: '8px' }}
          name="path"
          label={translations.scanner_detail_file_path + '：'}
          rules={[
            {
              required: true,
              message: translations.unStandard.str50,
            },
          ]}
        >
          <TzInput placeholder={translations.unStandard.str50} />
        </TzFormItem>
        <TzFormItem style={{ marginBottom: '8px' }} label={translations.valid_until + '：'} name="is_forever">
          <TzRadioGroupNormal
            radioList={[
              { value: true, children: translations.permanent },
              { value: false, children: translations.non_permanent },
            ]}
          />
        </TzFormItem>
        {is_forever ? null : (
          <TzFormItem colon={false} label={null} name="expire_at" style={{ marginBottom: '8px' }}>
            <TzDatePicker
              status={errorFields.includes('expire_time') ? 'error' : undefined}
              placeholder={translations.unStandard.str51}
              showTime
              disabledDate={(time) => {
                return moment(moment().format('YYYY-MM-DD')).valueOf() > moment(time).valueOf();
              }}
            />
          </TzFormItem>
        )}
      </TzForm>
    );
  };
  TzConfirm({
    title: type === 'edit' ? translations.edit_white_list : translations.add_white_list,
    content: <ContentModal data={data} />,
    className: 'footer-mt20',
    width: '520px',
    okText: type === 'edit' ? translations.save : translations.newAdd,
    cancelText: translations.cancel,
    onOk() {
      return new Promise(function (resolve, reject) {
        refDom
          .validateFields()
          .then((res) => {
            resolve(res);
            refDom.submit();
          })
          .catch(() => {
            refDom.submit();
            reject();
          });
      });
    },
  });
};
export const editWhiteList = (row: any, callback?: (arg0: WebResponse<any>) => void) => {
  addWhiteList('edit', row, callback);
};
const WhiteList = (props: any) => {
  const navigate = useNavigate();
  const [name, setName] = useState<any>('');
  const [filteredValueExpireTime, setFilteredValueExpireTime] = useState<any>([]);
  const listComp = useRef<any>(null);
  const whiteListColumns: any = useMemo(() => {
    return [
      {
        title: translations.scanner_detail_file_path,
        dataIndex: 'path',
      },
      {
        title: translations.valid_until,
        key: 'expire_at',
        dataIndex: 'expire_at',
        filterDropdown: (props: any) => {
          let { setSelectedKeys, selectedKeys, confirm, clearFilters } = props;
          return (
            <div
              style={{
                padding: '8px',
                boxShadow: '0px 2px 20px 0px rgba(144,168,205,0.25)',
                borderRadius: '8px',
              }}
            >
              <TzRangePicker
                showTime
                onChange={(value, dateString) => {
                  if (dateString[0]) {
                    setSelectedKeys(value);
                  } else {
                    clearFilters();
                  }
                  confirm({ closeDropdown: true });
                }}
                style={{ width: '364px' }}
              />
            </div>
          );
        },
        render: (expire_at: any, row: any) => {
          return row.is_forever ? translations.permanent : moment(expire_at).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: translations.updated_by,
        key: 'updater',
        dataIndex: 'updater',
      },
      {
        title: translations.notificationCenter_placeEvent_updateTime,
        key: 'updated_at',
        dataIndex: 'updated_at',
        width: '14%',
        render: (time: any) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: translations.operation,
        width: '140px',
        render: (text: any, row: any) => {
          return (
            <>
              <TzButton
                type="text"
                className="ml-8 mr4"
                onClick={(event) => {
                  editWhiteList(row, () => listComp.current.refresh());
                }}
              >
                {translations.edit}
              </TzButton>
              <TzButton
                type="text"
                className="ml0"
                danger
                onClick={(event) => {
                  deleteWhiteList(row, (res) => {
                    listComp.current.refresh();
                    if (!res.error) {
                      showSuccessMessage(translations.unStandard.str52);
                    }
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
  }, [filteredValueExpireTime]);
  const reqFun = useCallback(
    (pagination: TablePaginationConfig, filters: any) => {
      let { expire_time = [] } = filters;
      const { current = 1, pageSize = 10 } = pagination;
      const offset = (current - 1) * pageSize;
      let pageParams = {
        offset,
        limit: pageSize,
        search: name,
        expire_time,
      };
      if (expire_time && expire_time.length) {
        pageParams = Object.assign({}, pageParams, {
          start: expire_time[0].valueOf(),
          end: expire_time[1].valueOf(),
        });
      }
      return driftWhitelists(pageParams).pipe(
        map(({ data }: any) => {
          let { items = [], totalItems = 0 } = data || {};
          return {
            data: items,
            total: totalItems,
          };
        }),
      );
    },
    [name, filteredValueExpireTime],
  );
  const l = useLocation();
  useEffect(() => {
    Store.header.next({
      title: translations.white_list,
      onBack: () => {
        navigate(-1);
      },
    });
  }, [l]);
  return (
    <>
      <div className="ml32 mr32 mt4">
        <div className="flex-r-c mb12">
          <TzButton
            type={'primary'}
            onClick={() => {
              addWhiteList('add', { is_forever: true }, () => {
                listComp.current.resetPagination();
              });
            }}
          >
            {translations.scanner_config_confirm}
          </TzButton>
          <TzInputSearch
            placeholder={translations.unStandard.str53}
            onSearch={(val) => {
              setName(val);
            }}
          />
        </div>
        <TzTableServerPage columns={whiteListColumns} rowKey={'id'} ref={listComp} reqFun={reqFun} />
      </div>
    </>
  );
};
export default WhiteList;
