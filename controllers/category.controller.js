const express = require('express')
const router = express.Router()
const Joi = require('joi')
const validateRequest = require('../middleware/validate-request')
const authorize = require('../middleware/authorize')
const isOwner = require('../middleware/isOwner')
const categoryService = require('../services/category.service')
const Role = require('../helpers/role')

module.exports = router
//routers
router.get('/', getAll)
router.get('/:id', getById)
router.get('/:id/posts', getAllPosts)
router.post('/', authorize(Role.Admin), createSchema, create)
router.patch('/:id', authorize(Role.Admin), updateSchema, update)
router.delete('/:id', authorize(Role.Admin), _delete)

function getAll(req, res, next) {
    categoryService.getAll()
        .then(data => res.json(data))
        .catch(next);
}

function getById(req, res, next) {
    categoryService.getById(req.params.id)
        .then(category => res.json(category))
        .catch(next);
}

function getAllPosts(req, res, next) {
    categoryService.getAllPosts(req.params.id)
        .then(posts => res.json(posts))
        .catch(next);
}

function createSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().empty('').required(),
        description: Joi.string().empty(''),
    })
    validateRequest(req, next, schema)
}

function create(req, res, next) {
    categoryService.create(req.body)
        .then((category) => res.json({ message: "Category Creation successful", category}))
        .catch(next)
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().empty(''),
        description: Joi.string().empty(''),
    })
    validateRequest(req, next, schema)
}

function update(req, res, next) {
    categoryService.update(req.body, req.params.id)
        .then((category) => res.json({ message: "Category updated successfully", category}))
        .catch(next)
}

function _delete(req, res, next) {
    categoryService.delete(req.params.id)
        .then(() => res.json({message: "Category deleted successfully"}))
        .catch(next)
}
