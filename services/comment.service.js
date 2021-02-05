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
    unlock,
    createComment
};


async function getById(id) {
    const comment = await getComment(id)
    const author = await db.User.findOne( { where: {id: comment.author } } )
    return {comment, author}
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
    const comment = await getComment(CommentId);
    if (comment.author === author)
        throw `You cannot ${params.type} your own comment`
    //check if like/dislike already is in the table
    if (await db.Like.findOne({ where: { author, type: params.type, CommentId } })) {
        throw  `You cannot ${params.type} this comment again`;
    }

    const previousValue = await db.Like.findOne({ where: { author, CommentId}})
    if (previousValue) {
        likeTypeToRemove = previousValue.type === 'like' ? 'dislike' : 'like'
        updateUserRating(CommentId, likeTypeToRemove)
        updateCommentRating(CommentId, likeTypeToRemove)
        Object.assign(previousValue, params)
        await previousValue.save()
    }

    params.author = author;
    params.CommentId = CommentId
    updateUserRating(params.CommentId, params.type)
    updateCommentRating(params.CommentId, params.type)
    if (!previousValue)
        return await db.Like.create(params);
    return previousValue
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

async function createComment(author, content, CommentId) {
    const comment = await getComment(CommentId)
    if (comment.status === 'active') {
        const subcomment = await db.Subcomment.create({
            author,
            CommentId,
            content
        })
        return subcomment
    } else {
        throw 'You cannot add comments under inactive comments'
    }
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

async function updateCommentRating(commentId, likeType) {
    const comment = await db.Comment.findOne({ where: {
        id: commentId
    }})

    if (likeType === 'like')
        await comment.increment('rating')
    else 
        if (comment.rating > 0)
            await comment.decrement('rating')
    await comment.save()
}
