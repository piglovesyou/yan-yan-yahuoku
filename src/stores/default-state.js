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
  pageFetchedForward: 1,
  itemsFetchedForward: [],
  indexInFetchedForward: 0,
  metaFetchedForward: {
    firstResultPosition: null,
    totalResultsAvailable: null,
    totalResultsReturned: null
  },
  pageFetchedBackward: 1,
  itemsFetchedBackward: [],
  indexInFetchedBackward: 0,
  metaFetchedBackward: {
    firstResultPosition: null,
    totalResultsAvailable: null,
    totalResultsReturned: null
  },


  selectedAuctionItem: null,

  // lastCategoryId: null,
  // lastQueryKeywords: '',
};
