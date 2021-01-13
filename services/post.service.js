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
    delete: _delete,
    createComment,
    getAllComments,
    createLike,
    getAllLikes,
    deleteLike
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
    return { data: posts} 
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

async function deleteLike(id) {
    const like = await db.Like.findOne( { where: {
        PostId: id
    }} );
    await like.destroy();
}

async function createComment(content, PostId) {
    await db.Comment.create({
        PostId,
        content
    })
}

async function getAllComments(PostId) {
    return await db.Comment.findAll({ where: {
        PostId
    }})
    
}

async function createLike(params, author, PostId) {
    params.author = author;
    params.PostId = PostId
    await db.Like.create(params);
    updateRating(params.PostId, params.type)
}

async function getAllLikes(PostId) {
    return await db.Like.findAll({ where: {
        PostId
    }})
    
}
// helper functions

async function getPost(id) {
    const post = await db.Post.findByPk(id);
    if (!post) throw 'Post not found';
    return post;
}

async function updateRating(postId, likeType) {
    const post = await db.Post.findOne({ where: {
        id: postId
    }})
    const user = await db.User.findByPk(post.author)

    if (likeType === 'like')
        user.rating++
    else 
        if (user.rating > 0)
            user.rating--
    await user.save()
}
