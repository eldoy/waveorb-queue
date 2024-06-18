# Waveorb Queue

Enqueue jobs for running in the background.

### Requirements

* MongoDB
* [Mongowave](https://github.com/eldoy/mongowave)

### Install

```
npm i waveorb-queue
```

### Usage

```js
// Setup db
var mongodb = require('mongowave')
var db = await mongodb('queue')

// Queue config, needs a db
var config = { db }

// Create queue
var queue = require('waveorb-queue')(config)

// Queue name
var name = 'mail'

// Queue data
var data = { from: 'mail@example.com', to: 'post@example.com' }

// Queue options
var options = {
  start: 'now',
  repeat: 'every tuesday at 12'
}

// Listen for changes
queue.listen(name, async function(data, options) {
  // Send email
})

// Add item to queue
queue.add(name, data, options)
```

### Time options

Time options are human readable, here are some examples:

##### Start

* `now`
* `24 hours from now`
* `next friday at 23:00`

##### Repeat

* `every monday at 04`
* `every friday at 03:00 and 19:30`
* `every friday at 03:00 and every sunday at 04 and every saturday at 10:30:30`
* `every 10 seconds`

Clocks are 24 hours. You can specify hours, minutes and seconds: `HH:MM:SS`.

Created by [Eldøy Projects](https://eldoy.com)

Enjoy!
