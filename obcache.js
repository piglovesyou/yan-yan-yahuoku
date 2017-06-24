const LRU = require('lru-cache'),
    options = {
      max: 500
      , length: function (n, key) { return n * 2 + key.length; }
      , dispose: function (key, n) { n.close(); }
      , maxAge: 1000 * 60 * 60
    },
    cache = LRU(options);

const getBoomWrapped = wrapAsyncFn(getBoom);

async function main() {
  console.log(await getBoom({a: 'aaa', b: 'bbb',}));
  console.log(await getBoom({a: 'aaa', b: 'bbb',}));
  console.log(await getBoom({a: 'aaa', b: 'bbb',}));

  console.log('============');


  console.log(await getBoomWrapped({a: 'aaa', b: 'bbb',}));
  console.log(await getBoomWrapped({a: 'aaa', b: 'bbb',}));
  console.log(await getBoomWrapped({a: 'aaa', b: 'bbb',}));
}
main();

function wrapAsyncFn(fn) {
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
}

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

function getBoom(param) {
  console.log('called!!!!!!');
  let rv = '';
  for (let k of Object.keys(param)) {
    rv += `${k}=${param[k]}&`;
  }
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(rv);
    }, 800);
  });
}