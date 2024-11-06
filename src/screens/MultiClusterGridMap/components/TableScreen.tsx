import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { translations } from '../../../translations/translations';
import { TzTable } from '../../../components/tz-table';
import SearchInputCom from '../../../components/search-input/SearchInputComponent';
import { useTableScreenColumns } from './use_fn';
export interface TableScreenProps {
  dataSource: any[];
  type: string;
  activeKey: 'ingress' | 'egress';
  onActItem: (id: string) => void;
}
export const grayStyle = {
  background: 'rgba(33, 119, 209, 0.05)',
  fontSize: '12px',
  color: '#6C7480',
  maxWidth: '100%',
};

const TableScreen = forwardRef((props: TableScreenProps, ref: any) => {
  let { type, dataSource = [], onActItem } = props;
  const [search, setSearch] = useState('');
  const [actKey, setActKey] = useState<any>(null);
  let columns = useTableScreenColumns(type);
  let newColumns = useMemo(() => {
    switch (props.type) {
      case 'resource':
        columns[0].title =
          props.activeKey === 'egress'
            ? translations.chart_map_columns_targetResource
            : translations.chart_map_columns_sourceResources;
        columns[1].title = translations.clusterGraphList_namespace;
        break;
      case 'pod':
        columns[0].title =
          props.activeKey === 'egress'
            ? translations.chart_map_columns_targetPod
            : translations.chart_map_columns_sourcePod;
        break;
      case 'container':
        columns[0].title =
          props.activeKey === 'egress'
            ? translations.chart_map_columns_targetContainer
            : translations.chart_map_columns_sourceContainer;
        break;
      case 'process':
        columns[0].title = translations.chart_map_columns_associateProcess;
        break;
    }

    return columns;
  }, [props.activeKey, columns, props.type]);
  const newDataSource = useMemo(() => {
    if (!search) return dataSource;
    return dataSource.filter((t) => {
      let name = '';
      if (props.type == 'pod') {
        name = t.pod_name;
      } else if ('container' == props.type) {
        name = t.container_name;
      } else if ('process' == props.type) {
        name = t.process_name;
      } else if ('resource' == props.type) {
        name = t.resource_name;
      }
      return !!name?.includes(search);
    });
  }, [search, dataSource]);

  const searchPlaTxt = useMemo(() => {
    let obj: any = {
      resource: translations.chart_map_searchResource,
      container: translations.chart_map_searchContainer,
      process: translations.chart_map_searchProcess,
      pod: translations.chart_map_searchPod,
    };
    return obj[type];
  }, [type]);
  useEffect(() => {
    setActKey(null);
    setSearch('');
  }, [dataSource]);
  let tableScreenRef = useRef();
  useImperativeHandle(ref, () => {
    return {
      setNodeAct(id: string) {
        setActKey(id);
        id &&
          $(tableScreenRef.current)
            .find(`tr[data-row-key="${id}"]`)[0]
            ?.scrollIntoView({ block: 'center', inline: 'start' });
      },
    };
  }, [props]);
  return (
    <>
      <SearchInputCom placeholder={searchPlaTxt} onChange={setSearch} />
      <div style={{ maxHeight: 'calc(100% - 36px)', overflowY: 'auto' }} ref={tableScreenRef}>
        <TzTable
          className="nohoverTable"
          dataSource={newDataSource}
          pagination={false}
          sticky={true}
          onRow={(record) => {
            return {
              onClick: (event) => {
                event.stopPropagation();
                setActKey(record.id);
                onActItem(record.id);
              },
            };
          }}
          rowKey={'id'}
          rowClassName={(record) => {
            return actKey === record.id ? 'tb-clicked-tr' : '';
          }}
          columns={newColumns}
        />
      </div>
    </>
  );
});
export default TableScreen;
