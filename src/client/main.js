const {render} = require('react-dom');
const Store = require('../stores/application').default;
const React = require('react');
const {BrowserRouter, Route} = require('react-router-dom');
const Application = require('./components/application').default;

require('./sass/global.scss');

// Injection point of initial data in client-side.
Object.assign(Store._state, window.__initialData);

render((
    <BrowserRouter>
      <Route component={Application}/>
    </BrowserRouter>
), document.getElementById('application-container'));

// For dev
window.startStyleReload = () => {
  setInterval(() => {
    Array.from(document.querySelectorAll('link[rel=stylesheet]'))
        .filter(e => e.href.includes(location.hostname))
        .map(e => e.href = `${require('url').parse(e.href).pathname}?${Date.now()}`);
  }, 2000);
};
// window.startStyleReload();
