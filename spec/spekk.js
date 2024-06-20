var mongowave = require('mongowave')

module.exports = async function () {
  var db = await mongowave('waveorb-queue-test')

  var $ = {
    db,
    params: {},
    app: {
      config: {
        env: {}
      }
    }
  }

  return { $ }
}
