const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const {userOne, userOneId, setupDatabase} = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should sign up a user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Andrew',
        email: 'toto2@free.fr',
        password: 'toto44!!!'
    }).expect(201);
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();
    expect(response.body.user.name).toBe('Andrew');
    expect(response.body).toMatchObject({
        user: {
            name: 'Andrew',
            email: 'toto2@free.fr',
        },
        token: user.tokens[0].token
    });
    expect(response.body.user.password).toBeUndefined();
});

test('Should login with existing user', async () => {
    const {email, password, name} = userOne;
    const response = await request(app).post('/users/login')
    .send({email, password})
    .expect(200);
    const user = await User.findById(response.body.user._id);
    expect(response.body).toMatchObject({
        user: {name, email},
        token: user.tokens[1].token
    });
});

test('Should not login with unexisting user', (done) => {
    request(app).post('/users/login')
    .send({email: 'unknownguy@me.io', password: 'toto44!!'})
    .expect(500);
    done();
});

test('Should not login with wrong password', (done) => {
    const {email} = userOne;
    request(app).post('/users/login')
    .send({email, password: 'wrong44!!'})
    .expect(500);
    done();
});

test('Should get user profil', (done) => {
    request(app).get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
    done();
});

test('Should not get user profil when not logged', (done) => {
    request(app).get('/users/me')
    .send()
    .expect(401);
    done();
});

test('Should delete user', async () => {
    const response = await request(app).delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
    const user = await User.findById(userOneId);
    expect(user).toBeNull();
});

test('Should not delete user when not logged', (done) => {
    request(app).delete('/users/me')
    .send()
    .expect(401);
    done();
});

test('Should upload avatar image', async () => {
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/avatar.jpg')
    .expect(200);
    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valide user fields', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: 'Mikey',
        email: 'mikey@me.io',
        password: 'what!!44',
    })
    .expect(200);
    const user = await User.findById(userOneId);
    expect(user.name).toBe('Mikey');
});

test('Should not update user with non valide fields', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: 'Mikey',
        email: 'mikey@me.io',
        password: 'what!!44',
        location: 'Nantes',
    })
    .expect(400);
    const user = await User.findById(userOneId);
    expect(user.name).not.toBe('Mikey');
});