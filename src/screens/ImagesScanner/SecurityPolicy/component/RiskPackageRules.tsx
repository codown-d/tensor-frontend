import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { TzCard, TzCardHeaderState } from '../../../../components/tz-card';
import { MyFormItem, TzFormItem, TzFormItemsSubTit } from '../../../../components/tz-form';
import { translations } from '../../../../translations/translations';
import Form from 'antd/lib/form';
import { FormInstance, NamePath } from 'rc-field-form/lib/interface';
import { RenderTag, TzTag } from '../../../../components/tz-tag';
import { TzSwitch } from '../../../../components/tz-switch';
import TzInputSearch from '../../../../components/tz-input-search';
import TableEdit from './VulnTableEdit';
import AddInfoBtn from '../../../../components/ComponentsLibrary/AddInfoBtn';
import { TzTable } from '../../../../components/tz-table';
import {
  StrategyAction,
  segmentedOp,
} from '../../../../components/ComponentsLibrary/TzStrategyAction';
import { tabType } from '../../ImagesScannerScreen';
import { useFormErrorInfo } from '../../../../components/tz-form/useFormLib';
import { securityPolicyValidator } from '../SecurityPolicyEdit';
import VulnTableEdit from './VulnTableEdit';
import _, { find, isEmpty, keys, set } from 'lodash';
import ArtTemplateDataInfo from '../../../../components/ComponentsLibrary/ArtTemplateDataInfo';
import { TzSelect } from '../../../../components/tz-select';
import { useMemoizedFn } from 'ahooks';
import useLayoutMainSearchWid from '../../../../helpers/useLayoutMainSearchWid';
export let riskPackageColumns = [
  {
    title: translations.scanner_detail_soft_pack,
    dataIndex: 'name',
    width: '40%',
    editable: true,
  },
  {
    title: translations.package_version,
    dataIndex: 'installVersion',
    editable: true,
  },
];

const RiskPackageRules = (props: any) => {
  let { form, errorFields, title, id, imageFromType, setErrorFields } = props;
  let tableEditRef = useRef<any>();
  let { errorInfo } = useFormErrorInfo(errorFields, ['pkg.black']);

  let pkgBlack = Form.useWatch(['pkg', 'black'], form);
  let validator = ({ getFieldsValue }: FormInstance<any>) => {
    return new Promise((resolveFunc, rejectFunc) => {
      let { pkg } = getFieldsValue([['pkg', 'enable']]);
      if (pkg.enable) {
        tableEditRef.current?.form
          .validateFields()
          .then((val: unknown) => {
            if (keys(val).length) {
              setErrorFields({
                'pkg.black': undefined,
              });
              resolveFunc(val);
            } else {
              setErrorFields({
                'pkg.black': translations.unStandard.riskPackage1Tip,
              });
              rejectFunc(new Error(translations.unStandard.riskPackage1Tip));
            }
          })
          .catch(({ values }: any) => {
            let f = find(values, (item) => {
              return !_.values(item).some(isEmpty);
            });
            if (!f) {
              setErrorFields({
                'pkg.black': translations.unStandard.riskPackage1Tip,
              });
              rejectFunc(new Error(translations.unStandard.riskPackage1Tip));
            } else {
              setErrorFields({
                'pkg.black': undefined,
              });
            }
          });
      } else {
        tableEditRef.current?.form.resetFields();
        setErrorFields({
          'pkg.black': undefined,
        });
        resolveFunc(undefined);
      }
    });
  };
  return (
    <TzCard className={classNames({ 'has-error': errorInfo })} title={title} id={id}>
      <TzFormItem
        label={translations.functionSwitch}
        name={['pkg', 'enable']}
        valuePropName="checked"
        initialValue={false}
      >
        <TzSwitch
          checkedChildren={translations.confirm_modal_isopen}
          unCheckedChildren={translations.confirm_modal_isclose}
        />
      </TzFormItem>
      {tabType.deploy === imageFromType && (
        <TzFormItem
          label={translations.imageReject_strategy_action_title}
          name={['pkg', 'action']}
          initialValue={'alarm'}
        >
          <StrategyAction data={segmentedOp} />
        </TzFormItem>
      )}
      <TzFormItemsSubTit errorInfo={errorInfo} />
      <TzFormItem
        label={translations.custom_risk_software_package}
        rules={[
          (formInstance) => ({
            validator: () => validator(formInstance),
          }),
        ]}
        name={['pkg', 'black']}
        initialValue={[]}
        style={{ marginBottom: 0, paddingBottom: 0 }}
      ></TzFormItem>
      <VulnTableEdit
        value={pkgBlack}
        columns={riskPackageColumns}
        ref={tableEditRef}
        onChange={(val) => {
          form.setFieldValue(['pkg', 'black'], [...val]);
        }}
        locale={{ emptyText: <></> }}
      />
      <AddInfoBtn
        className={'mt6'}
        onClick={() => {
          tableEditRef.current.push({ name: undefined, installVersion: undefined });
        }}
      />
    </TzCard>
  );
};
export let useRiskPackageDataInfo = (pkg: { [x: string]: any }) => {
  let dataInfo = useMemo(() => {
    if (!pkg) return [];
    const obj: any = {
      action: translations.imageReject_strategy_action_title,
    };
    return keys(obj).map((item) => {
      let o: any = {
        title: obj[item] || '-',
        content: pkg[item],
      };
      if ('action' === item) {
        o['className'] = 'item-flex-center';
        o['render'] = (row: any) => {
          return <RenderTag type={pkg[item]} />;
        };
      }
      return o;
    });
  }, [pkg]);
  return dataInfo;
};
export let RiskPackageDetailDom = (props: {
  data: any;
  imageFromType: tabType;
  from?: 'snapshot';
}) => {
  let { data, imageFromType, from } = props;
  let dataList = useRiskPackageDataInfo(data);
  const [searchBlack, setSearchBlack] = useState('');
  const filterDataBlack = useMemo(() => {
    const sdata = data?.black?.filter((item: { [s: string]: unknown } | ArrayLike<unknown>) => {
      return Object.values(item).some((val) => {
        if (typeof val === 'string' || typeof val === 'number') {
          return val.toString().includes(searchBlack);
        }
        return false;
      });
    });
    return sdata;
  }, [data, searchBlack]);
  const fitlerWid = useLayoutMainSearchWid({});
  return (
    <>
      {imageFromType === tabType.deploy ? (
        <ArtTemplateDataInfo data={dataList.slice(0, 1)} span={1} rowProps={{ gutter: [0, 0] }} />
      ) : null}
      <TzFormItemsSubTit />
      <div className={'flex-r-c'}>
        <span style={{ color: '#6C7480' }}>{translations.custom_risk_software_package}</span>
        {from === 'snapshot' ? null : (
          <TzInputSearch
            style={{ width: fitlerWid }}
            placeholder={translations.unStandard.riskPackageSearchTip}
            onSearch={setSearchBlack}
          />
        )}
      </div>
      <TzTable
        columns={riskPackageColumns}
        dataSource={filterDataBlack}
        pagination={{ defaultPageSize: 5, hideOnSinglePage: true }}
      />
    </>
  );
};
RiskPackageRules.Detail = ({ data, id, title, imageFromType }: any) => {
  let pkg = data.pkg || {};
  return (
    <TzCard
      title={
        <>
          {title}
          <RenderTag type={pkg.enable + ''} className={'ml10'} />
        </>
      }
      id={id}
      bodyStyle={{ paddingTop: 0 }}
    >
      <RiskPackageDetailDom data={pkg} imageFromType={imageFromType} />
    </TzCard>
  );
};
export default RiskPackageRules;
