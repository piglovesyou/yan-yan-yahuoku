const React = require('react');
const s = require('./index.scss');
const {Icon, Popup} = require('semantic-ui-react');

class Detal extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const props = this.props;
    return (
        <div className={s.root}>
          detail❤️
          {/*<div className={s.toolbar}>*/}
            {/*<div className={s.leftButton}>*/}
              {/*<Icon name="chevron left"*/}
                    {/*size="big"*/}
                    {/*onClick={props.onMenuButtonClick}*/}
                    {/*tabIndex="0"*/}
              {/*/>*/}
            {/*</div>*/}
            {/*<div className={s.centerLabel}>*/}
              {/*{props.selectedAuctionItem}*/}
            {/*</div>*/}
            {/*<div className={s.rightButton}>*/}
              {/*{props.displayName*/}
                  {/*? <Popup trigger={<span><Icon name="lightning"/><a href="/auth/logout">{props.displayName}</a></span>}>*/}
                    {/*<Icon name="bomb"/>Sign out and destroy session*/}
                  {/*</Popup>*/}
                  {/*: <Popup content="Sign in to watch items"*/}
                           {/*trigger={<span><Icon name="privacy"/><a href="/auth/yj">Sign in</a></span>}*/}
                  {/*/>*/}
              {/*}*/}
            {/*</div>*/}
          {/*</div>*/}
        </div>
    );
  }
}

module.exports.default = Detal;
