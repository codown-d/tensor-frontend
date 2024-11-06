import React, {
  forwardRef,
  PureComponent,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './index.scss';
import { TzButton } from '../../../components/tz-button';
import { TzTableServerPage } from '../../../components/tz-table';
import { TablePaginationConfig } from 'antd/lib/table';
import {
  deleteCIWhitelist,
  getCiWhitelist,
  postCiWhitelists,
  processingCenterRecord,
  putCiWhitelists,
} from '../../../services/DataService';
import { map } from 'rxjs/operators';
import moment from 'moment';
import { TzTag } from '../../../components/tz-tag';
import { TzInputSearch } from '../../../components/tz-input-search';
import { TzConfirm, TzModal, TzSuccess } from '../../../components/tz-modal';
import { WebResponse } from '../../../definitions';
import { MyFormItem, TzForm, TzFormItem } from '../../../components/tz-form';
import { TzDatePicker } from '../../../components/tz-date-picker';
import { TzSelect } from '../../../components/tz-select';
import { Form } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { onSubmitFailed, showSuccessMessage } from '../../../helpers/response-handlers';
import { Store } from '../../../services/StoreService';
import { TzRangePicker } from '../../../components/tz-range-picker';
import { TzInput } from '../../../components/tz-input';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { translations } from '../../../translations/translations';
import useLayoutMainSearchWid from '../../../helpers/useLayoutMainSearchWid';

export const deleteWhiteList = (row: any, callback?: (arg0: WebResponse<any>) => void) => {
  let { id, name } = row;
  TzConfirm({
    content: translations.unStandard.str49(name),
    okText: translations.delete,
    okButtonProps: { danger: true },
    cancelButtonProps: {},
    cancelText: translations.cancel,
    onOk() {
      deleteCIWhitelist({ id }).subscribe((res) => {
        !callback || callback(res);
      });
    },
  });
};

export const addWhiteList = (
  type = 'add',
  data: any,
  callback?: (arg0: WebResponse<any>) => void,
) => {
  let refDom: FormInstance<any>;
  let ContentModal = (props: any) => {
    let { data } = props;
    let [errorFields, setErrorFields] = useState<any>([]);
    const [form] = Form.useForm();
    let [dataInfo, setDataInfo] = useState({});
    let dataList = useMemo(() => {
      return data.name || [];
    }, [data]);
    useEffect(() => {
      form.setFieldsValue({
        name: dataList,
        id: data.id || null,
        expire_time: data?.expire_time ? moment(data.expire_time) : moment(),
      });
      refDom = form;
    }, [dataList]);
    return (
      <TzForm
        form={form}
        initialValues={dataInfo}
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
          let arr = res.name.map((item: any) => {
            return {
              name: item,
              id: res.id,
              expire_time: moment(res.expire_time).valueOf(),
            };
          });
          type === 'edit'
            ? putCiWhitelists(arr).subscribe((res) => {
                if (res.error) {
                  return onSubmitFailed(res.error);
                }
                showSuccessMessage(translations.white_list_edited_successfully);
                !callback || callback(res);
              })
            : postCiWhitelists(arr).subscribe((res) => {
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
        {dataList?.length === 0 ? (
          <MyFormItem
            label={translations.scanner_detail_image + '：'}
            name="name"
            rules={[
              {
                required: true,
                message: translations.please_enter_the_image,
              },
            ]}
            render={(children) => (
              <div>
                {children}
                {type === 'edit' ? null : (
                  <p className="f12" style={{ color: '#B3BAC6' }}>
                    {translations.unStandard.str80}
                  </p>
                )}
              </div>
            )}
          >
            <TzSelect
              showArrow={false}
              status={errorFields.includes('name') ? 'error' : undefined}
              placeholder={translations.please_enter_the_image}
              mode="tags"
              dropdownStyle={{ display: 'none' }}
              bordered={type !== 'edit'}
              disabled={type === 'edit'}
            />
          </MyFormItem>
        ) : (
          <TzFormItem
            style={{ marginBottom: '18px' }}
            name="name"
            label={translations.scanner_detail_image + '：'}
          >
            {dataList?.map((item: any) => {
              return (
                <TzTag className={'mt3 mb3 f-l'} style={{ maxWidth: '100%' }}>
                  <EllipsisPopover>{item}</EllipsisPopover>
                </TzTag>
              );
            })}
          </TzFormItem>
        )}
        <TzFormItem
          label={translations.valid_until + '：'}
          name="expire_time"
          style={{ marginBottom: 0 }}
          rules={[
            {
              required: true,
              message: translations.unStandard.str51,
            },
          ]}
        >
          <TzDatePicker
            status={errorFields.includes('expire_time') ? 'error' : undefined}
            placeholder={translations.unStandard.str51}
            showTime
            disabledDate={(time) => {
              return moment(moment().format('YYYY-MM-DD')).valueOf() > moment(time).valueOf();
            }}
          />
        </TzFormItem>
      </TzForm>
    );
  };
  TzConfirm({
    title: type === 'edit' ? translations.edit_white_list : translations.add_white_list,
    content: <ContentModal data={data} />,
    width: '520px',
    okText: type === 'edit' ? translations.save : translations.scanner_config_confirm,
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
const editWhiteList = (row: any, callback?: (arg0: WebResponse<any>) => void) => {
  let obj = Object.assign({}, row, { name: [row.name] });
  addWhiteList('edit', obj, callback);
};
const WhiteList = (props: any) => {
  const [name, setName] = useState<any>('');
  const [filteredValueExpireTime, setFilteredValueExpireTime] = useState<any>([]);
  const listComp = useRef<any>(null);
  const navigate = useNavigate();
  const whiteListColumns: any = useMemo(() => {
    return [
      {
        title: translations.image,
        dataIndex: 'name',
      },
      {
        title: translations.valid_until,
        key: 'expire_time',
        dataIndex: 'expire_time',
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
        width: '14%',
        render: (time: any) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: translations.notificationCenter_placeEvent_updateTime,
        key: 'updated_at',
        dataIndex: 'updated_at',
        width: '14%',
        render: (time: any) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        width: '140px',
        title: translations.operation,
        render: (text: any, row: any) => {
          return (
            <>
              <TzButton
                type="text"
                className="ml-8 mr4"
                onClick={(event) => {
                  let id: any = row.id;
                  editWhiteList(row, () => listComp.current.refresh());
                }}
              >
                {translations.edit}
              </TzButton>
              <TzButton
                type="text"
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
        name,
        expire_time,
      };
      if (expire_time && expire_time.length) {
        pageParams = Object.assign({}, pageParams, {
          start_time: expire_time[0].valueOf(),
          end_time: expire_time[1].valueOf(),
        });
      }
      return getCiWhitelist(pageParams).pipe(
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
  const fitlerWid = useLayoutMainSearchWid({});
  return (
    <>
      <div className="ml32 mr32 mt4">
        <div className="flex-r-c mb12">
          <TzButton
            type={'primary'}
            onClick={() => {
              addWhiteList('add', { name: [] }, () => {
                listComp.current.refresh();
              });
            }}
          >
            {translations.scanner_config_confirm}
          </TzButton>
          <TzInputSearch
            style={{ width: fitlerWid }}
            placeholder={translations.please_enter_white_list}
            onSearch={(val) => {
              setName(val);
            }}
          />
        </div>
        <TzTableServerPage
          columns={whiteListColumns}
          rowKey={'id'}
          ref={listComp}
          reqFun={reqFun}
        />
      </div>
    </>
  );
};
export default WhiteList;
