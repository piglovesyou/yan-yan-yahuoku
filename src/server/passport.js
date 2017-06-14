const passport = require('passport');
const querystring = require('querystring');
const {YJStrategy} = require('passport-yj');

passport.serializeUser((user, done) => {
  done(null, querystring.escape(querystring.stringify(user)));
});

passport.deserializeUser((stored, done) => {
  done(null, querystring.parse(querystring.unescape(stored)));
});

// TODO: Remove them
process.env.YAN_YAN_YAHUOKU_CONSUMER_KEY = 'dj0zaiZpPUlwRFRjVXkzdVN1TyZzPWNvbnN1bWVyc2VjcmV0Jng9NWQ-';
process.env.YAN_YAN_YAHUOKU_CONSUMER_SECRET = 'f711efe735f57ecf80ccdbd21e51a41dd669cb1c';
process.env.YAN_YAN_YAHUOKU_CALLBACK_URL = 'http://yan-yan-yahuoku.com/auth/yj/callback';

passport.use(new YJStrategy({
      clientID: process.env.YAN_YAN_YAHUOKU_CONSUMER_KEY,
      clientSecret: process.env.YAN_YAN_YAHUOKU_CONSUMER_SECRET,
      callbackURL: process.env.YAN_YAN_YAHUOKU_CALLBACK_URL,
    }, (token, tokenSecret, {id, displayName}, done) => {
      return done(null, {id, token, tokenSecret, displayName});
    }
));

module.exports.default = passport;
