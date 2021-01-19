const bcrypt = require('bcryptjs');
const db = require('../helpers/db');
const Role = require('../helpers/role')

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    uploadAvatar,
    getAvatar
};

async function getAll() {
    const users = await db.User.findAll();
    return users.map(x => basicDetails(x))
}

async function getById(id) {
    const user = await getUser(id);
    return basicDetails(user)
}

async function create(params) {
    // validate
    if (await db.User.findOne({ where: { login: params.login } })) {
        throw 'Login ' + params.login + ' is already taken';
    }

    if(await db.User.findOne({ where: { email: params.email } }))
        throw 'Email ' + params.email + ' is already used by another user';
    const user = new db.User(params)
    user.verified = Date.now()
    // hash password
    user.hash = await hash(params.password)
    await user.save()
    return basicDetails(user)
}

async function update(id, params) {
    const user = await getUser(id);

    // validate
    const usernameChanged = params.username && user.username !== params.username;
    if (usernameChanged && await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username "' + params.username + '" is already taken';
    }

    if (params.email && user.email !== params.email && await db.User.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = await hash(params.password);
    }

    // copy params to user and save
    Object.assign(user, params);
    user.updated = Date.now()
    await user.save();

    return basicDetails(user);
}

async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}

async function uploadAvatar(id, file, protocol, host) {
    if (!file)
        throw 'No image provided'
    const user = await getUser(id)
    user.avatar = file.path
    await user.save()
    
}

async function getAvatar(userId) {
    const user = await db.User.findOne({
        attributes: ['avatar'],
        where: {
            id: userId
        },
        raw: true
    })

    if (!user)
        throw 'User not found'
    if (!user.avatar)
        throw 'Avatar not found'
    return user
}

// helper functions

async function getUser(id) {
    const user = await db.User.findByPk(id);
    if (!user) throw 'User not found';
    return user;
}

async function hash(password) {
    return await bcrypt.hash(password, 10);
}

function basicDetails(user) {
    const { id, login, email, role, created } = user;
    return { id, login, email, role, created };
}
