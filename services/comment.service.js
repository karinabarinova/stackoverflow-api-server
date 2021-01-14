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
    }})

    return likes
}

async function _delete(id) {
    const comment = await getComment(id);
    await comment.destroy();
}

async function deleteLike(id, user) {
    console.log(user)
    await getComment(id);
    const like = await db.Like.findOne( { where: {
        CommentId: id
    }} );
    console.log(like.author)
    if (Number(like.author) !== user.id && user.role != Role.Admin) {
        throw 'Unauthorized';
    }
    await like.destroy();
    // updateRating(id, )
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
    updateRating(params.CommentId, params.type)
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
        user.rating++
    else 
        if (user.rating > 0)
            user.rating--
    await user.save()
}
