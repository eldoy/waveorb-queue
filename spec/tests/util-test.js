var util = require('../../lib/util.js')

var DIFF = 10

var result
var expected

var second = 1000
var minute = 60 * second
var hour = 60 * minute
var day = 24 * hour
var week = 7 * day

function now(diff = 0) {
  return new Date().getTime() + diff
}

function next(day = 0, h = 0, m = 0, s = 0) {
  var now = new Date()
  now.setDate(now.getDate() + ((day + (7 - now.getDay())) % 7))
  now.setHours(h)
  now.setMinutes(m)
  now.setSeconds(s)
  now.setMilliseconds(0)

  var diff = now - new Date()
  if (diff < 0) {
    now.setDate(now.getDate() + 7)
  }

  return now
}

function message() {
  return (
    `result: ${result.toISOString()}, ` +
    `expected: ${new Date(expected).toISOString()}`
  )
}

it('should parse start schedule', async ({ $, t }) => {
  result = util.parseSchedule({ start: 'now' })
  expected = now()
  var diff = expected - result.getTime()
  t.ok(diff >= 0 && diff < DIFF, message())

  result = util.parseSchedule({ start: '10 seconds from now' })
  expected = now(10 * second)
  var diff = expected - result.getTime()
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

  result = util.parseSchedule({ start: 'next tuesday at 12:00' })
  expected = next(2, 12)
  t.equal(expected.getTime(), result.getTime())
})

it('should parse repeat schedule', async ({ $, t }) => {
  var now = new Date()
  var today = now.getDay()
  var hours = now.getHours()
  var tomorrow = today + 1

  result = util.parseSchedule({ repeat: 'monday to friday at 04' })
  var nextDay = tomorrow > 5 ? 1 : tomorrow
  expected = next(nextDay, 4)
  t.equal(expected.getTime(), result.getTime(), message())

  result = util.parseSchedule({
    repeat: 'monday, tuesday, wednesday, friday at 04'
  })
  if (today == 3) {
    nextDay = 5
  } else if ([5, 6].includes(today)) {
    nextDay = 1
  } else {
    nextDay = tomorrow
  }
  expected = next(nextDay, 4)
  t.equal(expected.getTime(), result.getTime(), message())

  result = util.parseSchedule({ repeat: 'every monday at 04' })
  expected = next(1, 4)
  t.equal(expected.getTime(), result.getTime(), message())

  result = util.parseSchedule({ repeat: 'every friday at 03:00 and 19:30' })
  expected = next(5, 3)
  t.equal(expected.getTime(), result.getTime(), message())

  result = util.parseSchedule({
    repeat: 'every friday at 03:00, sunday at 04, saturday at 10:30:30'
  })
  nextDay = 5
  var time = [3]
  if (today == 5 && hours > 3) {
    nextDay = 6
    time = [10, 30, 30]
  } else if (today == 6 && hours > 10) {
    nextDay = 1
    time = [4]
  }
  expected = next(nextDay, ...time)
  t.equal(expected.getTime(), result.getTime(), message())

  result = util.parseSchedule({
    repeat: 'every 10 seconds'
  })

  expected = new Date()
  expected.setSeconds(expected.getSeconds() + 10)
  var diff = expected.getTime() - result.getTime()
  t.ok(diff >= 0 && diff < DIFF, message())
})
