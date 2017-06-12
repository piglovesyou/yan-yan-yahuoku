const React = require('react');
const s = require('./index.sass');
const Button = require('semantic-ui-react').Button;
const {baam} =  require('../../actions');

module.exports.default = function Home(props) {
  return (
    <div className={s.root}>
      <h2>Home...</h2>
      <h3>Messages <Button onClick={baam}>Add message</Button></h3>
      <ul>
        {props.messages.map((m, i) => <li key={i}>{m}</li>)}
      </ul>
    </div>
  );
};
