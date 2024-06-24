module.exports = function (config) {
  var { silent } = config

  return function log(message, name, id) {
    if (!silent) {
      if (name) {
        var now = new Date()
        var info = `timestamp: ${now.toISOString()}, name: ${name}`
        if (Array.isArray(id) ? id.length : id) {
          info = `${info}, id: ${id}`
        }
        console.log(`${message} (${info})`)
      } else {
        console.log(message)
      }
    }
  }
}
