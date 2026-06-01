const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
    const results = []

    // 创建集合（如果不存在）
    const collections = ['wechat_test_progress', 'wechat_test_results', 'shared_chat_records', 'shared_products']
    for (const name of collections) {
        try {
            await db.createCollection(name)
            results.push({ collection: name, status: 'created' })
        } catch (e) {
            if (e.message && e.message.includes('already exists')) {
                results.push({ collection: name, status: 'exists' })
            } else {
                results.push({ collection: name, status: 'error', error: e.message })
            }
        }
    }

    // 插入默认产品数据
    const productRes = await db.collection('shared_products').where({}).count()
    if (productRes.total === 0) {
        const now = db.serverDate()
        const defaults = [
            { name: '10 次', price: '9.9', product: 'credit_10', amount: 10, desc: '轻量体验', features: ['10 次 AI 深度对话'], sort: 1, status: 'active', createdAt: now, updatedAt: now },
            { name: '50 次', price: '29.9', product: 'credit_50', amount: 50, desc: '超值囤货', features: ['50 次 AI 深度对话'], sort: 2, status: 'active', popular: true, createdAt: now, updatedAt: now },
            { name: '月卡', price: '49.9', product: 'vip_month', amount: 0, desc: '无限畅聊', features: ['30 天无限次对话'], sort: 3, status: 'active', createdAt: now, updatedAt: now }
        ]
        for (const p of defaults) {
            await db.collection('shared_products').add({ data: p })
        }
        results.push({ collection: 'shared_products', action: '插入 3 条默认产品' })
    }

    return { code: 0, data: results }
}
