module.exports = function (config = {}) {
  var log = require('./lib/log.js')(config)
  var { create, schedule } = require('./lib/job.js')(config)

  var { db } = config

  async function add(name, data, options = {}) {
    if (!name) return
    var job = await db('job').count({ name, payload: data, options })
    if (job) {
      throw Error('Job already exists')
    }
    return create({ name, payload: data, options })
  }

  async function listen(name, callback) {
    if (!name) return

    log(`\n🚀 Listening to job collection: ${name}\n`)

    var jobs = await db('job').find({ name, 'status.0.status': 'enqueued' })

    log(
      `📥 Looking for enqueued jobs: found ${jobs.length}`,
      name,
      jobs.map(({ id }) => id).join(', ')
    )

    if (jobs.length) {
      await Promise.all(jobs.map((job) => schedule(callback, job)))
    }

    var stream = db.base.collection('job').watch()
    stream.on('change', async (change) => {
      if (change.operationType == 'insert') {
        var job = change.fullDocument
        if (job.name == name && job.status[0].status == 'enqueued') {
          schedule(callback, job)
        }
      }
    })
  }

  return { add, listen }
}
