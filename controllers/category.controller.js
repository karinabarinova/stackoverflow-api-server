const express = require('express')
const router = express.Router()
const Joi = require('joi')
const validateRequest = require('../middleware/validate-request')
const authorize = require('../middleware/authorize')
const isOwner = require('../middleware/isOwner')
const categoryService = require('../services/category.service')

module.exports = router
//routers
router.get('/', getAll)
router.get('/:id', getById)
router.get('/:id/posts', getAllPosts)

function getAll(req, res, next) {
    categoryService.getAll()
        .then(categories => res.json(categories))
        .catch(next);
}

function getById(req, res, next) {
    categoryService.getById(req.params.id)
        .then(category => res.json(category))
        .catch(next);
}

function getAllPosts(req, res, next) {
    categoryService.getAllPosts(req.params.id)
        .then(category => res.json(category))
        .catch(next);
}