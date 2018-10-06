/* Copyright (c) 2018 voxgig and other contributors, MIT License */
'use strict'

// sys/user is used to represent organisations - this allows business
// logic to build on other sys/user plugins.  Populates can be in more
// than one organization (hence the use of seneca-member), although
// this is not the primary use-case. Multi-organisatin populates can be
// used for inter-organization collaboration, as shared permissions
// can be assigned to the populate.


const Util = require('util')

const Optioner = require('optioner')
const Joi = Optioner.Joi


module.exports = populate
module.exports.defaults = {
  test: false,
  populate: false,
  folder: Joi.string(),
}

function populate(opts) {
  const seneca = this
  const error = seneca.util.Eraro({
    msgmap: require(__dirname+'/lib/errors.js')
  })
  
  function define_patterns() {
    seneca
      .message('role:populate,cmd:import', cmd_import)
      .message('role:populate,cmd:export', cmd_export)
      .message('role:populate,cmd:populate', cmd_populate)
  }


  async function cmd_import(msg) {
  }

  async function cmd_export(msg) {
  }

  async function cmd_populate(msg, reply) {
    if(!opts.populate) {
      throw error('populate_not_active')
    }
  }

  
  return define_patterns()
}


const intern = (module.exports.intern = {

  foo: async function() {
  }

})

