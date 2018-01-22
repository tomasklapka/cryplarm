"use strict";

const debug = require('debug')('alarms');

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
    if (this.triggered) {
      return false;
    }
    let condition = false;
    if (this.type === 'UP') {
      condition = last_price >= this.price;
    } else {
      if (this.type === 'DOWN') {
        condition = last_price <= this.price;
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
      this.notify(msg);
    }
  }
}
Alarm.id = 0;

module.exports = Alarm;
