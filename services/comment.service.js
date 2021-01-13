const config = require('../config.json')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helpers/db');
const { Op } = require('sequelize');
const paginate = require('../helpers/pagination')
module.exports = {
    getById,
    update,
    delete: _delete
};


async function getById(id) {
    return await getComment(id);
}

async function _delete(id) {
    const comment = await getComment(id);
    await comment.destroy();
}

async function update(id, params) {
    console.log(params)
    const comment = await getComment(id);

    Object.assign(comment, params);
    await comment.save();

    return comment.get()
}

//helper function
async function getComment(id) {
    const comment = await db.Comment.findByPk(id);
    if (!comment) throw 'Comment not found';
    return comment;
}
