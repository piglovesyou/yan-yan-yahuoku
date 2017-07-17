const {dispatch} = require('../dispatcher');
const qs = require('querystring');
const store = require('../../stores/application').default;
const {asArray} = require('../../utils/object');

module.exports.selectSearchCategory = selectSearchCategory;
module.exports.executeQueryWithKeywords = executeQueryWithKeywords;
module.exports.goToNextGoods = goToNextGoods;
module.exports.selectAuctionItem = selectAuctionItem;

async function selectAuctionItem(auctionItem) {
  dispatch({
    type: 'select-auction-item',
    selectedAuctionItem: auctionItem,
  });
  // TODO
  // history.push('/items/' + auctionItem.AuctionID);
}

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

async function goToNextGoods(next = true) {
  const s = store.getState();
  const m = s.goodsMetadata;

  const from = next
      ? s.indexInFetched + s.goodsCountInViewport
      : s.indexInFetched - s.goodsCountInViewport;
  const to = from + s.goodsCountInViewport;

  const availableInFetched = next
      ? to <= s.goodsFetched.length
      : from >= 0;
  if (availableInFetched) {
    const goodsInViewport = s.goodsFetched.slice(from, to);
    dispatch({
      type: 'update_goods',
      goodsFetched: s.goodsFetched,
      goodsMetadata: s.goodsMetadata,
      indexInFetched: from,
      goodsInViewport,
    });
    return;
  }

  const availableByFetching = next
      ? m.firstResultPosition - 1 + s.goodsCountInViewport <= m.totalResultsAvailable
      : s.currentFetchedPage > 1;
  if (availableByFetching) {
    const nextPage = next
        ? s.currentFetchedPage + 1
        : s.currentFetchedPage - 1;

    const json = await requestGoods(s.lastQueryKeywords, nextPage);
    const {goodsFetched, goodsMetadata} = getGoodsFromJSON(json);
    const goodsInViewport = next
        ? s.goodsFetched.concat(goodsFetched).slice(from, to)
        : goodsFetched.concat(s.goodsFetched).slice(from + goodsFetched.length, to + goodsFetched.length);
    dispatch({
      type: 'update_goods',
      goodsFetched,
      goodsMetadata,
      indexInFetched: next
          ? to % s.goodsCountInViewport
          : from + goodsFetched.length,
      goodsInViewport,
    });
    // return;
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

