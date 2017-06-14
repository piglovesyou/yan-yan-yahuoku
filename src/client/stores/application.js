const dispatcher = require('../dispatcher').default;
const {ReduceStore} = require('flux/utils');
const justOnceStateInjector = require('./just-once-state-injector');

class Store extends ReduceStore {
  getInitialState() {
    return {
      title: null,
      messages: [],
      category: null,
      lastCategoryId: localStorage.getItem('v1.last_search_category_id') || 0,
    };
  }

  getState() {
    return justOnceStateInjector.consume() || this._state;
  }

  reduce(state, action) {
    let newState;
    switch (action.type) {
      case 'update_category':
        newState = Object.assign({}, state, {
          category: action.data,
          lastCategoryId: action.data.CategoryId,
        });
        localStorage.setItem('v1.last_search_category_id', action.data.CategoryId);
        break;

      case 'baam':
        newState = Object.assign({}, state, {
          messages: state.messages.concat(randomMessage())
        });
        break;
    }
    return newState;

    function randomMessage() {
      return state.messages[Math.floor(Math.random() * state.messages.length)];
    }
  }
}

module.exports.default = new Store(dispatcher);
