const db = require('../helpers/db');
const Role = require('../helpers/role')

module.exports = {
    getById,
    update,
    delete: _delete,
    deleteLike,
    createLike,
    getAllLikes,
    lock,
    unlock
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
    if (comment.lock_expires > new Date(Date.now()))
        throw "You cannot delete the locked comment"
    await comment.destroy();
}

async function deleteLike(id) {
    const like = await db.Like.findOne( { where: {
        CommentId: id
    }} );
    likeTypeToRemove = like.type === 'like' ? 'dislike' : 'like'
    await like.destroy();
    updateUserRating(id, likeTypeToRemove)
}

async function update(id, params) {
    const comment = await getComment(id);

    if (comment.lock_expires > new Date(Date.now()))
        throw "This comment is locked. Please contact admins to unlock it"

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
    updateUserRating(params.CommentId, params.type) //??
}

async function lock(CommentId) {
    const comment = await getComment(CommentId)
    if (comment.lock_expires > new Date(Date.now()))
        throw "You cannot lock the locked comment again"
    comment.lock_expires = new Date(Date.now() + 3*24*60*60*1000) //3 days
    await comment.save()
}

async function unlock(CommentId) {
    const comment = await getComment(CommentId)
    if (!(comment.lock_expires > new Date(Date.now())))
        throw "This comment is not locked"
    comment.lock_expires = null //3 days
    await comment.save()
}

//helper function
async function getComment(id) {
    const comment = await db.Comment.findByPk(id);
    if (!comment) throw 'Comment not found';
    return comment;
}

async function updateUserRating(commentId, likeType) {
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
