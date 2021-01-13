const { DataTypes, Sequelize, DATE } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        author: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        publish_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
        type: {
            type: DataTypes.ENUM('like', 'dislike'),
            // allowNull: false,
            // defaultValue: 'like'
        },
        PostId: {
            type: DataTypes.INTEGER
        },
        CommentId: {
            type: DataTypes.INTEGER
        }
    }

    return sequelize.define('Like', attributes, {})
}