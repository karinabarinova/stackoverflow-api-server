# Table of Content
# USOF

##description:

My challenge was to create an API for a future question and answer service forprofessional and enthusiast programmers. It allows to share your problems/solutions with short posts and receive solutions/feedback, or even increase your profile rating.

###**During the challenge I implemented**:<br/>

- User and Admin access rights
- User Authentication
- User Registration
- User Login, Logout options
- Option to reset password and verify user email
- CRUD operations for Posts, Comments, Categories, Likes, Subscribers, Users

##**Authentication module**:<br/>
- [x] POST - /api/auth/register - registration of a new user, required parameters are [login, password, password confirmation, email]<br/>
- [x] POST - /api/auth/login - log in user, required parameters are [login, email,password]. Only users with a confirmed email can sign in<br/>
- [x] POST - /api/auth/logout - log out authorized user<br/>
- [x] POST - /api/auth/password-reset - send a reset link to user email, requiredparameter is [email]<br/>
- [x] POST - /api/auth/password-reset/<confirm_token> - confirm new password with a token from email, required parameter is a [new password]<br/>

##**User module**:<br/>
- [x] GET - /api/users - get all users<br/>
- [x] GET - /api/users/<user_id> - get specified user data<br/>
- [x] POST - /api/users - create a new user, required parameters are [login, password,password confirmation, email, role]. This feature must be accessible only for admins<br/>
- [x] POST - /api/users/avatar - let an authorized user upload his/her avatar. Theuser will be designated by his/her access token<br/>
- [x]  - /api/users/<user_id> - update user data<br/>
- [x] DELETE - /api/users/<user_id> - delete user<br/>

##**Post module**:<br/>
- [x] GET - /api/posts- get all posts.This endpoint doesn't require any role, it ispublic. If there are too many posts, you must implement pagination. Page size isup to you<br/>
- [x] GET - /api/posts/<post_id> - get specified post data.Endpoint is public<br/>
- [x] GET - /api/posts/<post_id>/comments - get all comments for the specified post.Endpoint is public<br/>
- [x] POST - /api/posts/<post_id>/comments - create a new comment, required parameteris [content]<br/>
- [x] GET - /api/posts/<post_id>/categories - get all categories associated with thespecified post<br/>
- [x] GET - /api/posts/<post_id>/like - get all likes under the specified post<br/>
- [x] POST - /api/posts/- create a new post, required parameters are [title, content,categories]<br/>
- [x] POST - /api/posts/<post_id>/like - create a new like under a post<br/>
- [x] PATCH - /api/posts/<post_id> - update the specified post (its title, body orcategory). It's accessible only for the creator of the post<br/>
- [x] DELETE - /api/posts/<post_id> - delete a post<br/>
- [x] DELETE - /api/posts/<post_id>/like - delete a like under a post<br/>

##**Categories module**:<br/>
- [x] GET - /api/categories- get all categories<br/>
- [x] GET - /api/categories/<category_id> - get specified category data<br/>
- [x] GET - /api/categories/<category_id>/posts - get all posts associated with thespecified category<br/>
- [x] POST - /api/categories - create a new category, required parameter is [title]<br/>
- [x] PATCH - /api/categories/<category_id> - update specified category data<br/>
- [x] DELETE - /api/categories/<category_id> - delete a category<br/>

##**Comments module**:<br/>
- [x] GET - /api/comments/<comment_id> - get specified comment data<br/>
- [x] GET - /api/comments/<comment_id>/like - get all likes under the specified comment<br/>
- [x] POST - /api/comments/<comment_id>/like - create a new like under a comment<br/>
- [x] PATCH - /api/comments/<comment_id> - update specified comment data<br/>
- [x] DELETE - /api/comments/<comment_id> - delete a comment<br/>
- [x] DELETE - /api/comments/<comment_id>/like - delete a like under a comment<br/>

##**Database tables**:<br/>

- Users<br/>
- Posts<br/>
- Comments<br/>
- Categories<br/>
- Likes<br/>
- Subscribers<br/>
- Posts_Categories<br/>
- User Access Tokens<br/>

#installation:
```md
> npm install
```
#usage:
```md
> node server
```

#dependencies:<br/>
```md
    "bcryptjs": "^2.4.3",<br/>
    "body-parser": "^1.19.0",<br/>
    "cookie-parser": "^1.4.5",<br/>
    "cors": "^2.8.5",<br/>
    "express": "^4.17.1",<br/>
    "express-jwt": "^6.0.0",<br/>
    "express-session": "^1.17.1",<br/>
    "joi": "^17.3.0",<br/>
    "jsonwebtoken": "^8.5.1",<br/>
    "multer": "^1.4.2",<br/>
    "mysql2": "^2.2.5",<br/>
    "nodemailer": "^6.4.17",<br/>
    "rootpath": "^0.1.2",<br/>
    "sequelize": "^6.3.5",<br/>
    "uuidv1": "^1.6.14",<br/>
    node v13 and higher<br/>
    npm v13 and higher<br/>
```
##licenses:<br/>
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

##Author:<br/>
**Karina Barinova** :bowtie: 
