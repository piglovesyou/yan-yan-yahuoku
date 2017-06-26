const React = require('react');
const {Container} = require('flux/utils');
const {Route} = require('react-router-dom');
const Store = require('../../stores/application').default;
const Toolbar = require('../toolbar').default;
const Navigation = require('../navigation').default;
const About = require('../about').default;
const Home = require('../home').default;
const GoodsPane = require('../goods-pane').default;
const ConditionPane = require('../condition-pane').default;
const s = require('./index.scss');
const {Sidebar, Icon, Menu} = require('semantic-ui-react');
const {selectSearchCategory, executeQueryWithKeywords} = require('../../actions');
const BottomBar = require('../bottom-bar').default;

class Application extends React.Component {
  constructor(props) {
    super(props);
    this.toggleSidemenu = this.toggleSidemenu.bind(this);
    this.closeSidemenu = this.closeSidemenu.bind(this);
  }

  static getStores() {
    return [Store];
  }

  static calculateState() {
    return Store.getState();
  }

  componentDidMount() {
    selectSearchCategory(this.state.lastCategoryId);
    executeQueryWithKeywords(this.state.lastQueryKeywords);
  }

  render() {
    return (
        <Sidebar.Pushable className={s.root}>
          <Sidebar as={Menu} animation='overlay' width='thin' visible={this.state.isSidebarVisible} icon='labeled'
                   vertical inverted>
            <Menu.Item name='home'>
              <Icon name='home'/>
              Home
            </Menu.Item>
            <Menu.Item name='gamepad'>
              <Icon name='gamepad'/>
              Games
            </Menu.Item>
            <Menu.Item name='camera'>
              <Icon name='camera'/>
              Channels
            </Menu.Item>
          </Sidebar>

          <Sidebar.Pusher dimmed={this.state.isSidebarVisible}
                          className={s.mainViewport}
                          onClick={() => this.state.isSidebarVisible && this.closeSidemenu()}
          >
            <Toolbar {...this.state} onMenuButtonClick={this.toggleSidemenu}/>

            <ConditionPane {...this.state} />

            <GoodsPane className={s.goodsPane} {...this.state} />

            <BottomBar {...this.state} />

          </Sidebar.Pusher>

        </Sidebar.Pushable>
    );
  }

  toggleSidemenu() {
    this.setState({isSidebarVisible: !this.state.isSidebarVisible});
  }

  closeSidemenu() {
    this.setState({isSidebarVisible: false});
  }
}

module.exports.default = Container.create(Application);
