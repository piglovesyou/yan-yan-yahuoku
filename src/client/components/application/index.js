const React = require('react');
const {Container} = require('flux/utils');
const Store = require('../../../stores/application').default;
const Navigation = require('../navigation').default;
const About = require('../about').default;
const GoodsPane = require('../goods-pane').default;
const ConditionPane = require('../condition-pane').default;
const s = require('./index.scss');
const {Sidebar, Icon, Menu} = require('semantic-ui-react');
const {selectSearchCategory, loadFirstPage} = require('../../actions');
const BottomBar = require('../bottom-bar').default;
const Home = require('../home').default;
const Detail = require('../detail').default;

const {Route, Switch, IndexRoute, BrowserRouter, Match, Link} = require('react-router-dom');

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
    loadFirstPage(this.state.lastQueryKeywords);
  }

  render() {
    const routeClassName = this.props.location ? 'route-' + getRouteName(this.props.location.pathname) : '';
    return (
          <Sidebar.Pushable className={s.root}>
            <Sidebar as={Menu} animation='overlay' width='thin' visible={this.state.isSidebarVisible} icon='labeled'
                     vertical inverted>

              <Menu.Item name='home' className={s.sideMenuItem}>
                <Link to="/" onClick={this.closeSidemenu} className={s.sideMenuItemLink}><Icon name='home'/> Home</Link>
              </Menu.Item>

              <Menu.Item name='about' className={s.sideMenuItem}>
                <Link to="/about" onClick={this.closeSidemenu}><Icon name='info'/> About</Link>
              </Menu.Item>
            </Sidebar>

            <Sidebar.Pusher dimmed={this.state.isSidebarVisible}
                            className={s.mainViewport + ' ' + routeClassName}
                            onClick={() => this.state.isSidebarVisible && this.closeSidemenu()}
            >

              <Switch>
                {/*refactor*/}
                <Route exact path="/" component={() => <Home toggleSidemenu={this.toggleSidemenu} {...Object.assign({}, this.state, this.props)}/>}/>
                <Route exact path="/about" component={() => <About toggleSidemenu={this.toggleSidemenu} />}/>
                <Route exact path="/items/:id" component={() => <Detail {...Object.assign({}, this.state.selectedAuctionItem, this.props)} />}/>
              </Switch>

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

const lengthToIgnoreForPathname = '/'.length;
function getRouteName(pathname) {
  return pathname.slice(lengthToIgnoreForPathname,
      pathname.indexOf('/', lengthToIgnoreForPathname));
}
