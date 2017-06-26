const React = require('react');
// const {Icon} = require('semantic-ui-react');
const s = require('./index.scss');

const columns = 2;
const rows = 2;

class GoodsPane extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredItemId: undefined
    };
  }

  render() {
    const {className, goods} = this.props;
    return (
        <div className={`${s.root}${className ? ' ' + className : ''}`}>
          {
            goods ? goods.slice(0, 4).map((g, index) => {
              return [
                <div className={s.item}
                     onMouseEnter={(e) => this.setState({hoveredItemId: g.AuctionID})}
                     onMouseLeave={(e) => this.setState({hoveredItemId: undefined})}
                     key={g.AuctionID}>
                  <img className={s.img} key={g.AuctionID} src={g.Img.Image1 || g.Image}/>
                </div>,
                (this.state.hoveredItemId === g.AuctionID
                    ? (
                        <div key={`${g.AuctionID}:detail`} className={s.itemDetail} style={getLeftAndRight(index)}>
                          {g.Title}
                        </div>
                    ) : null)
              ];
            }) : null
          }
        </div>
    );
  }
}

const widthUnit = 100 / columns;
function getLeftAndRight(index) {
  const leftIndex = index % columns;
  const isRightEdge = leftIndex + 1 === columns;
  if (isRightEdge) {
    return {
      right: 100 - widthUnit + '%',
      left: 100 - (widthUnit * 2) + '%',
    };
  } else {
    const leftNum = leftIndex + 1;
    return {
      left: leftNum * widthUnit + '%',
      right: (columns - leftIndex - 2) * widthUnit + '%',
    };
  }
}

module.exports.default = GoodsPane;
