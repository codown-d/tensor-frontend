import { useMemoizedFn } from 'ahooks';
import { isArray, isNumber, keys, merge, result } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TzButton } from '../../../components/tz-button';
import { TzCard } from '../../../components/tz-card';
import { dockerfileTemplates, postDockerfileScan } from '../../../services/DataService';
import { Store } from '../../../services/StoreService';
import { TzForm, TzFormItem } from '../../../components/tz-form';
import { TzMessageSuccess } from '../../../components/tz-mesage';
import { TzConfirm } from '../../../components/tz-modal';
import { TzSelect } from '../../../components/tz-select';
import { translations } from '../../../translations/translations';
import Form, { FormInstance } from 'antd/lib/form';
import TzTextArea from '../../../components/ComponentsLibrary/TzTextArea';
import '../YamlIacRisk/index.scss';
import TzAceEditor from '../YamlIacRisk/TzAceEditor';
import { LoadingOutlined } from '@ant-design/icons';
import YamlIacRisk from '../YamlIacRisk';
import { useLocation } from 'react-router-dom';
export let promiseDockerfileScan = (
  data: any,
  formIns: FormInstance,
  callback?: (reg: any) => void,
) => {
  return new Promise(async function (resolve, reject) {
    formIns.validateFields().then((values) => {
      postDockerfileScan(merge({}, data, values)).subscribe((res) => {
        if (res.error) {
          reject();
          return;
        }
        TzMessageSuccess(translations.scanner_images_success);
        let item = res.getItem();
        callback && callback(item);
        resolve(res);
      });
    });
  });
};
let DockerfileContentModal = (props: any) => {
  let { formIns } = props;
  let [strategyList, setStrategyList] = useState<any>([]);
  useEffect(() => {
    dockerfileTemplates({ name: '', offset: 0, limit: 10000 }).subscribe((res) => {
      if (!res['error']) {
        let items = res.getItems().map((item: any) => {
          return {
            label: item.name,
            value: item.id,
          };
        });
        setStrategyList(items);
      }
    });
    return () => {
      formIns.resetFields();
    };
  }, []);
  return (
    <TzForm form={formIns} autoComplete="off">
      <TzFormItem
        name="template_id"
        label={`${translations.scan_baseline}：`}
        rules={[
          {
            required: true,
            message: translations.please_select_scanning_baseline,
          },
        ]}
      >
        <TzSelect
          placeholder={translations.please_select_scanning_baseline}
          options={strategyList}
        />
      </TzFormItem>
      <TzFormItem name="dockerfile" hidden>
        <TzTextArea placeholder={translations.please_select_scanning_baseline} />
      </TzFormItem>
    </TzForm>
  );
};
enum dockerfileStateEnum {
  pre_scan = 'pre_scan',
  scaning = 'scaning',
  after_scan = 'after_scan',
}
let ManualScanning = () => {
  let [dockerfileResult, setDockerfileResult] = useState<{
    result: any[];
    result_count: any;
    dockerfile: string;
    parse_error: string;
  }>();
  const [dockerfileState, setDockerfileState] = useState<'pre_scan' | 'scaning' | 'after_scan'>(
    dockerfileStateEnum.pre_scan,
  );
  let l = useLocation();
  const [height, setHeight] = useState<any>(0);
  const [value, setValue] = useState<any>(0);
  const [formIns] = Form.useForm();
  let aceRef = useRef<any>();
  let setHeader = useMemoizedFn(() => {
    Store.header.next({
      title: translations.manual_scanning,
      extra: (
        <TzButton
          disabled={dockerfileState === dockerfileStateEnum.scaning}
          onClick={() => {
            if (dockerfileState === dockerfileStateEnum.after_scan) {
              setValue('');
              setDockerfileState(dockerfileStateEnum.pre_scan);
            } else {
              let dockerfile = aceRef.current.editor.getValue();
              formIns.setFieldsValue({ dockerfile });
              setValue(dockerfile);
              TzConfirm({
                title: translations.customScan,
                content: <DockerfileContentModal formIns={formIns} />,
                width: '520px',
                okText: translations.scanner_images_scann,
                cancelText: translations.cancel,
                onOk() {
                  setDockerfileState(dockerfileStateEnum.scaning);
                  return promiseDockerfileScan({}, formIns, (val) => {
                    setDockerfileResult(merge({}, val, { dockerfile }));
                    setDockerfileState(dockerfileStateEnum.after_scan);
                  }).catch(() => {
                    setDockerfileState(dockerfileStateEnum.pre_scan);
                  });
                },
              });
            }
          }}
        >
          {dockerfileState === dockerfileStateEnum.pre_scan ? (
            translations.start_scanning
          ) : dockerfileState === dockerfileStateEnum.scaning ? (
            <>
              <LoadingOutlined className="mr4" />
              {translations.scanner_images_running}
            </>
          ) : (
            translations.clear_results
          )}
        </TzButton>
      ),
    });
  });
  useEffect(setHeader, [aceRef, dockerfileState, l]);
  return (
    <div className="mlr32 manual-scanning mt4">
      {dockerfileState === dockerfileStateEnum.after_scan ? (
        <>
          <YamlIacRisk
            option={{
              mode: 'dockerfile',
              value: dockerfileResult?.dockerfile,
              readOnly: true,
            }}
            result={dockerfileResult?.result || []}
            result_count={dockerfileResult?.result_count}
          />
          {dockerfileResult?.parse_error && (
            <TzCard title={translations.parsing_error} className="mt20 mb40">
              <p
                style={{
                  background: '#F4F6FA',
                  color: '#3E4653',
                  padding: '12px 24px',
                  maxHeight: '214px',
                  overflow: 'auto',
                  whiteSpace: 'break-spaces',
                }}
              >
                {`${dockerfileResult.parse_error}`}
              </p>
            </TzCard>
          )}
        </>
      ) : (
        <TzCard
          title={
            <>
              {translations.dockerfile_file}
              <br />
              <p className="f12 f-l">{translations.please_input_contents}</p>
            </>
          }
        >
          <div
            style={{ height: 'calc(100vh - 273px)', overflow: 'auto', background: '#F4F6FA' }}
            ref={(node) => {
              setHeight($(node).height());
            }}
          >
            {height && (
              <TzAceEditor
                ref={aceRef}
                value={value}
                height={height + 'px'}
                showPrintMargin={false}
                placeholder="Dockerfile"
                mode={'dockerfile'}
                setOptions={{
                  showLineNumbers: true,
                  tabSize: 2,
                }}
              />
            )}
          </div>
        </TzCard>
      )}
    </div>
  );
};
export default ManualScanning;
