const {dispatch} = require('../dispatcher');
const qs = require('querystring');
const store = require('../../stores/application').default;
const {asArray} = require('../../utils/object');

module.exports = {
  selectSearchCategory,
  executeQueryWithKeywords,
  goToNextGoods,
  selectAuctionItem,
  goBackFromDetail,
};

function goBackFromDetail(history) {
  const {goodsInViewport} = store.getState();
  if (goodsInViewport.length) {
    history.goBack();
  } else {
    history.push('/');
  }
}

async function selectAuctionItem(i, history) {
  const auctionID = i.AuctionID;
  const detail = await requestAPI('auctionItem', {auctionID});
  dispatch({
    type: 'select-auction-item',
    selectedAuctionItem: detail.ResultSet.Result,
  });
  history.push('/items/' + auctionID);
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

async function requestGoods(category, query, page = 1) {
  // TODO: if empty query width categoryId=0, stop requesting because it causes 400
  return query
      ? await requestAPI('search', {category, query, page})
      : await requestAPI('categoryLeaf', {category, page});
}

async function executeQueryWithKeywords(keywords = '') {
  const s = store.getState();
  const query = keywords.trim();
  const json = await requestGoods(store.getState().lastCategoryId, query);
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
    await Promise.all(goodsInViewport.map(i => waitUntilImgPreloaded(i.Img.Image1)));
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

    const json = await requestGoods(s.lastCategoryId, s.lastQueryKeywords, nextPage);
    const {goodsFetched, goodsMetadata} = getGoodsFromJSON(json);
    const goodsInViewport = next
        ? s.goodsFetched.concat(goodsFetched).slice(from, to)
        : goodsFetched.concat(s.goodsFetched).slice(from + goodsFetched.length, to + goodsFetched.length);
    await Promise.all(goodsInViewport.map(i => waitUntilImgPreloaded(i.Img.Image1)));
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

async function collectAuctionItems({collected, pageOfFirstFound, indexOfFirstFound},
                                   {pageOfItem, indexOfItem},
                                   goodsFetched, isForward, goodsCountInViewport, lastPage) {
  const gotEnough = acc.length >= goodsCountInViewport;
  if (gotEnough) return {acc, pageOfItem, indexOfItem};

  const reachedToEnd = isForward && !goodsFetched[indexInFetched] && pageOfItem === lastPage;
  if (reachedToEnd) return {acc, pageOfItem, indexOfItem};

  const reachedToBeginning = !isForward && pageOfItem < 0;
  if (reachedToEnd) return {acc, pageOfItem, indexOfItem};

  const nextIndex = indexOfItem + (isForward ? 1 : -1);

  const needToFlipPage = nextIndex < 0 || goodsFetched.length < nextIndex + 1;
  if (needToFlipPage) {
    pageOfItem = pageOfItem + (isForward ? 1 : -1);
    indexOfItem = isForward ? 0 : goodsFetched.length - 1;
    return collectAuctionItems(
        {collected, pageOfFirstFound, indexOfFirstFound},
        {pageOfItem, indexOfItem},
        isForward, goodsFetched, goodsCountInViewport, lastPage);
  }

  if (goodsFetched[nextIndex]) {
    if (collected.length === 0) {
      pageOfFirstFound = pageOfItem;
      indexOfFirstFound = indexOfItem;
    }
    collected.push(goodsFetched[nextIndex]);
    return collectAuctionItems(
        {collected, pageOfFirstFound, indexOfFirstFound},
        {pageOfItem, indexOfItem: nextIndex},
        isForward, goodsFetched, goodsCountInViewport, lastPage);
  }

  throw new Error('ok I\'m dumb');
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

function waitUntilImgPreloaded(src) {
  let containerEl = document.getElementById('img-preloader');
  if (!containerEl) {
    containerEl = document.body.appendChild(document.createElement('div'));
    containerEl.id = 'img-preloader';
  }
  return new Promise((resolve, reject) => {
    const imgEl = document.createElement('img');
    imgEl.onload = () => {
      resolve();
      removeNode(imgEl);
    };
    imgEl.onerror = () => {
      reject();
      removeNode(imgEl);
    };
    imgEl.src = src;
    containerEl.appendChild(imgEl);
  });
}
function removeNode(el) {
  el.parentNode.removeChild(el);
}
