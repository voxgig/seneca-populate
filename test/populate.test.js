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

lab.test(
  'validate',
  Util.promisify(function(x, fin) {
    PluginValidator(Plugin, module)(fin)
  })
)

lab.test('load', async () => {
  await seneca_instance({}).ready()
})

lab.test('intern', async () => {
  expect(
    Plugin.intern.load_data({ data: '{"a":1}' }, Seneca.util.deepextend)
  ).equal({ a: 1 })

  expect(
    Plugin.intern.load_data({ data: { a: 1 } }, Seneca.util.deepextend)
  ).equal({ a: 1 })

  expect(
    Plugin.intern.load_data(
      { data: { a: 1 }, file: __dirname + '/data0.js' },
      Seneca.util.deepextend
    )
  ).equal({ a: 1, b: 2 })

  expect(
    Plugin.intern.load_data(
      { data: { a: 1 }, files: __dirname + '/data0.js' },
      Seneca.util.deepextend
    )
  ).equal({ a: 1, b: 2 })

  expect(
    Plugin.intern.load_data(
      { data: { a: 1 }, file: [__dirname + '/data0.js'] },
      Seneca.util.deepextend
    )
  ).equal({ a: 1, b: 2 })

  expect(
    Plugin.intern.load_data(
      { data: { a: 1 }, files: [__dirname + '/data0.js'] },
      Seneca.util.deepextend
    )
  ).equal({ a: 1, b: 2 })

  expect(
    Plugin.intern.load_data(
      {
        data: { a: 1 },
        files: [__dirname + '/data0.js', __dirname + '/data1.json']
      },
      Seneca.util.deepextend
    )
  ).equal({ a: 1, b: 3, c: 4 })
})

lab.test('export_import', async () => {
  return await Util.promisify(function(fin) {
    var opts = { strict: false, once: false, folder: __dirname + '/data' }
    var b = Date.now()

    var si0 = seneca_instance(opts, fin)

    si0.make('foo/bar', { a: 1, b: b }).save$(function() {
      si0.act('role:populate,cmd:export', function() {
        var si1 = seneca_instance(
          Object.assign(opts, { once: true }),
          null,
          null,
          false
        )

        si1.act('role:populate,cmd:import', function() {
          si1.make('foo/bar').load$({ a: 1 }, function(err, foo_bar) {
            expect(foo_bar.a).equal(1)
            expect(foo_bar.b).equal(b)

            // verify auto import of most recent on startup if option import=true
            var si2 = seneca_instance(
              { import: true, folder: __dirname + '/data' },
              fin
            )
            si2.ready(function() {
              this.act('role:mem-store,cmd:dump', function(err, out) {
                si2.make('foo/bar').load$({ a: 1 }, function(err, foo_bar) {
                  expect(foo_bar.a).equal(1)
                  expect(foo_bar.b).equal(b)

                  si1.act('role:populate,cmd:import', function(err) {
                    expect(err.code).equal('import_already_run')

                    var si3 = seneca_instance(
                      Object.assign(opts, { strict: true, import: false }),
                      null,
                      null,
                      false
                    )
                    si3.act('role:populate,cmd:import', function(err) {
                      expect(err.code).equal('import_not_active')
                      fin()
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })()
})

lab.test('populate', async () => {
  return await Util.promisify(function(fin) {
    var opts = {
      populate: true,
      folder: __dirname,
      file: 'pop0-spec.js'
    }

    var custom_plugin = function() {
      this.add('list:foo_bar', function(msg, reply) {
        this.make('foo/bar').list$(function(err, items) {
          reply({ items: items })
        })
      })
        .add('add:zed', function(msg, reply) {
          this.make('zed')
            .data$({ id$: msg.id, q: msg.q })
            .save$(reply)
        })
        .add('get:zed', function(msg, reply) {
          this.make('zed').load$(msg.id, reply)
        })
    }

    var si = seneca_instance(opts, fin, custom_plugin)

    si.act('role:mem-store,cmd:dump', function(err, out) {
      expect(out.foo.bar['4mqccf']).contains({ a: 1, b: 100 })
      expect(out[undefined].zed['z0']).contains({ q: 1 })

      fin()
    })
  })()
})

lab.test('populate-files', async () => {
  var opts = {
    populate: true,
    folder: __dirname,
    file: 'pop1-spec.js'
  }

  var si = seneca_instance(opts)
  var out = await si.post('role:mem-store,cmd:dump')

  expect(out.foo.bar['4mqccf']).contains({ a: 1, b: 200 })
  expect(out.foo.bar['123456']).contains({ a: 3, b: 300 })
})


lab.test('depends', async () => {
  var opts = {
    populate: true,
    folder: __dirname,
    file: 'pop2-spec.js'
  }

  var tmp = {ents:[]}
  
  var si = seneca_instance(opts, null, function() {
    this.message('cmd:load', async function(msg) {
      var ent = await this.entity('foo/bar').load$({a:msg.a})
      tmp.ents.push({msg:msg,ent:ent})
      return ent
    })
  })

  await si.ready()
  var out = await si.post('role:mem-store,cmd:dump')

  expect(out.foo.bar).equal({ aaa: { 'entity$': '-/foo/bar', a: 1, y: 100 },
                              bbb: { 'entity$': '-/foo/bar', a: 2, y: 200 } })
  
  expect(tmp.ents.length).equals(2)
})

         
function seneca_instance(opts, fin, custom_plugin, testmode) {
  var si = Seneca({
    strict: { result: false }
  })

  if (false === testmode) {
    si.quiet()
  } else {
    si.test(fin, testmode)
  }

  si.use('promisify')
    .use('seneca-joi')
    .use('entity')
    .use('member')

  if (custom_plugin) {
    si.use(custom_plugin)
  }

  si.use(Plugin, opts)

  return si
}
