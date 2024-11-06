import { translations } from '../../../translations/translations';

export const statusValToKey: any = {
  // '0': 'Running',
  // '1': 'Created',
  // '2': 'Restarting',
  // '3': 'Removing',
  // '4': 'Paused',
  // '5': 'Exited',
  // '6': 'Dead',
  '0': 'running',
  '1': 'created',
  '2': 'exited',
  '3': 'unknown',
  '4': 'all',
};

export const tagsStyle: any = {
  Running: {
    label: translations.running,
    style: {
      color: 'rgba(33, 119, 209, 1)',
      background: 'rgba(33, 119, 209, 0.05)',
    },
  },
  Created: {
    label: translations.clusterGraphList_containerInfo_status_created,
    style: {
      color: 'rgba(82, 196, 26, 1)',
      background: 'rgba(82, 196, 26, 0.05)',
    },
  },
  Restarting: {
    label: translations.clusterGraphList_containerInfo_status_restarting,
    style: {
      color: 'rgba(255, 196, 35, 1)',
      background: 'rgba(255, 196, 35, 0.05)',
    },
  },
  Removing: {
    label: translations.clusterGraphList_containerInfo_status_removing,
    style: {
      color: 'rgba(233, 84, 84, 1)',
      background: 'rgba(233, 84, 84, 0.05)',
    },
  },
  Paused: {
    label: translations.clusterGraphList_containerInfo_status_paused,
    style: {
      color: 'rgba(255, 138, 52, 1)',
      background: 'rgba(255, 138, 52, 0.05)',
    },
  },

  Exited: {
    label: translations.clusterGraphList_containerInfo_status_exited,
    style: {
      color: 'rgba(152, 166, 190, 1)',
      background: 'rgba(152, 166, 190, 0.05)',
    },
  },
  Dead: {
    label: translations.clusterGraphList_containerInfo_status_dead,
    style: {
      color: 'rgba(152, 166, 190, 1)',
      background: 'rgba(152, 166, 190, 0.05)',
    },
  },
};
