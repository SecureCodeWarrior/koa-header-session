/**!
 * koa-generic-session - test/support/server.js
 * Copyright(c) 2013
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 */

'use strict';

/**
 * Module dependencies.
 */
var koa = require('koa');
var http = require('http');
var session = require('../../');
var Store = require('./store');

var app = koa();

app.name = 'koa-session-test';
app.outputErrors = true;
app.proxy = true; // to support `X-Forwarded-*` header

var store = new Store();
app.use(session({
  prefix: 'koss:test',
  path: '/session',
  ttl: 1000,
  store: store
}));

// will ignore repeat session
app.use(session({
  key: 'koss:test_sid',
  path: '/session'
}));

app.use(function *controllers() {
  switch (this.request.url) {
  case '/favicon.ico':
    this.staus = 404;
    break;
  case '/wrongpath':
    this.body = !this.session ? 'no session' : 'has session';
    break;
  case '/session/rewrite':
    this.session = {foo: 'bar'};
    this.body = this.session;
    break;
  case '/session/notuse':
    this.body = 'not touch session';
    break;
  case '/session/get':
    get(this);
    break;
  case '/session/nothing':
    nothing(this);
    break;
  case '/session/remove':
    remove(this);
    break;
  default:
    other(this);
  }
});

function nothing(ctx) {
  ctx.body = ctx.session.count;
}

function get(ctx) {
  ctx.session.count = ctx.session.count || 0;
  ctx.session.count++;
  ctx.body = ctx.session.count;
}

function remove(ctx) {
  ctx.session = null;
  ctx.body = 0;
}

function other(ctx) {
  ctx.body = ctx.session !== undefined ? 'has session' : 'no session';
}

var app = module.exports = http.createServer(app.callback());
app.store = store;
