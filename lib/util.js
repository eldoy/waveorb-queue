var weekdays = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
]

function str2day(str) {
  switch (str) {
    case 'sunday':
      return 0
    case 'monday':
      return 1
    case 'tuesday':
      return 2
    case 'wednesday':
      return 3
    case 'thursday':
      return 4
    case 'friday':
      return 5
    case 'saturday':
      return 6
  }
}

function is(unit, string) {
  return [string, `${string}s`].includes(unit)
}

function addDiff(diff, d) {
  var [value, unit] = diff.split(' ')

  value = parseInt(value)

  date = new Date(d)

  if (is(unit, 'second')) {
    date.setTime(date.getTime() + value * 1000)
  } else if (is(unit, 'minute')) {
    date.setTime(date.getTime() + value * 60 * 1000)
  } else if (is(unit, 'hour')) {
    date.setTime(date.getTime() + value * 60 * 60 * 1000)
  } else if (is(unit, 'day')) {
    date.setDate(date.getDate() + value)
  } else if (is(unit, 'week')) {
    date.setDate(date.getDate() + value * 7)
  } else if (is(unit, 'month')) {
    date.setMonth(date.getMonth() + value)
  } else if (is(unit, 'year')) {
    date.setFullYear(date.getFullYear() + value)
  }

  return date
}

function nextDay(day, h = 0, m = 0, s = 0) {
  if (typeof day == 'string') {
    day = str2day(day)
  }

  var date = new Date()
  date.setDate(date.getDate() + ((day + (7 - date.getDay())) % 7))
  date.setHours(parseInt(h))
  date.setMinutes(parseInt(m))
  date.setSeconds(parseInt(s))
  date.setMilliseconds(0)
  return date
}

function parseStart(string) {
  if (!string) return

  if (string.includes('now')) {
    if (string == 'now') {
      return new Date()
    }
    if (string.includes('from')) {
      var [diff] = string.split(' from ')
      return addDiff(diff, new Date())
    }
  }

  if (string.includes('at')) {
    var [date, time] = string.split(' at ')
    if (date.includes('next')) {
      var [, day] = date.split(' ')
      var [h, m, s] = time.split(':')
      var next = nextDay(day, h, m, s)
      return next
    }
  }
}

function parseRepeat(string) {
  if (!string) return

  if (string.includes('at')) {
    var [date, time] = string.split(' at ')

    if (date.includes('to')) {
      var [from, to] = date.split(' to ')
      var [h, m, s] = time.split(':')

      var fromIdx = weekdays.findIndex((v) => v == from)
      var toIdx = weekdays.findIndex((v) => v == to)

      return weekdays
        .slice(fromIdx, toIdx + 1)
        .map((day) => nextDay(day, h, m, s))
        .filter((day) => day > new Date())
        .sort((a, b) => a - b)[0]
    }
  }
}

function parseSchedule(options) {
  var start = parseStart(options.start)
  var repeat = parseRepeat(options.repeat)
  return [start, repeat].sort((a, b) => a - b)[0]
}

module.exports = { parseSchedule }
