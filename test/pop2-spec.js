/* Copyright (c) 2018 voxgig and other contributors, MIT License */
'use strict'

module.exports = {
  file: __dirname + '/pop2-data0.js',
  depends: __dirname + '/pop2a-spec.js',
  calls: [{ pattern: 'cmd:load', params: { a: 1 }, result: {} }],
}
