const Joi = require('@hapi/joi')

module.exports = {
  cmd_import: {
    desc: 'Import a JSON data file (using seneca-mem-store dump format).',
  },
  cmd_export: {
    desc: 'Export a JSON data file (using seneca-mem-store dump format).',
  },
  cmd_populate: {
    desc:
      'Import JSON data (using seneca-mem-store) and run data construction messages (using seneca-msg-test).',
  },
}
