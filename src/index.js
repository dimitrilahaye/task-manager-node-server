const express = require('express');
require('./db/mongoose');
const usersRouter = require('../src/routers/users');
const tasksRouter = require('../src/routers/tasks');

const app = express();
const port = process.env.PORT;


app.use(express.json());
app.use(usersRouter);
app.use(tasksRouter);

app.listen(port, () => console.log('server launched on port ' + port));