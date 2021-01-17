const config = require('../config.json')
const mysql = require('mysql2/promise')
const { Sequelize } = require('sequelize');
const createUserInfo = require('../middleware/createInfo')

module.exports = db = {}

initialize()

async function initialize() {
    //create db  if doesn't exist
    const { host, port, user, password, database } = config.database
    const connection = await mysql.createConnection({host, port, user, password})
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`)

    //connect to db
    const sequelize = new Sequelize(database, user, password, {dialect: 'mysql'})
    db.User = require('../models/user.model')(sequelize)
    db.userToken = require('../models/userToken.model')(sequelize)
    db.Post = require('../models/post.model')(sequelize)
    db.Comment = require('../models/comment.model')(sequelize)
    db.Like = require('../models/like.model')(sequelize)
    db.Category = require('../models/category.model')(sequelize)
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
    db.Like.belongsTo(db.Post, { 
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
    
    //sync all models with database
    await sequelize.sync()
    await createUserInfo(db.User)

}