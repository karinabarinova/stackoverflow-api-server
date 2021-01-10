const jwt = require('express-jwt');
const { secret } = require('../config.json');
const db = require('../helpers/db');

module.exports = authorize;

function authorize(roles = []) {
    if (typeof roles === 'string')
        roles = [roles];
    
    return [
        // authenticate JWT token and attach decoded token to request as req.user
        jwt({ secret, algorithms: ['HS256'] }),

        // attach full user record to request object
        async (req, res, next) => {
            // get user with id from token 'sub' (subject) property
            const user = await db.User.findByPk(req.user.id);

            // check user still exists
            if (!user || (roles.length && !roles.includes(user.role)))
                return res.status(401).json({ message: 'Unauthorized' });

            // authorization successful
            req.user.role = user.role;
            const refreshToken = await user.getRefreshTokens()
            req.user.ownsToken = token => !!refreshToken.find(x => x.token === token)
            // req.user = user.get();
            next();
        }
    ];
}