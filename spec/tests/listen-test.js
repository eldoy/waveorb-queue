var queue
var name = 'test'

async function wait(s) {
  return new Promise((resolve) => setTimeout(resolve, s * 1000))
}

setup(async function ({ $ }) {
  queue = require('../../index.js')({ db: $.db, interval: 1, silent: true })

  await $.db(name).delete()
  await $.db(`${name}-job`).delete()
})

async function listen(callback) {
  var processed = []

  await new Promise(async (resolve, reject) => {
    await queue.listen(name, async function (data, options) {
      processed.push({ data, options, timestamp: new Date() })
      if (data.last) resolve()
    })
    await wait(0)
    await callback()
  })
  await wait(1)

  return processed
}

it('should listen queue', async ({ $, t }) => {
  var result = await listen(async function () {
    await queue.add(name, { test: '1' }, { start: 'now' })
    await queue.add(
      name,
      { test: '2' },
      { start: 'now', repeat: 'every tuesday at 12' }
    )
    await queue.add(
      name,
      { test: '3', last: true },
      { start: '5 seconds from now', repeat: 'every 30 seconds' }
    )
  })
  t.equal(result.length, 3)

  // callback check
  var [t1, t2, t3] = result

  // test 1
  t.deepStrictEqual(t1.data, { test: '1' })
  t.deepStrictEqual(t1.options, { start: 'now' })
  t.equal(typeof t1.timestamp.getTime, 'function')

  // test 2
  t.deepStrictEqual(t2.data, { test: '2' })
  t.deepStrictEqual(t2.options, { start: 'now', repeat: 'every tuesday at 12' })
  t.equal(typeof t2.timestamp.getTime, 'function')

  // test 3
  t.deepStrictEqual(t3.data, { test: '3', last: true })
  t.deepStrictEqual(t3.options, {
    start: '5 seconds from now',
    repeat: 'every 30 seconds'
  })
  t.equal(typeof t3.timestamp.getTime, 'function')

  // db check
  var result = await $.db(`${name}-job`).find()
  t.equal(result.length, 5)

  // test 1
  var jobs = result.filter(({ source }) => source.payload.test == '1')
  t.equal(jobs.length, 1)

  var [j1] = jobs

  // test 1 - job 1
  t.equal(j1.status.length, 3)

  var [s3, s2, s1] = j1.status
  t.equal(s1.status, 'enqueued')
  t.equal(typeof s1.timestamp.getTime, 'function')
  t.equal(s1.schedule, undefined)
  t.equal(s1.error, undefined)

  t.equal(s2.status, 'processing')
  t.equal(typeof s2.timestamp.getTime, 'function')
  t.equal(s2.schedule, null)
  t.equal(s2.error, null)

  t.equal(s3.status, 'processed')
  t.equal(typeof s3.timestamp.getTime, 'function')
  t.equal(s3.schedule, null)
  t.equal(s3.error, null)

  // test 2
  var jobs = result.filter(({ source }) => source.payload.test == '2')
  t.equal(jobs.length, 2)

  var [j1, j2] = jobs

  // test 2 - job 1
  t.equal(j1.status.length, 3)

  var [s3, s2, s1] = j1.status
  t.equal(s1.status, 'enqueued')
  t.equal(typeof s1.timestamp.getTime, 'function')
  t.equal(s1.schedule, undefined)
  t.equal(s1.error, undefined)

  t.equal(s2.status, 'processing')
  t.equal(typeof s2.timestamp.getTime, 'function')
  t.equal(s2.schedule, null)
  t.equal(s2.error, null)

  t.equal(s3.status, 'processed')
  t.equal(typeof s3.timestamp.getTime, 'function')
  t.equal(s3.schedule, null)
  t.equal(s3.error, null)

  // test 2 - job 2
  t.equal(j2.status.length, 1)

  var [s1] = j2.status
  t.equal(s1.status, 'enqueued')
  t.equal(typeof s1.timestamp.getTime, 'function')
  t.equal(typeof s1.schedule.getTime, 'function')
  t.equal(s1.error, undefined)

  // test 3
  var jobs = result.filter(({ source }) => source.payload.test == '3')
  t.equal(jobs.length, 2)

  var [j1, j2] = jobs

  // test 3 - job 1
  t.equal(j1.status.length, 3)

  var [s3, s2, s1] = j1.status
  t.equal(s1.status, 'enqueued')
  t.equal(typeof s1.timestamp.getTime, 'function')
  t.equal(typeof s1.schedule.getTime, 'function')
  t.equal(s1.error, undefined)

  t.equal(s2.status, 'processing')
  t.equal(typeof s2.timestamp.getTime, 'function')
  t.equal(s2.schedule, null)
  t.equal(s2.error, null)

  t.equal(s3.status, 'processed')
  t.equal(typeof s3.timestamp.getTime, 'function')
  t.equal(s3.schedule, null)
  t.equal(s3.error, null)

  // test 3 - job 2
  t.equal(j2.status.length, 1)

  var [s1] = j2.status
  t.equal(s1.status, 'enqueued')
  t.equal(typeof s1.timestamp.getTime, 'function')
  t.equal(typeof s1.schedule.getTime, 'function')
  t.equal(s1.error, undefined)
})
