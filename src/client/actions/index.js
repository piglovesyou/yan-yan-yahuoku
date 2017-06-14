const {dispatch} = require('../dispatcher');
// const request = require('util').promisify(require('request'));

module.exports = {
  baam() {
    dispatch({type: 'baam'});
  },
  async selectSearchCategory(categoryId) {
    const res = await fetch(`/api/categoryTree?category=${categoryId}`);
    const jsonString = await res.json();
    const json = JSON.parse(jsonString);
    dispatch({
      type: 'update_category',
      data: json['ResultSet']['Result']
    });
  }
};
