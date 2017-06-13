const ConnectRedis = require('connect-redis');
const session = require('express-session');

const RedisStore = ConnectRedis(session);
module.exports.default = new RedisStore({
  url: process.env.REDISTOGO_URL || undefined/* localhost */
});
