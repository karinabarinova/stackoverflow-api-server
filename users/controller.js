const express = require('express')
const router = express.Router()
const Joi = require('joi')
const validateRequest = require('../middleware/validate-request')
const authorize = require('../middleware/authorize')
const userService = require('./service')

//routes
router.get('/', authorize(), getAll);
router.get('/:id', authorize(), getById);
router.patch('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => req.json(user))
        .catch(next)
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        login: Joi.string().empty(''),
        password: Joi.string().min(7).empty('')
    })
    validateRequest(req, next, schema)
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(user => res.json(user))
        .catch(next)
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({message: 'User deleted successfully'}))
        .catch(next)
}