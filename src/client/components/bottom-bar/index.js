const React = require('react');
const {Icon} = require('semantic-ui-react');
const s = require('./index.scss');
const {goToNextGoods} = require('../../actions');

class BottomBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <div className={s.root + ' ' +
        (this.props.isLeftEdge ? s.rootIsLeftEdge : '') + ' ' +
        (this.props.isRightEdge ? s.rootIsRightEdge : '')}>
          <div className={s.goBack} onClick={goToNextGoods.bind(null, false)}>
            <Icon name="arrow left"/>
          </div>
          <div className={s.goForward} onClick={goToNextGoods.bind(null, true)}>
            <Icon name="arrow right"/>
          </div>
        </div>
    );
  }
}

module.exports.default = BottomBar;
