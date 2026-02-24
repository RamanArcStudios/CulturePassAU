export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}) {
  if (!path) {
    return "/";
  }

  const [rawPath, rawQuery] = path.split("?");
  const cleanPath = rawPath || "/";
  const querySuffix = rawQuery ? `?${rawQuery}` : "";

  const remap = [
    ["/events/", "/event/"],
    ["/artists/", "/artist/"],
    ["/communities/", "/community/"],
    ["/profiles/", "/profile/"],
    ["/tickets/", "/tickets/"],
    ["/users/", "/user/"],
    ["/businesses/", "/business/"],
  ] as const;

  for (const [from, to] of remap) {
    if (cleanPath.startsWith(from)) {
      return `${cleanPath.replace(from, to)}${querySuffix}`;
    }
  }

  if (initial && cleanPath === "/home") {
    return "/(tabs)";
  }

  return `${cleanPath}${querySuffix}`;
}
