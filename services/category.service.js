const db = require('../helpers/db');

module.exports = {
    getAll,
    getById,
    getAllPosts,
    create,
    update,
    delete: _delete
};

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

async function create(params) {
    const exists = db.Category.findOne({ where: {title: params.title}})
    if (exists)
        throw 'Category already exists'
    await db.Category.create(params);

}

async function update(params, id) {
    const category = await getCategory(id);

    Object.assign(category, params);
    await category.save();

    return category.get()
}

async function _delete(id) {
    const category = await getCategory(id);
    await category.destroy();

}

//helper functions
async function getCategory(id) {
    const category = await db.Category.findByPk(id);
    if (!category) throw 'Category not found';
    return category;
}
