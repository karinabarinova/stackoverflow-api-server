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
app.use('/api/users', require('./users/controller'))
app.use('/api/auth', require('./auth/controller'))
app.use('/api/posts', require('./posts/controller'))
//global error handler
app.use(errorHandler)
//start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))