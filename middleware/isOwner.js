const db = require('../helpers/db');
const Role = require('../helpers/role')

module.exports = { post, comment, likeComment };

function post() {
    return [
        async (req, res, next) => {
            console.log(req.user)
            const post = await db.Post.findByPk(req.params.id);
            if (!post || post === null)
                return res.status(404).json({ message: 'Post Not Found' })
            if (Number(post.author) !== req.user.id && req.user.role != Role.Admin) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            next();
        }   
    ]   
}

function comment() {
    return [
        async (req, res, next) => {
            const comment = await db.Comment.findByPk(req.params.id);
            if (!comment || comment === null)
                return res.status(404).json({ message: 'Comment Not Found' })
            if (Number(comment.author) !== req.user.id && req.user.role != Role.Admin) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            next();
        }   
    ]   
}

function likeComment() {
    return [
        async (req, res, next) => {
            const comment = await db.Comment.findByPk(req.params.id);
            if (!comment || comment === null)
                return res.status(404).json({ message: 'Comment Not Found' })
            const like = await db.Like.findOne( { where: {
                    CommentId: comment.id
            }} );
            if (Number(like.author) !== req.user.id && req.user.role != Role.Admin) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            next();
        }   
    ]   
}
