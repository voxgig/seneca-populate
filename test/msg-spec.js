/* Copyright (c) 2018 voxgig and other contributors, MIT License */
'use strict'

const Optioner = require('optioner')
const Joi = Optioner.Joi

module.exports = {
  print: true,
  test: true,
  log: false,
  data: JSON.stringify(require('./data.js')),
  fix: 'role:populate',
  context: {},
  calls: [
    {
      pattern: 'cmd:import',
      params: {}
    },
    {
      pattern: 'cmd:export',
      params: {}
    },
    {
      pattern: 'cmd:populate',
      params: {}
    }
  ]
}

