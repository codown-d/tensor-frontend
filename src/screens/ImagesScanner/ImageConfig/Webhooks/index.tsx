import Checkbox from 'antd/lib/checkbox';
import Form from 'antd/lib/form';
import { TablePaginationConfig } from 'antd/lib/table';
import { isEqual } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import './index.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { map, tap } from 'rxjs/operators';
import { TzFilter, TzFilterForm } from '../../../../components/ComponentsLibrary';
import ArtTemplateDataInfo from '../../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import useTzFilter, { FilterContext } from '../../../../components/ComponentsLibrary/TzFilter/useTzFilter';
import { FilterFormParam } from '../../../../components/ComponentsLibrary/TzFilterForm/filterInterface';
import EllipsisPopover from '../../../../components/ellipsisPopover/ellipsisPopover';
import { TzButton } from '../../../../components/tz-button';
import { TzCard } from '../../../../components/tz-card';
import { TzDrawer } from '../../../../components/tz-drawer';
import { TzForm, TzFormItem, MyFormItem } from '../../../../components/tz-form';
import { TzInput } from '../../../../components/tz-input';
import { TzInputNumber } from '../../../../components/tz-input-number';
import { TzInputPassword } from '../../../../components/tz-input-password';
import TzInputSearch from '../../../../components/tz-input-search';
import { TzInputTextArea } from '../../../../components/tz-input-textarea';
import { TzMessageSuccess } from '../../../../components/tz-mesage';
import { TzConfirm, TzSuccess } from '../../../../components/tz-modal';
import { TzSelect } from '../../../../components/tz-select';
import { TzSwitch } from '../../../../components/tz-switch';
import { TzTable, TzTableServerPage } from '../../../../components/tz-table';
import { RenderTag, TzTag } from '../../../../components/tz-tag';
import { SelectItem, WebResponse } from '../../../../definitions';
import { onSubmitFailed, showSuccessMessage } from '../../../../helpers/response-handlers';
import { Routes } from '../../../../Routes';
import {
  startSync,
  getSyncStatus,
  getTrustedImagesRsa,
  getCIWebhook,
  getCiWebhookRecord,
  putCiWebhook,
} from '../../../../services/DataService';
import { Store } from '../../../../services/StoreService';
import { translations } from '../../../../translations/translations';
import { useScannerInfoList } from '../../../../helpers/use_fun';
import { IRepoItem } from '../../definition';

let webhooksStatusEnum: any = {
  reject: {
    label: translations.compliances_historyColumns_numFailed,
    style: {
      color: 'rgba(233, 84, 84, 1)',
      background: 'rgba(233, 84, 84, 0.1)',
    },
  },
  normal: {
    label: translations.success,
    style: {
      color: 'rgba(82, 196, 26, 1)',
      background: 'rgba(82, 196, 26, 0.1)',
    },
  },
};
export const Webhooks = () => {
  let [info, setInfo] = useState<any>(null);
  let [isEdit, setIsEdit] = useState<any>(false);
  let [errorFields, setErrorFields] = useState<any>([]);
  const listComp = useRef(undefined as any);
  const [formIns] = Form.useForm();
  let [initialValues, setInitialValues] = useState({});
  const dataInfoList = useMemo(() => {
    if (!info) return [];
    const obj: any = {
      enable: translations.functionSwitch + '：',
      url: 'URL：',
      secret: 'Secret：',
      options: translations.notify_events + '：',
    };

    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: info[item],
      };
      if ('enable' === item) {
        o['render'] = () => {
          return <RenderTag type={info[item] + ''} className={'mt-4'} />;
        };
      }
      if ('options' === item) {
        let obj: any = {
          'ci-alert': translations.cI_alarm_record,
          'ci-block': translations.cI_blocking_records,
        };
        const optionsWithCi = Object.keys(obj).map((it: string | number) => {
          return { label: obj[it], value: it, disabled: true };
        });
        o['render'] = () => {
          return <Checkbox.Group value={info[item]} options={optionsWithCi} className="alert-block-checkbox" />;
        };
      }
      return o;
    });
  }, [info]);
  let columns: any = [
    {
      title: 'ID',
      key: 'request_id',
      width: '40%',
      dataIndex: 'request_id',
    },
    {
      title: translations.compliances_node_status,
      key: 'status',
      width: '15%',
      align: 'center',
      dataIndex: 'status',
      render: (Status: any, row: any) => {
        let str = row.err_msg ? 'reject' : 'normal';
        if (!webhooksStatusEnum[str]) return null;
        return (
          <TzTag className={'f14'} style={webhooksStatusEnum[str].style}>
            {webhooksStatusEnum[str].label}
          </TzTag>
        );
      },
    },
    {
      title: translations.failure_reason,
      key: 'err_msg',
      width: '15%',
      dataIndex: 'err_msg',
    },
    {
      title: translations.sending_time,
      key: 'send_time',
      dataIndex: 'send_time',
      width: '14%',
      render: (time: any) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];
  const reqFun = useCallback((pagination: TablePaginationConfig) => {
    const { current = 1, pageSize = 10 } = pagination;
    const offset = (current - 1) * pageSize;
    const pageParams = {
      offset,
      limit: pageSize,
    };
    return getCiWebhookRecord(pageParams).pipe(
      map((res: any) => {
        let items = res.getItems();
        return {
          data: items,
          total: res.totalItems,
        };
      }),
    );
  }, []);
  let getCIWebhookFn = useCallback(() => {
    getCIWebhook().subscribe((res) => {
      let item = res.getItem();
      item['options'] = item['options'] ? item['options'].split(',') : [];
      setInfo(item);
      setInitialValues(item);
    });
  }, []);
  useEffect(() => {
    getCIWebhookFn();
  }, []);
  let l = useLocation();
  useEffect(() => {
    Store.pageFooter.next(
      isEdit ? (
        <div style={{ width: '100%' }}>
          <div className={'f-r'}>
            <TzButton
              onClick={() => {
                TzConfirm({
                  content: translations.unStandard.str38,
                  cancelText: translations.breadcrumb_back,
                  onOk: () => {
                    setIsEdit(false);
                  },
                });
              }}
              className={'mr16'}
            >
              {translations.cancel}
            </TzButton>
            <TzButton
              onClick={() => {
                formIns.submit();
              }}
              type="primary"
            >
              {translations.save}
            </TzButton>
          </div>
        </div>
      ) : null,
    );
  }, [isEdit, l]);

  let WebHook = () => {
    let data = [
      {
        name: 'X-IVAN-TOKEN',
        type: 'string',
        description: translations.unStandard.str97,
      },
      {
        name: 'Content-Type',
        type: 'string',
        description: 'application/json',
      },
      {
        name: 'X-IVAN-Event',
        type: 'string',
        description: translations.unStandard.str98,
      },
      {
        name: 'X-IVAN-Delivery',
        type: 'string',
        description: translations.unStandard.str99,
      },
      {
        name: 'X-IVAN-Signature-256',
        type: 'string',
        description: translations.unStandard.str100,
      },
      {
        name: 'User-Agent',
        type: 'string',
        description: translations.unStandard.str101,
      },
    ];
    let data2 = [
      {
        name: 'action',
        type: 'string',
        description: translations.unStandard.str102,
      },
      {
        name: 'image',
        type: 'string',
        description: translations.unStandard.str103,
      },
      {
        name: 'vuln',
        type: 'string（json）',
        description: translations.unStandard.str104,
      },
      {
        name: 'sensitive',
        type: 'string（json）',
        description: translations.unStandard.str105,
      },
      {
        name: 'pkg',
        type: 'string（json）',
        description: translations.unStandard.str106,
      },
      {
        name: 'os',
        type: 'string（json）',
        description: translations.unStandard.str107,
      },
    ];
    let data3 = [
      {
        name: 'name',
        type: 'string',
        description: translations.unStandard.str108,
      },
      {
        name: 'severity',
        type: 'string',
        description: translations.unStandard.str109,
      },
      {
        name: 'pkgName',
        type: 'string',
        description: translations.unStandard.str110,
      },
      {
        name: 'pkgVersion',
        type: 'string',
        description: translations.unStandard.str111,
      },
      {
        name: 'fixedBy',
        type: 'string',
        description: translations.unStandard.str112,
      },
      {
        name: 'Match',
        type: 'int',
        description: translations.unStandard.str113,
      },
    ];
    let data4 = [
      {
        name: 'Files',
        type: 'array',
        description: translations.unStandard.str114,
      },
      {
        name: 'DefaultFiles',
        type: 'array',
        description: translations.unStandard.str115,
      },
    ];
    let data5 = [
      {
        name: 'PkgName',
        type: 'string',
        description: translations.unStandard.str116,
      },
      {
        name: 'PkgVersion',
        type: 'string',
        description: translations.unStandard.str117,
      },
      {
        name: 'Histogram',
        type: '见example',
        description: translations.unStandard.str118,
      },
    ];
    let columns = [
      {
        title: 'key',
        dataIndex: 'name',
      },
      {
        title: 'type',
        dataIndex: 'type',
      },
      {
        title: translations.clusterManage_aDescription,
        dataIndex: 'description',
      },
    ];
    let WebhookDom = () => {
      let arr = [
        {
          txt: '{',
          textIndent: 0,
        },
        {
          txt: '"Action": "alert",',
          textIndent: 2,
        },
        {
          txt: '"Image": "wade23/deploy:deploytest",',
          textIndent: 2,
        },
        {
          txt: '"Vuln": [',
          textIndent: 2,
        },
        {
          txt: '{',
          textIndent: 4,
        },
        {
          txt: ' "id": 0,',
          textIndent: 6,
        },
        {
          txt: '"name": "CVE-2021-36084",',
          textIndent: 6,
        },
        {
          txt: '"severity": "LOW",',
          textIndent: 6,
        },
        {
          txt: '"pkgName": "libsepol1",',
          textIndent: 6,
        },
        {
          txt: '"Match": 0,',
          textIndent: 6,
        },
        {
          txt: '"White": false',
          textIndent: 6,
        },
        {
          txt: ' }',
          textIndent: 4,
        },
        {
          txt: '],',
          textIndent: 2,
        },
        {
          txt: '"Sensitive": {',
          textIndent: 2,
        },
        {
          txt: '"severity": "LOW",',
          textIndent: 6,
        },
        {
          txt: '"Files": [',
          textIndent: 4,
        },
        {
          txt: '"/etc/gai.conf"',
          textIndent: 6,
        },
        {
          txt: '],',
          textIndent: 4,
        },
        {
          txt: ' "DefaultFiles": null,',
          textIndent: 4,
        },
        {
          txt: '"Remediation": "found senstive files,please check and delete: /etc/gai.conf,/etc/nsswitch.conf,/etc/resolv.conf,/etc/ld.so.conf.d/libc.conf,/etc/ld.so.conf.d/x86_64-linux-gnu.conf,/etc/security/group.conf,/etc/security/time.conf,/etc/security/namespace.conf,/etc/security/limits.conf,/etc/security/access.conf,/etc/security/pam_env.conf,/etc/security/sepermit.conf,/etc/security/faillock.conf,/etc/sysctl.d/10-zeropage.conf,/etc/sysctl.d/10-network-security.conf,/etc/sysctl.d/10-magic-sysrq.conf,/etc/sysctl.d/10-ipv6-privacy.conf,/etc/sysctl.d/10-link-restrictions.conf,/etc/sysctl.d/10-messages.conf,/etc/sysctl.d/10-ptrace.conf,/etc/sysctl.d/10-kernel-hardening.conf,/etc/pam.conf,/etc/mke2fs.conf,/etc/libaudit.conf,/etc/sysctl.conf,/etc/ld.so.conf,/etc/debconf.conf,/etc/selinux/semanage.conf,/etc/deluser.conf,/etc/adduser.conf,/etc/host.conf,/usr/share/libc-bin/nsswitch.conf,/usr/lib/tmpfiles.d/passwd.conf,/usr/share/debconf/debconf.conf,/usr/share/adduser/adduser.conf,,",',
          textIndent: 4,
        },
        {
          txt: ' "Match": false',
          textIndent: 4,
        },
        {
          txt: ' },',
          textIndent: 2,
        },
        {
          txt: '"Os": "ubuntu:18.04",',
          textIndent: 2,
        },
        {
          txt: '"Pkg": [',
          textIndent: 2,
        },
        {
          txt: ' {',
          textIndent: 4,
        },
        {
          txt: '"PkgName": "libsepol1",',
          textIndent: 6,
        },
        {
          txt: ' "PkgVersion": "2.7-1",',
          textIndent: 6,
        },
        {
          txt: '"Histogram": {',
          textIndent: 6,
        },
        {
          txt: '"numCritical": 0,',
          textIndent: 8,
        },
        {
          txt: ' "numHigh": 0,',
          textIndent: 8,
        },
        {
          txt: ' "numMedium": 0,',
          textIndent: 8,
        },
        {
          txt: '"numLow": 1,',
          textIndent: 8,
        },
        {
          txt: '"numNegligible": 0,',
          textIndent: 8,
        },
        {
          txt: '"numUnknown": 0',
          textIndent: 8,
        },
        {
          txt: '}',
          textIndent: 6,
        },
        {
          txt: '}',
          textIndent: 4,
        },
        {
          txt: ']',
          textIndent: 2,
        },
        {
          txt: '}',
          textIndent: 0,
        },
      ];
      return (
        <>
          {arr.map((item) => {
            let { txt, textIndent } = item;
            return (
              <div
                style={{ textIndent: `${textIndent * 12}px`, whiteSpace: 'nowrap' }}
                dangerouslySetInnerHTML={{ __html: txt }}
              ></div>
            );
          })}
        </>
      );
    };
    return (
      <div className={'webhook-sc'}>
        <h1>Webhook</h1>
        <p>{translations.unStandard.str119}</p>
        <h2>Request Header</h2>
        <p>{translations.unStandard.str120}</p>
        <TzTable dataSource={data} columns={columns} pagination={false} />
        <h2>Request Body</h2>
        <p>{translations.unStandard.str121}</p>
        <TzTable dataSource={data2} columns={columns} pagination={false} />
        <h2>{translations.unStandard.str122}</h2>
        <h2>vuln</h2>
        <p>{translations.unStandard.str123} </p>
        <TzTable dataSource={data3} columns={columns} pagination={false} />
        <h2>sensitive</h2>
        <p>{translations.unStandard.str124} </p>
        <TzTable dataSource={data4} columns={columns} pagination={false} />
        <h2>pkg</h2>
        <p>{translations.unStandard.str125}</p>
        <TzTable dataSource={data5} columns={columns} pagination={false} />
        <h2>{translations.unStandard.str126}</h2>
        <h2>Request header</h2>
        <code>
          POST /payload HTTP/1.1
          <br />
          Host: localhost:4567
          <br />
          X-IVAN-Delivery: 72d3162e-cc78-11e3-81ab-4c9367dc0958
          <br />
          X-Hub-Signature-256:ZpIhWIA01G3hsCyAx92F2eTYf64=
          <br />
          User-Agent: IVAN-Hookshot
          <br />
          Content-Type: application/json
          <br />
          Content-Length: 6615
          <br />
          X-IVAN-Event: ci-alert
          <br />
          X-IVAN-TOKEN：1234
        </code>
        <h2>Request body</h2>
        <code style={{ overflowX: 'auto' }}>
          <WebhookDom />
        </code>
        <h2>{translations.unStandard.str127}</h2>
        <p> {translations.unStandard.str128}</p>
        <h2>{translations.unStandard.str129}</h2>
        <code style={{ overflowX: 'auto' }}>
          {'// HMACSHA1 keyStr: 用户的secretkey，value：request body内容 '} <br />
          &nbsp;&nbsp;{`func  HMACSHA1(keyStr string, value []byte) string {`} <br />
          &nbsp;&nbsp;&nbsp;&nbsp;{`  key := []byte(keyStr)`} <br />
          &nbsp;&nbsp;&nbsp;&nbsp;{`  mac := hmac.New(sha1.New, key)`} <br />
          &nbsp;&nbsp;&nbsp;&nbsp;{`  mac.Write(value)`} <br />
          &nbsp;&nbsp;&nbsp;&nbsp;{`  res := base64.StdEncoding.EncodeToString(mac.Sum(nil))`}
          <br />
          &nbsp;&nbsp;{`return res`}
          <br />
          {`}`}
        </code>
      </div>
    );
  };
  return (
    <>
      <TzCard
        title={translations.basic_configuration}
        className={'mb20'}
        extra={
          !isEdit ? (
            <TzButton
              onClick={() => {
                setIsEdit(true);
              }}
            >
              {translations.edit}
            </TzButton>
          ) : null
        }
        bodyStyle={{ paddingBottom: 0 }}
      >
        <p className={'mb20 f12'} style={{ color: '#8E97A3' }}>
          <span>{translations.unStandard.str96}</span>
          <TzButton
            type="text"
            className={'f12 ml0'}
            onClick={() => {
              TzSuccess({
                title: translations.webhooks_user_manual,
                content: <WebHook />,
                width: '70%',
                onOk() {},
              });
            }}
          >
            {translations.webhooks_user_manual}
          </TzButton>
        </p>
        {!isEdit ? (
          <ArtTemplateDataInfo rowProps={{ gutter: [0, 0] }} data={dataInfoList} span={1} />
        ) : (
          <TzForm
            form={formIns}
            onFinishFailed={({ values, errorFields, outOfDate }) => {
              setErrorFields(
                errorFields.reduce((pre, value: any) => {
                  return pre.concat(value.name);
                }, []),
              );
            }}
            initialValues={initialValues}
            onFinish={(values) => {
              setErrorFields([]);
              let { options = [] } = values;
              putCiWebhook(Object.assign({}, values, { options: !options ? '' : options.join(',') })).subscribe(
                (res) => {
                  if (!res.error) {
                    getCIWebhookFn();
                    setIsEdit(false);
                    TzMessageSuccess(translations.edit_succeeded);
                  }
                },
              );
            }}
          >
            <TzFormItem valuePropName="checked" name="enable" label={translations.functionSwitch + '：'}>
              <TzSwitch
                checkedChildren={translations.confirm_modal_isopen}
                unCheckedChildren={translations.confirm_modal_isclose}
              />
            </TzFormItem>
            <TzFormItem
              name="url"
              label={'URL：'}
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: translations.please_enter_the_URL,
                },
                {
                  type: 'url',
                  message: translations.please_enter_a_valid_URL,
                },
              ]}
            >
              <TzInput
                status={errorFields.includes('url') ? 'error' : undefined}
                placeholder={translations.please_enter_the_URL}
                style={{ width: '60%' }}
              />
            </TzFormItem>
            <TzFormItem name="secret" label={'Secret：'}>
              <TzInput placeholder={translations.please_enter_Secret} style={{ width: '60%' }} />
            </TzFormItem>
            <TzFormItem name="options" label={translations.notify_events + '：'}>
              <Checkbox.Group>
                <Checkbox value="ci-alert" className="mr40">
                  {translations.cI_alarm_record}
                </Checkbox>
                <Checkbox value="ci-block">{translations.cI_blocking_records}</Checkbox>
              </Checkbox.Group>
            </TzFormItem>
          </TzForm>
        )}
      </TzCard>
      {!isEdit ? (
        <TzCard className={'mb40'} title={translations.notification_record} bodyStyle={{ paddingBottom: '0px' }}>
          <TzTableServerPage columns={columns} reqFun={reqFun} ref={listComp} rowKey={'id'} />
        </TzCard>
      ) : null}
    </>
  );
};
