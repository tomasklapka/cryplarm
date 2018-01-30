"use strict";

const debug = require('debug')('ticker');
const request = require('request');

class Ticker {
  constructor(options) {
    options = options || {};
    this.url = options.url || 'https://api.bitfinex.com/v2/ticker/tBTCUSD';
    this.last_price = 0;
    this.hooks = [];
  }
  tick() {
    // debug('tick');
    request(this.url, (err, res, body) => {
      if (!err) {
        let js;
        try {
          js = JSON.parse(body);
          this.last_price = Math.round(js[6], 2);
          this.hooks.forEach((cb) => {
            cb(this.last_price);
          })
        } catch(err) {
          debug(err);
        }
      } else {
        debug(err);
      }
    })
  }
  hook(cb) {
    this.hooks.push(cb);
  }
}

module.exports = Ticker;
