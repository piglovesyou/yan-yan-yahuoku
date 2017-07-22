module.exports.default = {
  title: 'YYY',
  category: null,

  displayName: null,

  goodsCountInViewport: 4,
  goodsInViewport: [], // To render
  indexInFetched: 0,

  // page of auction api (20 per page), not of viewport
  currentFetchedPage: 1,
  goodsFetched: [],
  goodsMetadata: {
    firstResultPosition: null,
    totalResultsAvailable: null,
    totalResultsReturned: null
  },


  // Experiment
  pageOfFirstItem: 1,
  itemsOfFirstItem: [],
  indexOfFirstItem: 0,
  metaOfFirstItem: {
    firstResultPosition: null,
    totalResultsAvailable: null,
    totalResultsReturned: null
  },
  pageOfLastItem: 1,
  itemsOfLastItem: [],
  indexOfLastItem: 0,
  metaOfLastItem: {
    firstResultPosition: null,
    totalResultsAvailable: null,
    totalResultsReturned: null
  },


  selectedAuctionItem: null,

  // lastCategoryId: null,
  // lastQueryKeywords: '',
};
