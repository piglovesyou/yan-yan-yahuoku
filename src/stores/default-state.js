module.exports.default = {
  title: 'yyy',
  category: null,

  displayName: null,

  goodsCountInViewport: 4,
  goodsInViewport: [], // To render
  indexInCurrentPage: 0,

  // page of auction api (20 per page), not of viewport
  currentPage: 1,
  goodsFetched: [],
  currentGoodsMetadata: {
    firstResultPosition: null,
    totalResultsAvailable: null,
    totalResultsReturned: null
  },
};
