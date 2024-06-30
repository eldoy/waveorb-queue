module.exports = function (config) {
  return function log(message, name, id) {
    if (config.silent) return
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
