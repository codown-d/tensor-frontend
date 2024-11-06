import React, { useMemo, useRef, useState } from 'react';
import { TzCard } from '../../../../components/tz-card';
import { TzCol, TzRow } from '../../../../components/tz-row-col';
import NamespaceModules from '../../component/NamespaceModules';
import BaseInfo from '../../component/BaseInfo';
import ModuleTable from '../../component/ModuleTable';
import GroupOverview from '../../component/GroupOverview';

const NamespaceGroup = (props: any) => {
  let { activeKey } = props;
  let [namespaceGroupId, setGroupId] = useState('all');
  let [groupInfo, changeGroupInfo] = useState({});
  let [clusterNS, setClusterNS] = useState<{ cluster: string | undefined; namespace: string | undefined }>({
    cluster: undefined,
    namespace: undefined,
  });
  let groupId = useMemo(() => {
    return namespaceGroupId === 'all' || namespaceGroupId === 'wfz' ? undefined : namespaceGroupId;
  }, [namespaceGroupId]);
  let namespaceModulesRef = useRef<any>();
  let baseInfoRef = useRef<any>();
  return (
    <>
      <TzRow gutter={[16, 0]} justify={'start'} wrap={false}>
        <TzCol flex={'250px'}>
          <TzCard bodyStyle={{ padding: '12px 14px' }}>
            <NamespaceModules
              changeGroupInfo={changeGroupInfo}
              ref={namespaceModulesRef}
              type={'namespaceGroup'}
              onGroupChange={setGroupId}
              onChangeClusterNS={(val) => {
                let [cluster, namespace] = val || [];
                setClusterNS({ cluster, namespace });
              }}
              onChange={function (): void {
                baseInfoRef.current?.refresh();
              }}
            />
          </TzCard>
        </TzCol>
        <TzCol flex={1} className="">
          {groupId ? (
            <div className="mb20">
              <BaseInfo
                ref={baseInfoRef}
                type={'namespaceGroup'}
                groupId={groupId}
                onChange={() => {
                  namespaceModulesRef.current?.refresh();
                }}
              />
            </div>
          ) : null}
          {namespaceGroupId === 'all' && clusterNS.cluster ? (
            <GroupOverview cluster={clusterNS.cluster} namespace={clusterNS.namespace} type={'namespaceGroup'} />
          ) : null}

          <ModuleTable
            groupInfo={groupInfo}
            cluster={clusterNS.cluster}
            namespace={clusterNS.namespace}
            type={'namespaceGroup'}
            activeKey={activeKey}
            groupId={groupId}
            onChange={() => {
              namespaceModulesRef.current?.refresh();
            }}
            ungrouped={namespaceGroupId === 'wfz' ? true : undefined}
          />
        </TzCol>
      </TzRow>
    </>
  );
};

export default NamespaceGroup;
