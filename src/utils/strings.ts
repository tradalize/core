export function joinUrl(...string: string[]) {
  return string
    .map((part) => part.replace(/(^\/+|\/+$)/g, ""))
    .filter((part) => part.length > 0)
    .join("/");
}
