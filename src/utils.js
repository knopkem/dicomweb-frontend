export function __get(obj, path, def) {
  path = path.replace(/\[/g, '.').replace(/]/g, '').split('.');

  path.forEach(function (level) {
    obj = obj[level];
  });
  if (obj === undefined) {
    return def;
  }

  return obj;
}
