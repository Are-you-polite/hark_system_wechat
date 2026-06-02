const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

const routes = {
    'user.login': require('./routes/user').login,
    'user.getProgress': require('./routes/user').getProgress,
    'user.saveProgress': require('./routes/user').saveProgress,
    'user.submitResult': require('./routes/user').submitResult,
    'user.getCredits': require('./routes/user').getCredits,
    'user.deductCredit': require('./routes/user').deductCredit,
    'user.addAdReward': require('./routes/user').addAdReward,
    'user.topUpCredits': require('./routes/user').topUpCredits,
    'user.vipRenew': require('./routes/user').vipRenew,
    'user.updateProfile': require('./routes/user').updateProfile,
    'questions.list': require('./routes/questions').list,
    'products.list': require('./routes/payment').listProducts,
    'chat.getConfig': require('./routes/chat').getConfig,
    'chat.save': require('./routes/chat').save,
    'chat.list': require('./routes/chat').list,
    'chat.getDetail': require('./routes/chat').getDetail,
    'payment.prepay': require('./routes/payment').prepay,
    'payment.confirm': require('./routes/payment').confirm,
    'payment.list': require('./routes/payment').listOrders,
    'match.getInviteInfo': require('./routes/match').getInviteInfo,
    'match.confirm': require('./routes/match').confirm,
    'match.list': require('./routes/match').list,
    'match.getDetail': require('./routes/match').getDetail
}

exports.main = async (event) => {
    const { action } = event

    if (!action) {
        return { code: 1, message: '缺少 action 参数' }
    }

    const handler = routes[action]
    if (!handler) {
        return { code: 1, message: `未知 action: ${action}` }
    }

    try {
        const ctx = { cloud, db }
        return await handler(event, ctx)
    } catch (err) {
        return { code: 1, message: err.message }
    }
}
