const React = require('react');
// const {Icon} = require('semantic-ui-react');
const s = require('./index.scss');

module.exports.default = function GoodsPane(props) {
  return (
      <div className={`${s.root}${props.className ? ' ' + props.className : ''}`}>

        {
          props.goods ? props.goods.slice(0, 4).map(g => {
            return <img className={s.img} key={g.AuctionID} src={g.Img.Image1 || g.Image} />;
          }) : null
        }
      </div>
  );
};
