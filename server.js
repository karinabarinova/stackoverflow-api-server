require('rootpath')()
const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error-handler')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser());

app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));


//api routes for user, posts, etc
app.use('/api/users', require('./controllers/user.controller'))
app.use('/api/auth', require('./controllers/auth.controller'))
app.use('/api/posts', require('./controllers/post.controller'))
app.use('/api/comments', require('./controllers/comment.controller'))
//global error handler
app.use(errorHandler)
//start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))