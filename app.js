"use strict";

const morgan = require('morgan');
const nodemailer = require('nodemailer');
const join = require('path').join;

const Ticker = require('./lib/ticker');
const Web = require('./lib/web');

const config = require('./config.json') || {};
config.tickerInterval = config.tickerInterval || 5000;

const ticker = new Ticker({
  url: config.ticker
});

const transporter = nodemailer.createTransport(config.transporter);
transporter.verify(function(error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log('SMTP transporter ready');
  }
});

function notify(msg) {
  console.log(msg);
  const options = config.mail;
  options.subject = msg;
  options.text = msg;
  transporter.sendMail(options, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Message sent: '+info.response);
    }
  })
}

const web = new Web({
  ticker: ticker,
  notify: notify,
  persist: join(__dirname, config.persist),
  logger: morgan(config.morgan),
  port: config.port,
});

web.listen();

if (config.tickerInterval > 0) {
  tick();
  setInterval(tick, config.tickerInterval);
}

function tick() {
  ticker.tick((last_price) => {
    web.last_price(last_price);
  });
}
