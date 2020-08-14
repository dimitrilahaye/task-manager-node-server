const express = require('express');
const Task = require('../models/task');
const auth = require('../middlewares/auth');
const pagination = require('../middlewares/pagination');

const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({...req.body, owner: req.user._id});
    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send();
    }
});

router.get('/tasks/me', auth, pagination, async (req, res) => {
    const {query} = req;
    const match = {};
    if (!!query.completed) {
        match.completed = query.completed === 'true';
    }
    const {sort, skip, limit} = req.pagination;
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {sort, skip, limit},
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send();
    }
});

router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const valid = ['description', 'completed'];
    if (!updates.every((u) => valid.includes(u))) {
        return res.status(400).send({error: 'Invalid properties'});
    }
    try {
        let task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if (!task) {
            return res.status(404).send();
        }
        task = Object.assign(task, req.body);
        task.save();
        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        if (!task) {
            res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});


module.exports = router;