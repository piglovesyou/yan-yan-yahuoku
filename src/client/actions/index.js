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
    // TODO: if keywords empty, hit category result api
    const category = store.getState().lastCategoryId;
    const json = keywords
        ? await requestAPI('search', {category, query: keywords,})
        : await requestAPI('categoryLeaf', {category});
    dispatch({
      type: 'update_goods',
      json,
      args: {keywords}
    });
  }
};

