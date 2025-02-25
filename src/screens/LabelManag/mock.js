export const list = {
  apiVersion: '1.0',
  data: {
    status: 0,
    startIndex: 10,
    totalItems: 24,
    items: [
      {
        containerId: 'f4df4bb6be7b885a16fd3ed086bf7813bf85f514ad7d24d7cdbd663cab6ed3d9',
        svcName: 'PostgreSQL',
        svcType: 'Databases',
        user: 'root',
        configDir: '/var/lib/postgresql/data/postgresql.conf',
        id: 581452823,
        containerName: 'pgsql',
        svcVersion: '13.5',
        binaryDir: '/usr/lib/postgresql/13/bin/postgres',
        enable: false,
        isDefault: true,
      },
      {
        binaryDir: '/usr/local/bin/redis-server',
        configDir: '',
        containerName: 'redis',
        svcVersion: '5.0.14',
        svcType: 'Databases',
        user: '1001',
        id: 670535899,
        containerId: 'f8d2b42c54e37f101b65774cfc81f31c5e016ccefe8d7d793c214e32f367421b',
        svcName: 'Redis',
        enable: true,
      },
    ],
    itemsPerPage: 0,
  },
};
