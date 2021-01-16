const db = require('../helpers/db');
const Role = require('../helpers/role')

module.exports = {
    getById,
    update,
    delete: _delete,
    deleteLike,
    createLike,
    getAllLikes
};


async function getById(id) {
    return await getComment(id);
}

async function getAllLikes(CommentId) {

    await getComment(CommentId)
    const likes = await db.Like.findAll({ where: {
        CommentId,   
    }, include: {
        model: db.Comment,
        as: "comment",
        where: {
            status: "active"
        }
    }})

    return likes
}

async function _delete(id) {
    const comment = await getComment(id);
    await comment.destroy();
}

async function deleteLike(id) {
    const like = await db.Like.findOne( { where: {
        CommentId: id
    }} );
    likeTypeToRemove = like.type === 'like' ? 'dislike' : 'like'
    await like.destroy();
    updateRating(id, likeTypeToRemove)
}

async function update(id, params) {
    const comment = await getComment(id);

    Object.assign(comment, params);
    await comment.save();

    return comment.get()
}

async function createLike(params, author, CommentId) {
    await getComment(CommentId);
    //check if like/dislike already is in the table

    if (await db.Like.findOne({ where: { author, type: params.type } })) {
        throw  `You cannot ${params.type} this comment again`;
    }

    params.author = author;
    params.CommentId = CommentId
    await db.Like.create(params);
    updateRating(params.CommentId, params.type) //??
}

//helper function
async function getComment(id) {
    const comment = await db.Comment.findByPk(id);
    if (!comment) throw 'Comment not found';
    return comment;
}

async function updateRating(commentId, likeType) {
    const comment = await db.Comment.findOne({ where: {
        id: commentId
    }})
    const user = await db.User.findByPk(comment.author)

    if (likeType === 'like')
        user.increment('rating')
    else 
        if (user.rating > 0)
            user.decrement('rating')
    await user.save()
}
