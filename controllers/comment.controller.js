const express = require('express')
const router = express.Router()
const Joi = require('joi')
const validateRequest = require('../middleware/validate-request')
const authorize = require('../middleware/authorize')
// const userService = require('./service')
const commentService = require('../services/comment.service')

module.exports = router
//routers
// router.post('/:post_id/comments', createSchema, create)

