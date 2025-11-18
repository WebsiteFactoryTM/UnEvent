import * as migration_20251118_191204_init from './20251118_191204_init';
import * as migration_20251118_193644_add_prefix_to_media from './20251118_193644_add_prefix_to_media';

export const migrations = [
  {
    up: migration_20251118_191204_init.up,
    down: migration_20251118_191204_init.down,
    name: '20251118_191204_init',
  },
  {
    up: migration_20251118_193644_add_prefix_to_media.up,
    down: migration_20251118_193644_add_prefix_to_media.down,
    name: '20251118_193644_add_prefix_to_media'
  },
];
