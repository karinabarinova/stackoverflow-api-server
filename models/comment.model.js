const { DataTypes, Sequelize } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        publish_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            allowNull: false,
            defaultValue: 'active'
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false
        },
        author: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        PostId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Post",
                key: "id"
            }
        }
    }

    return sequelize.define('Comment', attributes, {})
}