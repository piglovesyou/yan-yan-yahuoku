module.exports.asArray = function(o) {
  if (Array.isArray(o)) {
    return o;
  } else if (typeof o === 'object') {
    return [o];
  }
  return [];
}
;
