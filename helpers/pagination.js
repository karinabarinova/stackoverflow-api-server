const { Op } = require('sequelize')
const db = require('../helpers/db');


const paginate = async (model, pageSize, pageLimit, search = {}, filter = {}, filterStatus = {}, order = {}, transform) => {
    try {
        const limit = parseInt(pageLimit, 10) || 15
        const page = parseInt(pageSize, 10) || 1

        let options = {
            offset: getOffset(page, limit),
            limit,
            where: {
                status: "active"
            }   
        }

        if (filter && filter.length)
            options.where.createdAt = {[Op.between]: [filter[0][0], filter[0][1]]}
        if (filterStatus && filterStatus.length)
            options.where.status = filterStatus

        if (Object.keys(search).length)
            options = {options, ...search}

        if (order && order.length)
            options['order'] = order
        let {count, rows} = await model.findAndCountAll(options)

        if (transform && typeof transform === 'function')
            rows = transform(rows)

        return {
            previousPage: getPreviousPage(page),
            currentPage: page,
            nextPage: getNextPage(page, limit, count),
            total: count,
            limit,
            filter,
            data: rows
        }
    } catch (e) {
        console.log(e)
        throw 'Internal Server Error' //Fix error printing to next
    }
}

const getOffset = (page, limit) => {
    return (page * limit) - limit
}

const getNextPage = (page, limit, total) => {
    if ((total / limit) > page)
        return page + 1;
    return null
}

const getPreviousPage = (page) => {
    if (page <= 1)
        return null
    return page - 1
}
module.exports = paginate
