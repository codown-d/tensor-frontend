import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  versionSystem,
  versionATTCK,
  dbVersion,
  sensitiveRuleList,
  deleteSensitiveRule,
  postSensitiveRule,
  putSensitiveRule,
} from '../../services/DataService';
import { localLang, translations } from '../../translations/translations';
import './SystemUpgrade.scss';
import { TzButton } from '../../components/tz-button';
import { TzMessageSuccess } from '../../components/tz-mesage';
import FileUpload from './FileUpload';
import { TzCard } from '../../components/tz-card';
import { showFailedMessage } from '../../helpers/response-handlers';
import { merge } from 'lodash';
import { TzConfirm, TzModal } from '../../components/tz-modal';
import { TzForm, TzFormItem } from '../../components/tz-form';
import { getUid } from '../../helpers/until';
import { Routes } from '../../Routes';
import moment from 'moment';
import { TzRadioGroup } from '../../components/tz-radio';
import Form from 'antd/lib/form';
import { getUserInformation } from '../../services/AccountService';
import { TzInput } from '../../components/tz-input';
import { TzTable } from '../../components/tz-table';
import ArtTemplateDataInfo from '../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { useNavigate } from 'react-router-dom';
import TzInputSearch from '../../components/tz-input-search';
import TzTextArea from '../../components/ComponentsLibrary/TzTextArea';

export let virusOptions = [
  {
    label: 'clamav',
    value: 'clamav',
  },
  {
    label: translations.avria,
    value: 'avira',
  },
  {
    label: translations.vulnerability_library,
    value: 'trivy',
  },
];
const SystemUpgrade = () => {
  const navigate = useNavigate();
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [dataSourceSensitiveRule, setDataSourceSensitiveRule] = useState<any>([]);
  const [showModalSensitiveRule, setShowModalSensitiveRule] = useState<any>(false);
  const [dbVersionDataSource, setDBVersionDataSource] = useState<any>([]);
  const [formSensitiveRule] = Form.useForm();
  let getSystemInfo = () => {
    versionSystem().subscribe((res) => {
      let item = res.getItem();
      setSystemInfo((pre: any) => merge({}, pre, item));
    });
    versionATTCK().subscribe((res: any) => {
      const { lastUpdateTime, version } = res.getItem();
      setSystemInfo((pre: any) => merge({}, pre, { ruleVersion: version, lastUpdateTime }));
    });
    dbVersion().subscribe((res: any) => {
      let items = res.getItems();
      if (res.error) return;
      let node = items.shift();
      setSystemInfo((pre: any) =>
        merge({}, pre, { ruleVersionVuln: node?.version, lastUpdateTimeVuln: node?.updateTime }),
      );
      setDBVersionDataSource(items);
    });
  };
  let sensitiveRuleListFn = useCallback((keyword?: any) => {
    const params = {
      offset: 0,
      limit: 10000,
      keyword: keyword || '',
    };
    sensitiveRuleList(params).subscribe((res) => {
      let items = res.getItems().filter((item) => !keyword || (item.value + item.description).indexOf(keyword) != -1);
      setDataSourceSensitiveRule(items);
    });
  }, []);
  useEffect(() => {
    getSystemInfo();
    sensitiveRuleListFn('');
  }, []);

  const systemInfoData = useMemo(() => {
    if (!systemInfo) return [];
    const obj: any = {
      softName: translations.calico_cluster_name + '：',
      version: translations.version + '：',
      ruleVersion: translations.recently_updated_rule_base_version + '：',
      lastUpdateTime: translations.notificationCenter_placeEvent_updateTime + '：',
      //   database_version: translations.virus_database_version + '：',
      //   virus_databases: translations.number_virus_databases + '：',
      ruleVersionVuln: translations.recently_updated_vuln_lib_version + '：',
      lastUpdateTimeVuln: translations.notificationCenter_placeEvent_updateTime + '：',
      ruleVersionVirus: translations.recently_updated_virus_lib_version + '：',
      lastUpdateTimeVirus: translations.notificationCenter_placeEvent_updateTime + '：',
    };
    return Object.keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: systemInfo[item],
      };
      if ('softName' === item || 'version' === item) {
        o['className'] = 'w46';
      }
      if ('ruleVersion' === item || 'ruleVersionVuln' === item || 'ruleVersionVirus' === item) {
        o['className'] = 'w140';
      }
      if ('lastUpdateTime' === item || 'lastUpdateTimeVuln' === item || 'lastUpdateTimeVirus' === item) {
        o['className'] = 'w70';
        o['render'] = () => {
          return systemInfo[item] ? moment(systemInfo[item]).format('YYYY-MM-DD HH:mm:ss') : '-';
        };
      }
      if ('database_version' === item) {
        o['render'] = () => {
          return '8.20.18.248';
        };
      }
      if ('virus_databases' === item) {
        o['render'] = () => {
          return 6832211;
        };
      }
      return o;
    });
  }, [systemInfo]);
  const [formIns] = Form.useForm();
  let userInfo = getUserInformation();
  let openTzConfirm = useCallback((action, title, callback) => {
    let getFileName = (action: string) => {
      let str = translations.vulnerability_library;
      if (action.indexOf('ATTCK/conf') != -1) {
        str = translations.rule_base;
      } else if (action.indexOf('update/malicious') != -1) {
        str = translations.virus_database;
      } else if (action.indexOf('/scanner/db/update') != -1) {
        str = translations.vulnerability_library;
      }
      return str;
    };
    let modal = TzConfirm({
      className: 'footer_null',
      title,
      content: (
        <TzForm initialValues={{ options: 'clamav', updater: userInfo.username }} form={formIns}>
          {action.indexOf('update/malicious') != -1 ? (
            <>
              <TzFormItem name="updater" hidden>
                <TzInput />
              </TzFormItem>
              <TzFormItem
                label={translations.virus_type}
                name="options"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <TzRadioGroup options={virusOptions.slice(0, -1)} />
              </TzFormItem>
            </>
          ) : null}
          <TzFormItem
            name={'file'}
            label={getFileName(action)}
            style={{ marginBottom: '0px' }}
            rules={[
              {
                required: true,
                message: translations.activeDefense_serviceNamePla,
              },
            ]}
          >
            <FileUpload
              uploadProps={{
                id: getUid(),
                action,
                method: 'PUT',
              }}
              formIns={formIns}
              callback={(r: any) => {
                if (r.code) {
                  showFailedMessage(r.message || translations.upload_failed_try);
                } else {
                  modal.destroy();
                  callback();
                  TzMessageSuccess(translations.upload_succeeded);
                }
              }}
            />
          </TzFormItem>
        </TzForm>
      ),
    });
  }, []);
  let columns = [
    {
      title: translations.unStandard.str216,
      dataIndex: 'dbType',
      render: (text: any) => {
        let node = virusOptions.find((item) => item.value === text);
        return node?.label;
      },
    },
    {
      title: translations.unStandard.str217,
      dataIndex: 'version',
      render: (text: number, row: any, index: number) => {
        return text || '-';
      },
    },
    {
      title: 'translations.runtimePolicy_policy_updated_at',
      dataIndex: 'updateTime',
      render: (text: number, row: any, index: number) => {
        return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-';
      },
    },
  ];
  const sensitiveColumns = useMemo(() => {
    let arr = [
      {
        title: translations.rule,
        key: 'value',
        dataIndex: 'value',
      },
      {
        title: translations.notificationCenter_details_description,
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: translations.clusterManage_operate,
        width: '120px',
        className: 'td-center',
        render: (record: any, row: any) => {
          return row.isDefault ? (
            '-'
          ) : (
            <>
              <TzButton
                type={'text'}
                onClick={() => {
                  setShowModalSensitiveRule(true);
                  formSensitiveRule.setFieldsValue(row);
                }}
              >
                {translations.edit}
              </TzButton>
              <TzButton
                type={'text'}
                danger
                className="ml4"
                onClick={() => {
                  TzConfirm({
                    content: translations.unStandard.str41(row.value),
                    onOk: () => {
                      deleteSensitiveRule(row).subscribe((res) => {
                        if (res.error) {
                          return;
                        }
                        TzMessageSuccess(translations.delete_success_tip);
                        sensitiveRuleListFn();
                      });
                    },
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
        },
      },
    ];
    return arr;
  }, []);
  const isEdit = Form.useWatch('id', formSensitiveRule);

  return (
    <div className="system-upgrade">
      <TzCard className={'mb20'} title={translations.system}>
        <ArtTemplateDataInfo data={systemInfoData.slice(0, 2)} span={2} rowProps={{ gutter: [0, 0] }} />
      </TzCard>
      <TzCard
        className={'mb20'}
        title={translations.rule_base}
        bodyStyle={{ paddingBottom: '0px' }}
        extra={
          <>
            <TzButton
              onClick={() =>
                openTzConfirm(
                  '/api/v2/containerSec/ATTCK/conf',
                  translations.offline_update_of_rule_base,
                  getSystemInfo,
                )
              }
              type={'text'}
            >
              {translations.offline_update_of_rule_base}
            </TzButton>
            <TzButton
              onClick={() => {
                navigate(`${Routes.UpgradeHistory}`);
              }}
              className={'ml8'}
              type={'text'}
            >
              {translations.history}
            </TzButton>
          </>
        }
      >
        <ArtTemplateDataInfo data={systemInfoData.slice(2, 4)} span={2} rowProps={{ gutter: [0, 0] }} />
      </TzCard>
      <TzCard
        className={'mb20'}
        title={translations.vulnerability_library}
        bodyStyle={{ paddingBottom: '0px' }}
        extra={
          <>
            <TzButton
              onClick={() =>
                openTzConfirm(
                  '/api/v2/containerSec/scanner/db/update',
                  translations.offline_update_of_vulnerability_library,
                  getSystemInfo,
                )
              }
              type={'text'}
            >
              {translations.offline_update_of_vulnerability_library}
            </TzButton>
            <TzButton
              onClick={() => {
                navigate(Routes.VulnUpgradeHistory);
              }}
              className={'ml8'}
              type={'text'}
            >
              {translations.history}
            </TzButton>
          </>
        }
      >
        <ArtTemplateDataInfo data={systemInfoData.slice(4, 6)} span={2} rowProps={{ gutter: [0, 0] }} />
      </TzCard>
      {false && (
        <TzCard
          title={translations.virus_database}
          className={'mb20'}
          extra={
            <>
              <TzButton
                onClick={() =>
                  openTzConfirm(
                    '/api/v2/containerSec/scanner/db/update/malicious',
                    translations.virus_update_offline,
                    getSystemInfo,
                  )
                }
                type={'text'}
              >
                {translations.virus_update_offline}
              </TzButton>
              <TzButton
                onClick={() => {
                  navigate(Routes.VirusUpgradeHistory);
                }}
                className={'ml8'}
                type={'text'}
              >
                {translations.history}
              </TzButton>
            </>
          }
        >
          <TzTable dataSource={dbVersionDataSource} columns={columns} pagination={false} />
        </TzCard>
      )}
      <TzCard title={<>{translations.sensitive_file_rule_config}</>} className={'mb20'}>
        <p className={'mb12'} style={{ overflow: 'hidden' }}>
          <TzButton
            onClick={() => {
              setShowModalSensitiveRule(true);
            }}
          >
            {translations.newAdd}
          </TzButton>
          <TzInputSearch
            className={'f-r'}
            style={{ width: '370px' }}
            placeholder={translations.unStandard.str223}
            onChange={(value: any) => sensitiveRuleListFn(value)}
          />
        </p>
        <TzTable
          columns={sensitiveColumns}
          scroll={{ y: $('body').width() >= 1440 ? 450 : 450 }}
          rowKey={'id'}
          dataSource={dataSourceSensitiveRule}
          pagination={false}
        />
      </TzCard>

      <TzModal
        open={showModalSensitiveRule}
        destroyOnClose
        title={isEdit ? translations.edit_sensitive_file_rule : translations.added_sensitive_file_rule}
        okText={isEdit ? translations.save : translations.scanner_config_confirm}
        onCancel={() => {
          formSensitiveRule.resetFields();
          setShowModalSensitiveRule(false);
        }}
        onOk={() => {
          formSensitiveRule?.validateFields().then((value: any) => {
            const loginUser = getUserInformation().username;
            let fn = isEdit ? putSensitiveRule : postSensitiveRule;
            fn({ ...value, updater: loginUser }).subscribe((res) => {
              if (res.error) return;
              setShowModalSensitiveRule(false);
              TzMessageSuccess(isEdit ? translations.edit_succeeded : translations.add_success_tip);
              formSensitiveRule.resetFields();
              sensitiveRuleListFn();
            });
          });
        }}
      >
        <TzForm form={formSensitiveRule}>
          <TzFormItem name={'id'} hidden>
            <TzInput />
          </TzFormItem>
          <TzFormItem
            label={translations.imageReject_sensitiveRules_tab_title}
            name={'value'}
            style={{ marginBottom: 0 }}
            rules={[
              {
                required: true,
                message: translations.unStandard.str219,
              },
            ]}
            extra={translations.unStandard.str220}
          >
            <TzInput placeholder={translations.unStandard.str237} />
          </TzFormItem>
          <TzFormItem
            label={translations.notificationCenter_details_description}
            name={'description'}
            style={{ marginBottom: 0 }}
            rules={[
              {
                required: true,
                message: translations.unStandard.str222,
              },
            ]}
          >
            <TzTextArea placeholder={translations.unStandard.str221} maxLength={150} />
          </TzFormItem>
        </TzForm>
      </TzModal>
    </div>
  );
};
export default SystemUpgrade;
