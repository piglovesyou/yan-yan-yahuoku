const React = require('react');
// const {Icon} = require('semantic-ui-react');
const s = require('./index.scss');

const {Route, Switch, IndexRoute, BrowserRouter, Match, Link} = require('react-router-dom');
const columns = 2;
const rows = 2;
const {selectAuctionItem} = require('../../actions');

class GoodsPane extends React.Component {
  constructor(props) {
    super(props);
    // this.state = {
    //   hoveredItemId: undefined
    // };
  }

  render() {
    const {className, goodsInViewport} = this.props;
    return (
        <div className={`${s.root}${className ? ' ' + className : ''}`}>
          {
            goodsInViewport.map((g, index) => {
              return (
                  <div className={s.item}
                       onClick={selectAuctionItem.bind(null, g, this.props.history)}
                       key={g.AuctionID}>
                    <img className={s.img + ' ' + (isImageLandscape(g.Img.Image1) ? s.imgLandscape : s.imgPortlate)}
                         key={g.AuctionID} src={g.Img.Image1 || g.Image}/>
                  </div>
              );
            })
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

function isImageLandscape(imgUrl) {
  if (!imgUrl) return true;
  const basename = require('path').basename(imgUrl);
  const [_, w, h] = basename.match(/(\d+)x(\d+)/);
  if (!w || !h) return true;
  return Number(w) >= Number(h);
}

module.exports.default = GoodsPane;
