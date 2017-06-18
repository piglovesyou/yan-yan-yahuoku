const assert = require('assert');
const appToken = new Buffer(
    `${process.env.YAN_YAN_YAHUOKU_CONSUMER_KEY}:${process.env.YAN_YAN_YAHUOKU_CONSUMER_SECRET}`).toString('base64');
const util = require('util');
const request = util.promisify(require('request'));

const express = require('express');
const router = express.Router();

// Requires appid
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

const errorJSONPrefix = ' {\n\"Error\" : ';
const tokenExpiredErrorJSON = ' {\n\"Error\" : {\n\"Message\" : \"Please provide valid credentials. Bearer realm=\\\"yahooapis.jp\\\", error=\\\"invalid_token\\\", error_description=\\\"expired token\\\"\"\n}\n} ';
async function requestNewAccessToken(req) {
  const {body} = await request({
    uri: 'https://auth.login.yahoo.co.jp/yconnect/v1/token',
    method: 'POST',
    headers: {Authorization: `Basic ${appToken}`},
    form: {
      grant_type: 'refresh_token',
      refresh_token: req.user.refresh_token,
    }
  });
  const {access_token} = JSON.parse(body);
  return access_token;
}

router.get('/*', async function proxyApiRequest(req, res, next) {
  const json = await requestAuctionAPI(req.path.slice('/'.length), req.query, req.user && req.user.access_token);

  if (json.startsWith(errorJSONPrefix)) {
    if (json === tokenExpiredErrorJSON) {
      const access_token = await requestNewAccessToken(req);
      if (access_token) {
        Object.assign(req.user, {access_token}); // TODO: Save it to session storage too
        return proxyApiRequest(req, res, next);
      }
    }
    res.status(500); // TODO: Replace to yahoo response code
  }
  if (json) return res.json(json);
  next();
});

module.exports.default = router;

function convertJSONPToJSON(jsonp) {
  return jsonp.slice(jsonp.indexOf('(') + 1, jsonp.lastIndexOf(')'));
}
assert.deepEqual(convertJSONPToJSON('xxx({"blaa":"blaa"})'), '{"blaa":"blaa"}');
