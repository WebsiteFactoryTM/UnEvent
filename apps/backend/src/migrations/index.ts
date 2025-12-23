import * as migration_20251118_191204_init from './20251118_191204_init';
import * as migration_20251118_193644_add_prefix_to_media from './20251118_193644_add_prefix_to_media';
import * as migration_20251123_143804_enable_api_keys_for_users from './20251123_143804_enable_api_keys_for_users';
import * as migration_20251129_202656_add_ticket_url_to_events from './20251129_202656_add_ticket_url_to_events';
import * as migration_20251202_102606 from './20251202_102606';
import * as migration_20251204_121815 from './20251204_121815';
import * as migration_20251204_125748 from './20251204_125748';
import * as migration_20251204_135953 from './20251204_135953';
import * as migration_20251205_075202 from './20251205_075202';
import * as migration_20251211_100529_add_claim_status from './20251211_100529_add_claim_status';
import * as migration_20251215_073929_make_city_optional_for_drafts from './20251215_073929_make_city_optional_for_drafts';
import * as migration_20251215_074247_make_city_optional_for_drafts from './20251215_074247_make_city_optional_for_drafts';
import * as migration_20251216_120412 from './20251216_120412';
import * as migration_20251217_113056 from './20251217_113056';
import * as migration_20251217_150432 from './20251217_150432';
import * as migration_20251217_151242 from './20251217_151242';
import * as migration_20251218_060720 from './20251218_060720';
import * as migration_20251218_120110_Added_search_collection_fields from './20251218_120110_Added_search_collection_fields';
import * as migration_20251219_141657 from './20251219_141657';
import * as migration_20251223_112807 from './20251223_112807';
import * as migration_20251223_113641 from './20251223_113641';

export const migrations = [
  {
    up: migration_20251118_191204_init.up,
    down: migration_20251118_191204_init.down,
    name: '20251118_191204_init',
  },
  {
    up: migration_20251118_193644_add_prefix_to_media.up,
    down: migration_20251118_193644_add_prefix_to_media.down,
    name: '20251118_193644_add_prefix_to_media',
  },
  {
    up: migration_20251123_143804_enable_api_keys_for_users.up,
    down: migration_20251123_143804_enable_api_keys_for_users.down,
    name: '20251123_143804_enable_api_keys_for_users',
  },
  {
    up: migration_20251129_202656_add_ticket_url_to_events.up,
    down: migration_20251129_202656_add_ticket_url_to_events.down,
    name: '20251129_202656_add_ticket_url_to_events',
  },
  {
    up: migration_20251202_102606.up,
    down: migration_20251202_102606.down,
    name: '20251202_102606',
  },
  {
    up: migration_20251204_121815.up,
    down: migration_20251204_121815.down,
    name: '20251204_121815',
  },
  {
    up: migration_20251204_125748.up,
    down: migration_20251204_125748.down,
    name: '20251204_125748',
  },
  {
    up: migration_20251204_135953.up,
    down: migration_20251204_135953.down,
    name: '20251204_135953',
  },
  {
    up: migration_20251205_075202.up,
    down: migration_20251205_075202.down,
    name: '20251205_075202',
  },
  {
    up: migration_20251211_100529_add_claim_status.up,
    down: migration_20251211_100529_add_claim_status.down,
    name: '20251211_100529_add_claim_status',
  },
  {
    up: migration_20251215_073929_make_city_optional_for_drafts.up,
    down: migration_20251215_073929_make_city_optional_for_drafts.down,
    name: '20251215_073929_make_city_optional_for_drafts',
  },
  {
    up: migration_20251215_074247_make_city_optional_for_drafts.up,
    down: migration_20251215_074247_make_city_optional_for_drafts.down,
    name: '20251215_074247_make_city_optional_for_drafts',
  },
  {
    up: migration_20251216_120412.up,
    down: migration_20251216_120412.down,
    name: '20251216_120412',
  },
  {
    up: migration_20251217_113056.up,
    down: migration_20251217_113056.down,
    name: '20251217_113056',
  },
  {
    up: migration_20251217_150432.up,
    down: migration_20251217_150432.down,
    name: '20251217_150432',
  },
  {
    up: migration_20251217_151242.up,
    down: migration_20251217_151242.down,
    name: '20251217_151242',
  },
  {
    up: migration_20251218_060720.up,
    down: migration_20251218_060720.down,
    name: '20251218_060720',
  },
  {
    up: migration_20251218_120110_Added_search_collection_fields.up,
    down: migration_20251218_120110_Added_search_collection_fields.down,
    name: '20251218_120110_Added_search_collection_fields',
  },
  {
    up: migration_20251219_141657.up,
    down: migration_20251219_141657.down,
    name: '20251219_141657',
  },
  {
    up: migration_20251223_112807.up,
    down: migration_20251223_112807.down,
    name: '20251223_112807',
  },
  {
    up: migration_20251223_113641.up,
    down: migration_20251223_113641.down,
    name: '20251223_113641'
  },
];
