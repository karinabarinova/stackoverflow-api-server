const express = require('express')
const router = express.Router()
const Joi = require('joi')
const validateRequest = require('../middleware/validate-request')
const authorize = require('../middleware/authorize')
const isAdmin = require('../middleware/isAdmin')
// const userService = require('./service')
const postService = require('./service')

//routes
router.get('/', getAll) //public TO DO: Add pagination
router.get('/:id', getById) //public
router.post('/', authorize(), createSchema, create)
router.patch('/:id', authorize(), updateSchema, update)
router.delete('/:id', authorize(), _delete)

module.exports = router

function getAll(req, res, next) {
    postService.getAll()
        .then(posts => res.json(posts))
        .catch(next);
}

function getById(req, res, next) {
    postService.getById(req.params.id)
        .then(post => res.json(post))
        .catch(next)
}

function createSchema(req, res, next) {
    req.body.author = req.user.id
    const schema = Joi.object({
        title: Joi.string().empty(''),
        content: Joi.string().empty(''),
        categories: Joi.string().empty(''),
        author: Joi.number()
    })
    validateRequest(req, next, schema)
}

function create(req, res, next) {
    postService.create(req.body)
        .then(() => res.json({ message: "Post Creation successful"}))
        .catch(next)
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string(),
        content: Joi.string(),
        categories: Joi.string()
    })
    validateRequest(req, next, schema)
}

function update(req, res, next) {
    postService.update(req.params.id, req.body)
        .then(post => res.json(post))
        .catch(next)
}

function _delete(req, res, next) {
    postService.delete(req.params.id)
        .then(() => res.json({message: 'Post deleted successfully'}))
        .catch(next)
}
