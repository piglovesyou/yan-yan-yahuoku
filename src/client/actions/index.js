const {dispatch} = require('../dispatcher');
const qs = require('querystring');
const store = require('../../stores/application').default;
const {asArray} = require('../../utils/object');

module.exports.selectSearchCategory = selectSearchCategory;
module.exports.executeQueryWithKeywords = executeQueryWithKeywords;
module.exports.goToNextGoods = goToNextGoods;

async function selectSearchCategory(categoryId) {
  const json = await requestAPI('categoryTree', {
    category: categoryId
  });
  dispatch({
    type: 'update_category',
    category: json.ResultSet.Result,
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
  const goodsFetched = asArray(json.ResultSet && json.ResultSet.Result.Item);
  const goodsMetadata = getGoodsMetadata(json);
  dispatch({
    type: 'update_goods',
    goodsFetched,
    goodsMetadata,
    indexInFetched: 0,
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
  const m = s.goodsMetadata;

  const from = s.indexInFetched + s.goodsCountInViewport;
  const to = from + s.goodsCountInViewport;

  const isCacheAvailable = from <= s.goodsFetched.length;
  if (isCacheAvailable) {
    dispatch({
      type: 'update_goods',
      goodsFetched: s.goodsFetched,
      goodsMetadata: s.goodsMetadata,
      indexInFetched: from,
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
  //   const nextPage = s.currentFetchedPage + 1;
  //   const json = await requestGoods(s.lastQueryKeywords, nextPage);
  //   const nextGoodsInViewport = s.goodsFetched.slice(from, to);
  //   // TODO: dispatch
  //   return;
  // }
  //

}

function getGoodsMetadata(json) {
  const raw = json.ResultSet['@attributes'];
  return Object.keys(raw).reduce((rv, k) => {
    return Object.assign(rv, {
      [k]: Number(raw[k])
    });
  }, {});
}

