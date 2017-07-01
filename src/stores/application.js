const dispatcher = require('../client/dispatcher/index').default;
const {ReduceStore} = require('flux/utils');
const justOnceStateInjector = require('./just-once-state-injector');
const {asArray} = require('../utils/object');
const defaultState = require('./default-state').default;

class Store extends ReduceStore {
  getInitialState() {
    return Object.assign({}, defaultState, {
      lastCategoryId: global.localStorage && localStorage.getItem('v1.last_search_category_id') || 0,
      lastQueryKeywords: global.localStorage && localStorage.getItem('v1.last_query_keywords') || ''
    });
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
        const items = asArray(action.json.ResultSet && action.json.ResultSet.Result.Item);
        const metadata = getGoodsMetadata(action.json);
        const veryFirst = 0;
        newState = Object.assign({}, state, {
          currentPage: Math.ceil(metadata.firstResultPosition / metadata.totalResultsReturned),
          goodsFetched: items,
          goodsInViewport: items.slice(veryFirst, state.goodsCountInViewport),
          indexInCurrentPage: veryFirst,
          currentGoodsMetadata: metadata,
        });
        localStorage.setItem('v1.last_query_keywords', action.args.query);
        break;
    }
    return newState;
  }
}

function getGoodsMetadata(json) {
  const raw = json.ResultSet['@attributes'];
  return Object.keys(raw).reduce((rv, k) => {
    return Object.assign(rv, {
      [k]: Number(raw[k])
    });
  }, {});
}

module.exports.default = new Store(dispatcher);
