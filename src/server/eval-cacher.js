const LRU = require('lru-cache'),
    cache = LRU({
      max: 500
      , length: (n, key) => n * 2 + key.length
      , dispose: (key, n) => { n.close(); }
      , maxAge: 1000 * 60 * 60
    });

module.exports.wrapAsyncFn = (fn) => {
  return async function () {
    const key = Array.from(arguments).map(serialize).join('&') + '&';
    // console.log(key);
    const cachedValue = cache.get(key);
    if (cachedValue) {
      return cachedValue;
    }
    const evaluatedValue = await fn.apply(null, arguments);
    cache.set(key, evaluatedValue);
    return evaluatedValue;
  };
};
//TODO: Write tests

function serialize(arg) {
  if (Array.isArray(arg)) {
    return `${arg.map(serialize)}&`;

  } else if (typeof arg === 'object') {
    return Object.keys(arg).map((k) => {
      return `${k}=${serialize(arg[k])}&`;
    });

  }
  return String(arg) + '&';
}
