const config = require('../config.json')
const mysql = require('mysql2/promise')
const { Sequelize } = require('sequelize');
const create = require('../middleware/createInfo')

module.exports = db = {}

initialize()

async function initialize() {
    //create db  if doesn't exist
    const { host, port, user, password, database } = config.database
    const connection = await mysql.createConnection({host, port, user, password})
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`)

    //connect to db
    const sequelize = new Sequelize(database, user, password, {dialect: 'mysql', logging: false})
    db.User = require('../models/user.model')(sequelize)
    db.userToken = require('../models/userToken.model')(sequelize)
    db.Post = require('../models/post.model')(sequelize)
    db.Comment = require('../models/comment.model')(sequelize)
    db.Like = require('../models/like.model')(sequelize)
    db.Category = require('../models/category.model')(sequelize)
    db.Subcribers = require('../models/subscribers.model')(sequelize)
    //define relations
    db.User.hasMany(db.userToken, {onDelete: 'CASCADE', foreignKey: 'userId'})
    db.userToken.belongsTo(db.User, {
        foreignKey: 'userId',
        as: "user"
    })
    db.User.hasMany(db.Post, {
        foreignKey: 'author',
        as: "posts"
    });
    db.Post.belongsTo(db.User, {
        foreignKey: 'author',
        as: "user"
    })
    db.Post.hasMany(db.Comment, {
        as: 'comments',
        onDelete: 'CASCADE'
    })
    db.Comment.belongsTo(db.Post, {
        foreignKey: 'PostId',
        as: "post"
    })
    db.Post.hasMany(db.Like, {
        as: 'likes',
        onDelete: 'CASCADE'
    })
    db.Like.belongsTo(db.Post, { 
        foreignKey: 'PostId',
        as: "post"
    })

    db.Comment.hasMany(db.Like, {
        as: 'likes',
        onDelete: 'CASCADE'
    })
    db.Like.belongsTo(db.Comment, { 
        foreignKey: 'CommentId',
        as: "comment"
    })
    db.Category.belongsToMany(db.Post, {
        through: "post_category",
        as: "posts",
        foreignKey: "category_id"
    })
    db.Post.belongsToMany(db.Category, {
        through: "post_category",
        as: "categories",
        foreignKey: "post_id"
    })
    db.Post.hasMany(db.Subcribers, {
        as: 'subscriber',
        onDelete: 'CASCADE'
    })
    db.Subcribers.belongsTo(db.Post, {
        foreignKey: 'PostId',
        as: "post"
    })
    
    //sync all models with database
    await sequelize.sync()
    await create.userInfo(db.User)
    await create.postInfo(db.Post, db.Category)
    await create.commentInfo(db.Comment)
    await create.likeInfo(db.Like, db.Comment, db.Post, db.User)
}
