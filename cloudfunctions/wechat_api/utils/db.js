async function paginate(db, collection, { page = 1, pageSize = 10, query = {}, orderBy = { field: 'createdAt', dir: 'desc' } } = {}) {
    const [listRes, totalRes] = await Promise.all([
        db
            .collection(collection)
            .where(query)
            .orderBy(orderBy.field, orderBy.dir)
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .get(),
        db.collection(collection).where(query).count()
    ])
    return { code: 0, data: { list: listRes.data || [], total: totalRes.total || 0 } }
}

module.exports = { paginate }
