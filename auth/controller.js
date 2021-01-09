const express = require('express')
const router = express.Router()
const Joi = require('joi')
const validateRequest = require('../middleware/validate-request')
const authorize = require('../middleware/authorize')//for logout
const authService = require('./service')
const userService = require('../users/service')


//routes
router.post('/login', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);
// router.post('/logout', authorize(), logOut);
// router.post('/password-reset', passwordReset)
// router.post('/password-reset/:confirm_token')

module.exports = router

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        login: Joi.string().required(),
        password: Joi.string().required(),
        email: Joi.string().required()
    })
    validateRequest(req, next, schema)
}

function authenticate(req, res, next) {
    authService.authenticate(req.body)
        .then(user => res.json(user))
        .catch(next)
}

function registerSchema(req, res, next) {
    const schema = Joi.object({
        login: Joi.string().required(),
        password: Joi.string().min(7).required(),
        email: Joi.string().email(),
        fullName: Joi.string().regex(/^[A-Z]+ [A-Z]+$/i).uppercase(),
        repeat_password: Joi.any().equal(Joi.ref('password'))
            .required()
            .label('Confirm password')
            .options({ messages: { 'any.only': '{{#label}} does not match'} })
    })
    validateRequest(req, next, schema)
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({ message: "Registration successful"}))
        .catch(next)
}

// function logOut(req, res, next) {
//     // console.log(req.cookie)
//     console.log(req.user.token)
// }