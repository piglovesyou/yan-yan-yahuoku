const {dispatch} = require('../dispatcher');
const qs = require('querystring');
const store = require('../stores/application').default;

// const request = require('util').promisify(require('request'));

async function requestAPI(endpoint, query) {
  const url = `/api/${endpoint}?${qs.stringify(query)}`;
  const res = await fetch(url);
  const jsonString = await res.json();
  return JSON.parse(jsonString);
}
module.exports = {
  baam() {
    dispatch({type: 'baam'});
  },

  async selectSearchCategory(categoryId) {
    const json = await requestAPI('categoryTree', {
      category: categoryId
    });
    dispatch({
      type: 'update_category',
      json,
      args: {categoryId},
    });
  },

  async executeQueryWithKeywords(keywords) {
    const json = await requestAPI('search', {
      category: store.getState().lastCategoryId,
      query: keywords,
    });
    dispatch({ type: 'update_goods',
      json,
      args: {keywords}
    });

    // const i = json.ResultSet.Result.Item[0];
    // const json2 = await requestAPI('auctionItem', {
    //   auctionID: i.AuctionID
    // });
  }
};

