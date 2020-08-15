const { send } = require('@sendgrid/mail');
const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const {userOne, userOneId, userTwoId, userTwo, taskOne, setupDatabase} = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should create new task', async () => {
    const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: 'A new created task'
    })
    .expect(201);
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toBeFalsy();
});

test('Should request all the user tasks', async () => {
    const response = await request(app)
    .get('/tasks/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200);
    expect(response.body.length).toBe(2);
});

test('Should not delete task from another user', async () => {
    await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);
    const task = await Task.findById(taskOne._id);
    expect(task).not.toBeNull();
});