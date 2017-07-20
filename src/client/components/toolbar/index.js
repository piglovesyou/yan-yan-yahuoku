const React = require('react');
const {Icon, Popup} = require('semantic-ui-react');
const s = require('./index.scss');

module.exports.default = function Toolbar(props) {
  return (
      <div className={s.root}>
        <div className={s.menuIcon}>
          <Icon name="sidebar"
                size="big"
                onClick={props.onMenuButtonClick}
                tabIndex="0"
          />
        </div>
        <div className={s.title}>
          {props.children}
        </div>
        {/*<div className={s.authTrigger}>*/}
          {/*{props.displayName*/}
              {/*? <Popup trigger={<span><Icon name="lightning"/><a href="/auth/logout">{props.displayName}</a></span>}>*/}
                {/*<Icon name="bomb"/>Sign out and destroy session*/}
              {/*</Popup>*/}
              {/*: <Popup content="Sign in to watch items"*/}
                       {/*trigger={<span><Icon name="privacy"/><a href="/auth/yj">Sign in</a></span>}*/}
              {/*/>*/}
          {/*}*/}
        {/*</div>*/}
      </div>
  );
};

