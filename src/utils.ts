export function __get(obj: any, path: any, def: any) {
  path = path.replace(/\[/g, '.').replace(/]/g, '').split('.');

  path.forEach(function (level: any) {
    obj = obj[level];
  });
  if (obj === undefined) {
    return def;
  }

  return obj;
}
