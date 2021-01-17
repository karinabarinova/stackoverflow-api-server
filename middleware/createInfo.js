
const bcrypt = require('bcryptjs');

module.exports = createUserInfo;

async function createUserInfo(user) {
    //check if users empty

    const users = await user.findAll()
    if (users.length === 0) {
        var params = [
            { login: "alex", email: "alex@gmail.com", fullName: "Alex Norton", role: "User", verified: Date.now(), hash: await hash("secretpass")},
            { login: "tom", email: "tom@gmail.com", fullName: "Tom Norton", role: "User", verified: Date.now(), hash: await hash("secretpass")},
            { login: "anna", email: "anna@gmail.com", fullName: "Anna Norton", role: "User", verified: Date.now(), hash: await hash("secretpass")},
            { login: "fin", email: "fin@gmail.com", fullName: "Fin Norton", role: "User", verified: Date.now(), hash: await hash("secretpass")},
            { login: "jessica", email: "jessica@gmail.com", fullName: "Jessica Norton", role: "User", verified: Date.now(), hash: await hash("secretpass")},
            { login: "karina", email: "karina@gmail.com", fullName: "Karina Norton", role: "Admin", verified: Date.now(), hash: await hash("secretpass")},
        ]
        user.bulkCreate(params)
    }
}

async function hash(password) {
    return await bcrypt.hash(password, 10);
}
