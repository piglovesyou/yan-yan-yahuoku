const assert = require('assert');
// const appToken = new Buffer(`${process.env.YAN_YAN_YAHUOKU_CONSUMER_KEY}:${process.env.YAN_YAN_YAHUOKU_CONSUMER_SECRET}`).toString();
const util = require('util');
const request = util.promisify(require('request'));

module.exports.default = async function proxyApiRequest(req, res) {
  const {body} = await request({
    uri: 'https://auctions.yahooapis.jp/AuctionWebService/V2/openWatchList',
    qs: {start: 1, output: 'json', callback: '_'},
    method: 'GET',
    headers: {Authorization: 'Bearer ' + req.user.access_token}
  });
  const jsonString = convertJSONPToJSON(body);
  // TODO: Handle error without parsing JSON
  // const result = convertJSONPtoObject(body);
  // if (result['Error']) {
  //   if (isTokenExpired(result)) {
  //     const x = request({
  //       uri: 'https://auth.login.yahoo.co.jp/yconnect/v1/token',
  //       method: 'POST',
  //       headers: {Authorization: `Basic ${appToken}`},
  //       form: {
  //         grant_type: 'refresh_token',
  //         refresh_token: req.user.refresh_token,
  //       }
  //     });
  //   }
  // }
  res.json(jsonString);
};

function isTokenExpired(result) {
  return result['Error'] &&
      result['Error']['Message'] === 'Please provide valid credentials. Bearer realm="yahooapis.jp", error="invalid_token", error_description="expired token"' || false;
}
assert.deepEqual(isTokenExpired({Error: {Message: 'Please provide valid credentials. Bearer realm="yahooapis.jp", error="invalid_token", error_description="expired token"'}}), true);
assert.deepEqual(isTokenExpired({}), false);

function convertJSONPToJSON(jsonp) {
  return jsonp.slice(jsonp.indexOf('(') + 1, jsonp.lastIndexOf(')'));
}
function convertJSONPtoObject(jsonp) {
  return JSON.parse(convertJSONPToJSON(jsonp));
}
assert.deepEqual(convertJSONPtoObject('xxx({"blaa":"blaa"})'), {blaa: 'blaa'});
