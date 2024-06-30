var scheduleName = 'test'

setup(async function ({ $ }) {
  await $.db('job').delete()
})

it('should add job to queue', async ({ $, t }) => {
  var result = await $.scheduler.add()
  t.equal(result, null)

  result = await $.scheduler.add('')
  t.equal(result, null)

  result = await $.db('job').find()
  t.equal(result.length, 0)

  var data = { from: 'from', to: 'to' }
  var options = { start: 'now', repeat: 'every tuesday at 12' }
  result = await $.scheduler.add(scheduleName, data, options)

  t.equal(Object.keys(result).length, 7)
  t.equal(typeof result.id, 'string')
  t.equal(result.name, scheduleName)
  t.deepStrictEqual(result.payload, data)
  t.deepStrictEqual(result.options, options)
  t.equal(result.status.length, 1)
  t.equal(result.status[0].status, 'enqueued')
  t.equal(typeof result.status[0].schedule.getTime, 'function')
  t.equal(typeof result.created_at.getTime, 'function')
  t.equal(typeof result.updated_at.getTime, 'function')

  var jobs = await $.db('job').find()
  t.equal(jobs.length, 1)

  t.deepStrictEqual(result, jobs[0])

  t.rejects(
    async () => $.scheduler.add(scheduleName, data, options),
    new Error('Job already exists')
  )
})
