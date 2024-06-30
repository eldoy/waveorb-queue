var mongowave = require('mongowave')

async function wait(s) {
  return new Promise((resolve) => setTimeout(resolve, s * 1000))
}

async function add(queue, collection) {
  var data = { test: '1' }
  var options = { start: 'now' }
  await queue.add(collection, data, options)

  data = { test: '2' }
  options = { start: 'now', repeat: 'every tuesday at 13:30' }
  await queue.add(collection, data, options)

  data = { test: '3' }
  options = { start: '30 seconds from now', repeat: 'every 10 seconds' }
  await queue.add(collection, data, options)
}

async function test() {
  var db = await mongowave('waveorb-queue-dev')
  var queue = require('./index.js')({ db })
  var collection = 'test'

  // cleanup
  await db('job').delete()
  await db('job-history').delete()

  // test: before listen
  // await add(queue, collection)

  // listen
  await queue.listen(collection, async function (data, options) {
    console.log('   ⚠️  callback')
    console.log('   💊 data: ' + JSON.stringify(data))
    console.log('   💊 options: ' + JSON.stringify(options))
  })

  // why?
  await wait(0)

  // test: after listen
  await add(queue, collection)
}

test()
