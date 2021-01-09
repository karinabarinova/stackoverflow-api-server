const config = require('../config.json')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helpers/db');

module.exports = {
    authenticate
};

async function authenticate({ login, password }) {
    const user = await db.User.scope('withHash').findOne({ where: { login } });

    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'Login or password is incorrect';

    // authentication successful
    const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' });
    return { ...omitHashAndPassword(user.get()), token };
}

//helper functions
function omitHashAndPassword(user) {
    const { hash, password, ...userWithoutHash } = user;
    return userWithoutHash;
}