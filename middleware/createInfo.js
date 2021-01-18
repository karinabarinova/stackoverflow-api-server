
const bcrypt = require('bcryptjs');

module.exports = {
    userInfo,
    postInfo
}

async function userInfo(user) {
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

async function postInfo(post, dbCategory) {
    //check if posts empty
    const posts = await post.findAll()
    if (posts.length === 0) {
        var params = [
            { title: "Selecting an element by the class name after insertAdjacentHTML", author: 1, status: "active", content: "So when I click my start button, this function is working and I can see it"},
            { title: "Draw animated line around differences between images", author: 2, status: "active", content: "What it's going is taking two images, highlighting the differences between the two. It draws a red line to show the different pixels. I was wondering if I could possibly have the line drawn from a starting position and you can watch the line draw itself until it's complete?"},
            { title: "Playing a sound while an alert is displayed", author: 4, status: "inactive", content: "I need a sound to play while or before a score alert pops up (simple dinosaur game). Right now it just shows the alert and then it plays the sound. I have tried to set a timeout but it doesn't work."},
            { title: "How do I return the dataframe from a function in Python?", author: 4, status: "active", content: "x is my dataframe name.I pass it to dataDct , which is a dictionary, as a key. This returns me the dataframe when i don't use this function and just type the dataframe name manually. This dictionary is not declared inside the function."},
            { title: "Create post reaction using jQuery", author: 5, status: "active", content: "I'm trying to generate a jQuery code with post review functionality. What I want to create looks like the image below"},
        ]
        var categories = ["DOM HTML", "Animation", "Javascript DOM", "Python", "Javascript DOM HTML"]
        await post.bulkCreate(params)
        for(let i = 1; i <= categories.length; i++) {
            var p = await post.findOne({ where: {id: i}})
            var category = categories[i - 1].split(" ")
            for (c of category) {
                var categoryExists = await dbCategory.findOne({ where: { title: c}})
                if (categoryExists)
                    await categoryExists.addPost(p)
                else {
                    var newCategory = await dbCategory.create({title: c})
                    await newCategory.addPost(p)
                }
            }
        }
    }
}
async function hash(password) {
    return await bcrypt.hash(password, 10);
}
