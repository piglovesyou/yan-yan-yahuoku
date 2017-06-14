const Path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const logger = require('morgan');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require('../../webpack-configs/client');
const passport = require('./passport').default;
const session = require('express-session');
const sessionStore = require('./session-store').default;
const assert = require('assert');

const {isProduction} = require('./env');
const app = express();
app.set('port', normalizePort(process.env.PORT || '3000'));
app.use(logger('dev'));
app.use(favicon(Path.resolve(__dirname, '../../public/favicon.ico')));
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'baa',
}));
app.use(passport.initialize());
app.use(passport.session());

// import bodyParser from 'body-parser';
// import cookieParser from 'cookie-parser';
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());

if (Number(process.env.NODE_API_DEV)) {
  // No config for static files
} else if (isProduction ) {
  app.use(compression());
} else {
  Object.assign(webpackConfig.output, {path: '/'});
  app.use(webpackDevMiddleware(webpack(webpackConfig), {}));
}

app.use(express.static(Path.join(__dirname, '../../public')));

// Handle browser GET accesses
app.get('/auth/yj',
    passport.authenticate('yj', {
      scope: 'openid profile email',
      nonce: parseInt((new Date) / 1000)
    }));
app.get(
    require('url').parse(process.env.YAN_YAN_YAHUOKU_CALLBACK_URL).pathname,
    passport.authenticate('yj', {
      successRedirect: '/',
    }),
    (req, res) => {
      res.send('<a href="/">Authentication failed. Go back and try again.</a>');
    });
app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.send('You logged out. <a href="/">Go back to home screen.</a>');
});

app.get('/api/*', require('./middlewares/yahoo-api').default);

app.get('*', require('./middlewares/react-views').default);

// Handle 404
app.use((req, res, next) => {
  const err = new Error(`"${req.url}" Not Found`);
  err.status = 404;
  next(err);
});

// Handle errors
app.use(isProduction ? (err, req, res) => {
  res.status(err.status || 500);
  res.send('error;)');
} : (err, req, res) => {
  console.error(err);
  res.status(err.status || 500);
  res.send(`${err.message}

${err.stack}`);
});

module.exports.default = app;

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
