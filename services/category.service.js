const db = require('../helpers/db');
const { Op } = require('sequelize');
// const paginate = require('../helpers/pagination')
module.exports = {
    getAll,
    getById,
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

async function getAll() {
    return await db.Category.findAll()
}

async function getById(id) {
    return await getCategory(id)
}

//helper functions
async function getCategory(id) {
    const category = await db.Category.findByPk(id);
    if (!category) throw 'Category not found';
    return category;
}
