const React = require('react');
const {Container} = require('flux/utils');
const {Route} = require('react-router-dom');
const Store = require('../../stores/application').default;
const Toolbar = require('../toolbar').default;
const Navigation = require('../navigation').default;
const About = require('../about').default;
const Home = require('../home').default;
const s = require('./index.sass');
const {Sidebar, Icon, Menu} = require('semantic-ui-react');
const {prepareSearchCategory} = require('../../actions');

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
    prepareSearchCategory(this.state.category);
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

            <div className={s.masterDetail}>
              <Navigation className={s.masterDetailMaster}/>
              <div className={s.masterDetailDetail}>
                <Route path='/' exact render={() => <Home {...this.state} />}/>
                <Route path='/about' render={() => <About {...this.state} />}/>
              </div>
            </div>
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
