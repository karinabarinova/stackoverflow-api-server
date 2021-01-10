const { DataTypes, Sequelize } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        author: {
            type: DataTypes.STRING,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
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
        categories: {
            type: DataTypes.STRING,
            allowNull: false,
            get() {
                return this.getDataValue('categories').split(';')
            },
            set(value) {
                return this.setDataValue('categories', value.join(';'))
            }
        }
    }

    return sequelize.define('Post', attributes, {})
}