const dispatcher = require('../client/dispatcher/index').default;
const {ReduceStore} = require('flux/utils');
const justOnceStateInjector = require('./just-once-state-injector');
// const {asArray} = require('../utils/object');
const defaultState = require('./default-state').default;
const blacklist = require('blacklist');

// const {COUNT_PER_PAGE} = require('../utils/const');

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

      // case 'load_first_page':
      //   const {
      //     goodsFetched,
      //     totalResultsAvailable,
      //     goodsInViewport,
      //     isLeftEdge,
      //     isRightEdge,
      //   } = action;
      //   const query = action.args ? action.args.query : state.lastQueryKeywords;
      //   newState = Object.assign({}, state, {
      //     goodsInViewport,
      //     isLeftEdge,
      //     isRightEdge,
      //
      //     totalResultsAvailable,
      //     lastQueryKeywords: query,
      //
      //     // Experiment
      //     pageOfFirstItem: 1,
      //     itemsOfFirstItem: goodsFetched,
      //     indexOfFirstItem: 0,
      //     pageOfLastItem: 1,
      //     itemsOfLastItem: goodsFetched,
      //     indexOfLastItem: goodsInViewport.length - 1,
      //   });
      //   if (typeof query === 'string') {
      //     localStorage.setItem('v1.last_query_keywords', query);
      //   }
      //   break;

      case 'update_goods_index':
        const {lastCategoryId, lastQueryKeywords} = action;
        newState = Object.assign({}, state, blacklist(action, 'type'));
        if (lastCategoryId) {
          localStorage.setItem('v1.last_search_category_id', lastCategoryId);
        }
        if (lastQueryKeywords) {
          localStorage.setItem('v1.last_query_keywords', lastQueryKeywords);
        }
        break;
    }
    return newState;
  }
}

module.exports.default = new Store(dispatcher);
