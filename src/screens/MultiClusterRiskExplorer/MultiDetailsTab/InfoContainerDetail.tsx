import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { TzCard } from '../../../components/tz-card';
import { translations } from '../../../translations/translations';
import { TzTable, TzTableKeyVal, TzTableServerPage } from '../../../components/tz-table';
import { TzInputSearch } from '../../../components/tz-input-search';
import { getHistory } from '../../../services/DataService';
import { map } from 'rxjs/operators';
import EllipsisPopover from '../../../components/ellipsisPopover/ellipsisPopover';
import { TzTooltip } from '../../../components/tz-tooltip';
import { TzButton } from '../../../components/tz-button';
import { Tittle } from '../../../components/ComponentsLibrary/Tittle';

interface IProps {
  children?: any;
  history?: any;
  containerName?: string;
  containerData: any;
}

const defPagination = {
  current: 1,
  pageSize: 5,
  hideOnSinglePage: true,
};

const InfoContainerDetail = (props: IProps, ref?: any) => {
  const {
    containerName,
    containerData: {
      name,
      type,
      working_dir,
      command,
      image_name,
      image_tag,
      image_repo,
      envs = [],
      frame_work_info = [
        {
          frame_name: '-',
          language: '-',
          version: '-',
        },
      ],
      volume_mounts,
      ports = [],
    },
  } = props;
  const [search, setSearch] = useState('');
  const [searchVolumeMounts, setSearchVolumeMounts] = useState('');
  const tabelEnvs = useMemo(() => {
    if (!envs.length) {
      return '-';
    }
    return (
      <>
        <div className="df dfac envs-case">
          <span className="cell-key">{translations.key}</span>
          <span className="cell-value">{translations.value}</span>
        </div>
        {envs.map((t: any) => {
          if (!t?.name) {
            return null;
          }
          return (
            <div className="df dfac envs-case">
              <span className="cell-key">
                {/* <EllipsisPopover>{t.name}:</EllipsisPopover> */}
                <TzTooltip title={t.name}>{t.name}</TzTooltip>：
              </span>
              <span className="cell-value">
                {/* <EllipsisPopover>{t.value || '-'}</EllipsisPopover> */}
                <TzTooltip title={t.value || '-'}>{t.value || '-'}</TzTooltip>
              </span>
            </div>
          );
        })}
      </>
    );
  }, [envs]);

  const tableObj = useMemo(() => {
    return {
      [translations.clusterGraphList_tabInfo_containerName]: (
        <span style={{ maxWidth: '410px' }}>
          <EllipsisPopover>{name}</EllipsisPopover>
        </span>
      ),
      [translations.clusterGraphList_tabInfo_containerType]: type || '-',
      [translations.clusterGraphList_tabInfo_containerDirectory]: working_dir || '-',
      [translations.clusterGraphList_tabInfo_order]: command || '-',
      [translations.clusterGraphList_containerDetail_imageName]: image_name || '-',
      [translations.clusterGraphList_containerDetail_version]: image_tag || '-',
      [translations.clusterGraphList_containerDetail_imageDepot]: image_repo || '-',
      [translations.clusterGraphList_containerDetail_frameName]: frame_work_info?.[0].frame_name || '-',
      [translations.filePath]: frame_work_info?.[0].file_path || '-',
      [translations.clusterGraphList_containerDetail_frameLanguage]: frame_work_info?.[0].language || '-',
      [translations.clusterGraphList_containerDetail_frameVersion]: frame_work_info?.[0].version || '-',
      [translations.clusterGraphList_containerDetail_environmentVariable]: tabelEnvs,
    };
  }, [name, type, working_dir, command, image_name, image_tag, image_repo, frame_work_info, tabelEnvs]);

  const onSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const reqFun = useCallback(
    (pagination, filter) => {
      const { current = 1, pageSize = 5 } = pagination;
      const offset = (current - 1) * pageSize;
      const filterPorts = (ports || [])
        .slice(0)
        .filter(
          (t: any) =>
            (t?.name || '').includes(search) ||
            String(t?.containerPort).includes(search) ||
            t?.protocol.includes(search) ||
            !search,
        )
        .filter((t: any) => !filter || !filter.protocol || filter.protocol.includes(t.protocol));
      const items = filterPorts.slice(offset, offset + pageSize);
      return getHistory().pipe(
        map(() => {
          return {
            data: items,
            total: ports.length,
          };
        }),
      );
    },
    [ports, search],
  );

  const rowKey = useCallback((item: any) => {
    return item.key;
  }, []);

  const columns = useMemo(() => {
    return [
      {
        title: translations.clusterGraphList_containerDetail_portName,
        dataIndex: 'name',
        width: '20%',
      },
      {
        title: translations.clusterGraphList_containerDetail_containerPorts,
        dataIndex: 'containerPort',
        width: '20%',
      },
      {
        title: translations.clusterGraphList_containerDetail_hostPort,
        dataIndex: 'hostport',
        width: '20%',
      },
      {
        title: translations.clusterGraphList_containerDetail_protocol,
        dataIndex: 'protocol',
        width: '20%',
        filters: [
          { text: 'TCP', value: 'TCP' },
          { text: 'UDP', value: 'UDP' },
          { text: 'IP', value: 'IP' },
          { text: 'ICMP', value: 'ICMP' },
        ],
      },
      {
        title: translations.clusterGraphList_containerDetail_hostIP,
        dataIndex: 'hostIP',
        width: '20%',
      },
    ];
  }, []);
  let columnsInformation = [
    {
      title: translations.mountPath,
      dataIndex: 'mountPath',
    },
    {
      title: translations.volumeName,
      dataIndex: 'name',
    },
    {
      title: translations.commonpro_readOnly,
      dataIndex: 'readOnly',
    },
    {
      title: translations.subPath,
      dataIndex: 'subPath',
    },
    {
      title: translations.subPathExpression,
      dataIndex: 'subPathExpr',
    },
    {
      title: translations.mountPropagationMode,
      dataIndex: 'mountPropagation',
    },
  ];
  let data = useMemo(() => {
    return volume_mounts?.filter((item: any) => {
      return (
        item.mountPath.indexOf(searchVolumeMounts || '') !== -1 || item.name.indexOf(searchVolumeMounts || '') !== -1
      );
    });
  }, [props, searchVolumeMounts]);
  useImperativeHandle(
    ref,
    () => {
      return {
        close() {},
      };
    },
    [],
  );
  return (
    <>
      <div className="info-container-detail-case">
        <div className="details-content-case">
          <Tittle title={translations.clusterGraphList_containerDetail_containerInfo} className={'mb16'} />
          <TzTableKeyVal data={tableObj} />
          <Tittle title={translations.mountInformation} className={'mb16 mt40'} />
          <div className="mb16">
            <TzInputSearch
              placeholder={translations.clusterGraphList_searchKey}
              enterButton={translations.clusterGraphList_search}
              onSearch={setSearchVolumeMounts}
              suffix
            />
          </div>
          <TzTable dataSource={data} columns={columnsInformation} />
          <Tittle title={translations.clusterGraphList_containerDetail_port} className={'mb16 mt40'} />
          <div className="mb16">
            <TzInputSearch
              placeholder={translations.clusterGraphList_searchKey}
              enterButton={translations.clusterGraphList_search}
              onSearch={onSearch}
              suffix
            />
          </div>
          <TzTableServerPage
            columns={columns}
            defaultPagination={defPagination}
            rowKey={rowKey}
            reqFun={reqFun}
            equalServerPageAnyway={false}
          />
        </div>
      </div>
    </>
  );
};

export default forwardRef(InfoContainerDetail);
