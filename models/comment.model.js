const { DataTypes, Sequelize } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        publish_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }

    return sequelize.define('Comment', attributes, {})
}