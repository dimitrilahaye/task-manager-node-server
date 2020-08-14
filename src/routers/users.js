const express = require('express');
const sharp = require('sharp');
const multer = require('multer');
const User = require('../models/user');
const auth = require('../middlewares/auth');
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account');

const router = new express.Router();

// public endpoints

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body);
        const token = await user.generateAuthToken();
        return res.send({token, user});
    } catch (e) {
        res.status(500).send({error: e.message});
    }
});

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    const token = await user.generateAuthToken();
    try {
        sendWelcomeEmail(user);
        await user.save();
        res.status(201).send({token, user});
    } catch (e) {
        res.status(400).send(e);
    }
});

// auth needed endpoints

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(({token}) => token !== req.token);
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/users/me', auth, async (req, res) => {
    try {
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        sendGoodbyeEmail(req.user);
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const props = ['name', 'age', 'email', 'password'];
    if (!updates.every((u) => props.includes(u))) {
        return res.status(400).send({error: 'Invalid properties'});
    }
    try {
        let {user} = req;
        user = Object.assign(user, req.body);
        await user.save();
        res.send(user);
    } catch (e) {
        res.status(400).send(e);
    }
});

const upload = multer({
    limits: {
        fileSize: 10000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error('Please choose an image'));
        }
        cb(undefined, true);
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({
        error: error.message
    });
});

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user?.avatar) {
        return res.status(404).send();
    }
    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
});

module.exports = router;