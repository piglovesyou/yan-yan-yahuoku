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
      case 'select-auction-item':
        const {selectedAuctionItem} = action;
        newState = Object.assign({}, state, {selectedAuctionItem});
        break;

      case 'update_category':
        const {category} = action;
        newState = Object.assign({}, state, {
          category: category,
          lastCategoryId: category.CategoryId,
        });
        localStorage.setItem('v1.last_search_category_id', category.CategoryId);
        break;

      case 'update_goods':
        // const items = asArray(action.json.ResultSet && action.json.ResultSet.Result.Item);
        const {
          goodsFetched,
          goodsMetadata,
          indexInFetched,
          goodsInViewport
        } = action;
        newState = Object.assign({}, state, {
          currentFetchedPage: Math.ceil(goodsMetadata.firstResultPosition / goodsMetadata.totalResultsReturned),
          goodsFetched,
          goodsMetadata,
          indexInFetched,
          goodsInViewport,
          lastQueryKeywords: action.args.query,
        });
        if (typeof action.args.query === 'string') {
          localStorage.setItem('v1.last_query_keywords', action.args.query);
        }
        break;
    }
    return newState;
  }
}

module.exports.default = new Store(dispatcher);
