const express = require('express')
const router = express.Router()
const Joi = require('joi')
const validateRequest = require('../middleware/validate-request')
const authorize = require('../middleware/authorize')
const isOwner = require('../middleware/isOwner')
const commentService = require('../services/comment.service')
const Role = require('../helpers/role')

module.exports = router
//routers
router.get('/:id', getById)
router.patch('/:id', authorize(), updateSchema, update)
router.delete('/:id', authorize(), isOwner.comment(), _delete)
router.post('/:id/like', authorize(), createLikeSchema, createLike)
router.get('/:id/like', authorize(), getAllLikes)
router.delete('/:id/like', authorize(), isOwner.likeComment(), deleteLike)
router.post('/:id/lock', authorize(Role.Admin), lock)
router.post('/:id/unlock', authorize(Role.Admin), unlock)

function getById(req, res, next) {
    commentService.getById(req.params.id)
        .then(post => res.json(post))
        .catch(next)
}

function getAllLikes(req, res, next) {
    commentService.getAllLikes(req.params.id)
        .then(likes => res.json(likes))
        .catch(next);
}

function lock(req, res, next) {
    commentService.lock(req.params.id)
        .then(() => res.json({message: "Comment has been locked successfully"}))
        .catch(next)
}

function unlock(req, res, next) {
    commentService.unlock(req.params.id)
        .then(() => res.json({message: "Comment has been unlocked successfully"}))
        .catch(next)
}

function _delete(req, res, next) {
    commentService.delete(req.params.id)
        .then(() => res.json({message: 'Comment deleted successfully'}))
        .catch(next)
}

function deleteLike(req, res, next) {
    commentService.deleteLike(req.params.id, req.user)
        .then(() => res.json({message: 'Like deleted successfully'}))
        .catch(next)
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        status: Joi.string().valid('active', 'inactive').empty('')
    })
    validateRequest(req, next, schema)
}

function update(req, res, next) {
    commentService.update(req.params.id, req.body)
        .then(post => res.json(post))
        .catch(next)
}

function createLikeSchema(req, res, next) {
    const schema = Joi.object({
        type: Joi.string().empty('').valid("like", "dislike").required()
    })
    validateRequest(req, next, schema)
}

function createLike(req, res, next) {
    commentService.createLike(req.body, req.user.id, req.params.id)
        .then(() => res.json({ message: "Like Creation successful"}))
        .catch(next)
}