var mongowave = require('mongowave')

module.exports = async function () {
  var db = await mongowave('waveorb-scheduler-test')
  var scheduler = require('../index.js')({ db, silent: true })

  var $ = {
    db,
    scheduler,
    params: {},
    app: {
      config: {
        env: {}
      }
    }
  }

  return { $ }
}
