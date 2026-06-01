const { paginate } = require('../utils/db')

async function list(event, { db }) {
    const { page = 1, pageSize = 50 } = event
    return paginate(db, 'shared_questions', { page, pageSize, query: { status: 'active' }, orderBy: { field: 'sort', dir: 'asc' } })
}

module.exports = { list }
