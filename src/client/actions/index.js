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
  const s = store.getState();
  const query = keywords.trim();
  const json = await requestGoods(query);
  const {goodsFetched, goodsMetadata} = getGoodsFromJSON(json);
  const indexInFetched = 0;
  const goodsInViewport = goodsFetched.slice(indexInFetched, indexInFetched + s.goodsCountInViewport);
  dispatch({
    type: 'update_goods',
    goodsFetched,
    goodsMetadata,
    indexInFetched,
    goodsInViewport,
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

  const availableInFetched = to <= s.goodsFetched.length;
  if (availableInFetched) {
    const goodsInViewport = s.goodsFetched.slice(s.indexInFetched, s.indexInFetched + s.goodsCountInViewport);
    dispatch({
      type: 'update_goods',
      goodsFetched: s.goodsFetched,
      goodsMetadata: s.goodsMetadata,
      indexInFetched: from,
      goodsInViewport,
    });
    return;
  }

  const availableByFetching = m.firstResultPosition - 1 + s.goodsCountInViewport <= m.totalResultsAvailable;
  if (availableByFetching) {
    const nextPage = s.currentFetchedPage + 1;
    const json = await requestGoods(s.lastQueryKeywords, nextPage);
    const {goodsFetched, goodsMetadata} = getGoodsFromJSON(json);
    const goodsInViewport = s.goodsFetched.concat(goodsFetched).slice(from, to);
    dispatch({
      type: 'update_goods',
      goodsFetched,
      goodsMetadata,
      indexInFetched: from % s.goodsCountInViewport,
      goodsInViewport,
    });
    return;
  }

  // TODO: fetch the last few
}

function getGoodsFromJSON(json) {
  const goodsFetched = asArray(json.ResultSet && json.ResultSet.Result.Item);
  const goodsMetadata = getGoodsMetadata(json);
  return {goodsFetched, goodsMetadata};

  function getGoodsMetadata(json) {
    const raw = json.ResultSet['@attributes'];
    return Object.keys(raw).reduce((rv, k) => {
      return Object.assign(rv, {
        [k]: Number(raw[k])
      });
    }, {});
  }
}

