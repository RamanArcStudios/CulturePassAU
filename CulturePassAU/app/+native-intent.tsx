export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}) {
  try {
    if (!path) return "/";

    const cleanPath = path.split("?")[0];

    // Map legacy routes
    if (cleanPath.startsWith("/events/")) {
      return cleanPath.replace("/events/", "/event/");
    }

    if (cleanPath.startsWith("/artists/")) {
      return cleanPath.replace("/artists/", "/artist/");
    }

    // Allow valid routes
    return cleanPath;
  } catch {
    return "/";
  }
}