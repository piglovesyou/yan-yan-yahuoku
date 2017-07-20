const FS = require('fs');
const Path = require('path');
const deepmerge = require('deepmerge');
const babelrc = JSON.parse(FS.readFileSync(Path.resolve(__dirname, '../../../.babelrc')));
const {isProduction} = require('../env');
const {requestAuctionItem} = require('./api');

if (!isProduction) {
  // Applied only for JSXs in '../components'
  require('babel-register')(
      Object.assign(babelrc, {
        only: Path.resolve(__dirname, '../../client/components'),
        babelrc: false,
        sourceMaps: true
      })
  );
}

const React = require('react');
const {StaticRouter} = require('react-router');
const {renderToString} = require('react-dom/server');

module.exports.default = isProduction
    ? defaultRouteMiddleware
    : [unloadModulesMiddleware, defaultRouteMiddleware];

function unloadModulesMiddleware(_, __, next) {
  unloadModules_();
  next();
}

const defaultState = require('../../stores/default-state').default;
async function defaultRouteMiddleware(req, res) {

  // TODO: Use express route instead of string match
  let selectedAuctionItem;
  if (req.url.startsWith('/items/')) {
    const m = req.url.match(/\/items\/([a-zA-Z0-9]*)/);
    if (!m || !m[1]) {
      res.status(404);
      return res.send('boom');
    }
    const [_, auctionID] = m;
    selectedAuctionItem = await requestAuctionItem(auctionID);
  }

  const data = Object.assign({}, defaultState, {
    displayName: req.user && req.user.displayName,
    selectedAuctionItem,
  });

  require('../../stores/just-once-state-injector').set(data);
  const html = renderToString(React.createElement(StaticRouter, {
    location: req.url,
    context: {}
  }, React.createElement(require('../../client/components/application/index').default, data)));

  // TODO: Handling redirect and 404
  res.status(200).send(require('../../client/layout').default([data, html]));
}

function unloadModules_() {
  const srcPath = Path.resolve(__dirname, '../client');
  Object.keys(require.cache)
      .filter(m => m.startsWith(srcPath))
      .forEach(m => delete require.cache[m]);
}

