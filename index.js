var util = require('./lib/util.js')

var SECOND = 1000

function getStatus(status, options, error) {
  var schedule
  if (status == 'enqueued') {
    schedule = util.parseSchedule(options)
  }

  return {
    status,
    timestamp: new Date(),
    schedule,
    error: error?.message
  }
}

module.exports = function (config = {}) {
  var { db, interval = 10, silent } = config

  function log(message, collection, id) {
    if (!silent) {
      if (collection) {
        var now = new Date()
        var info = `timestamp: ${now.toISOString()}, collection: ${collection}`
        if (id) {
          info = `${info}, id: ${id}`
        }
        console.log(`${message} (${info})`)
      } else {
        console.log(message)
      }
    }
  }

  async function addStatus(collection, jobId, status, options, error) {
    return db.base.collection(collection).findOneAndUpdate(
      { _id: jobId },
      {
        $push: {
          status: {
            $each: [getStatus(status, options, error)],
            $position: 0
          }
        }
      }
    )
  }

  async function addJob(collection, source, scheduled = false) {
    if (!collection) return
    log('🛠  Adding job', collection)

    var options = scheduled ? { repeat: source.options.repeat } : source.options
    var enqueued = getStatus('enqueued', options)

    return db(collection).create({
      sourceId: source.id || source._id,
      source,
      status: [enqueued]
    })
  }

  async function processJob(callback, { jobId, collection, source }) {
    log('🔥 Processing job', collection, jobId)

    var { payload, options } = source

    await addStatus(collection, jobId, 'processing', options)

    try {
      await callback(payload, options)
      await addStatus(collection, jobId, 'processed', options)
      log('✅ Processed job', collection, jobId)
    } catch (err) {
      await addStatus(collection, jobId, 'failed', options, err)
      log('❌ Failed job', collection, jobId)
    }

    if (options.repeat) {
      await addJob(collection, source, true)
    }
  }

  return {
    add: async function (name, data, options = {}) {
      if (!name) return
      var collection = `${name}-job`

      var result = await db(name).create({ payload: data, options })

      await addJob(collection, result)

      return result
    },
    listen: async function (name, callback) {
      if (!name) return
      var collection = `${name}-job`

      log(`\n🚀 Listening to ${collection} collection\n`)

      var stream = db.base.collection(collection).watch()

      stream.on('change', async (job) => {
        if (job.operationType == 'insert') {
          var { _id, status, source } = job.fullDocument
          var { status, schedule } = status[0]
          if (status == 'enqueued' && !schedule) {
            log('📥 New unscheduled job detected', collection, _id)
            await processJob(callback, {
              jobId: _id,
              collection,
              source
            })
          }
        }
      })

      setInterval(async function () {
        var jobs = await db(collection).find({
          'status.0.status': 'enqueued',
          'status.0.schedule': { $lte: new Date() }
        })

        log(
          `⏰ Looking for scheduled jobs: found ${jobs.length}`,
          collection,
          jobs.map(({ id }) => id).toString()
        )

        await Promise.all(
          jobs.map(async ({ id, source }) =>
            processJob(callback, {
              jobId: id,
              collection,
              source
            })
          )
        )
      }, interval * SECOND)
    }
  }
}
