var queue
var name = 'test'

setup(async function ({ $ }) {
  queue = require('../../index.js')({ db: $.db })
  await $.db(name).delete()
})

it('should add', async ({ $, t }) => {
  var result = await queue.add()
  t.equal(result, null)

  result = await queue.add('')
  t.equal(result, null)

  result = await $.db(name).find()
  t.equal(result.length, 0)

  var data = { from: 'from', to: 'to' }
  var options = { start: 'now', repeat: 'every tuesday at 12' }

  result = await queue.add(name, data, options)

  t.equal(Object.keys(result).length, 5)
  t.equal(typeof result.id, 'string')
  t.deepStrictEqual(result.payload, data)
  t.deepStrictEqual(result.options, options)
  t.equal(typeof result.created_at.getTime, 'function')
  t.equal(typeof result.updated_at.getTime, 'function')

  result = await $.db(name).find()
  t.equal(result.length, 1)

  result = result[0]

  t.equal(Object.keys(result).length, 5)
  t.equal(typeof result.id, 'string')
  t.deepStrictEqual(result.payload, data)
  t.deepStrictEqual(result.options, options)
  t.equal(typeof result.created_at.getTime, 'function')
  t.equal(typeof result.updated_at.getTime, 'function')
})
