# Table of Content
# USOF
-[description](#description)

-[installation](#installation)

-[usage](#usage)

-[licenses](#licenses)

-[profile](#profile)

##description:

My challenge was to create an API for a future question and answer service forprofessional and enthusiast programmers. It allows to share your problems/solutions with short posts and receivesolutions/feedback, or even increase your profile rating.

###During the challenge I implemented:<br/>
##Users<br/>

- User and Admin access rights
- User Authentication
- User Registration
- User Login, Logout options
- Option to reset password and verify user email
- CRUD operations for Posts, Comments, Categories, Likes, Subscribers, Users

##Authentication module:<br/>
- POST - /api/auth/register - registration of a new user, required parameters are [login, password, password confirmation, email]<br/>
- POST - /api/auth/login - log in user, required parameters are [login, email,password]. Only users with a confirmed email can sign in<br/>
- POST - /api/auth/logout - log out authorized user<br/>
- POST - /api/auth/password-reset- send a reset link to user email, requiredparameter is [email]<br/>
- POST - /api/auth/password-reset/<confirm_token> - confirm new password with a token from email, required parameter is a [new password]<br/>

##User module:<br/>
- GET - /api/users- get all users<br/>
- GET - /api/users/<user_id> - get specified user data<br/>
- POST - /api/users- create a new user, required parameters are [login, password,password confirmation, email, role]. This feature must be accessible only for admins<br/>
- POST - /api/users/avatar- let an authorized user upload his/her avatar. Theuser will be designated by his/her access token<br/>
- PATCH - /api/users/<user_id>- update user data<br/>
- DELETE - /api/users/<user_id>- delete user<br/>

##Post module:<br/>
- GET - /api/posts- get all posts.This endpoint doesn't require any role, it ispublic. If there are too many posts, you must implement pagination. Page size isup to you<br/>
- GET - /api/posts/<post_id>- get specified post data.Endpoint is public<br/>
- GET - /api/posts/<post_id>/comments- get all comments for the specified post.Endpoint is public<br/>
- POST - /api/posts/<post_id>/comments- create a new comment, required parameteris [content]<br/>
- GET - /api/posts/<post_id>/categories- get all categories associated with thespecified post<br/>
- GET - /api/posts/<post_id>/like- get all likes under the specified post<br/>
- POST - /api/posts/- create a new post, required parameters are [title, content,categories]<br/>
- POST - /api/posts/<post_id>/like- create a new like under a post<br/>
- PATCH - /api/posts/<post_id>- update the specified post (its title, body orcategory). It's accessible only for the creator of the post<br/>
- DELETE - /api/posts/<post_id>- delete a post<br/>
- DELETE - /api/posts/<post_id>/like- delete a like under a post<br/>

##Database tables:<br/>

- Users<br/>
- Posts<br/>
- Comments<br/>
- Categories<br/>
- Likes<br/>
- Subscribers<br/>
- Posts_Categories<br/>
- User Access Tokens<br/>

##installation:

##usage:

##licenses:

##profile: