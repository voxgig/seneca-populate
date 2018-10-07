/* Copyright (c) 2018 voxgig and other contributors, MIT License */
'use strict'

const Util = require('util')

const Lab = require('lab')
const Code = require('code')
const lab = (exports.lab = Lab.script())
const expect = Code.expect

const PluginValidator = require('seneca-plugin-validator')
const Seneca = require('seneca')
const Plugin = require('..')


lab.test('validate', PluginValidator(Plugin, module))

lab.test('load', fin => {
  seneca_instance({}, fin).ready(fin)
})


lab.test('export_import', fin => {
  var opts = {strict:false,once:false,folder:__dirname+'/data'}
  var si0 = seneca_instance(opts, fin)
  var b = Date.now()
  
  si0.make('foo/bar',{a:1,b:b}).save$(function() {
    si0.act('role:populate,cmd:export', function() {

      var si1 = seneca_instance(opts, fin)
      si1.act('role:populate,cmd:import', function() {
        si1.make('foo/bar').load$({a:1},function(err, foo_bar) {
          expect(foo_bar.a).equal(1)
          expect(foo_bar.b).equal(b)

          // verify auto import of most recent on startup if option import=true
          var si2 = seneca_instance({import:true,folder:__dirname+'/data'}, fin)
          si2.ready(function() {
            this.act('role:mem-store,cmd:dump', function(err, out) {
              si2.make('foo/bar').load$({a:1},function(err, foo_bar) {
                expect(foo_bar.a).equal(1)
                expect(foo_bar.b).equal(b)
                fin()
              })
            })
          })
        })
      })
    })
  })
})


lab.test('populate', fin => {
  var opts = {
    populate:true,
    folder:__dirname,
    file:'pop0-spec.js'
  }

  var custom_plugin = function() {
    this
      .add('list:foo_bar', function(msg, reply) {
        this.make('foo/bar').list$(function(err, items) {
          reply({items:items})
        })
      })
      .add('add:zed', function(msg, reply) {
        this.make('zed').data$({id$:msg.id,q:msg.q}).save$(reply)
      })
      .add('get:zed', function(msg, reply) {
        this.make('zed').load$(msg.id,reply)
      })
  }
  
  var si = seneca_instance(opts, fin, custom_plugin)
  
  si.act('role:mem-store,cmd:dump', function(err, out) {
    expect(out.foo.bar['4mqccf']).contains({a:1,b:100})
    expect(out[undefined].zed['z0']).contains({q:1})
    
    fin()
  })
})



function seneca_instance(opts, fin, custom_plugin, testmode) {
  var si = Seneca({
    strict: { result: false }
  })
    .test(fin, testmode)
    .use('promisify')
    .use('seneca-joi')
    .use('entity')
    .use('member')

  if(custom_plugin) {
    si.use(custom_plugin)
  }
  
  si.use(Plugin, opts)

  return si
}
