"use strict";

const express = require('express'),
    join = require('path').join,
    favicon = require('serve-favicon'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    pug = require('pug'),
    fs = require('fs'),
    { URL } = require('url');

const debug = require('debug')('web');

const Alarm = require('./alarm');

class Web {
  constructor(options) {
    options = options || {};
    this.ticker = options.ticker;
    this.notify = options.notify;
    this.persist = options.persist || './alarms.json';
    this.app = options.express || express();
    this.logger = options.logger || morgan('dev');
    this.port = options.port || 3042;
    this.viewDir = options.viewDir || join(__dirname, '/../views');
    this.viewEngine = options.viewEngine || 'pug';
    this.staticDir = options.staticDir || join(__dirname, '/../public');
    this.expressEnables = options.expressEnables || [ 'trust proxy' ];
    this.expressMiddlewares = options.expressMiddlewares || [ cors_enable ];

    this.loadAlarms();

    this.app.set('json spaces', 2);
    this.app.set('port', this.port);
    this.app.set('views', this.viewDir);
    this.app.set('view engine', this.viewEngine, 'pug');
    for (let i = 0; i < this.expressEnables.length; i++) {
      this.app.enable(this.expressEnables[i]);
    }
    this.app.use(favicon(join(this.staticDir, '/favicon.ico')));
    this.app.use(express.static(this.staticDir));
    this.app.use(this.logger);
    this.app.use(bodyParser.json());

    for (let i = 0; i < this.expressMiddlewares.length; i++) {
      this.app.use(this.expressMiddlewares[i]);
    }

    this.app.get('/add', (req, res) => {
      debug('action add');
      let alarmType = this.ticker.last_price < req.query.price ? 'UP' : 'DOWN';
      const alarm = new Alarm({
        type: alarmType,
        price: req.query.price,
        notify: this.notify
      });
      this.ticker.hook((last_price) => {
        alarm.check(last_price);
      });
      this.alarms.push(alarm);
      this.alarms.sort(sort_alarms);
      this.saveAlarms();
      return res.redirect('/');
    });

    this.app.get('/remove/:id', (req, res) => {
      debug('action remove: "%s"', req.params.id);
      for (let i = 0; i < this.alarms.length; i++) {
        debug(i);
        const a = this.alarms[i];
        debug(a.id);
        if (a.id === +req.params.id) {
          debug('splice');
          this.alarms.splice(i, 1);
          this.saveAlarms();
        }
      }
      return res.redirect('/');
    });

    this.app.get('/', (req, res) => {
      debug('action /');
      this.updateOffers();
      res.render('alarms', {
        ticker: this.ticker,
        alarms: this.alarms,
        offers: this.offers
      })
    });

    this.template = {};
    this.template.alarms_list_up = pug.compileFile(join(this.viewDir, 'alarms_list_up.pug'));
    this.template.alarms_list_down = pug.compileFile(join(this.viewDir, 'alarms_list_down.pug'));
    this.app.get('/ticker', (req, res) => {
      this.updateOffers();
      res.json({
        "last_price": this.ticker.last_price,
        "alarms_list_up": this.template.alarms_list_up({
          alarms: this.alarms,
          ticker: this.ticker
        }),
        "alarms_list_down": this.template.alarms_list_down({
          alarms: this.alarms,
          ticker: this.ticker
        }),
        "offers": this.offers
      });
    })
  }

  updateOffers() {
    if (!this.ticker.last_price > 0) {
      this.offers = [];
    }
    const p = this.ticker.last_price / 100;
    const lower = Math.floor(p) * 100;
    const upper = Math.ceil(p) * 100;
    const kp = this.ticker.last_price / 1000;
    const klower = Math.floor(kp) * 1000;
    const kupper = Math.ceil(kp) * 1000;
    this.offers = [ upper, upper+100, upper+200, kupper, kupper+1000, kupper+2000, '|', lower, lower-100, lower-200, klower, klower-1000, klower-2000 ];
  }

  listen() {
    this.app.listen(this.port, () => {
      debug('listening on "%d"', this.port);
      console.log('Cryplarm listening on port ' + this.port);
    });
  }

  loadAlarms(done) {
    fs.readFile(this.persist, (err, data) => {
      this.alarms = [];
      if (err) {
        ;
      } else {
        const alarms = JSON.parse(data);
        for (let i = 0; i < alarms.length; i++) {
          alarms[i].notify = this.notify;
          const alarm = new Alarm(alarms[i]);
          this.ticker.hook((last_price) => {
            alarm.check(last_price);
          });
          this.alarms.push(alarm);
        }
        this.alarms.sort(sort_alarms);
      }
      if (done) {
        done();
      }
    })
  }

  saveAlarms() {
    fs.writeFile(this.persist, JSON.stringify(this.alarms));
  }
}

module.exports = Web;

function sort_alarms(a, b) {
  return b.price - a.price;
}

function cors_enable(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}
