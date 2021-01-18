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
    getAllCategories,
    createLike,
    getAllLikes,
    deleteLike,
    lock,
    unlock
};

async function getAll(query) {
    const { q, page, limit} = query
    var { order_by, order_direction, fromDate, toDate, status, category } = query
    if (order_by !== "id" && order_by !== "createdAt" 
    && order_by !== 'updatedAt' && order_by !== 'rating')
        order_by = "rating"//should be number of likes
    if (order_direction !== "desc" && order_direction !== "asc")
        order_direction = "desc"

    let search = {}
    let filter1 = []
    let filter2 = []
    let filterStatus = []
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

    if (fromDate && toDate)
        filter1.push([new Date(fromDate), new Date(toDate)])
    if (category)
        filter2.push(["category", category])

    if (status && (status === "active" || status === "inactive"))
        filterStatus.push([status])

    const transform = (posts) => {
        return posts.map(post => {
            return {
                title: post.title,
                content: post.content,
                rating: post.rating
            }
        })
    }

    const posts = await paginate(db.Post, page, limit, search, filter1, filter2, filterStatus, order, transform)
    return { data: posts} 
}

async function getById(id) {
    return await getPost(id);
}

async function create(params, author) {
    params.author = author;
    const post = await db.Post.create(params);
    const categories = params.categories.split(" ")
    for (var category of categories) {
        var categoryExists = await db.Category.findOne({ where: { title: category}})
        if (categoryExists)
            await categoryExists.addPost(post)
        else {
            const newCategory = await db.Category.create({title: category})
            await newCategory.addPost(post)
        }
    }
    
}

async function update(id, params) {
    const post = await getPost(id);
    if (post.lock_expires > new Date(Date.now()))
        throw "This post is locked. Please contact Admin to unlock it"

    Object.assign(post, params);
    await post.save();

    return post.get()
}

async function _delete(id) {
    const post = await getPost(id);
    if (post.lock_expires > new Date(Date.now()))
        throw "You cannot delete locked post. Please contact Admin to unlock it"

    await post.destroy();
}

async function deleteLike(id) {
    await getPost(id)
    const like = await db.Like.findOne( { where: {
        PostId: id
    }} );
    likeTypeToRemove = like.type === 'like' ? 'dislike' : 'like'
    await like.destroy();
    updateUserRating(id, likeTypeToRemove)
}

async function createComment(author, content, PostId) {
    const post = await getPost(PostId)
    if (post.lock_expires > new Date(Date.now()))
        throw "You cannot add comments to locked posts"
    if (post.status === 'active') {
        await db.Comment.create({
            author,
            PostId,
            content
        })
    } else {
        throw 'You cannot add comments under inactive posts'
    }
    
}

async function getAllComments(PostId) {
    await getPost(PostId)
    return await db.Comment.findAll({ where: {
        PostId
    }})   
}

async function getAllCategories(PostId) {
    await getPost(PostId)
    return await db.Post.findAll({ 
        where: {id: PostId},
        attributes: [],
        include: [{
            model: db.Category,
            as: 'categories',
            through: {
                attributes: []
            }
    }]})
}

async function createLike(params, author, PostId) {
    await getPost(PostId)
    //check if like/dislike already is in the table
    if (await db.Like.findOne({ where: { author, type: params.type } })) {
        throw `You cannot ${params.type} this post again`;
    }

    params.author = author;
    params.PostId = PostId
    await db.Like.create(params);
    updateUserRating(params.PostId, params.type)
    updatePostRating(params.postId, params.type)
}

async function getAllLikes(PostId) {
    await getPost(PostId)
    const likes = await db.Like.findAll({ where: {
        PostId,
    }, include: { 
        model: db.Post,
        as: "post",
        where: {
            status: "active"
        }
    }})

    for ( var prop in likes) {
        likes[prop] = basicDetails(likes[prop].dataValues)
    }
    return likes
}

async function lock(PostId) {
    const post = await getPost(PostId)
    if (post.lock_expires > new Date(Date.now()))
        throw "You cannot lock the locked post again"
    post.lock_expires = new Date(Date.now() + 3*24*60*60*1000) //3 days
    await post.save()
}

async function unlock(PostId) {
    const post = await getPost(PostId)
    if (!(post.lock_expires > new Date(Date.now())))
        throw "This post is not locked"
    post.lock_expires = null //3 days
    await post.save()
}
// helper functions

async function getPost(id) {
    const post = await db.Post.findByPk(id);
    if (!post) throw 'Post not found';
    return post;
}

async function updateUserRating(postId, likeType) {
    const post = await db.Post.findOne({ where: {
        id: postId
    }})
    const user = await db.User.findByPk(post.author)

    if (likeType === 'like')
        await user.increment('rating')
    else 
        if (user.rating > 0)
            user.decrement('rating')
    await user.save()
}

async function updatePostRating(postId, likeType) {
    const post = await db.Post.findOne({ where: {
        id: postId
    }})

    if (likeType === 'like')
        await post.increment('rating')
    else 
        if (post.rating > 0)
            post.decrement('rating')
    await post.save()
}

function basicDetails(like) {
    const { id, author, publish_date, type, PostId, CommentId } = like;
    return { id, author, publish_date, type, PostId, CommentId };
}