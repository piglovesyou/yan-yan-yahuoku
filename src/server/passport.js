const passport = require('passport');
const querystring = require('querystring');
const {YJStrategy} = require('passport-yj');

passport.serializeUser((user, done) => {
  done(null, querystring.escape(querystring.stringify(user)));
});

passport.deserializeUser((stored, done) => {
  done(null, querystring.parse(querystring.unescape(stored)));
});

passport.use(
    new YJStrategy({
      clientID: process.env.YAN_YAN_YAHUOKU_CONSUMER_KEY,
      clientSecret: process.env.YAN_YAN_YAHUOKU_CONSUMER_SECRET,
      callbackURL: process.env.YAN_YAN_YAHUOKU_CALLBACK_URL,
    }, (access_token, refresh_token, {id, displayName}, done) => {
      return done(null, {id, access_token, refresh_token, displayName});
    })
);

module.exports.default = passport;
