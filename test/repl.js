/* Copyright (c) 2018 voxgig and other contributors, MIT License */
'use strict'

const Seneca = require('seneca')
const Plugin = require('..')

Seneca()
  .test('print')
  .use('promisify')
  .use('seneca-joi')
  .use('repl')
  .use('entity')
  .use('member')
  .use(Plugin, {populate: true,file:'a.json'})

