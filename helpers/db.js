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
    db.User = require('../users/model')(sequelize)
    db.Post = require('../posts/model')(sequelize)
    //relations
    db.User.hasMany(db.Post, { as: "Posts", foreignKey: "author"})
    db.Post.belongsTo(db.User, { as: "User", foreignKey: "author"})
    //sync all models with database
    await sequelize.sync()
}