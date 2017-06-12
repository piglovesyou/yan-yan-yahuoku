const React = require('react');
const {Icon} = require('semantic-ui-react');
const s = require('./index.sass');

module.exports.default = function Toolbar(props) {
  return (
      <div className={s.root}>
        <Icon name="sidebar" size="big" onClick={props.onMenuButtonClick} tabIndex="0"/>
        <h1 className={s.title}>{props.title}</h1>
        <div>
          &nbsp;<Icon name="heartbeat"/>
        </div>
      </div>
  );
};
