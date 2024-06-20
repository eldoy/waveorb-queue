var util = require('../../lib/util.js')

var DIFF = 10

function now(diff = 0) {
  return new Date().getTime() + diff
}

function next(day = 0, h = 0, m = 0, s = 0) {
  var now = new Date()
  now.setDate(now.getDate() + ((day + (7 - now.getDay())) % 7))
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, s)
}

var second = 1000
var minute = 60 * second
var hour = 60 * minute
var day = 24 * hour
var week = 7 * day

it('should parse schedule', async ({ $, t }) => {
  function message() {
    return (
      `result: ${result.toISOString()}, ` +
      `expected: ${new Date(expected).toISOString()}, ` +
      `diff: ${diff}`
    )
  }

  // start
  var result = util.parseSchedule({ start: 'now' })
  var expected = now()
  var diff = expected - result.getTime()
  t.ok(diff >= 0 && diff < DIFF, message())

  result = util.parseSchedule({ start: '10 seconds from now' })
  expected = now(10 * second)
  diff = expected - result.getTime()
  t.ok(diff >= 0 && diff < DIFF, message())

  result = util.parseSchedule({ start: '1 minute from now' })
  expected = now(1 * minute)
  diff = expected - result.getTime()
  t.ok(diff >= 0 && diff < DIFF, message())

  result = util.parseSchedule({ start: '24 hours from now' })
  expected = now(24 * hour)
  diff = expected - result.getTime()
  t.ok(diff >= 0 && diff < DIFF, message())

  result = util.parseSchedule({ start: '5 days from now' })
  expected = now(5 * day)
  diff = expected - result.getTime()
  t.ok(diff >= 0 && diff < DIFF, message())

  result = util.parseSchedule({ start: '1 week from now' })
  expected = now(1 * week)
  diff = expected - result.getTime()
  t.ok(diff >= 0 && diff < DIFF, message())

  result = util.parseSchedule({ start: 'next friday at 23:00' })
  expected = next(5, 23)
  t.equal(expected.getTime(), result.getTime())

  // repeat
  result = util.parseSchedule({ repeat: 'monday to friday at 04' })
  expected = next(5, 4)
  t.equal(expected.getTime(), result.getTime())

  // * `monday, tuesday, wednesday, friday at 04`
  // * `every monday at 04`
  // * `every friday at 03:00 and 19:30`
  // * `every friday at 03:00, sunday at 04, saturday at 10:30:30`
  // * `every 10 seconds`
})
