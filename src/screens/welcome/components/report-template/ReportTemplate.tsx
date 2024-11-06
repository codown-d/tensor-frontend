import React from 'react';
import { translations } from '../../../../translations/translations';
import { Chart, LineAdvance } from 'bizcharts';
import moment from 'moment';
import { tampTit, setTemp } from '../../../AlertCenter/AlertCenterScreen';

const ReportTable = (props: any) => {
  const { columns, dataSource } = props;
  const tdWidth = 100 / columns.length + '%';
  return (
    <table style={{ border: '1px solid #f0f2f5', width: '100%', textAlign: 'left' }}>
      <thead style={{ backgroundColor: '#f0f2f5' }}>
        <tr>
          {columns.map((item: any) => (
            <th style={{ padding: 8, width: tdWidth, margin: 0, border: 'none' }}>{item.title}</th>
          ))}
        </tr>
      </thead>
      <tbody
        style={{ width: '100%' }}
        onMouseOver={(e: any) => {
          let tooltip;
          const ele = e.nativeEvent.target.parentElement;
          if (ele.nodeName === 'SPAN' || ele.nodeName === 'TD') {
            if (ele.nodeName === 'SPAN') tooltip = ele.parentElement.querySelector('#tooltip');
            if (ele.nodeName === 'TD') tooltip = ele.querySelector('#tooltip');
          }
          if (tooltip) tooltip.style.display = 'inline-block';
        }}
        onMouseOut={(e: any) => {
          let tooltip;
          const ele = e.nativeEvent.target.parentElement;
          if (ele.nodeName === 'SPAN' || ele.nodeName === 'TD') {
            if (ele.nodeName === 'SPAN') tooltip = ele.parentElement.querySelector('#tooltip');
            if (ele.nodeName === 'TD') tooltip = ele.querySelector('#tooltip');
          }
          if (tooltip) tooltip.style.display = 'none';
        }}
      >
        {!dataSource || !dataSource.length ? (
          <tr>
            <td
              colSpan={columns.length}
              style={{ width: '100%', height: 200, verticalAlign: 'middle', textAlign: 'center' }}
            >
              {translations.scanner_report_noData}
            </td>
          </tr>
        ) : (
          dataSource.map((row: any) => {
            return (
              <tr>
                {columns.map((item: any) => {
                  const data = item.dataIndex ? row[item.dataIndex] : row;
                  return (
                    <td
                      style={{
                        borderBottom: '1px solid #f0f2f5',
                        borderRight: '1px solid #f0f2f5',
                        // width: tdWidth,
                        // maxWidth: '200px',
                        position: 'relative',
                        padding: 8,
                      }}
                    >
                      {/* <span style={{
                        position: 'absolute',
                        top: -25,
                        left: 20,
                        display: 'none',
                        padding: 5,
                        color: '#fff',
                        background: '#000',
                        borderRadius: 5,
                        zIndex: 200,
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                      }} id='tooltip'>
                        {item.render(data)}
                        <div style={{
                          display: 'inline-block',
                          position: 'absolute',
                          bottom: -5,
                          left: '50%',
                          transform: 'translate(-4px, 0)',
                          width: 0,
                          height: 0,
                          borderLeft: '6px solid transparent',
                          borderRight: '6px solid transparent',
                          borderTop: '6px solid #000',
                        }}>
                        </div>
                      </span> */}
                      {/* <span style={{
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        width: '100%',
                        whiteSpace: 'normal',
                      }}> */}
                      {item.render(data)}
                      {/* </span> */}
                    </td>
                  );
                })}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
};

export default (props: any) => {
  const { data } = props;
  const { assetsReport = {}, eventsReport = {} } = data;
  const { imageCount, vulnerabilityCount, riskImages } = data?.imagesReport || {};

  const imgLeakStatis = [
    [
      {
        title: translations.scanner_report_imageSum,
        icon: '',
        data: imageCount?.totalImageCount !== undefined ? imageCount?.totalImageCount : '-',
      },
      {
        title: translations.scanner_report_onlineImageSum,
        icon: '',
        data: imageCount?.onlineImageCount !== undefined ? imageCount?.onlineImageCount : '-',
      },
      {
        title: translations.scanner_report_trustImageSum,
        icon: '',
        data: imageCount?.trustedImageCount !== undefined ? imageCount?.trustedImageCount : '-',
      },
      {
        title: translations.scanner_report_canFixableImageSum,
        icon: '',
        data:
          imageCount?.repairableImageCount !== undefined ? imageCount?.repairableImageCount : '-',
      },
      {
        title: translations.scanner_report_enhanceImageSum,
        icon: '',
        data:
          imageCount?.reinforcedImageCount !== undefined ? imageCount?.reinforcedImageCount : '-',
      },
    ],
    [
      {
        title: translations.scanner_report_leakSum,
        icon: '',
        data:
          vulnerabilityCount?.totalVulnerabilityCount !== undefined
            ? vulnerabilityCount?.totalVulnerabilityCount
            : '-',
      },
      {
        title: translations.scanner_report_highLeakSum,
        icon: '',
        data:
          vulnerabilityCount?.criticalVulnerabilityCount !== undefined
            ? vulnerabilityCount?.criticalVulnerabilityCount
            : '-',
      },
      {
        title: translations.scanner_report_riskLeakSum,
        icon: '',
        data:
          vulnerabilityCount?.highVulnerabilityCount !== undefined
            ? vulnerabilityCount?.highVulnerabilityCount
            : '-',
      },
      {
        title: translations.scanner_report_middleLeakSum,
        icon: '',
        data:
          vulnerabilityCount?.mediumVulnerabilityCount !== undefined
            ? vulnerabilityCount?.mediumVulnerabilityCount
            : '-',
      },
      {
        title: translations.scanner_report_lowRiskSum,
        icon: '',
        data:
          vulnerabilityCount?.lowVulnerabilityCount !== undefined
            ? vulnerabilityCount?.lowVulnerabilityCount
            : '-',
      },
      {
        title: translations.scanner_report_unknownLeanSum,
        icon: '',
        data:
          vulnerabilityCount?.unknownVulnerabilityCount !== undefined
            ? vulnerabilityCount?.unknownVulnerabilityCount
            : '-',
      },
    ],
  ];
  const detailStatis = [
    {
      title: translations.scanner_report_existLeakImageSum,
      icon: '',
      data: imageCount?.vulnerabilityCount !== undefined ? imageCount?.vulnerabilityCount : '-',
    },
    {
      title: translations.scanner_report_existSenFileImgSum,
      icon: '',
      data: imageCount?.sensitiveFileCount !== undefined ? imageCount?.sensitiveFileCount : '-',
    },
    {
      title: translations.scanner_report_existBadFileImgSum,
      icon: '',
      data: imageCount?.maliciousCount !== undefined ? imageCount?.maliciousCount : '-',
    },
    {
      title: translations.scanner_report_existWebshellImgSum,
      icon: '',
      data: imageCount?.webShellCount !== undefined ? imageCount?.webShellCount : '-',
    },
    {
      title: translations.scanner_report_existExEnvVarImgSum,
      icon: '',
      data: imageCount?.abnormalEnvCount !== undefined ? imageCount?.abnormalEnvCount : '-',
    },
    {
      title: translations.scanner_report_existLicBanImgSum,
      icon: '',
      data: imageCount?.licenceCount !== undefined ? imageCount?.licenceCount : '-',
    },
    {
      title: translations.scanner_report_existNotStanImgSum,
      icon: '',
      data: imageCount?.softwareCount !== undefined ? imageCount?.softwareCount : '-',
    },
    {
      title: translations.scanner_report_existRootImgSum,
      icon: '',
      data: imageCount?.privilegedCount !== undefined ? imageCount?.privilegedCount : '-',
    },
  ];
  const riskImageColumns = [
    {
      title: translations.scanner_report_imageName,
      dataIndex: 'name',
      render: (name: any) => {
        return <span>{name || '-'}</span>;
      },
    },
    {
      title: translations.scanner_report_version,
      dataIndex: 'version',
      render: (name: any) => {
        return <span>{name || '-'}</span>;
      },
    },
    {
      title: translations.scanner_report_imgScore,
      dataIndex: 'riskScore',
      render: (name: any) => {
        return <span>{name !== undefined ? name : '-'}</span>;
      },
    },
  ];

  const clusterListColumns = [
    {
      title: translations.scanner_report_clusterKey,
      dataIndex: 'key',
      render: (name: any) => {
        return <span>{name || '-'}</span>;
      },
    },
    {
      title: translations.scanner_report_clusterName,
      dataIndex: 'name',
      render: (name: any) => {
        return <span>{name || '-'}</span>;
      },
    },
    {
      title: translations.scanner_report_createTime,
      dataIndex: 'createdAt',
      render: (name: any) => {
        return <span>{moment(name).format('YYYY-MM-DD HH:mm:ss')}</span>;
      },
    },
  ];
  const nodeListColumns = [
    {
      title: translations.scanner_report_nodeName,
      dataIndex: 'name',
      render: (name: any) => {
        return <span>{name || '-'}</span>;
      },
    },
    {
      title: translations.scanner_report_belongToCluster,
      dataIndex: 'cluster',
      render: (name: any) => {
        return <span>{name || '-'}</span>;
      },
    },
  ];
  const containerListColumns = [
    {
      title: translations.scanner_report_containerName,
      dataIndex: 'name',
      render: (name: any) => {
        return <span>{name || '-'}</span>;
      },
    },
    {
      title: translations.scanner_report_containerType,
      dataIndex: 'type',
      render: (name: any) => {
        return <span>{name || '-'}</span>;
      },
    },
    {
      title: translations.scanner_report_resourceName,
      dataIndex: 'resourceName',
      render: (name: any) => {
        return <span>{name || '-'}</span>;
      },
    },
    {
      title: translations.scanner_report_namespace,
      dataIndex: 'namespace',
      render: (name: any) => {
        return <span>{name || '-'}</span>;
      },
    },
    {
      title: translations.scanner_report_cluster,
      dataIndex: 'cluster',
      render: (name: any) => {
        return <span>{name || '-'}</span>;
      },
    },
    {
      title: translations.scanner_report_createTime,
      dataIndex: 'createdAt',
      render: (name: any) => {
        return <span>{moment(name).format('YYYY-MM-DD HH:mm:ss')}</span>;
      },
    },
  ];
  const eventListColumns = [
    {
      title: translations.scanner_report_occurTime,
      dataIndex: 'timestamp',
      render: (name: any) => {
        return (
          <span style={{ overflowWrap: 'anywhere' }}>
            {moment(name).format('YYYY-MM-DD HH:mm:ss')}
          </span>
        );
      },
    },
    {
      title: translations.scanner_report_eventName,
      render: (row: any) => {
        return (
          <span style={{ overflowWrap: 'anywhere' }}>{`${row.ruleCategory || '-'}/${
            row.ruleName || '-'
          }`}</span>
        );
      },
    },
    {
      title: translations.scanner_report_event_description,
      dataIndex: 'ruleDescription',
      render: (name: any) => {
        return <span style={{ overflowWrap: 'anywhere' }}>{name || '-'}</span>;
      },
    },
    {
      title: translations.disposal_suggestions,
      dataIndex: 'resolution',
      render: (name: any) => {
        return <span style={{ overflowWrap: 'anywhere' }}>{name || '-'}</span>;
      },
    },
    {
      title: translations.scanner_report_eventType,
      dataIndex: 'ruleCategory',
      render: (name: any) => {
        return <span style={{ overflowWrap: 'anywhere' }}>{name || '-'}</span>;
      },
    },
    {
      title: translations.scanner_report_belongToCluster,
      dataIndex: 'cluster',
      render: (name: any) => {
        return <span style={{ overflowWrap: 'anywhere' }}>{name || '-'}</span>;
      },
    },
    {
      title: translations.scanner_report_relateRes,
      key: 'relateRes',
      render: (row: any) => {
        return (
          <span style={{ overflowWrap: 'anywhere' }}>{`${row.namespace || '-'}/${
            row.nodeKey || '-'
          }`}</span>
        );
      },
    },
    {
      title: translations.scanner_report_eventLevel,
      dataIndex: 'severity',
      render: (severity: any) => {
        return <span style={{ overflowWrap: 'anywhere' }}>{tampTit[setTemp(severity)]}</span>;
      },
    },
    {
      title: translations.runtimePolicy_drawer_title_detail,
      dataIndex: 'context',
      render: (name: any) => {
        return (
          <span
            style={{ overflowWrap: 'anywhere' }}
            dangerouslySetInnerHTML={{ __html: name || '-' }}
          />
        );
      },
    },
  ];
  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100%' }}>
      <div style={{ margin: '0 auto', width: '80%' }}>
        <div style={{ padding: '20px 0' }}>
          <span
            style={{
              borderRadius: '25%',
              background: '#00A2FC',
              color: '#fff',
              display: 'inline-block',
              padding: 2,
            }}
          >
            {data.type === 'weekly'
              ? translations.scanner_report_weeklyReport
              : data.type === 'monthly'
              ? translations.scanner_report_monthlyReport
              : translations.scanner_report_customReport}
          </span>
          &nbsp;&nbsp;
          <span
            style={{
              display: 'inline-block',
              maxWidth: '50%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              verticalAlign: 'middle',
            }}
          >
            {data.templateName}
          </span>
          &nbsp;&nbsp;
          {`${moment(data.startTimestamp).format('YYYY-MM-DD HH:mm:ss')} - ${moment(
            data.endTimestamp,
          ).format('YYYY-MM-DD HH:mm:ss')}`}
        </div>
        <div>
          {data.categories?.includes('images') && (
            <>
              <p style={{ padding: 16, paddingLeft: 0, fontSize: 20 }}>
                {translations.imageSecurity}
              </p>
              <div style={{ marginBottom: 16 }}>
                {imgLeakStatis.map((arr: any) => {
                  const item = arr.shift();
                  return (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '50px 30px',
                        borderRadius: '2px',
                        backgroundColor: '#fff',
                        marginBottom: '16px',
                      }}
                    >
                      <div style={{ position: 'relative', flexBasis: '25%' }}>
                        {item.icon ? <span className={`info-icon ${item.icon}`}></span> : null}
                        <div
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                          }}
                        >
                          <p
                            style={{
                              fontSize: '28px',
                              fontWeight: 400,
                              marginBottom: '20px',
                              textAlign: 'center',
                            }}
                          >
                            {' '}
                            {item.data}
                          </p>
                          <p>{item.title}</p>
                        </div>
                      </div>

                      <div style={{ height: '80px', width: '2px', backgroundColor: '#f0f2f5' }} />
                      <div style={{ width: '100%' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-around',
                          }}
                        >
                          {arr.map((item: any) => {
                            return (
                              <div style={{ textAlign: 'center' }}>
                                <p
                                  style={{
                                    fontSize: '28px',
                                    fontWeight: 400,
                                    marginBottom: '20px',
                                    textAlign: 'center',
                                  }}
                                >
                                  {item.data}
                                </p>
                                <p>{item.title}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  {detailStatis.map((item: any) => {
                    return (
                      <div style={{ flexBasis: 'calc(25% - 12px)' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            padding: '16px',
                            borderRadius: '2px',
                            backgroundColor: '#fff',
                            marginBottom: '16px',
                          }}
                        >
                          {item.icon ? <span className={`info-icon ${item.icon}`}></span> : null}
                          <div>
                            <p
                              style={{
                                fontSize: '28px',
                                fontWeight: 400,
                                marginBottom: '20px',
                                textAlign: 'center',
                              }}
                            >
                              {item.data}
                            </p>
                            <p>{item.title}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div
                  style={{
                    marginBottom: 16,
                    padding: 16,
                    backgroundColor: '#fff',
                    borderRadius: 2,
                  }}
                >
                  <p style={{ marginBottom: 16 }}>{translations.scanner_report_riskImgList}</p>
                  <ReportTable dataSource={riskImages} columns={riskImageColumns}></ReportTable>
                </div>
              </div>
            </>
          )}

          {data.categories?.includes('assets') && (
            <>
              <p style={{ padding: 16, paddingLeft: 0, fontSize: 20 }}>
                {translations.scanner_report_platformAsset}
              </p>
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    marginBottom: 16,
                    padding: 16,
                    backgroundColor: '#fff',
                    borderRadius: 2,
                  }}
                >
                  <p style={{ marginBottom: 16 }}>{translations.scanner_report_clusterList}</p>
                  <ReportTable
                    dataSource={assetsReport?.clusters}
                    columns={clusterListColumns}
                  ></ReportTable>
                </div>
                <div
                  style={{
                    marginBottom: 16,
                    padding: 16,
                    backgroundColor: '#fff',
                    borderRadius: 2,
                  }}
                >
                  <p style={{ marginBottom: 16 }}>{translations.scanner_report_nodeList}</p>
                  <ReportTable
                    dataSource={assetsReport?.nodes}
                    columns={nodeListColumns}
                  ></ReportTable>
                </div>
                <div
                  style={{
                    marginBottom: 16,
                    padding: 16,
                    backgroundColor: '#fff',
                    borderRadius: 2,
                  }}
                >
                  <p style={{ marginBottom: 16 }}>{translations.scanner_report_containerList}</p>
                  <ReportTable
                    dataSource={assetsReport?.containers}
                    columns={containerListColumns}
                  ></ReportTable>
                </div>
              </div>
            </>
          )}

          {data.categories?.includes('events') && (
            <>
              <p style={{ padding: 16, paddingLeft: 0, fontSize: 20 }}>
                {translations.scanner_report_platformEvent}
              </p>
              <div style={{ padding: 16, backgroundColor: '#fff', borderRadius: 2 }}>
                <p style={{ marginBottom: 16 }}>{translations.scanner_report_eventList}</p>
                <ReportTable
                  dataSource={eventsReport?.events}
                  columns={eventListColumns}
                ></ReportTable>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
