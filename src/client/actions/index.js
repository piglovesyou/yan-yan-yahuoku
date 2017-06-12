const {dispatch} = require('../dispatcher');

module.exports = {
  baam() {
    dispatch({ type: 'baam' });
  }
};
