const config = require('../config.json')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update
};

async function getAll() {
    return await db.Post.findAll();
}

async function getById(id) {
    return await getPost(id);
}

async function create(params) {
    await db.Post.create(params);
}

async function update(id, params) {
    const post = await getPost(id);

    // // validate
    // const usernameChanged = params.username && user.username !== params.username;
    // if (usernameChanged && await db.User.findOne({ where: { username: params.username } })) {
    //     throw 'Username "' + params.username + '" is already taken';
    // }

    // // hash password if it was entered
    // if (params.password) {
    //     params.hash = await bcrypt.hash(params.password, 10);
    // }

    // copy params to user and save
    Object.assign(post, params);
    await post.save();

    // return omitHashAndPassword(user.get());
    return post.get()
}

// async function _delete(id) {
//     const user = await getUser(id);
//     await user.destroy();
// }

// helper functions

async function getPost(id) {
    const post = await db.Post.findByPk(id);
    if (!post) throw 'Post not found';
    return post;
}

// function omitHashAndPassword(user) {
//     const { hash, password, ...userWithoutHash } = user;
//     return userWithoutHash;
// }