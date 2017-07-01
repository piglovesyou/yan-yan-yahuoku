const {dispatch} = require('../dispatcher');
const qs = require('querystring');
const store = require('../../stores/application').default;

module.exports.selectSearchCategory = selectSearchCategory;
module.exports.executeQueryWithKeywords = executeQueryWithKeywords;

async function selectSearchCategory(categoryId) {
  const json = await requestAPI('categoryTree', {
    category: categoryId
  });
  dispatch({
    type: 'update_category',
    json,
    args: {categoryId},
  });
  executeQueryWithKeywords(store.getState().lastQueryKeywords);
}

async function requestGoods(query, page = 1) {
  const category = store.getState().lastCategoryId;
  // TODO: if empty query width categoryId=0, stop requesting because it causes 400
  return query
      ? await requestAPI('search', {category, query, page})
      : await requestAPI('categoryLeaf', {category, page});
}

async function executeQueryWithKeywords(keywords = '') {
  const query = keywords.trim();
  const json = await requestGoods(query);
  dispatch({
    type: 'update_goods',
    json,
    args: {query}
  });
}

async function requestAPI(endpoint, query) {
  const url = `/api/${endpoint}?${qs.stringify(query)}`;
  const res = await fetch(url);
  return await res.json();
}

async function goToNextGoods() {
  const s = store.getState();
  const m = s.currentGoodsMetadata;

  const from = s.indexInCurrentPage + s.goodsCountInViewport;
  const to = from + s.goodsCountInViewport;

  const isCacheAvailable = s.indexInCurrentPage + s.goodsCountInViewport <= s.goodsFetched.length;
  if (isCacheAvailable) {
    dispatch({
    })
  }

  // const isEnding = m.firstResultPosition + m.totalResultsReturned > m.totalResultsAvailable;
  // if (isEnding) {
  //   const nextGoodsInViewport = s.goodsFetched.slice(from, to);
  //   const nextIndexInCurrentPage = to;
  //   // TODO: dispatch
  //   return;
  // }
  //
  // const toAcrossPage = m.firstResultPosition - 1 + s.goodsCountInViewport > m.totalResultsReturned;
  // if (toAcrossPage) {
  //   const nextPage = s.currentPage + 1;
  //   const json = await requestGoods(s.lastQueryKeywords, nextPage);
  //   const nextGoodsInViewport = s.goodsFetched.slice(from, to);
  //   // TODO: dispatch
  //   return;
  // }
  //

}
