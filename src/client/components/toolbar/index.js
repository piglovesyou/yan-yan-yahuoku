const React = require('react');
const s = require('./index.sass');
const {Icon} = require('semantic-ui-react');

module.exports.default = function Toolbar(props) {
  return (
      <div className={s.root}>
        <h1 className={s.title}>
          {props.title}&nbsp;<Icon name="heartbeat" />
        </h1>
      </div>
  );
};
