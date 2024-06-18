### Background

https://hackernoon.com/why-i-built-a-mongodb-powered-message-queue

The goal of the library is to process things in the background instead of using cron jobs, and also do heavy tasks in the background.

The queue consists of 'jobs'. Each job has to be unique in the database. You cannot add two identical jobs to the queue.

The job must contain the name, data and options, as well as the schedule for when to execute the task.
