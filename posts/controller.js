const express = require('express')
const router = express.Router()
const Joi = require('joi')
const validateRequest = require('../middleware/validate-request')
const authorize = require('../middleware/authorize')
const isAdmin = require('../middleware/isAdmin')
const userService = require('./service')
const postService = require('./service')

//routes
router.get('/', getAll) //public
// router.get('/', authorize(), getAll);
// router.post('/', authorize(), createSchema, create);
// router.get('/:id', authorize(), getById);
// router.patch('/:id', authorize(), updateSchema, update);
// router.delete('/:id', authorize(), _delete);

module.exports = router

function getAll(req, res, next) {
    postService.getAll()
        .then(posts => res.json(posts))
        .catch(next);
}