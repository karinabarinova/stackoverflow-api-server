const express = require('express')
const router = express.Router()
const Joi = require('joi')
// const multer = require('multer')
const validateRequest = require('../middleware/validate-request')
const authorize = require('../middleware/authorize')
const Role = require('../helpers/role')
const userService = require('../services/user.service')

// const upload = multer( {
//     // dest: 'resources/avatars',
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter(req, file, cb) {
//         if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
//             return cb(new Error('Please upload an image'))
//         cb(undefined, true)
//     }
// })

//routes
router.get('/', authorize(Role.Admin), getAll);
router.post('/', authorize(Role.Admin), createSchema, create);
router.get('/:id', authorize(), getById);
router.patch('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);
// router.post('/avatar', authorize(), upload.single('avatar'), uploadAvatar, (error, req, res, next) => {
//     res.status(400).json({ error: error.message })
// })

module.exports = router

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

function getById(req, res, next) {

    if (Number(req.params.id) !== req.user.id && req.user.role != Role.Admin)
        return res.status(401).json({ message: "Unauthorized" })

    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(next)
}

function updateSchema(req, res, next) {
    const schemaRules = {
        email: Joi.string().email().empty(''),
        login: Joi.string().empty(''),
        password: Joi.string().min(7).empty(''),
        fullName: Joi.string().empty(),
        repeat_password: Joi.any().equal(Joi.ref('password'))
            .label('Confirm password')
            .options({ messages: { 'any.only': '{{#label}} does not match'} })
    }
    if (req.user.role === Role.Admin) {
        schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty('')
        schemaRules.rating = Joi.number()
    }
    
    const schema = Joi.object(schemaRules).with('password', 'repeat_password'); //!
    validateRequest(req, next, schema)
}

function update(req, res, next) {
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    userService.update(req.params.id, req.body)
        .then(user => res.json(user))
        .catch(next)
}

function createSchema(req, res, next) {
    const schema = Joi.object({
        login: Joi.string().empty(''),
        email: Joi.string().email(),
        fullName: Joi.string().regex(/^[A-Z]+ [A-Z]+$/i).uppercase(),
        password: Joi.string().min(7).empty(''),
        repeat_password: Joi.any().equal(Joi.ref('password'))
            .required()
            .label('Confirm password')
            .options({ messages: { 'any.only': '{{#label}} does not match'} }),
        role: Joi.string().valid(Role.Admin, Role.User).required()
    })
    validateRequest(req, next, schema)
}

function create(req, res, next) {

    userService.create(req.body)
        .then((user) => res.json(user))
        .catch(next)
    
}

function _delete(req, res, next) {
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    userService.delete(req.params.id)
        .then(() => res.json({message: 'User deleted successfully'}))
        .catch(next)
}

// async function uploadAvatar(req, res, next) {
//     // console.log(req.file)
//     userService.uploadAvatar(req.user.id, req.file)
//         .then(() => res.json({ message: "Avatar uploaded"}))
//         .catch(next)
//     // req.user.avatar = req.file.buffer
//     // await req.user.save()
//     // res.send()
// }
