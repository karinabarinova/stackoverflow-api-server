const express = require('express')
const router = express.Router()
const Joi = require('joi')
const validateRequest = require('../middleware/validate-request')
const authorize = require('../middleware/authorize')
// const userService = require('./service')
const commentService = require('../services/comment.service')

module.exports = router
//routers
router.get('/:id', getById)
router.delete('/:id', authorize(), _delete)


function getById(req, res, next) {
    commentService.getById(req.params.id)
        .then(post => res.json(post))
        .catch(next)
}

function _delete(req, res, next) {
    commentService.delete(req.params.id)
        .then(() => res.json({message: 'Comment deleted successfully'}))
        .catch(next)
}
