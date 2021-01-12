const config = require('../config.json')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helpers/db');
const { Op } = require('sequelize');
const paginate = require('../helpers/pagination')
module.exports = {
    getById,
    delete: _delete
    // update,
};


async function getById(id) {
    return await getComment(id);
}

async function _delete(id) {
    const comment = await getComment(id);
    await comment.destroy();
}

//helper function
async function getComment(id) {
    const comment = await db.Comment.findByPk(id);
    if (!comment) throw 'Comment not found';
    return comment;
}
