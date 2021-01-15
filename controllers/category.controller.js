const express = require('express')
const router = express.Router()
const Joi = require('joi')
const validateRequest = require('../middleware/validate-request')
const authorize = require('../middleware/authorize')
const isOwner = require('../middleware/isOwner')
const categoryService = require('../services/category.service')

module.exports = router
//routers
router.get('/', getAll) //public TO DO: Add pagination
// router.get('/:id', getById)

function getAll(req, res, next) {
    categoryService.getAll()
        .then(posts => res.json(posts))
        .catch(next);
}