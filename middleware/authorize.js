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
        async (req, res, next) => {
            const authHeader = req.headers['authorization']
            const token = authHeader && authHeader.split(' ')[1]

            if (!token && !roles.includes('guest'))
                return res.status(401).json({ message: 'Unauthorized' });

            const validateToken = await db.userToken.findOne({where:{token}})

            if (!validateToken || validateToken.expires < new Date(Date.now())) {
                if (roles.includes('guest')) {
                    req.user = { id: 0 }
                    next()
                }
                else
                    return res.status(401).json({ message: 'Unauthorized' });
            }

            jwt.verify(token, secret, async (err, user) => {

                if (err)
                    return res.status(403).json({ message: 'Invalid Token' })//token has expired
                
                const dbUser = await db.User.findOne({ where: { id: user.id }})

                if (!dbUser || (roles.length && !roles.includes(dbUser.role)))
                    return res.status(401).json({ message: 'Unauthorized' })
                req.user = user
                req.user.role = dbUser.role

                next()
            })
        }
    ];
}