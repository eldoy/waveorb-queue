var util = require('./lib/util.js')

module.exports = function (config = {}) {
  var { db } = config
  return {
    add: function (name, data, options = {}) {
      if (!name) return null

      var next = util.parseSchedule(options)

      var enqueued = {
        status: 'enqueued',
        timestamp: new Date(),
        schedule: next
      }

      return db(name).create({ status: [enqueued], payload: data, options })
    }
  }
}
