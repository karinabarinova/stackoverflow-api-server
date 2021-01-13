const { DataTypes, Sequelize } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        author: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "User",
                key: "id"
            }
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
                return this.setDataValue('categories', value)
            }
        },
        // UserId: {
        //     type: Sequelize.INTEGER,
        //     allowNull: false,
            
        // }
    }

    return sequelize.define('Post', attributes, {})
}