import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { map } from 'rxjs/operators';
import AssetTopAction from '../../../components/AssetModule/TopActionBar';
import { TzCard } from '../../../components/tz-card';
import { TzTableKeyVal, TzTableServerPage } from '../../../components/tz-table';
import { getHistory } from '../../../services/DataService';
import { TzTabsNormal } from '../../../components/tz-tabs';
import './DetailTabRunStrategy.scss';
import { translations } from '../../../translations/translations';

interface IProps {
  children?: any;
  history?: any;
}

const defPagination = {
  current: 1,
  pageSize: 10,
  hideOnSinglePage: true,
};

const DetailTabRunStrategy = (props: IProps, ref?: any) => {
  const [record, setRecord] = useState(true);
  const tablelistRef = useRef<any>(null);

  useEffect(() => {}, []);

  const tableObj = useMemo(() => {
    if (!record) {
      return {};
    }
    return {
      // [translations.policyName]: name,
      [translations.policyName]: <span style={{ color: '#2899E5' }}> ts</span>,
      [translations.microseg_segments_policy_type]: 'ts',
      [translations.runtimePolicy_policy_desc]: 'Alias',
      [translations.runtimePolicy_policy_author]: '张三',
      [translations.policy_time]: '2020-09-01',
    };
  }, [record]);

  const reqFun = useCallback((pagination) => {
    const { current = 1, pageSize = 10 } = pagination;
    const offset = (current - 1) * pageSize;
    const pageParams = {
      offset,
      limit: pageSize,
    };
    return getHistory().pipe(
      map((res) => {
        return {
          data: [],
          total: 200,
        };
      }),
    );
  }, []);

  const rowKey = useCallback((item: any) => {
    return item.key;
  }, []);

  const columns = useMemo(() => {
    return [
      {
        title: translations.scanner_listColumns_namespace,
        dataIndex: 'key',
        key: 'key',
      },
      {
        title: translations.resource_name,
        dataIndex: 'cname',
        key: 'cname',
      },
      {
        title: translations.microseg_resources_res_kind,
        dataIndex: 'author',
        key: 'author',
      },
    ];
  }, []);

  const tabFun = useCallback((data) => {
    return getHistory().pipe(
      map((res) => {
        return {
          data: data,
          total: data.length,
        };
      }),
    );
  }, []);

  const tabColumns = useMemo(() => {
    return [
      {
        title: translations.runtimePolicy_container_path,
        dataIndex: 'path',
        key: 'path',
        width: '50%',
      },
      {
        title: translations.runtimePolicy_container_competence,
        dataIndex: 'authority',
        key: 'authority',
      },
    ];
  }, []);

  const TabList = useMemo(() => {
    const mockTabData = [
      {
        title: '1234',
        data: [
          { path: '/etc/passwd', authority: 'Read/Write ' },
          {
            path: '/data/wwwroot/unsafe/index.html',
            authority: 'Deny Read',
          },
          { path: '/etc/passwd', authority: 'Read/Write ' },
          {
            path: '/data/wwwroot/unsafe/index.html',
            authority: 'Deny Read',
          },
          { path: '/etc/passwd', authority: 'Read/Write ' },
          {
            path: '/data/wwwroot/unsafe/index.html',
            authority: 'Deny Read',
          },
        ],
      },
      {
        title: '456',
        data: [
          { path: '456-/etc/passwd', authority: '456-Read/Write ' },
          {
            path: '/data/wwwroot/unsafe/index.html',
            authority: 'Deny Read',
          },
        ],
      },
    ];
    return mockTabData.map((t) => {
      return {
        tab: <span>{t.title}</span>,
        tabKey: t.title,
        children: (
          <TzTableServerPage
            columns={tabColumns}
            defaultPagination={{
              current: 1,
              pageSize: 5,
              hideOnSinglePage: true,
            }}
            rowKey={rowKey}
            reqFun={() => tabFun(t.data)}
            equalServerPageAnyway={false}
          />
        ),
      };
    });
  }, []);

  useImperativeHandle(
    ref,
    () => {
      return {
        show() {},
      };
    },
    [],
  );
  return (
    <>
      <div className="detail-isolationStrategy-case">
        <AssetTopAction>
          <button className="btn-scan">{translations.edit}</button>
        </AssetTopAction>
        <div className="details-content-case">
          <TzCard
            headStyle={{ padding: 0 }}
            bodyStyle={{ paddingLeft: 0, paddingRight: 0 }}
            title={<span className="subtitle">{translations.activeDefense_baseInfo}</span>}
            className="detail-info-card initCard"
          >
            <TzTableKeyVal data={tableObj} />
          </TzCard>
          <TzCard
            headStyle={{ padding: 0 }}
            bodyStyle={{ paddingLeft: 0, paddingRight: 0 }}
            title={<span className="subtitle">{translations.range}</span>}
            className="detail-info-card initCard"
          >
            <TzTableServerPage
              columns={columns}
              defaultPagination={defPagination}
              rowKey={rowKey}
              reqFun={reqFun}
              ref={tablelistRef}
              equalServerPageAnyway={false}
            />
          </TzCard>
          <TzCard
            headStyle={{ padding: 0 }}
            bodyStyle={{ paddingLeft: 0, paddingRight: 0 }}
            title={<span className="subtitle">{translations.configOption}</span>}
            className="detail-info-card initCard"
          >
            <div className="tab-title-pos">
              {translations.onlineVulnerability_innerShapeMeaning}
            </div>
            <TzTabsNormal
              tabpanes={TabList}
              tabPosition="left"
              centered
              className="table-tabs"
            ></TzTabsNormal>
          </TzCard>
        </div>
      </div>
    </>
  );
};

export default forwardRef(DetailTabRunStrategy);
