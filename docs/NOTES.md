### Background

https://hackernoon.com/why-i-built-a-mongodb-powered-message-queue

The goal of the library is to process things in the background instead of using cron jobs, and also do heavy tasks in the background.

The queue consists of 'jobs'. Each job has to be unique in the database. You cannot add two identical jobs to the queue.

The job must contain the name, data and options, as well as the schedule for when to execute the task.

The human readable options must have its own parser, and throws an exception if it can't be parsed.

### MongoDB setup

The mongodb instance you're using must be set up as a replica set to be able to watch for changes.

Add the `--replSet` option to your mongodb config:

```
mongod --replSet rs0 ...
```

Then log into your mongodb instance with `mongo` and run `rs.initiate()`.

https://www.mongodb.com/docs/manual/tutorial/convert-standalone-to-replica-set/
