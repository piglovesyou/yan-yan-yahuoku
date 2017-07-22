const dispatcher = require('../client/dispatcher/index').default;
const {ReduceStore} = require('flux/utils');
const justOnceStateInjector = require('./just-once-state-injector');
// const {asArray} = require('../utils/object');
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
        const {
          goodsFetched,
          goodsMetadata,
          indexInFetched,
          goodsInViewport
        } = action;
        const query = action.args ? action.args.query : state.lastQueryKeywords;
        const currentFetchedPage = Math.ceil(goodsMetadata.firstResultPosition / goodsMetadata.totalResultsReturned);
        newState = Object.assign({}, state, {
          currentFetchedPage,
          goodsFetched,
          goodsMetadata,
          indexInFetched,
          goodsInViewport,
          lastQueryKeywords: query,

          // Experiment
          pageFetchedForward: currentFetchedPage,
          itemsFetchedForward: goodsFetched,
          indexInFetchedForward: indexInFetched,
          metaFetchedForward: goodsMetadata,
          pageFetchedBackward: currentFetchedPage,
          itemsFetchedBackward: goodsFetched,
          indexInFetchedBackward: indexInFetched,
          metaFetchedBackward: goodsMetadata,
        });
        if (typeof query === 'string') {
          localStorage.setItem('v1.last_query_keywords', query);
        }
        break;
    }
    return newState;
  }
}

module.exports.default = new Store(dispatcher);
