export function formatBytes(size: number): string {
  if (!size) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const power = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  return `${(size / 1024 ** power).toFixed(power ? 1 : 0)} ${units[power]}`;
}
