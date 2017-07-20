const React = require('react');
const s = require('./index.scss');
const {Icon, Popup} = require('semantic-ui-react');
const {goBackFromDetail} = require('../../actions');

class Detal extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const i = this.props;
    return (
        <div className={s.root}>
          <div className={s.toolbar}>
            <div className={s.leftButton}
                 onClick={goBackFromDetail.bind(null, this.props.history)}
            >
              <Icon name="chevron left"
                    size="big"
                    tabIndex="0"
              />
            </div>
            <div className={s.centerLabel}>
              {i.Title}
            </div>
            {/*<div className={s.rightButton}>*/}
              {/*{i.displayName*/}
                  {/*? <Popup trigger={<span><Icon name="lightning"/><a href="/auth/logout">{i.displayName}</a></span>}>*/}
                    {/*<Icon name="bomb"/>Sign out and destroy session*/}
                  {/*</Popup>*/}
                  {/*: <Popup content="Sign in to watch items"*/}
                           {/*trigger={<span><Icon name="privacy"/><a href="/auth/yj">Sign in</a></span>}*/}
                  {/*/>*/}
              {/*}*/}
            {/*</div>*/}
          </div>

          <div className={s.images}>
            <img className={s.img} src={i.Img.Image1}/>
          </div>

          <h2 className={s.h2}>
            <a href={i.AuctionItemUrl} target="_blank">{i.Title}</a>
          </h2>

          <div className={s.detail} dangerouslySetInnerHTML={{__html: i.Description}}></div>

        </div>
    );
  }
}

module.exports.default = Detal;
