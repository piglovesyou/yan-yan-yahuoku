const lengthToIgnoreForPathname = '/'.length;

function getRouteName(pathname) {
  const secondSlashIndex = pathname.indexOf('/', lengthToIgnoreForPathname);
  return pathname.slice(lengthToIgnoreForPathname,
      secondSlashIndex > 0 ? secondSlashIndex : undefined);
}

module.exports = {
  createBodyClassNameFromPathName: pathname => {
    return 'route-' + (getRouteName(pathname) || 'home');
  }
};