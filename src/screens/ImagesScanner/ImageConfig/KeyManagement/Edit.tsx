import Form from 'antd/lib/form';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import './Edit.scss';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ArtTemplateDataInfo from '../../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { TzButton } from '../../../../components/tz-button';
import { TzCard } from '../../../../components/tz-card';
import { TzForm, TzFormItem, MyFormItem } from '../../../../components/tz-form';
import { TzInput } from '../../../../components/tz-input';
import { TzConfirm } from '../../../../components/tz-modal';
import { TzSelect } from '../../../../components/tz-select';
import { SelectItem, WebResponse } from '../../../../definitions';
import { onSubmitFailed, showSuccessMessage } from '../../../../helpers/response-handlers';
import { getTime } from '../../../../helpers/until';
import {
  getTrustedImagesRsaId,
  putTrustedImagesRsa,
  trustedImagesRsa,
} from '../../../../services/DataService';
import { Store } from '../../../../services/StoreService';
import { translations } from '../../../../translations/translations';
import { TextHoverCopy } from '../../../AlertCenter/AlertCenterScreen';
import { Tittle } from '../../../../components/ComponentsLibrary/Tittle';
import { useGetLibrary } from '../../../../services/ServiceHook';
import { Routes } from '../../../../Routes';
import { flushSync } from 'react-dom';

let showRegModal = () => {
  let OpenConfirmBody = () => {
    let arr = [
      {
        one: translations.unStandard.str7,
        two: '**',
      },
      {
        one: translations.unStandard.str8,
        two: '/path*',
      },
      {
        one: translations.unStandard.str9,
        two: '/{path1, path2}*',
      },
      {
        one: translations.unStandard.str10,
        two: '/{path1, path2}/**',
      },
      {
        one: translations.unStandard.str11,
        two: '/{path1, path2}*/**',
      },
      {
        one: translations.unStandard.str12,
        two: '1.？',
      },
      {
        one: translations.unStandard.str13,
        two: '{env1*, env2*}',
      },
    ];
    return (
      <>
        <div className={'confirm-div'} style={{ textAlign: 'left' }}>
          <Tittle title={translations.unStandard.regularMatchingRule} className={'mb16 f16'} />
          <p className={'mb16'}>{translations.unStandard.str1}</p>
          <span style={{ lineHeight: '28px' }}>
            • <span className={'modal-txt-color-b'}>*</span>
            {translations.unStandard.str2}
            <br />• <span className={'modal-txt-color-b'}>**</span>
            {translations.unStandard.str3}
            <br />• <span className={'modal-txt-color-b'}>?</span>
            {translations.unStandard.str4}
            <br />• <span className={'modal-txt-color-b'}>{`\u007B alt1, alt2,...\u007d`}</span>
            {translations.unStandard.str5}
            <br />
          </span>
          <p className={'attention'}>
            <span className={'modal-txt-color-b'} style={{ fontWeight: 600 }}>
              <i className={'icon iconfont icon-tishi'} style={{ marginRight: '6px' }}></i>
              {translations.attention}
            </span>
            <p
              style={{ fontWeight: 550 }}
              dangerouslySetInnerHTML={{
                __html: translations.unStandard.attentionInfo(
                  `<span class='modal-txt-color-b'>**</span>`,
                  `<span class='modal-txt-color-b'>/path**</span>`,
                  `<span class='modal-txt-color-b'>/path*</span>`,
                  `<span class='modal-txt-color-b'>/path/**</span>`,
                  `<span class='modal-txt-color-b'>/path/**</span>`,
                ),
              }}
            ></p>
          </p>
          <Tittle title={translations.unStandard.typicalScene} className={'mb20 f16 mt40'} />
          <div className={'scene'}>
            {arr.map((item) => {
              return (
                <div className={'flex-r'}>
                  <p className={'one'}>{item.one}</p>
                  <p className={'two '}>
                    <span className={'modal-txt-color-b txt-bg'}>{item.two}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };
  TzConfirm({
    width: 1000,
    className: 'modal-confirm-body',
    title: translations.regularExpressionRuleDescription,
    icon: <span></span>,
    closable: true,
    content: <OpenConfirmBody />,
    onOk: () => {},
  });
};
const AddKeyManagement = (props: any, ref?: any) => {
  let navigate = useNavigate();
  const [result] = useSearchParams();
  let id = result.get('id');
  const [formIns] = Form.useForm();
  useEffect(() => {
    if (id) {
      getTrustedImagesRsaId({ id }).subscribe((res) => {
        if (res.error) return;
        let item = res.getItem();
        formIns.setFieldsValue(item);
      });
    } else {
      formIns.setFieldsValue({
        id: null,
        name: undefined,
        comment: undefined,
        registry: undefined,
        match_rule: undefined,
      });
    }
  }, []);
  let setHeader = () => {
    let title = id ? translations.editSecretKey : translations.newSecretKey;
    Store.header.next({
      title: title,
    });
    let breads = props.breadcrumb.slice(0);
    breads.pop();
    Store.breadcrumb.next([
      ...breads,
      {
        children: title,
      },
    ]);
  };
  let l = useLocation();
  useEffect(setHeader, [l]);
  let setFooter = useCallback(() => {
    Store.pageFooter.next(
      <div style={{ width: '100%', textAlign: 'right' }}>
        <TzButton
          className={'mr20'}
          onClick={() => {
            if (formChange.current) {
              TzConfirm({
                content: translations.unStandard.str38,
                cancelText: translations.breadcrumb_back,
                onOk: () => {
                  navigate(-1);
                },
              });
            } else {
              navigate(-1);
            }
          }}
        >
          {translations.cancel}
        </TzButton>
        <TzButton
          type={'primary'}
          onClick={() => {
            formIns.validateFields().then((val) => {
              let fn = val.id ? putTrustedImagesRsa : trustedImagesRsa;
              fn(val).subscribe((res) => {
                if (res.error && res.error.message) {
                  onSubmitFailed(res.error);
                } else {
                  showSuccessMessage(translations.scanner_images_addSuccess);
                  navigate(-1);
                  flushSync(() => {
                    navigate(`${Routes.ImageConfig}?tab=trustedkey`, {
                      replace: true,
                      state: { keepAlive: true },
                    });
                  });
                }
              });
            });
          }}
        >
          {id ? translations.save : translations.newAdd}
        </TzButton>
      </div>,
    );
  }, []);
  useEffect(() => {
    setFooter();
  }, [setFooter, l]);
  const repoOptions = useGetLibrary('url');
  let formChange = useRef(false);
  return (
    <div className={'mlr32'}>
      <TzForm
        form={formIns}
        onValuesChange={() => {
          formChange.current = true;
        }}
      >
        <TzCard
          title={translations.compliances_breakdown_taskbaseinfo}
          bodyStyle={{ paddingBottom: 0 }}
        >
          <TzFormItem name="id" hidden>
            <TzInput />
          </TzFormItem>
          <TzFormItem
            label={translations.keyName}
            name="name"
            rules={[
              {
                required: true,
                validator: (_, value) => {
                  if (value.length > 50 || !/^[0-9a-zA-Z_]+$/gi.test(value)) {
                    return Promise.reject(new Error(translations.nameRule));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <TzInput
              placeholder={translations.superAdmin_inputPlaceholder + translations.keyName}
            />
          </TzFormItem>
          <TzFormItem label={translations.keyDescription} name="comment">
            <TzInput
              placeholder={translations.superAdmin_inputPlaceholder + translations.keyDescription}
            />
          </TzFormItem>
        </TzCard>
        <TzCard
          title={
            <div className={'flex-r-c'}>
              {translations.rule}
              <TzButton onClick={showRegModal} type={'text'} className="mr-8">
                {translations.regularExpressionRuleDescription}
              </TzButton>
            </div>
          }
          className={'mt20'}
          bodyStyle={{ paddingBottom: 0 }}
        >
          <TzFormItem label={translations.effectiveWarehouse} name="registry">
            <TzSelect
              showSearch
              filterOption={(input, option) => {
                if (!option) return true;
                return (option as SelectItem).label.toLowerCase().indexOf(input) >= 0;
              }}
              placeholder={
                translations.originalWarning_pleaseSelect + translations.scanner_config_repoName
              }
              options={repoOptions}
            />
          </TzFormItem>
          <TzFormItem label={translations.mirrorRule} name="match_rule">
            <TzInput
              placeholder={translations.superAdmin_inputPlaceholder + translations.mirrorRule}
            />
          </TzFormItem>
        </TzCard>
      </TzForm>
      <p className="key-info-description mt20">
        <i className={'icon iconfont icon-xingzhuangjiehe'}></i> {translations.infoDescription}
      </p>
    </div>
  );
};
AddKeyManagement.Detail = (props: { id: any }) => {
  let { id } = props;
  let l = useLocation();
  const [info, setInfo] = useState<any>(undefined);
  let getTrustedImagesRsaIdFn = () => {
    getTrustedImagesRsaId({ id }).subscribe((res) => {
      if (res.error) return;
      let item = res.getItem();
      setInfo(item);
    });
  };
  useEffect(() => {
    getTrustedImagesRsaIdFn();
  }, []);
  const dataInfoList = useMemo(() => {
    if (!info) return [];
    const obj: any = {
      name: translations.keyName + '：',
      created_at: translations.clusterManage_createtime + '：',
      comment: translations.keyDescription + '：',
      public_key: translations.publicKey + '：',
      registry: translations.effectiveWarehouse + '：',
      match_rule: translations.mirrorRule + '：',
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: info[item],
      };
      if ('created_at' === item) {
        o['render'] = () => {
          return getTime(info[item]);
        };
      }
      if ('public_key' === item) {
        o['render'] = () => {
          return <TextHoverCopy text={info[item]} />;
        };
      }
      return o;
    });
  }, [info]);
  let setHeader = () => {
    Store.header.next({
      title: info?.name,
    });
  };
  useEffect(setHeader, [info, l]);
  return (
    <div className={'mlr32'}>
      <TzCard
        title={translations.compliances_breakdown_taskbaseinfo}
        bodyStyle={{ paddingBottom: 0 }}
      >
        <ArtTemplateDataInfo
          data={dataInfoList.slice(0, 2)}
          span={2}
          rowProps={{ gutter: [0, 0] }}
        />
        <ArtTemplateDataInfo
          data={dataInfoList.slice(2, 3)}
          span={1}
          rowProps={{ gutter: [0, 0] }}
        />

        <ArtTemplateDataInfo
          data={dataInfoList.slice(3, 4)}
          span={1}
          rowProps={{ gutter: [0, 0] }}
        />
      </TzCard>
      <TzCard
        className={'mt20'}
        title={
          <div className={'flex-r-c'}>
            {translations.rule}
            <TzButton onClick={showRegModal} type={'text'} className="mr-8">
              {translations.regularExpressionRuleDescription}
            </TzButton>
          </div>
        }
        bodyStyle={{ paddingBottom: 0 }}
      >
        <ArtTemplateDataInfo data={dataInfoList.slice(4)} span={1} rowProps={{ gutter: [0, 0] }} />
      </TzCard>
    </div>
  );
};
export default AddKeyManagement;
