const express = require('express')
const router = express.Router()
const Joi = require('joi')
const multer = require('multer')
const uuid = require('uuidv1')
const path = require('path')
const validateRequest = require('../middleware/validate-request')
const authorize = require('../middleware/authorize')
const isOwner = require('../middleware/isOwner')
const postService = require('../services/post.service')
const Role = require('../helpers/role')

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, 'resources/media')
//     },
//     filename: function(req, file, cb) {
//         cb(null, file.fieldname + uuid() + path.extname(file.originalname))
//     }
// })
// const media = multer( {
//     storage: storage,
//     dest: 'resources/media',
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter(req, file, cb) {
//         if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
//             return cb(new Error('Please upload an image'))
//         cb(undefined, true)
//     }
// }).single('media')

//routes
router.get('/', getAll) //public TO DO: Add pagination
router.get('/:id', getById)
router.get('/:id/categories', getAllCategories)
router.post('/', authorize(), createSchema, create)
router.patch('/:id', authorize(), isOwner.post(), updateSchema, update)
router.delete('/:id', authorize(), _delete)
router.post('/:id/comments', authorize(), createCommentSchema, createComment)
router.get('/:id/comments', getAllComments)
router.post('/:id/like', authorize(), createLikeSchema, createLike)
router.get('/:id/like', authorize(), getAllLikes)
router.delete('/:id/like', authorize(), deleteLike)
router.post('/:id/lock', authorize(Role.Admin), lock)
router.post('/:id/unlock', authorize(Role.Admin), unlock)
router.post('/:id/subscribe', authorize(), subscribe)
router.post('/:id/unsubscribe', authorize(), unsubscribe)


module.exports = router

function getAll(req, res, next) {
    postService.getAll(req.query)
        .then(posts => res.json(posts))
        .catch(next);
}

function getAllComments(req, res, next) {
    postService.getAllComments(req.params.id)
        .then(posts => res.json(posts))
        .catch(next);
}

function getAllLikes(req, res, next) {
    postService.getAllLikes(req.params.id)
        .then(likes => res.json(likes))
        .catch(next);
}

function getAllCategories(req, res, next) {
    postService.getAllCategories(req.params.id)
        .then(categories => res.json(categories))
        .catch(next);
}

function getById(req, res, next) {
    postService.getById(req.params.id)
        .then(post => res.json(post))
        .catch(next)
}

function createSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().empty(''),
        content: Joi.string().empty(''),
        categories: Joi.string().empty(''),
    })
    validateRequest(req, next, schema)
}

function create(req, res, next) {
    postService.create(req.body, req.user.id)
        .then(() => res.json({ message: "Post Creation successful"}))
        .catch(next)    
}

function updateSchema(req, res, next) {
    const schemaRules = {
        title: Joi.string(),
        content: Joi.string(),
        categories: Joi.string() //TO DO: add status 
    }
    if (req.user.role === Role.Admin) {
        schemaRules.status = Joi.string().valid("active", "inactive")
    }
    
    const schema = Joi.object(schemaRules)
    
    validateRequest(req, next, schema)
}

function update(req, res, next) {
    postService.update(req.params.id, req.body)
        .then(post => res.json(post))
        .catch(next)
}

function lock(req, res, next) {
    postService.lock(req.params.id)
        .then(() => res.json({message: "Post has been locked successfully"}))
        .catch(next)
}

function unlock(req, res, next) {
    postService.unlock(req.params.id)
        .then(() => res.json({message: "Post has been unlocked successfully"}))
        .catch(next)
}

function subscribe(req, res, next) {
    postService.subscribe(req.user.id, req.params.id)
        .then(() => res.json({message: "Subscribed successfully"}))
        .catch(next)
}

function unsubscribe(req, res, next) {
    postService.unsubscribe(req.user.id, req.params.id)
        .then(() => res.json({message: "Unsubscribed successfully"}))
        .catch(next)
}

function _delete(req, res, next) {
    postService.delete(req.params.id)
        .then(() => res.json({message: 'Post deleted successfully'}))
        .catch(next)
}

function deleteLike(req, res, next) {
    postService.deleteLike(req.params.id)
        .then(() => res.json({message: 'Like deleted successfully'}))
        .catch(next)
}

function createCommentSchema(req, res, next) {
    const schema = Joi.object({
        content: Joi.string().empty('').required()
    })
    validateRequest(req, next, schema)
}

function createComment(req, res, next) {
    postService.createComment(req.user.id, req.body.content, req.params.id)
        .then((post) => res.json(post))
        .catch(next)
}

function createLikeSchema(req, res, next) {
    const schema = Joi.object({
        type: Joi.string().empty('').valid("like", "dislike").required()
    })
    validateRequest(req, next, schema)
}

function createLike(req, res, next) {
    postService.createLike(req.body, req.user.id, req.params.id)
        .then(() => res.json({ message: "Like Creation successful"}))
        .catch(next)
}
