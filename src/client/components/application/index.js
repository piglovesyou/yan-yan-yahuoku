const React = require('react');
const {Container} = require('flux/utils');
const {Route} = require('react-router-dom');
const Store = require('../../stores/application').default;
const Toolbar = require('../toolbar').default;
const Navigation = require('../navigation').default;
const About = require('../about').default;
const Home = require('../home').default;
const s = require('./index.sass');
const {Sidebar, Icon, Menu, Segment} = require('semantic-ui-react');

class Application extends React.Component {
  static getStores() {
    return [Store];
  }

  static calculateState() {
    return Store.getState();
  }

  render() {
    return (
        <Sidebar.Pushable as={Segment} className={s.root}>

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

          <Toolbar {...this.state} onMenuButtonClick={this.toggleSidemenu.bind(this)}/>

          <Sidebar.Pusher className={s.mainContent}>
            <div className={s.layoutMasterDetail}>
              <Navigation className={s.layoutMasterDetailMaster}/>
              <div className={s.layoutMasterDetailDetail}>
                <Route path='/' exact render={() => <Home {...this.state} />}/>
                <Route path='/about' render={() => <About {...this.state} />}/>
              </div>
            </div>
          </Sidebar.Pusher>

        </Sidebar.Pushable>

    );
  }

  toggleSidemenu() {
    console.log(this.state.isSidebarVisible);
    this.setState({
      isSidebarVisible: !this.state.isSidebarVisible
    });
  }
}

module.exports.default = Container.create(Application);
