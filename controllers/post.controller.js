const express = require('express')
const router = express.Router()
const Joi = require('joi')
const validateRequest = require('../middleware/validate-request')
const authorize = require('../middleware/authorize')
// const Role = require('../helpers/role')
const isOwner = require('../middleware/isOwner')
// const userService = require('./service')
const postService = require('../services/post.service')

//routes
router.get('/', getAll) //public TO DO: Add pagination
router.get('/:id', getById) //public
router.post('/', authorize(), createSchema, create)
router.patch('/:id', authorize(), isOwner.post(), updateSchema, update)
router.delete('/:id', authorize(), _delete)
router.post('/:id/comments', authorize(), createCommentSchema, createComment)
router.get('/:id/comments', getAllComments)
//likes
router.post('/:id/like', authorize(), createLikeSchema, createLike)
router.get('/:id/like', authorize(), getAllLikes)
router.delete('/:id/like', authorize(), deleteLike)

module.exports = router

function getAll(req, res, next) {
    postService.getAll(req.query)
        .then(posts => res.json(posts))
        .catch(next);
}

function getAllComments(req, res, next) {
    postService.getAllComments(req.params.id)
        .then(posts => res.json(posts))
        .catch(next);
}

function getAllLikes(req, res, next) {
    postService.getAllLikes(req.params.id)
        .then(likes => res.json(likes))
        .catch(next);
}

function getById(req, res, next) {
    postService.getById(req.params.id)
        .then(post => res.json(post))
        .catch(next)
}

function createSchema(req, res, next) {
    // req.body.author = req.user.id
    const schema = Joi.object({
        title: Joi.string().empty(''),
        content: Joi.string().empty(''),
        categories: Joi.string().empty(''),
        // author: Joi.number()
    })
    validateRequest(req, next, schema)
}

function create(req, res, next) {
    postService.create(req.body, req.user.id)
        .then(() => res.json({ message: "Post Creation successful"}))
        .catch(next)
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string(),
        content: Joi.string(),
        categories: Joi.string() //TO DO: add status
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
function deleteLike(req, res, next) {
    postService.deleteLike(req.params.id)
        .then(() => res.json({message: 'Like deleted successfully'}))
        .catch(next)
}

function createCommentSchema(req, res, next) {
    const schema = Joi.object({
        content: Joi.string().empty('').required()
    })
    validateRequest(req, next, schema)
}

function createComment(req, res, next) {
    postService.createComment(req.user.id, req.body.content, req.params.id)
        .then((post) => res.json(post))
        .catch(next)
}

function createLikeSchema(req, res, next) {
    const schema = Joi.object({
        type: Joi.string().empty('').valid("like", "dislike").required()
    })
    validateRequest(req, next, schema)
}

function createLike(req, res, next) {
    postService.createLike(req.body, req.user.id, req.params.id)
        .then(() => res.json({ message: "Like Creation successful"}))
        .catch(next)
}
