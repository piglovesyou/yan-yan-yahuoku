const React = require('react');
const s = require('./index.scss');
const Toolbar = require('../toolbar').default;

module.exports.default = function About(props) {
  return (
    <div>
      <Toolbar {...props}
               onMenuButtonClick={props.toggleSidemenu}
      >
        <h1 className={s.h1}>About</h1>
      </Toolbar>
    </div>
  );
};
