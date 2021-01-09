module.exports = isAdmin

function isAdmin(requestor) {
    return requestor.role === 'admin'
}
