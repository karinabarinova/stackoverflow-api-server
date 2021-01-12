const config = require('../config.json')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helpers/db');
const { Op } = require('sequelize');
const paginate = require('../helpers/pagination')
module.exports = {
    create,
    // update,
};

async function create(content, PostId) {
    await db.Comment.create({
        PostId,
        content
    })
}

