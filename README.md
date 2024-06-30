# Waveorb Scheduler

Schedule jobs for running in the background.

### Requirements

* MongoDB
* [Mongowave](https://github.com/eldoy/mongowave)

The mongodb instance you're using must be set up as a replica set to be able to watch for changes.

Add the `--replSet` option to your mongodb config:

```
mongod --replSet rs0 ...
```

Then log into your mongodb instance with `mongo` and run `rs.initiate()`.

[More info on MongoDB setup here &raquo;](https://www.mongodb.com/docs/manual/tutorial/convert-standalone-to-replica-set/)


### Install

```
npm i waveorb-scheduler
```

### Usage

```js
// Setup db
var mongodb = require('mongowave')
var db = await mongodb('firmalisten')

// Scheduler config, needs a db
var config = { db }

// Create scheduler
var scheduler = require('waveorb-scheduler')(config)

// Scheduler name
var name = 'mail'

// Scheduler data
var data = { from: 'mail@example.com', to: 'post@example.com' }

// Scheduler options
var options = {
  start: 'now',
  repeat: 'every tuesday at 12'
}

// Listen for changes
scheduler.listen(name, async function(data, options) {
  // Send email
})

// Add job to scheduler
scheduler.add(name, data, options)
```

### Time options

The time options DSL are human readable, here are some examples:

##### Start

* `now`
* `10 seconds from now`
* `24 hours from now`
* `5 days from now`
* `1 week from now`
* `next friday at 23:00`

##### Repeat

* `every monday at 04`
* `every friday at 03:00 and 19:30`
* `every friday at 03:00, sunday at 04, saturday at 10:30:30`
* `every 10 seconds`
* `monday to friday at 04`
* `monday, tuesday, wednesday, friday at 04`

Clocks are 24 hours. You can specify hours, minutes and seconds: `HH:MM:SS`.

Created by [Eldøy Projects](https://eldoy.com)

Enjoy!
