const config = require('../config.json')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto')
const { Op } = require('sequelize')
const sendEmail = require('../helpers/send-email')
const db = require('../helpers/db');
const Role = require('../helpers/role')


module.exports = {
    authenticate,
    refreshToken,
    revokeToken,
    register,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    // logOut
};

async function authenticate({ login, email, password, ipAddress }) {
    const user = await db.User.scope('withHash').findOne({ where: { email, login } });

    if (!user || !user.isVerified || !(await bcrypt.compare(password, user.hash))) {
        throw 'Email or password is incorrect';
    }

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(user);
    const refreshToken = generateRefreshToken(user, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(user),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const user = await refreshToken.getUser();

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(user, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const jwtToken = generateJwtToken(user);

    // return basic details and tokens
    return {
        ...basicDetails(user),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    console.log('Before')
    console.log(refreshToken)
    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    console.log("After revoke")
    console.log(refreshToken)
    await refreshToken.save();
}

async function register(params, origin) {
    // validate
    if (await db.User.findOne({ where: { email: params.email } })) {
        // send already registered error in email to prevent account enumeration
        return await sendAlreadyRegisteredEmail(params.email, origin);
    }
    // create account object
    const user = new db.User(params);

    // first registered account is an admin
    const isFirstAccount = (await db.User.count()) === 0;
    user.role = isFirstAccount ? Role.Admin : Role.User;
    user.verificationToken = randomTokenString();
    // hash password
    user.hash = await hash(params.password);

    // save account
    await user.save();

    // send email
    await sendVerificationEmail(user, origin);
}

async function verifyEmail({ token }) {
    const user = await db.User.findOne({ where: { verificationToken: token } });

    if (!user) throw 'Verification failed';

    user.verified = Date.now();
    user.verificationToken = null;
    await user.save();
}

async function forgotPassword({ email }, origin) {
    const user = await db.User.findOne({ where: { email } });

    // always return ok response to prevent email enumeration
    if (!user) return;

    // create reset token that expires after 24 hours
    user.resetToken = randomTokenString();
    user.resetTokenExpires = new Date(Date.now() + 24*60*60*1000);
    await user.save();

    // send email
    await sendPasswordResetEmail(user, origin);
}

async function validateResetToken({ token }) {
    const user = await db.User.findOne({
        where: {
            resetToken: token,
            resetTokenExpires: { [Op.gt]: Date.now() }
        }
    });

    if (!user) throw 'Invalid token';

    return user;
}

async function resetPassword({ password }, token) {
    const user = await validateResetToken({ token });

    // update password and remove reset token
    user.hash = await hash(password);
    user.passwordReset = Date.now();
    user.resetToken = null;
    await user.save();
}

//helper functions
async function getRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne({ where: { token } });
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}

function generateJwtToken(user) {
    // create a jwt token containing the account id that expires in 15 minutes
    return jwt.sign({ sub: user.id, id: user.id }, config.secret, { expiresIn: '15m' });
}

function generateRefreshToken(user, ipAddress) {
    // create a refresh token that expires in 7 days
    return new db.RefreshToken({
        userId: user.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 1*24*60*60*1000), //1 day
        createdByIp: ipAddress
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

async function sendVerificationEmail(user, origin) {
    let message;
    if (origin) {
        const verifyUrl = `${origin}/api/auth/verify-email?token=${user.verificationToken}`;
        message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to verify your email address with the <code>/api/auth/verify-email</code> api route:</p>
                   <p><code>${user.verificationToken}</code></p>`;
    }

    await sendEmail({
        to: user.email,
        subject: 'Sign-up USOF API - Verify Email',
        html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`
    });
}

async function sendAlreadyRegisteredEmail(email, origin) {

    let message;
    if (origin) {
        message = `<p>If you don't know your password please visit the <a href="${origin}/api/auth/password-reset">forgot password</a> page.</p>`;
    } else {
        message = `<p>If you don't know your password you can reset it via the <code>/api/auth/password-reset</code> api route.</p>`;
    }

    await sendEmail({
        to: email,
        subject: 'Sign-up USOF API - Email Already Registered',
        html: `<h4>Email Already Registered</h4>
               <p>Your email <strong>${email}</strong> is already registered.</p>
               ${message}`
    });
}

async function sendPasswordResetEmail(user, origin) {
    let message;
    if (origin) {
        const resetUrl = `${origin}/api/auth/password-reset?token=${user.resetToken}`;
        message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to reset your password with the <code>/api/auth/password-reset</code> api route:</p>
                   <p><code>${user.resetToken}</code></p>`;
    }

    await sendEmail({
        to: user.email,
        subject: 'Sign-up USOF API - Reset Password',
        html: `<h4>Reset Password Email</h4>
               ${message}`
    });
}

function basicDetails(user) {
    const { id, login, email, role, created, updated, isVerified } = user;
    return { id, login, email, role, created, updated, isVerified };
}

async function hash(password) {
    return await bcrypt.hash(password, 10);
}

// async function logOut(id, { refreshToken }) {
//     const row = await db.RefreshToken.findOne( {where: {UserId: id, token: refreshToken }})
//     console.log(row.dataValues.expires)
//     if (!row)
//         throw "Invalid token in cookies"
//     row.expires = new Date(Date.now())
//     await row.save()
//     console.log(row.dataValues.expires)
// }