/**
 * Remaps legacy/URL-friendly paths to Expo Router paths
 * Handles query params and initial route special cases
 */
export function redirectSystemPath({
  path,
  initial = false,
}: {
  path: string | null | undefined;
  initial?: boolean;
}): string {
  // Handle empty/null path
  if (!path || path.trim() === '') {
    return '/';
  }

  // Parse path and query
  const [rawPath, rawQuery = ''] = path.split('?');
  const cleanPath = rawPath.trim() || '/';
  const querySuffix = rawQuery ? `?${rawQuery}` : '';

  // Legacy path remapping (plural to singular)
  const PATH_REMAP: Array<[string, string]> = [
    ['/events/', '/event/'],
    ['/artists/', '/artist/'],
    ['/communities/', '/community/'],
    ['/profiles/', '/profile/'],
    ['/tickets/', '/tickets/'], // tickets stays plural
    ['/users/', '/user/'],
    ['/businesses/', '/business/'],
  ];

  // Check for exact prefix matches
  for (const [from, to] of PATH_REMAP) {
    if (cleanPath.startsWith(from)) {
      return `${cleanPath.replace(from, to)}${querySuffix}`;
    }
  }

  // Initial route special case: /home -> tabs
  if (initial && cleanPath === '/home') {
    return '/(tabs)';
  }

  // Preserve trailing slash for directories
  const hasTrailingSlash = cleanPath.endsWith('/');
  const normalizedPath = hasTrailingSlash ? cleanPath : `${cleanPath}/`;

  // Return original path (normalized) if no remap needed
  return `${normalizedPath}${querySuffix}`;
}
