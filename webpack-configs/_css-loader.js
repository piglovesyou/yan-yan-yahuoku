const {isProduction} = require('../src/server/env');

const localIdentName = isProduction
    ? module.exports.production = '[hash:base64:3]'
    : module.exports.develop = '[path]_[name]_[local]';

module.exports.default = `css-loader?modules&camelCase&localIdentName=${localIdentName}`;

