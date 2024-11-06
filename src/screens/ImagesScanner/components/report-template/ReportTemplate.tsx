import moment from 'moment';
import React from 'react';
import { translations } from '../../../../translations/translations';
import { get } from 'lodash';

const severityLevel: any = {
  5: {
    en: 'ignoreable',
    zh: translations.notificationCenter_columns_Negligible,
  },
  6: {
    en: 'unknown',
    zh: translations.unknown,
  },
  4: {
    en: 'low',
    zh: translations.severity_Low,
  },
  3: {
    en: 'medium',
    zh: translations.severity_Medium,
  },
  2: {
    en: 'high',
    zh: translations.severity_High,
  },
  1: {
    en: 'critical',
    zh: translations.notificationCenter_columns_Critical,
  },
};

const ReportTable = (props: any) => {
  const { columns, dataSource } = props;
  const tdWidth = 100 / columns.length + '%';
  return (
    <table style={{ border: '1px solid #f0f2f5', width: '100%', textAlign: 'left' }}>
      <thead style={{ backgroundColor: '#f0f2f5' }}>
        <tr>
          {columns.map((item: any) => (
            <th style={{ padding: 8, margin: 0, border: 'none' }}>{item.title}</th>
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
                  const data = item.dataIndex ? get(row, item.dataIndex) : row;
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
                      {item.render(data)}
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

const ReportTemplate = (props: any) => {
  const { data, lang } = props;

  const virusList = (function (data) {
    const list = [];
    if (data.data.viri && data.data.viri.length) {
      for (const item of data.data.viri) {
        const { name, images } = item;
        const virus = images.map((image: any) => ({ name, path: image.path, image: image.image }));
        list.push(...virus);
      }
    }
    return list;
  })(data);

  const {
    total_count,
    online_count,
    trusted_count,
    fixable_count,
    fixed_count,

    vuln_count,
    sensitive_file_count,
    malicious_count,
    webshell_count,
    env_count,
    licence_count,
    privileged_count,
    software_count,
  } = data.data?.image_count;

  const {
    total_count: totalCount,
    critical_count,
    high_count,
    medium_count,
    low_count,
    unknown_count,
    negligible_count,
  } = data.data?.vuln_count;

  const imgLeakStatis = [
    [
      {
        title: translations.scanner_report_imageSum,
        icon: '',
        data: total_count !== undefined ? total_count : '-',
      },
      {
        title: translations.scanner_report_onlineImageSum,
        icon: '',
        data: online_count !== undefined ? online_count : '-',
      },
      {
        title: translations.scanner_report_trustImageSum,
        icon: '',
        data: trusted_count !== undefined ? trusted_count : '-',
      },
      {
        title: translations.scanner_report_canFixableImageSum,
        icon: '',
        data: fixable_count !== undefined ? fixable_count : '-',
      },
      {
        title: translations.scanner_report_enhanceImageSum,
        icon: '',
        data: fixed_count !== undefined ? fixed_count : '-',
      },
    ],
    [
      {
        title: translations.scanner_report_leakSum,
        icon: '',
        data: totalCount !== undefined ? totalCount : '-',
      },
      {
        title: translations.scanner_report_highLeakSum,
        icon: '',
        data: critical_count !== undefined ? critical_count : '-',
      },
      {
        title: translations.scanner_report_riskLeakSum,
        icon: '',
        data: high_count !== undefined ? high_count : '-',
      },
      {
        title: translations.scanner_report_middleLeakSum,
        icon: '',
        data: medium_count !== undefined ? medium_count : '-',
      },
      {
        title: translations.scanner_report_lowRiskSum,
        icon: '',
        data: low_count !== undefined ? low_count : '-',
      },
      {
        title: translations.scanner_report_ignorableLeakSum,
        icon: '',
        data: negligible_count !== undefined ? negligible_count : '-',
      },
      {
        title: translations.scanner_report_unknownLeanSum,
        icon: '',
        data: unknown_count !== undefined ? unknown_count : '-',
      },
    ],
  ];

  const detailStatis = [
    {
      title: translations.scanner_report_existLeakImageSum,
      icon: '',
      data: vuln_count !== undefined ? vuln_count : '-',
    },
    {
      title: translations.scanner_report_existSenFileImgSum,
      icon: '',
      data: sensitive_file_count !== undefined ? sensitive_file_count : '-',
    },
    {
      title: translations.scanner_report_existBadFileImgSum,
      icon: '',
      data: malicious_count !== undefined ? malicious_count : '-',
    },
    {
      title: translations.scanner_report_existWebshellImgSum,
      icon: '',
      data: webshell_count !== undefined ? webshell_count : '-',
    },
    {
      title: translations.scanner_report_existExEnvVarImgSum,
      icon: '',
      data: env_count !== undefined ? env_count : '-',
    },
    {
      title: translations.scanner_report_existLicBanImgSum,
      icon: '',
      data: licence_count !== undefined ? licence_count : '-',
    },
    {
      title: translations.scanner_report_existNotStanImgSum,
      icon: '',
      data: software_count !== undefined ? software_count : '-',
    },
    {
      title: translations.scanner_report_existRootImgSum,
      icon: '',
      data: privileged_count !== undefined ? privileged_count : '-',
    },
  ];
  const riskImageColumns = [
    {
      title: translations.scanner_report_imageName,
      key: 'imageName',
      dataIndex: 'name',
      ellipsis: {
        showTitle: false,
      },
      render: (name: any) => {
        return <span>{name}</span>;
      },
    },
    {
      title: translations.scanner_report_version,
      key: 'version',
      dataIndex: 'tag',
      ellipsis: {
        showTitle: false,
      },
      render: (name: any) => {
        return <span>{name}</span>;
      },
    },
    {
      title: translations.scanner_report_imgScore,
      key: 'imageScore',
      dataIndex: 'score',
      ellipsis: {
        showTitle: false,
      },
      render: (name: any) => {
        return <span>{name}</span>;
      },
    },
  ];
  const imageLeakColumns = [
    {
      title: translations.scanner_report_leakNum,
      key: 'leakNum',
      dataIndex: 'vuln.id',
      ellipsis: {
        showTitle: false,
      },
      render: (name: any) => {
        return <span>{name}</span>;
      },
    },
    {
      title: translations.scanner_report_leakType,
      key: 'leakType',
      dataIndex: 'vuln.type',
      ellipsis: {
        showTitle: false,
      },
      render: (name: any) => {
        return <span>{name}</span>;
      },
    },
    {
      title: translations.scanner_report_riskLevel,
      key: 'riskLevel',
      dataIndex: 'vuln.level',
      ellipsis: {
        showTitle: false,
      },
      render: (name: any) => {
        const sProps = (severityLevel[name] && severityLevel[name][lang]) || '-';
        return sProps;
      },
    },
    {
      title: translations.scanner_report_riskRelateImg,
      key: 'riskRelateImg',
      dataIndex: 'images',
      ellipsis: {
        showTitle: false,
      },
      render: (name: any) => {
        return (
          <span style={{ overflow: 'auto', wordBreak: 'break-all' }}>{(name || []).join(',')}</span>
        );
      },
    },
  ];
  const virusListColumns = [
    {
      title: translations.scanner_report_virusName,
      key: 'virusName',
      dataIndex: 'name',
      ellipsis: {
        showTitle: false,
      },
      render: (name: any) => {
        return <span>{name}</span>;
      },
    },
    {
      title: translations.scanner_report_filePath,
      key: 'filePath',
      dataIndex: 'path',
      ellipsis: {
        showTitle: false,
      },
      render: (name: any) => {
        return <span>{name}</span>;
      },
    },
    {
      title: translations.scanner_report_riskRelateImg,
      key: 'riskRelateImg',
      dataIndex: 'image',
      ellipsis: {
        showTitle: false,
      },
      render: (name: any) => {
        return <span>{name}</span>;
      },
    },
  ];
  const canFixList = data.data?.images.filter((item: any) => !!item.fixedable);
  return (
    <div style={{ backgroundColor: '#f0f2f5' }}>
      <div style={{ margin: '0 auto', width: '80%', paddingBottom: 32 }}>
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
            {data.type === 1
              ? translations.scanner_report_weeklyReport
              : data.type === 2
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
            {data.name}
          </span>
          &nbsp;&nbsp;
          {`${moment(data.start_timestamp).format('YYYY-MM-DD HH:mm:ss')} - ${moment(
            data.end_timestamp,
          ).format('YYYY-MM-DD HH:mm:ss')}`}
        </div>

        <div>
          {data.content_types?.includes(1) && (
            <>
              <p style={{ padding: 16, paddingLeft: 0, fontSize: 20 }}>
                {translations.scanner_report_riskInfoStatis}
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
                  <ReportTable
                    dataSource={data.data.images.filter((item: any) => item.score <= 80)}
                    columns={riskImageColumns}
                  ></ReportTable>
                </div>
              </div>
            </>
          )}
          {data.content_types?.includes(2) && (
            <>
              <p style={{ padding: 16, paddingLeft: 0, fontSize: 20 }}>
                {translations.scanner_report_imageLeakList}
              </p>
              <div style={{ padding: 16, backgroundColor: '#fff', borderRadius: 2 }}>
                <ReportTable
                  dataSource={data.data.image_vulns}
                  columns={imageLeakColumns}
                ></ReportTable>
              </div>
            </>
          )}

          {data.content_types?.includes(3) && (
            <>
              <p style={{ padding: 16, paddingLeft: 0, fontSize: 20 }}>
                {translations.scanner_report_virusList}
              </p>
              <div style={{ padding: 16, backgroundColor: '#fff', borderRadius: 2 }}>
                <ReportTable dataSource={virusList} columns={virusListColumns}></ReportTable>
              </div>
            </>
          )}

          {data.content_types?.includes(4) && (
            <>
              <p style={{ padding: 16, paddingLeft: 0, fontSize: 20 }}>
                {translations.scanner_report_imageFixAdvise}
              </p>
              <div style={{ padding: 16, backgroundColor: '#fff', borderRadius: 2 }}>
                {canFixList?.length ? (
                  canFixList?.map((item: any, index: number) => {
                    return (
                      <div style={{ marginBottom: 32 }}>
                        <p>
                          {index + 1}.{translations.scanner_report_imageName}:&nbsp;{item.name}
                        </p>
                        {item?.vulns &&
                          item?.vulns.map((leak: any) => (
                            <div
                              style={{
                                width: '80%',
                                margin: '16px auto',
                                marginBottom: 0,
                                border: '.1px solid #e1e8f7',
                                textAlign: 'left',
                              }}
                            >
                              <div style={{ display: 'flex' }}>
                                <span
                                  style={{ flexBasis: 150, backgroundColor: '#f0f2f5', padding: 8 }}
                                >
                                  {translations.scanner_report_leakNum}
                                </span>
                                <span
                                  style={{
                                    borderBottom: '.1px solid #e1e8f7',
                                    padding: 8,
                                    flexBasis: 'calc(100% - 150px)',
                                  }}
                                >
                                  {leak.id}
                                </span>
                              </div>
                              <div style={{ display: 'flex' }}>
                                <span
                                  style={{ flexBasis: 150, backgroundColor: '#f0f2f5', padding: 8 }}
                                >
                                  {translations.scanner_report_virusLevel}
                                </span>
                                <span
                                  style={{
                                    borderBottom: '.1px solid #e1e8f7',
                                    padding: 8,
                                    flexBasis: 'calc(100% - 150px)',
                                  }}
                                >
                                  {(severityLevel[leak.level] && severityLevel[leak.level][lang]) ||
                                    '-'}
                                </span>
                              </div>
                              <div style={{ display: 'flex' }}>
                                <span
                                  style={{ flexBasis: 150, backgroundColor: '#f0f2f5', padding: 8 }}
                                >
                                  {translations.scanner_report_fixVersion}
                                </span>
                                <span
                                  style={{
                                    borderBottom: '.1px solid #e1e8f7',
                                    padding: 8,
                                    flexBasis: 'calc(100% - 150px)',
                                  }}
                                >
                                  {leak.fix_versoin}
                                </span>
                              </div>
                              <div style={{ display: 'flex' }}>
                                <span
                                  style={{ flexBasis: 150, backgroundColor: '#f0f2f5', padding: 8 }}
                                >
                                  {translations.scanner_report_CNNVDNumber}
                                </span>
                                <span
                                  style={{
                                    borderBottom: '.1px solid #e1e8f7',
                                    padding: 8,
                                    flexBasis: 'calc(100% - 150px)',
                                  }}
                                >
                                  {leak.cnnvd}
                                </span>
                              </div>
                              <div style={{ display: 'flex' }}>
                                <span
                                  style={{ flexBasis: 150, backgroundColor: '#f0f2f5', padding: 8 }}
                                >
                                  {translations.scanner_report_CVSS3Score}
                                </span>
                                <span
                                  style={{
                                    borderBottom: '.1px solid #e1e8f7',
                                    padding: 8,
                                    flexBasis: 'calc(100% - 150px)',
                                  }}
                                >
                                  {leak.cvss3}
                                </span>
                              </div>
                              <div style={{ display: 'flex' }}>
                                <span
                                  style={{ flexBasis: 150, backgroundColor: '#f0f2f5', padding: 8 }}
                                >
                                  {translations.scanner_report_leakType}
                                </span>
                                <span
                                  style={{
                                    borderBottom: '.1px solid #e1e8f7',
                                    padding: 8,
                                    flexBasis: 'calc(100% - 150px)',
                                  }}
                                >
                                  {leak.type}
                                </span>
                              </div>
                              <div style={{ display: 'flex' }}>
                                <span
                                  style={{ flexBasis: 150, backgroundColor: '#f0f2f5', padding: 8 }}
                                >
                                  {translations.scanner_report_fixAdvise}
                                </span>
                                <span
                                  style={{
                                    borderBottom: '.1px solid #e1e8f7',
                                    padding: 8,
                                    flexBasis: 'calc(100% - 150px)',
                                  }}
                                >
                                  {leak.fix_suggestion}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '16px 0',
                      width: '80%',
                      margin: '16px auto',
                    }}
                  >
                    {translations.scanner_report_noData}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportTemplate;
