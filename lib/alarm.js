"use strict";

const debug = require('debug')('alarm');

class Alarm {
  constructor(options) {
    options = options || {};
    this.id = Alarm.id++;
    this.price = options.price;
    this.notify = options.notify || debug;
    this.type = options.type || 'UP';
    this.triggered = false;
  }
  check(last_price) {
    debug("check(last_price=%d) this.price=%d, this.type='%s', this.triggered=%s", last_price, this.price, this.type, this.triggered ? 'true' : 'false');
    if (this.triggered) {
      return false;
    }
    let condition = false;
    if (this.type === 'UP') {
      condition = last_price >= this.price;
      if (condition) { debug("... TRIGGERED last_price >= this.price"); }
    } else {
      if (this.type === 'DOWN') {
        condition = last_price <= this.price;
        if (condition) { debug("... TRIGGERED last_price <= this.price"); }
      }
    }
    if (condition) {
      this.triggered = true;
      this.dispatch(last_price);
    }
    return condition;
  }
  triggered() {
    return this.triggered;
  }
  dispatch(last_price) {
    if (this.notify) {
      const msg = 'ALARM triggered '+this.type+' '+this.price+' ('+last_price+')'
      debug("dispatch(last_price=%d) dispatching message '%s'", last_price, msg);
      this.notify(msg);
    }
  }
}
Alarm.id = 0;

module.exports = Alarm;
