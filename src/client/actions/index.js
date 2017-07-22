const {dispatch} = require('../dispatcher');
const qs = require('querystring');
const store = require('../../stores/application').default;
const {asArray} = require('../../utils/object');
const COUNT_PER_PAGE = 20; // Auction API rule

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
  executeQueryWithKeywords();
}

async function requestGoods(category, query, page) {
  // TODO: if empty query width categoryId=0, stop requesting because it causes 400
  return query
      ? await requestAPI('search', {category, query, page})
      : await requestAPI('categoryLeaf', {category, page});
}

async function executeQueryWithKeywords(keywords = store.getState().lastQueryKeywords,
                                        category = store.getState().lastCategoryId) {
  const s = store.getState();
  const query = keywords.trim();
  const json = await requestGoods(category, query, 1);
  const {goodsFetched, goodsMetadata} = getGoodsFromJSON(json);
  const indexInFetched = 0;
  const goodsInViewport = goodsFetched.slice(indexInFetched, indexInFetched + s.goodsCountInViewport);
  dispatch({
    type: 'load_first_page',
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

async function goToNextGoods(isForward = true) {
  const s = store.getState();
  // const m = s.goodsMetadata;

  const {
    collected,
    pageOfFirstItem,
    itemsOfFirstItem,
    metaOfFirstItem,
    indexOfFirstItem,
    pageOfLastItem,
    itemsOfLastItem,
    metaOfLastItem,
    indexOfLastItem,
  } = await collectAuctionItems({
        collected: undefined,
        pageOfFirstItem: undefined,
        itemsOfFirstItem: undefined,
        metaOfFirstItem: undefined,
        indexOfFirstItem: undefined,
        pageOfLastItem: undefined,
        itemsOfLastItem: undefined,
        metaOfLastItem: undefined,
        indexOfLastItem: undefined,
      },
      isForward ? s.pageOfLastItem : s.pageOfFirstItem,
      isForward ? s.itemsOfLastItem : s.itemsOfFirstItem,
      isForward ? s.metaOfLastItem : s.metaOfFirstItem,
      isForward ? s.indexOfLastItem + 1 : s.indexOfFirstItem - 1, // Next index to try
      s.lastCategoryId, s.lastQueryKeywords, isForward,
      s.goodsCountInViewport, getLastPage(s.metaOfFirstItem));

  if (!collected) {
    return;
  }

  await Promise.all(collected.map(i => waitUntilImgPreloaded(i.Img.Image1)));

  if (isForward) {
    dispatch({
      type: 'update_goods_index',
      goodsInViewport: collected,
      pageOfFirstItem,
      itemsOfFirstItem,
      metaOfFirstItem,
      indexOfFirstItem,
      pageOfLastItem,
      itemsOfLastItem,
      metaOfLastItem,
      indexOfLastItem,
    });
  } else {
    collected.reverse();
    dispatch({
      type: 'update_goods_index',
      goodsInViewport: collected,
      pageOfFirstItem: pageOfLastItem,
      itemsOfFirstItem: itemsOfLastItem,
      metaOfFirstItem: metaOfLastItem,
      indexOfFirstItem: indexOfLastItem,
      pageOfLastItem: pageOfFirstItem,
      itemsOfLastItem: itemsOfFirstItem,
      metaOfLastItem: metaOfFirstItem,
      indexOfLastItem: indexOfFirstItem,
    });
  }

  // dispatch({
  //   type: 'update_goods_index',
  //
  //   pageOfFirstItem: currentFetchedPage,
  //   itemsOfFirstItem: goodsFetched,
  //   indexOfFirstItem: indexInFetched,
  //   metaOfFirstItem: goodsMetadata,
  //
  //   pageOfLastItem: currentFetchedPage,
  //   itemsOfLastItem: goodsFetched,
  //   indexOfLastItem: indexInFetched,
  //   metaOfLastItem: goodsMetadata,
  // })


  // const from = isForward
  //     ? s.indexInFetched + s.goodsCountInViewport
  //     : s.indexInFetched - s.goodsCountInViewport;
  // const to = from + s.goodsCountInViewport;
  //
  // const availableInFetched = isForward
  //     ? to <= s.goodsFetched.length
  //     : from >= 0;
  // if (availableInFetched) {
  //   const goodsInViewport = s.goodsFetched.slice(from, to);
  //   await Promise.all(goodsInViewport.map(i => waitUntilImgPreloaded(i.Img.Image1)));
  //   dispatch({
  //     type: 'load_first_page',
  //     goodsFetched: s.goodsFetched,
  //     goodsMetadata: s.goodsMetadata,
  //     indexInFetched: from,
  //     goodsInViewport,
  //   });
  //   return;
  // }
  //
  // const availableByFetching = isForward
  //     ? m.firstResultPosition - 1 + s.goodsCountInViewport <= m.totalResultsAvailable
  //     : s.currentFetchedPage > 1;
  // if (availableByFetching) {
  //   const nextPage = isForward
  //       ? s.currentFetchedPage + 1
  //       : s.currentFetchedPage - 1;
  //
  //   const json = await requestGoods(s.lastCategoryId, s.lastQueryKeywords, nextPage);
  //   const {goodsFetched, goodsMetadata} = getGoodsFromJSON(json);
  //   const goodsInViewport = isForward
  //       ? s.goodsFetched.concat(goodsFetched).slice(from, to)
  //       : goodsFetched.concat(s.goodsFetched).slice(from + goodsFetched.length, to + goodsFetched.length);
  //   await Promise.all(goodsInViewport.map(i => waitUntilImgPreloaded(i.Img.Image1)));
  //   dispatch({
  //     type: 'update_goods',
  //     goodsFetched,
  //     goodsMetadata,
  //     indexInFetched: isForward
  //         ? to % s.goodsCountInViewport
  //         : from + goodsFetched.length,
  //     goodsInViewport,
  //   });
  //   // return;
  // }
  //
  // // TODO: fetch the last few
}

async function collectAuctionItems(accumulator,
                                   pageOfItem, itemsOfItem, goodsMetadata, indexOfItem,
                                   category, query, isForward,
                                   goodsCountInViewport, lastPage) {
  let {
    collected,
    pageOfFirstItem,
    itemsOfFirstItem,
    metaOfFirstItem,
    indexOfFirstItem,
    pageOfLastItem,
    itemsOfLastItem,
    metaOfLastItem,
    indexOfLastItem,
  } = accumulator;

  const gotEnough = collected && collected.length >= goodsCountInViewport;
  const reachedToEdge = !gotEnough && (
      (!isForward && pageOfItem < 1) ||
      (isForward && lastPage <= pageOfItem && !itemsOfItem[indexOfItem]));

  if (gotEnough || reachedToEdge) return accumulator;

  const existsInFetched = !!itemsOfItem[indexOfItem];
  if (existsInFetched) {
    if (!collected) {
      collected = [];
      pageOfFirstItem = pageOfItem;
      itemsOfFirstItem = itemsOfItem;
      metaOfFirstItem = goodsMetadata;
      indexOfFirstItem = indexOfItem;
    }

    // Update everytime to catch the last page and index
    pageOfLastItem = pageOfItem;
    itemsOfLastItem = itemsOfItem;
    metaOfLastItem = goodsMetadata;
    indexOfLastItem = indexOfItem;

    collected.push(itemsOfItem[indexOfItem]);
    return collectAuctionItems(
        {
          collected,
          pageOfFirstItem,
          itemsOfFirstItem,
          metaOfFirstItem,
          indexOfFirstItem,
          pageOfLastItem,
          itemsOfLastItem,
          metaOfLastItem,
          indexOfLastItem,
        },
        pageOfItem, itemsOfItem, goodsMetadata, indexOfItem + (isForward ? 1 : -1),
        category, query, isForward,
        goodsCountInViewport, lastPage);

  } else {
    // Flip page

    indexOfItem = isForward ? 0 : COUNT_PER_PAGE - 1;

    pageOfItem = pageOfItem + (isForward ? 1 : -1);
    if (pageOfItem <= 0) {
      // Auction API returns the same items with page "1" and "0".
      // We don't want results of page "0" so we'll finish it.
      return undefined;
    }

    const json = await requestGoods(category, query, pageOfItem);
    const {goodsFetched, goodsMetadata} = getGoodsFromJSON(json);

    return collectAuctionItems(
        {
          collected,
          pageOfFirstItem,
          itemsOfFirstItem,
          metaOfFirstItem,
          indexOfFirstItem,
          pageOfLastItem,
          itemsOfLastItem,
          metaOfLastItem,
          indexOfLastItem,
        },
        pageOfItem, goodsFetched, goodsMetadata, indexOfItem,
        category, query, isForward,
        goodsCountInViewport, lastPage);
  }
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

function getLastPage(m) {
  return Math.ceil(m.totalResultsAvailable / COUNT_PER_PAGE);
}
