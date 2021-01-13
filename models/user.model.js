// const { DataTypes } = require('sequelize');

// module.exports = model;

// function model(sequelize) {
//     const attributes = {
//         id: {
//             type: DataTypes.INTEGER,
//             autoIncrement: true,
//             primaryKey: true,
//             allowNull: false
//         },
//         login: {
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         password: {
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         hash: {
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         fullName: {
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         email: {
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         avatar: {
//             type: DataTypes.STRING,
//             allowNull: true
//         },
//         rating: {
//             type: DataTypes.FLOAT,
//             allowNull: false,
//             defaultValue: 5.0
//         },
//         role: {
//             type: DataTypes.ENUM('user', 'admin'),
//             allowNull: false,
//             defaultValue: 'user'
//         }
//     }

//     const options = {
//         defaultScope: {
//             // exclude hash by default
//             attributes: { exclude: ['hash'] }
//         },
//         scopes: {
//             // include hash with this scope
//             withHash: { attributes: {}, }
//         }
//     };

//     return sequelize.define('User', attributes, options)
// }

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
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
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false
        },
        verificationToken: {type: DataTypes.STRING},
        verified: { type: DataTypes.DATE},
        resetToken: { type: DataTypes.STRING},
        resetTokenExpires: { type: DataTypes.DATE },
        passwordReset: { type: DataTypes.DATE},
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
        updated: { type: DataTypes.DATE},
        isVerified: {
            type: DataTypes.VIRTUAL,
            get() { return !!(this.verified || this.passwordReset); }
        }
        // avatar: {
        //     type: DataTypes.BIGINT
        // }
    }

    const options = {
        timestamps: false,
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