const React = require('react');
const s = require('./index.scss');
const {Icon, Popup} = require('semantic-ui-react');

class Detal extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const item = this.props;
    return (
        <div className={s.root}>
          <div className={s.toolbar}>
            <div className={s.leftButton}>
              <Icon name="chevron left"
                    size="big"
                    onClick={item.onMenuButtonClick}
                    tabIndex="0"
              />
            </div>
            <div className={s.centerLabel}>
              {item.Title}
            </div>
            <div className={s.rightButton}>
              {item.displayName
                  ? <Popup trigger={<span><Icon name="lightning"/><a href="/auth/logout">{item.displayName}</a></span>}>
                    <Icon name="bomb"/>Sign out and destroy session
                  </Popup>
                  : <Popup content="Sign in to watch items"
                           trigger={<span><Icon name="privacy"/><a href="/auth/yj">Sign in</a></span>}
                  />
              }
            </div>
          </div>
        </div>
    );
  }
}

module.exports.default = Detal;
