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
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    logOut
};

async function authenticate({ login, email, password, ipAddress }) {
    const user = await db.User.scope('withHash').findOne({ where: { email: email.toLowerCase(), login: login.toLowerCase() } });

    if (!user || !user.isVerified || !(await bcrypt.compare(password, user.hash))) {
        throw 'Email or password is incorrect';
    }

    // authentication successful so generate jwt and token
    const jwtToken = generateJwtToken(user);
    const tokenRow = new db.userToken({
        userId: user.id,
        token: jwtToken,
        expires: new Date(Date.now() + 1*24*60*60*1000), //1 day
        createdByIp: ipAddress
    });
    await tokenRow.save()
    return {
        ...basicDetails(user),
        jwtToken
    };
}

async function register(params, origin) {
    // validate
    if (await db.User.findOne({ where: { email: params.email } })) {
        // send already registered error in email to prevent account enumeration
        return await sendAlreadyRegisteredEmail(params.email, origin);
    }
    if (await db.User.findOne({ where: { login: params.login } }))
        throw "Username is already taken"
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

function generateJwtToken(user) {
    // create a jwt token containing the account id that expires in 15 minutes
    return jwt.sign({ sub: user.id, id: user.id }, config.secret, { expiresIn: '1h' });
    // return jwt.sign({ sub: user.id, id: user.id }, config.secret);

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

async function logOut(id, {token}) {
    console.log(token)
    const row = await db.userToken.findOne( {where: {UserId: id, token}})
    if (!row)
        throw "Invalid token in cookies"
    row.expires = new Date(Date.now())
    await row.save()
}