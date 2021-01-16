// const jwt = require('express-jwt');
const jwt = require('jsonwebtoken')
const { secret } = require('../config.json');
const db = require('../helpers/db');

module.exports = authorize;

function authorize(roles = []) {
    if (typeof roles === 'string')
        roles = [roles];
    
    return [
        // authenticate JWT token and attach decoded token to request as req.user
        // jwt({ secret, algorithms: ['HS256'] }),
        // attach full user record to request object
        async (req, res, next) => {
            // console.log(req)
            // get user with id from token 'sub' (subject) property
            // const user = await db.User.findByPk(req.user.id);

            // // check user still exists
            // if (!user || (roles.length && !roles.includes(user.role)))
            //     return res.status(401).json({ message: 'Unauthorized' });

            // // authorization successful
            // req.user.role = user.role;
            // const refreshToken = await user.getRefreshTokens()
            // req.user.ownsToken = token => !!refreshToken.find(x => x.token === token)
            // // req.user = user.get();
            // console.log(req)
            // console.log(secret)
            const authHeader = req.headers['authorization']
            // const refreshToken = req.cookies.refreshToken;
            // console.log(refreshToken)
            // console.log(authHeader)
            const token = authHeader && authHeader.split(' ')[1]
            if (token === null)
                return res.status(401).json({ message: 'Unauthorized' });
            // const print = await db.RefreshToken.findOne({where:{token: req.cookies.refreshToken}})
            const print = await db.RefreshToken.findOne({where:{token}})
            if (print.expires < new Date(Date.now()))
                return res.status(401).json({ message: 'Unauthorized' });
            //here we need to check if expires greater than Date.now()
            jwt.verify(token, secret, (err, user) => {
                if (err) {
                    console.log('Expired!!')
                    return res.status(403).json({ message: 'Invalid Token' })
                } 
                req.user = user
                // console.log("USER\n\n")
                // console.log(user)
                next()
            })
        }
    ];
}