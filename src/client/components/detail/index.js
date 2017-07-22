const React = require('react');
const s = require('./index.scss');
const {Icon, Popup} = require('semantic-ui-react');
const {goBackFromDetail} = require('../../actions');

class Detal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imageIndex: 0
    };
    this.flipImage = this.flipImage.bind(this);
  }

  render() {
    const i = this.props;
    const imgKeys = Object.keys(i.Img).sort();
    const imgSrc = i.Img[imgKeys[this.state.imageIndex]];
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

          <div className={s.images} onClick={this.flipImage}>
            <img className={s.img} src={imgSrc}/>
          </div>
          <div className={s.indicator}>
            {imgKeys.map((_, i) => {
              return <div className={s.indicatorDot + ' ' + (i === this.state.imageIndex ? s.indicatorDotSelected : '')}/>
            })}
          </div>

          <h2 className={s.h2}>
            <a href={i.AuctionItemUrl} target="_blank">{i.Title}</a>
          </h2>

          <div className={s.detail} dangerouslySetInnerHTML={{__html: i.Description}}/>

        </div>
    );
  }

  flipImage() {
    const {Img} = this.props;
    const {length} = Object.keys(Img);
    this.setState({
      imageIndex: this.state.imageIndex === length - 1 ? 0 : this.state.imageIndex + 1
    });
  }
}

module.exports.default = Detal;
