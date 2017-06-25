const {dispatch} = require('../dispatcher');
const qs = require('querystring');
const store = require('../stores/application').default;

module.exports.selectSearchCategory = selectSearchCategory;
module.exports.executeQueryWithKeywords = executeQueryWithKeywords;

async function selectSearchCategory(categoryId) {
  const json = await requestAPI('categoryTree', {
    category: categoryId
  });
  dispatch({
    type: 'update_category',
    json,
    args: {categoryId},
  });
  executeQueryWithKeywords(store.getState().lastQueryKeywords)
}

async function executeQueryWithKeywords(keywords = '') {
  const category = store.getState().lastCategoryId;
  const query = keywords.trim();
  const json = query
      ? await requestAPI('search', {category, query,})
      : await requestAPI('categoryLeaf', {category});
  dispatch({
    type: 'update_goods',
    json,
    args: {query}
  });
}

async function requestAPI(endpoint, query) {
  const url = `/api/${endpoint}?${qs.stringify(query)}`;
  const res = await fetch(url);
  return await res.json();
}
