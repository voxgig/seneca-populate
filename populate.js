/* Copyright (c) 2018 voxgig and other contributors, MIT License */
'use strict'

const Util = require('util')
const Fs = require('fs')

const Optioner = require('optioner')
const Joi = Optioner.Joi

const SenecaMsgTest = require('seneca-msg-test')


module.exports = populate
module.exports.defaults = {
  test: false,

  // actions on init are exclusive, populate wins if both true
  populate: false, // run population messages
  import: false, // load data dump file

  strict: true, // if true, populate/import can only run if active
  once: true, // if true, populate/import can only be run once
  
  folder: Joi.string().min(1).default(__dirname),
  file: Joi.string().min(1), // if null, load most recent
  prefix: Joi.string().min(1).default('seneca-dump-')
}

function populate(opts) {
  const seneca = this
  const error = seneca.util.Eraro({
    msgmap: require(__dirname+'/lib/errors.js')
  })

  const already_run = {
    populate: false,
    import: false
  }
  
  function define_patterns() {
    seneca
      .message('role:populate,cmd:import', cmd_import)
      .message('role:populate,cmd:export', cmd_export)
      .message('role:populate,cmd:populate', cmd_populate)
      .prepare(async function() {
        if(opts.populate) {
          await this.post('role:populate,cmd:populate')
        }
        else if(opts.import) {
          await this.post('role:populate,cmd:import')
        }
      })
  }


  async function cmd_import(msg) {
    if(opts.strict && !opts.import) {
      throw error('import_not_active')
    }

    if(opts.once && already_run.import) {
      throw error('import_already_run')
    }

    var datafile = opts.file

    if(null == datafile) {
      const files = (await Util.promisify(Fs.readdir)(opts.folder))
            .filter(x=>x.startsWith(opts.prefix)).sort()

      // most recent, as file name is <prefix><timestamp>.json
      datafile = files[files.length-1]

      if(null == datafile) {
        throw error('datafile_not_found', {folder:opts.folder})
      }
    }

    const datapath = opts.folder+'/'+datafile
    const json = (await Util.promisify(Fs.readFile)(datapath)).toString()

    // TODO: stringify necessary?
    this.post('role:mem-store,cmd:import',{json:json})

    already_run.import = true
  }

  
  async function cmd_export(msg) {
    const out = await this.post('role:mem-store,cmd:dump')
    const datafile = null == opts.file ?
          opts.prefix+(Date.now())+'.json' : opts.file 
    const datapath = opts.folder+'/'+datafile
    await Util.promisify(Fs.writeFile)(datapath, JSON.stringify(out))
  }

  
  async function cmd_populate(msg, reply) {
    if(opts.strict && !opts.populate) {
      throw error('populate_not_active')
    }

    if(opts.once && already_run.populate) {
      throw error('populate_already_run')
    }

    const specfile = opts.folder+'/'+opts.file

    if( !(await Util.promisify(Fs.exists)(specfile)) ) {
      throw error('populate_specfile_not_found', {specfile: specfile})
    }
    
    // populate and import are mutually exclusive
    const spec = Object.assign({
      print: false,
      test: false,
      log: false,
      context: {},
      fix: ''
    },require(specfile))

    await this.post('role:mem-store,cmd:import',{json:spec.data})
    await Util.promisify(SenecaMsgTest.intern.run)(this, spec)
    
    already_run.populate = true
  }

  
  return define_patterns()
}


const intern = (module.exports.intern = {

})

