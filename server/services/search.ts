export type SearchType = 'all' | 'event' | 'community' | 'business' | 'profile';

export type SearchQuery = {
  q: string;
  type: SearchType;
  city?: string;
  country?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
};

export type SearchableItem = {
  id: string;
  type: Exclude<SearchType, 'all'>;
  title: string;
  subtitle: string;
  description?: string;
  city?: string;
  country?: string;
  tags?: string[];
  date?: string;
};

function tokenize(input: string): string[] {
  return input.toLowerCase().split(/\s+/).filter(Boolean);
}

function trigramSet(text: string): Set<string> {
  const normalized = `  ${text.toLowerCase()}  `;
  const set = new Set<string>();
  for (let i = 0; i < normalized.length - 2; i += 1) {
    set.add(normalized.slice(i, i + 3));
  }
  return set;
}

function trigramSimilarity(a: string, b: string): number {
  const setA = trigramSet(a);
  const setB = trigramSet(b);
  const intersection = [...setA].filter((value) => setB.has(value)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function dateInRange(value?: string, startDate?: string, endDate?: string): boolean {
  if (!value) return true;
  if (startDate && value < startDate) return false;
  if (endDate && value > endDate) return false;
  return true;
}

function computeWeightedScore(item: SearchableItem, query: SearchQuery): number {
  const q = query.q.toLowerCase();
  const title = item.title.toLowerCase();
  const subtitle = item.subtitle.toLowerCase();
  const description = (item.description ?? '').toLowerCase();
  const itemTags = (item.tags ?? []).map((tag) => tag.toLowerCase());

  let score = 0;

  // Full-text weighting (title > subtitle > description)
  if (title === q) score += 200;
  if (title.startsWith(q)) score += 120;
  if (title.includes(q)) score += 90;

  const queryTokens = tokenize(q);
  const titleTokens = tokenize(title);
  const subtitleTokens = tokenize(subtitle);
  const descriptionTokens = tokenize(description);

  for (const token of queryTokens) {
    if (titleTokens.includes(token)) score += 35;
    if (subtitleTokens.includes(token)) score += 15;
    if (descriptionTokens.includes(token)) score += 8;
    if (itemTags.some((tag) => tag.includes(token))) score += 20;
  }

  // Fuzzy score (trigram approximation)
  score += Math.round(trigramSimilarity(title, q) * 80);

  // Location relevance
  if (query.city && item.city?.toLowerCase() === query.city.toLowerCase()) score += 30;
  if (query.country && item.country?.toLowerCase() === query.country.toLowerCase()) score += 20;

  return score;
}

export function buildSearchCacheKey(query: SearchQuery): string {
  return JSON.stringify({
    ...query,
    tags: [...(query.tags ?? [])].sort(),
  });
}

export function runSearch(items: SearchableItem[], query: SearchQuery) {
  const filtered = items
    .filter((item) => (query.type === 'all' ? true : item.type === query.type))
    .filter((item) => !query.city || item.city?.toLowerCase() === query.city.toLowerCase())
    .filter((item) => !query.country || item.country?.toLowerCase() === query.country.toLowerCase())
    .filter((item) => !query.tags?.length || query.tags.some((tag) => (item.tags ?? []).map((v) => v.toLowerCase()).includes(tag.toLowerCase())))
    .filter((item) => dateInRange(item.date, query.startDate, query.endDate));

  const ranked = filtered
    .map((item) => ({ item, score: computeWeightedScore(item, query) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  const start = (query.page - 1) * query.pageSize;
  const paged = ranked.slice(start, start + query.pageSize);

  return {
    total: ranked.length,
    page: query.page,
    pageSize: query.pageSize,
    results: paged.map(({ item }) => item),
  };
}

export function runSuggest(items: SearchableItem[], prefix: string, limit = 8): string[] {
  const normalized = prefix.trim().toLowerCase();
  if (!normalized) return [];
  const values = [...new Set(items.map((item) => item.title))];

  return values
    .map((title) => ({
      title,
      score: title.toLowerCase().startsWith(normalized)
        ? 100
        : Math.round(trigramSimilarity(title, normalized) * 60),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.title);
}
