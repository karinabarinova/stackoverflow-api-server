const db = require('../helpers/db');
const Role = require('../helpers/role')

module.exports = { post };

function post() {
    return [
        async (req, res, next) => {
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
