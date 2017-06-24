const dispatcher = require('../dispatcher').default;
const {ReduceStore} = require('flux/utils');
const justOnceStateInjector = require('./just-once-state-injector');

class Store extends ReduceStore {
  getInitialState() {
    return {
      title: null,
      messages: [],
      category: null,
      goods: [],

      // TODO: take SSR into account
      lastCategoryId: global.localStorage && localStorage.getItem('v1.last_search_category_id') || 0,
      lastQueryKeywords: global.localStorage && localStorage.getItem('v1.last_query_keywords') || ''
    };
  }

  getState() {
    return justOnceStateInjector.consume() || this._state;
  }

  reduce(state, action) {
    let newState;
    switch (action.type) {
      case 'update_category':
        const category = action.json.ResultSet.Result;
        newState = Object.assign({}, state, {
          category: category,
          lastCategoryId: category.CategoryId,
        });
        localStorage.setItem('v1.last_search_category_id', category.CategoryId);
        break;

      case 'update_goods':
        const items = asArray(action.json.ResultSet.Result.Item);
        newState = Object.assign({}, state, {
          goods: items.map(i => {
            i['@largerImage'] = i.Image.replace('-thumb-', '-img600x450-');
            return i;
          }),
        });
        localStorage.setItem('v1.last_query_keywords', action.args.keywords);
        break;
    }
    return newState;
  }
}

function asArray(o) {
  if (Array.isArray(o)) {
    return o;
  } else if (typeof o === 'object') {
    return [o];
  }
  return [];
}

module.exports.default = new Store(dispatcher);
