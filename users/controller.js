const express = require('express')
const router = express.Router()
const Joi = require('joi')
const validateRequest = require('../middleware/validate-request')
const authorize = require('../middleware/authorize')
const isAdmin = require('../middleware/isAdmin')
const userService = require('./service')

//routes
router.get('/', authorize(), getAll);
router.post('/', authorize(), createSchema, create);
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

function createSchema(req, res, next) {
    const schema = Joi.object({
        login: Joi.string().empty(''),
        email: Joi.string().email(),
        role: Joi.string().valid('user', 'admin'),
        fullName: Joi.string().regex(/^[A-Z]+ [A-Z]+$/i).uppercase(),
        password: Joi.string().min(7).empty(''),
        repeat_password: Joi.any().equal(Joi.ref('password'))
            .required()
            .label('Confirm password')
            .options({ messages: { 'any.only': '{{#label}} does not match'} })
    })
    validateRequest(req, next, schema)
}

function create(req, res, next) {
    try {
        if (isAdmin(req.user)) {
            userService.create(req.body)
            .then(() => res.json({ message: "User Creation successful"}))
            .catch(next)
        } else {
            res.status(401).json({message: "Unauthorized"})
        }
    } catch(e) {
        res.status(500).json() //?
    }
    
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({message: 'User deleted successfully'}))
        .catch(next)
}