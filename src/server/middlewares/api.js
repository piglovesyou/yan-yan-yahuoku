const assert = require('assert');
const appToken = new Buffer(
    `${process.env.YAN_YAN_YAHUOKU_CONSUMER_KEY}:${process.env.YAN_YAN_YAHUOKU_CONSUMER_SECRET}`).toString('base64');
const util = require('util');
const request = util.promisify(require('request'));
const {asArray} = require('../../utils/object');

const express = require('express');
const router = express.Router();

// Requires appid, let's cache returned values!
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

// Requires access_token that everytime we ouhgt to evaluate values
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

const requestAuctionAPIWithAppToken = (() => {
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

  return require('../eval-cacher').wrapAsyncFn(requestAuctionAPIWithAppToken);
})();

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

async function requestAuctionItem(auctionID) {
  const {body} = await requestAuctionAPIWithAppToken(endpointsOnAppToken['auctionItem'],
      {auctionID});
  const detailJson = JSON.parse(convertJSONPToJSON(body));
  return detailJson.ResultSet ? detailJson.ResultSet.Result : {};
}

async function requestAuctionAPI(endpoint, params, access_token) {
  const {body} = endpointsOnAppToken[endpoint] ? await requestAuctionAPIWithAppToken(endpointsOnAppToken[endpoint], params)
      : endpointsOnAccessToken[endpoint] ? await requestAuctionAPIWithAccessToken(endpointsOnAccessToken[endpoint], params, access_token)
          : {};
  if (!body) {
    return;
  }
  const jsonString = convertJSONPToJSON(body);
  if (endpoint === 'search' || endpoint === 'categoryLeaf') {
    const json = JSON.parse(jsonString);
    if (!json.ResultSet) {
      return JSON.stringify(json);
    }
    const items = asArray(json.ResultSet.Result.Item);
    const details = await Promise.all(items.map(i => i.AuctionID).map(requestAuctionAPI));
    json.ResultSet.Result.Item = items.map((item, index) => {
      return Object.assign({}, item, {
        Img: details[index] ? details[index].Img : []
      });
    });
    return JSON.stringify(json);
  }
  return jsonString;
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

router.get('/:endpoint', async function proxyApiRequest(req, res, next) {
  const jsonString = await requestAuctionAPI(req.params.endpoint, req.query, req.user && req.user.access_token);

  if (jsonString.startsWith(errorJSONPrefix)) {
    if (jsonString === tokenExpiredErrorJSON) {
      const access_token = await requestNewAccessToken(req);
      if (access_token) {
        Object.assign(req.user, {access_token}); // TODO: Save it to session storage too
        return proxyApiRequest(req, res, next);
      }
    }
    res.status(500); // TODO: Replace to yahoo response code
  }
  if (jsonString) {
    res.header('Content-Type', 'application/json; charset=utf-8');
    return res.send(jsonString);
  }
  next();
});

module.exports = {
  'default': router,
  requestAuctionItem,
};

function convertJSONPToJSON(jsonp) {
  return jsonp.slice(jsonp.indexOf('(') + 1, jsonp.lastIndexOf(')'));
}
assert.deepEqual(convertJSONPToJSON('xxx({"blaa":"blaa"})'), '{"blaa":"blaa"}');
