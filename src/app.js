const express = require('express');
require('./db/mongoose');
const usersRouter = require('../src/routers/users');
const tasksRouter = require('../src/routers/tasks');

const app = express();
app.use(express.json());
app.use(usersRouter);
app.use(tasksRouter);

module.exports = app;