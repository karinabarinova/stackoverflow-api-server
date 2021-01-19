const express = require('express')
const router = express.Router()
const Joi = require('joi')
const validateRequest = require('../middleware/validate-request')
const authorize = require('../middleware/authorize')//for logout
const authService = require('../services/auth.service')
const Role = require('../helpers/role')

//routes
router.post('/login', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);
router.post('/verify-email', verifyEmailSchema, verifyEmail);
router.post('/password-reset', forgotPasswordSchema, forgotPassword);
router.post('/reset-password/:confirm_token', resetPasswordSchema, resetPassword);
router.post('/logout', authorize(), logOut);

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
    const { login, email, password } = req.body;
    const ipAddress = req.ip;
    authService.authenticate({login, email, password, ipAddress })
        .then(({...user }) => {
            setTokenCookie(res, user.jwtToken);
            res.json(user);
        })
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
        // role: Joi.string().valid(Role.Admin, Role.User).required()
    })
    validateRequest(req, next, schema)
}

function register(req, res, next) {
    authService.register(req.body, req.get('origin'))
        .then(() => res.json({ message: "Registration successful, please check your email for verification instructions"}))
        .catch(next)
}

function verifyEmailSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function verifyEmail(req, res, next) {
    authService.verifyEmail(req.body)
        .then(() => res.json({ message: 'Verification successful, you can now login' }))
        .catch(next);
}

function forgotPasswordSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().email().required()
    });
    validateRequest(req, next, schema);
}

function forgotPassword(req, res, next) {
    authService.forgotPassword(req.body, req.get('origin'))
        .then(() => res.json({ message: 'Please check your email for password reset instructions' }))
        .catch(next);
}

function resetPasswordSchema(req, res, next) {
    const schema = Joi.object({
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    });
    validateRequest(req, next, schema);
}

function resetPassword(req, res, next) {
    authService.resetPassword(req.body, req.params.confirm_token)
        .then(() => res.json({ message: 'Password reset successful, you can now login' }))
        .catch(next);
}


function setTokenCookie(res, token) {
    // create cookie with refresh token that expires in 7 days
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 1*24*60*60*1000)
    };
    res.cookie('token', token, cookieOptions);
}
function logOut(req, res, next) {
    authService.logOut(req.user.id, req.cookies)
        .then(() => res.json({ message: "Logged out successfully"}))
        .catch(next)
}