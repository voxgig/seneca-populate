/* Copyright (c) 2018 voxgig and other contributors, MIT License */
'use strict'

const Optioner = require('optioner')
const Joi = Optioner.Joi

module.exports = {
  data: JSON.stringify(require(__dirname+'/pop0-data.json')),
  calls: [
    {
      pattern: 'list:foo_bar',
      params: {},
      out: {items:[{a:1}]}
    },
    {
      name:'z0',
      pattern: 'add:zed',
      params: {id:'z0',q:1},
      out: {q:1}
    },
    {
      pattern: 'get:zed',
      params: {id:'`z0:out.id`'},
      out: {}
    },
  ]
}


