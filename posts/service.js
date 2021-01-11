const config = require('../config.json')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helpers/db');
const { Op } = require('sequelize');
const paginate = require('../helpers/pagination')
module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function getAll(query) {
    const { q, page, limit, order_by, order_direction} = query
    let search = {}
    let order = []

    if (q) {
        search = {
            where: {
                name: {
                    [Op.like]: `%${q}%`
                }
            }
        }
    }

    if (order_by && order_direction)
        order.push([order_by, order_direction])

    const transform = (posts) => {
        return posts.map(post => {
            return {
                title: post.title,
                content: post.content,
                categories: post.categories
            }
        })
    }

    const posts = await paginate(db.Post, page, limit, search, order, transform)
    return { data: posts} //?
    // return await db.Post.findAll();
}

async function getById(id) {
    return await getPost(id);
}

async function create(params, author) {
    params.author = author;
    await db.Post.create(params);
}

async function update(id, params) {
    const post = await getPost(id);

    Object.assign(post, params);
    await post.save();

    return post.get()
}

async function _delete(id) {
    const post = await getPost(id);
    await post.destroy();
}

// helper functions

async function getPost(id) {
    const post = await db.Post.findByPk(id);
    if (!post) throw 'Post not found';
    return post;
}
