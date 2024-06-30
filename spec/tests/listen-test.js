var scheduleName = 'test'

async function wait(s) {
  return new Promise((resolve) => setTimeout(resolve, s * 1000))
}

async function listen($, calls) {
  var { pre = [], post = [] } = calls

  var processed = []

  for (var call of pre) {
    await call()
  }

  await new Promise(async (resolve) => {
    await $.scheduler.listen(scheduleName, async function (data, options) {
      processed.push({ data, options })
      if (processed.length == pre.length + post.length) resolve()
    })
    await wait(0)

    for (var call of post) {
      await call()
      await wait(0)
    }
  })
  await wait(0.1)

  return processed
}

setup(async function ({ $ }) {
  await $.db('job').delete()
  await $.db('job-history').delete()
})

it('should listen to scheduler', async ({ $, t }) => {
  var result = await listen($, {
    pre: [() => $.scheduler.add(scheduleName, { test: '0' }, { start: 'now' })],
    post: [
      () => $.scheduler.add(scheduleName, { test: '1' }, { start: 'now' }),
      () =>
        $.scheduler.add(
          scheduleName,
          { test: '2' },
          { start: 'now', repeat: 'every tuesday at 12' }
        ),
      () =>
        $.scheduler.add(
          scheduleName,
          { test: '3' },
          { start: '2 seconds from now', repeat: 'every 10 seconds' }
        )
    ]
  })
  t.equal(result.length, 4)

  // callback check
  var [t0, t1, t2, t3] = result.sort(
    (a, b) => parseInt(a.data.test) - parseInt(b.data.test)
  )

  // test 0
  t.deepStrictEqual(t0.data, { test: '0' })
  t.deepStrictEqual(t0.options, { start: 'now' })

  // test 1
  t.deepStrictEqual(t1.data, { test: '1' })
  t.deepStrictEqual(t1.options, { start: 'now' })

  // test 2
  t.deepStrictEqual(t2.data, { test: '2' })
  t.deepStrictEqual(t2.options, { start: 'now', repeat: 'every tuesday at 12' })

  // test 3
  t.deepStrictEqual(t3.data, { test: '3' })
  t.deepStrictEqual(t3.options, {
    start: '2 seconds from now',
    repeat: 'every 10 seconds'
  })

  // job check
  var jobs = await $.db('job').find()
  t.equal(jobs.length, 2)

  var [j1, j2] = jobs.sort(
    (a, b) => parseInt(a.payload.test) - parseInt(b.payload.test)
  )

  // test 2
  t.equal(j1.payload.test, '2')
  t.equal(j1.status.length, 1)
  t.equal(j1.status[0].status, 'enqueued')
  t.equal(typeof j1.status[0].schedule.getTime, 'function')

  // test 3
  t.equal(j2.payload.test, '3')
  t.equal(j2.status.length, 1)
  t.equal(j2.status[0].status, 'enqueued')
  t.equal(typeof j2.status[0].schedule.getTime, 'function')

  // job-history check
  var result = await $.db('job-history').find()
  t.equal(result.length, 4)

  // test 0
  var jobs = result.filter(({ payload }) => payload.test == '0')
  t.equal(jobs.length, 1)

  var [j1] = jobs

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

  // test 1
  var jobs = result.filter(({ payload }) => payload.test == '1')
  t.equal(jobs.length, 1)

  var [j1] = jobs

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

  // test 2
  var jobs = result.filter(({ payload }) => payload.test == '2')
  t.equal(jobs.length, 1)

  var [j1] = jobs

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

  // test 3
  var jobs = result.filter(({ payload }) => payload.test == '3')
  t.equal(jobs.length, 1)

  var [j1] = jobs

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
})
