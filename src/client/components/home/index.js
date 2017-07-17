const React = require('react');
const s = require('./index.scss');
const {Breadcrumb, Dropdown, Sidebar, Icon, Menu} = require('semantic-ui-react');
const {selectSearchCategory} = require('../../actions');
const GoodsPane = require('../goods-pane').default;
const ConditionPane = require('../condition-pane').default;
const BottomBar = require('../bottom-bar').default;
const Toolbar = require('../toolbar').default;

module.exports.default = function Home(props) {
  return (
      <div className={s.root}>
        <Toolbar {...props}
                 onMenuButtonClick={props.toggleSidemenu}
        >
          <ConditionPane {...props} />
        </Toolbar>
        <GoodsPane {...props} />
        <BottomBar {...props} />
      </div>
  );
};
