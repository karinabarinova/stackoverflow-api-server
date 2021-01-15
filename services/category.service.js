const db = require('../helpers/db');
const { Op } = require('sequelize');
// const paginate = require('../helpers/pagination')
module.exports = {
    getAll,
    getById,
    getAllPosts
    // create,
    // update,
    // delete: _delete,
    // createComment,
    // getAllComments,
    // getAllCategories,
    // createLike,
    // getAllLikes,
    // deleteLike
};

// await getPost(PostId)
//     return await db.Post.findAll({ 
//         where: {id: PostId},
//         attributes: [],
//         include: [{
//             model: db.Category,
//             as: 'categories',
//             through: {
//                 attributes: []
//             }
//     }]})

async function getAll() {
    return await db.Category.findAll()
}

async function getById(id) {
    return await getCategory(id)
}

async function getAllPosts(id) {
    await getCategory(id)
    const posts = await db.Category.findAll({ 
        where: {id},
        attributes: [],
        include: [{
            model: db.Post,
            as: 'posts',
            through: {
                attributes: []
            }
        }]
    })
    return posts[0].posts
}

//helper functions
async function getCategory(id) {
    const category = await db.Category.findByPk(id);
    if (!category) throw 'Category not found';
    return category;
}
