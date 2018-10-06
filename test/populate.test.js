/* Copyright (c) 2018 voxgig and other contributors, MIT License */
'use strict'

const Util = require('util')

const Lab = require('lab')
const Code = require('code')
const lab = (exports.lab = Lab.script())
const expect = Code.expect

const SenecaMsgTest = require('seneca-msg-test')
const PluginValidator = require('seneca-plugin-validator')
const Seneca = require('seneca')
const Plugin = require('..')


lab.test('validate', PluginValidator(Plugin, module))

lab.test('load', fin => {
  seneca_instance(fin).ready(fin)
})

lab.test(
  'populate-msgs',
  SenecaMsgTest(seneca_instance(), require('./msg-spec.js'))
)

function seneca_instance(fin, testmode) {
  return Seneca()
    .test(fin, testmode)
    .use('promisify')
    .use('seneca-joi')
    .use('entity')
    .use('member')
    .use(Plugin, {populate: true})
}
