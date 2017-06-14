const assert = require('assert');
// const appToken = new
// Buffer(`${process.env.YAN_YAN_YAHUOKU_CONSUMER_KEY}:${process.env.YAN_YAN_YAHUOKU_CONSUMER_SECRET}`).toString();
const util = require('util');
const request = util.promisify(require('request'));

// Requires appToken
const endpointsOnAppToken = {
  categoryTree: 'https://auctions.yahooapis.jp/AuctionWebService/V2/categoryTree',
  categoryLeaf: 'https://auctions.yahooapis.jp/AuctionWebService/V2/categoryLeaf',
  sellingList: 'https://auctions.yahooapis.jp/AuctionWebService/V2/sellingList',
  search: 'https://auctions.yahooapis.jp/AuctionWebService/V2/search',
  auctionItem: 'https://auctions.yahooapis.jp/AuctionWebService/V2/auctionItem',
  BidHistory: 'https://auctions.yahooapis.jp/AuctionWebService/V1/BidHistory',
  BidHistoryDetail: 'https://auctions.yahooapis.jp/AuctionWebService/V1/BidHistoryDetail',
  ShowQandA: 'https://auctions.yahooapis.jp/AuctionWebService/V1/ShowQandA',
  ShowRating: 'https://auctions.yahooapis.jp/AuctionWebService/V1/ShowRating',
  saleCampaign: 'https://auctions.yahooapis.jp/AuctionWebService/V1/saleCampaign',
};

// Requires access_token
const endpointsOnAccessToken = {
  openWatchList: 'https://auctions.yahooapis.jp/AuctionWebService/V2/openWatchList',
  closeWatchList: 'https://auctions.yahooapis.jp/AuctionWebService/V2/closeWatchList',
  myBidList: 'https://auctions.yahooapis.jp/AuctionWebService/V2/myBidList',
  myWonList: 'https://auctions.yahooapis.jp/AuctionWebService/V2/myWonList',
  mySellingList: 'https://auctions.yahooapis.jp/AuctionWebService/V2/mySellingList',
  myCloseList: 'https://auctions.yahooapis.jp/AuctionWebService/V2/myCloseList',
  myWinnerList: 'https://auctions.yahooapis.jp/AuctionWebService/V1/myWinnerList',
  deleteMyWonList: 'https://auctions.yahooapis.jp/AuctionWebService/V1/deleteMyWonList',
  deleteMyCloseList: 'https://auctions.yahooapis.jp/AuctionWebService/V1/deleteMyCloseList',
  myOfferList: 'https://auctions.yahooapis.jp/AuctionWebService/V1/myOfferList',
  deleteMyOfferList: 'https://auctions.yahooapis.jp/AuctionWebService/V1/deleteMyOfferList',
  reminder: 'https://auctions.yahooapis.jp/AuctionWebService/V1/reminder',
  deleteReminder: 'https://auctions.yahooapis.jp/AuctionWebService/V1/deleteReminder',
  watchList: 'https://auctions.yahooapis.jp/AuctionWebService/V1/watchList',
  deleteWatchList: 'https://auctions.yahooapis.jp/AuctionWebServicee/V1/deleteWatchList',
};

const baseQueryParam = {
  output: 'json',
  callback: '_'
};
function requestAuctionAPIWithAppToken(uri, params) {
  return request({
    uri,
    qs: Object.assign(
        baseQueryParam,
        {appid: process.env.YAN_YAN_YAHUOKU_CONSUMER_KEY},
        params),
    method: 'GET',
  });
}
function requestAuctionAPIWithAccessToken(uri, params, access_token) {
  return request({
    uri,
    qs: Object.assign(
        baseQueryParam,
        {access_token},
        params),
    method: 'GET'
  });
}
async function requestAuctionAPI(endpoint, params, access_token) {
  const {body} = endpointsOnAppToken[endpoint] ? await requestAuctionAPIWithAppToken(endpointsOnAppToken[endpoint], params)
      : endpointsOnAccessToken[endpoint] ? await requestAuctionAPIWithAccessToken(endpointsOnAccessToken[endpoint], params, access_token)
          : {};
  if (!body) {
    return;
  }
  return convertJSONPToJSON(body);
}

module.exports.default = async function proxyApiRequest(req, res, next) {
  const json = await requestAuctionAPI(req.path.slice('/api/'.length), req.query, req.user.access_token);
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
  if (json) return res.json(json);
  next();
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
