const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        login: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true
        },
        rating: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 5.0
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            allowNull: false,
            defaultValue: 'user'
        }
    }

    const options = {
        defaultScope: {
            // exclude hash by default
            attributes: { exclude: ['hash'] }
        },
        scopes: {
            // include hash with this scope
            withHash: { attributes: {}, }
        }
    };

    return sequelize.define('User', attributes, options)
}