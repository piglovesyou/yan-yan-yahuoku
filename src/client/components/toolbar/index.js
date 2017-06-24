const React = require('react');
const {Icon} = require('semantic-ui-react');
const s = require('./index.scss');

class UserName extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
        <span onMouseEnter={() => this.setState({isHovered: true})}
              onMouseLeave={() => this.setState({isHovered: false})}
        >
      {this.state.isHovered
          ? <a href="/auth/logout">Logout</a>
          : <span><Icon name="user outline"/><a href="/auth/logout">{this.props.displayName}</a></span>
      }
  </span>
    );
  }
}

module.exports.default = function Toolbar(props) {
  return (
      <div className={s.root}>
        <Icon name="sidebar" size="big" onClick={props.onMenuButtonClick} tabIndex="0"/>
        <h1 className={s.title}>{props.title}</h1>
        <div>
          {props.displayName
              ? <UserName {...props} />
              : <span><Icon name="privacy"/><a href="/auth/yj">auth</a></span>
          }
        </div>
      </div>
  );
};

