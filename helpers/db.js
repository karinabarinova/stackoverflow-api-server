const config = require('../config.json')
const mysql = require('mysql2/promise')
const { Sequelize } = require('sequelize');

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
    db.RefreshToken = require('../models/refresh-token.model')(sequelize)
    db.Post = require('../models/post.model')(sequelize)
    db.Comment = require('../models/comment.model')(sequelize)
    db.Like = require('../models/like.model')(sequelize)

    //define relations
    db.User.hasMany(db.RefreshToken, {onDelete: 'CASCADE'})
    db.RefreshToken.belongsTo(db.User)
    db.User.hasMany(db.Post, {
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
    
    //sync all models with database
    await sequelize.sync()
}