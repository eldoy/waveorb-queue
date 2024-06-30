var mongowave = require('mongowave')

module.exports = async function () {
  var db = await mongowave('waveorb-scheduler-test')
  var queue = require('../index.js')({ db, silent: true })

  var $ = {
    db,
    queue,
    params: {},
    app: {
      config: {
        env: {}
      }
    }
  }

  return { $ }
}
