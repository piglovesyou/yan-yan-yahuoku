const React = require('react');
const {Icon} = require('semantic-ui-react');
const s = require('./index.sass');

module.exports.default = function GoodsPane(props) {
  return (
      <div className={`${s.root}${props.className ? ' ' + props.className : ''}`}>

        {
          props.goods ? props.goods.slice(0, 1).map(g => {
            return <img key={g.AuctionID} src={g.Image} />;
          }) : null
        }
      </div>
  );
};