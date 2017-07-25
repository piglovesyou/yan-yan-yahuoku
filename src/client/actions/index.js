const {dispatch} = require('../dispatcher');
const qs = require('querystring');
const store = require('../../stores/application').default;
const {asArray} = require('../../utils/object');
const {COUNT_PER_PAGE} = require('../../utils/const');

module.exports = {
  selectSearchCategory,
  loadFirstPage,
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
  loadFirstPage();
}

async function requestAuctionItems(category, query, page) {
  // TODO: if empty query width categoryId=0, stop requesting because it causes 400
  return query
      ? await requestAPI('search', {category, query, page})
      : await requestAPI('categoryLeaf', {category, page});
}

async function loadFirstPage(keywords = store.getState().lastQueryKeywords,
                             category = store.getState().lastCategoryId) {
  const s = store.getState();

  const {
    collected,
    pageOfFirstItem,
    itemsOfFirstItem,
    indexOfFirstItem,
    pageOfLastItem,
    itemsOfLastItem,
    indexOfLastItem,
    isRightEdge,
    totalResultsAvailable,
  } = await collectAuctionItems({
        collected: undefined,
        pageOfFirstItem: undefined,
        itemsOfFirstItem: undefined,
        indexOfFirstItem: undefined,
        pageOfLastItem: undefined,
        itemsOfLastItem: undefined,
        indexOfLastItem: undefined,
        isRightEdge: false,
        totalResultsAvailable: undefined,
      },
      0, [], 0,
      category, keywords, true,
      s.goodsCountInViewport, undefined);

  dispatch({
    type: 'update_goods_index',
    goodsInViewport: collected,
    pageOfFirstItem,
    itemsOfFirstItem,
    indexOfFirstItem,
    pageOfLastItem,
    itemsOfLastItem,
    indexOfLastItem,
    isLeftEdge: true,
    isRightEdge,
    totalResultsAvailable,
    lastCategoryId: category,
    lastQueryKeywords: keywords,
  });
}

async function goToNextGoods(isForward = true) {
  const s = store.getState();

  const {
    collected,
    pageOfFirstItem,
    itemsOfFirstItem,
    indexOfFirstItem,
    pageOfLastItem,
    itemsOfLastItem,
    indexOfLastItem,
    isLeftEdge,
    isRightEdge,
  } = await collectAuctionItems({
        collected: undefined,
        pageOfFirstItem: undefined,
        itemsOfFirstItem: undefined,
        indexOfFirstItem: undefined,
        pageOfLastItem: undefined,
        itemsOfLastItem: undefined,
        indexOfLastItem: undefined,
        isLeftEdge: false,
        isRightEdge: false,
      },
      isForward ? s.pageOfLastItem : s.pageOfFirstItem,
      isForward ? s.itemsOfLastItem : s.itemsOfFirstItem,
      isForward ? s.indexOfLastItem + 1 : s.indexOfFirstItem - 1, // Next index to try
      s.lastCategoryId, s.lastQueryKeywords, isForward,
      s.goodsCountInViewport, getLastPage(s.totalResultsAvailable));

  if (!collected) {
    return;
  }

  await Promise.all(collected.map(i => waitUntilImgPreloaded(i.Img && i.Img.Image1 || i.Image)));

  if (isForward) {
    dispatch({
      type: 'update_goods_index',
      goodsInViewport: collected,
      pageOfFirstItem,
      itemsOfFirstItem,
      indexOfFirstItem,
      pageOfLastItem,
      itemsOfLastItem,
      indexOfLastItem,
      isLeftEdge,
      isRightEdge,
    });
  } else {
    collected.reverse();
    dispatch({
      type: 'update_goods_index',
      goodsInViewport: collected,
      pageOfFirstItem: pageOfLastItem,
      itemsOfFirstItem: itemsOfLastItem,
      indexOfFirstItem: indexOfLastItem,
      pageOfLastItem: pageOfFirstItem,
      itemsOfLastItem: itemsOfFirstItem,
      indexOfLastItem: indexOfFirstItem,
      isLeftEdge,
      isRightEdge,
    });
  }
}

async function collectAuctionItems(accumulator,
                                   pageOfItem, itemsOfItem, indexOfItem,
                                   category, query, isForward,
                                   goodsCountInViewport, lastPage) {
  let {
    collected,
    pageOfFirstItem,
    itemsOfFirstItem,
    indexOfFirstItem,
    pageOfLastItem,
    itemsOfLastItem,
    indexOfLastItem,
    isLeftEdge,
    isRightEdge,
    totalResultsAvailable,
  } = accumulator;

  const gotEnough = collected && collected.length >= goodsCountInViewport;

  isLeftEdge = !isForward && pageOfItem <= 1 && indexOfItem < 0;
  isRightEdge = isForward &&lastPage && lastPage <= pageOfItem && !itemsOfItem[indexOfItem];

  if (gotEnough || isLeftEdge || isRightEdge) return {
    collected,
    pageOfFirstItem,
    itemsOfFirstItem,
    indexOfFirstItem,
    pageOfLastItem,
    itemsOfLastItem,
    indexOfLastItem,
    isLeftEdge,
    isRightEdge,
    totalResultsAvailable,
  };

  const existsInFetched = !!itemsOfItem[indexOfItem];
  if (existsInFetched) {
    if (!collected) {
      collected = [];
      pageOfFirstItem = pageOfItem;
      itemsOfFirstItem = itemsOfItem;
      indexOfFirstItem = indexOfItem;
    }

    // Update everytime to catch the last page and index
    pageOfLastItem = pageOfItem;
    itemsOfLastItem = itemsOfItem;
    indexOfLastItem = indexOfItem;

    collected.push(itemsOfItem[indexOfItem]);
    indexOfItem = indexOfItem + (isForward ? 1 : -1);

  } else {
    // Flip page

    indexOfItem = isForward ? 0 : COUNT_PER_PAGE - 1;

    pageOfItem = pageOfItem + (isForward ? 1 : -1);
    if (pageOfItem <= 0) {
      // Auction API returns the same items with page "1" and "0".
      // We don't want results of page "0" so we'll finish it.
      return {
        collected,
        pageOfFirstItem,
        itemsOfFirstItem,
        indexOfFirstItem,
        pageOfLastItem,
        itemsOfLastItem,
        indexOfLastItem,
        isLeftEdge,
        isRightEdge,
        totalResultsAvailable,
      };
    }

    const json = await requestAuctionItems(category, query, pageOfItem);
    const {goodsFetched, goodsMetadata} = getGoodsFromJSON(json);
    totalResultsAvailable = goodsMetadata.totalResultsAvailable;
    if (!lastPage) {
      // On loading the first page
      lastPage = getLastPage(totalResultsAvailable);
    }
    itemsOfItem = goodsFetched;
  }

  return collectAuctionItems({
        collected,
        pageOfFirstItem,
        itemsOfFirstItem,
        indexOfFirstItem,
        pageOfLastItem,
        itemsOfLastItem,
        indexOfLastItem,
        isLeftEdge,
        isRightEdge,
        totalResultsAvailable,
      },
      pageOfItem, itemsOfItem, indexOfItem,
      category, query, isForward,
      goodsCountInViewport, lastPage);
}


async function requestAPI(endpoint, query) {
  const url = `/api/${endpoint}?${qs.stringify(query)}`;
  const res = await fetch(url);
  return await res.json();
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

function getLastPage(totalResultsAvailable) {
  return Math.ceil(totalResultsAvailable / COUNT_PER_PAGE);
}
