import assert from 'node:assert/strict';
import { InMemoryTtlCache } from '../../server/services/cache';
import { buildSearchCacheKey, runSearch, runSuggest, type SearchableItem } from '../../server/services/search';
import { textHasProfanity } from '../../server/middleware/moderation';
import { getRolloutConfig, isFeatureEnabledForUser } from '../../server/services/rollout';

const items: SearchableItem[] = [
  { id: 'e1', type: 'event', title: 'Startup Night Sydney', subtitle: 'Tech · CBD', description: 'Founder demos', city: 'Sydney', country: 'Australia', tags: ['startup'] },
  { id: 'c1', type: 'community', title: 'Sydney Startup Circle', subtitle: 'Tech community', description: 'Builders', city: 'Sydney', country: 'Australia', tags: ['community'] },
  { id: 'b1', type: 'business', title: 'RamanArc Studios', subtitle: 'Studio', description: 'Digital products', city: 'Sydney', country: 'Australia', tags: ['studio'] },
];

const searchResult = runSearch(items, { q: 'startup', type: 'all', page: 1, pageSize: 10, city: 'Sydney' });
assert.ok(searchResult.results.length >= 2);
assert.equal(searchResult.page, 1);

const suggest = runSuggest(items, 'sta');
assert.ok(suggest.length >= 1);

const keyA = buildSearchCacheKey({ q: 'x', type: 'all', page: 1, pageSize: 10, tags: ['b', 'a'] });
const keyB = buildSearchCacheKey({ q: 'x', type: 'all', page: 1, pageSize: 10, tags: ['a', 'b'] });
assert.equal(keyA, keyB);

assert.equal(textHasProfanity('you are an idiot'), true);
assert.equal(textHasProfanity('welcome friend'), false);

const cache = new InMemoryTtlCache(1000);
cache.set('k1', { ok: true });
assert.deepEqual(cache.get('k1'), { ok: true });
cache.del('k1');
assert.equal(cache.get('k1'), null);

const rollout = getRolloutConfig();
assert.ok(['internal', 'pilot', 'half', 'full'].includes(rollout.phase));
assert.equal(typeof isFeatureEnabledForUser('ticketingPhase6', 'u1'), 'boolean');

console.log('unit services/middleware checks passed');
