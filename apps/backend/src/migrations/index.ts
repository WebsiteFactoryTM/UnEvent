import * as migration_20251118_191204_init from './20251118_191204_init';

export const migrations = [
  {
    up: migration_20251118_191204_init.up,
    down: migration_20251118_191204_init.down,
    name: '20251118_191204_init'
  },
];
