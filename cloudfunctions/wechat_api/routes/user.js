async function login(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const openId = wxContext.OPENID

    if (!openId) {
        return { code: 1, message: '获取用户身份失败' }
    }

    // 查找或创建用户
    let res = await db.collection('shared_users').where({ openId }).get()
    let user

    if (res.data.length === 0) {
        // 新用户
        const data = {
            openId,
            creditBalance: 10,
            isVip: false,
            vipExpireAt: null,
            adRewardCount: 0,
            testCount: 0,
            personalityType: '',
            personalityTypeName: '',
            createdAt: db.serverDate(),
            updatedAt: db.serverDate()
        }
        const createRes = await db.collection('shared_users').add({ data })
        user = { ...data, _id: createRes._id }
    } else {
        user = res.data[0]
    }

    // 查询测试进度
    const progressRes = await db.collection('wechat_test_progress').where({ userId: user._id }).orderBy('updatedAt', 'desc').limit(1).get()
    const progress = progressRes.data[0] || null

    // 查询最新结果
    const resultRes = await db.collection('wechat_test_results').where({ userId: user._id }).orderBy('createdAt', 'desc').limit(1).get()
    const result = resultRes.data[0] || null

    let testStatus = 'not_started'
    if (result) testStatus = 'completed'
    else if (progress && progress.completed === false) testStatus = 'in_progress'

    return {
        code: 0,
        data: {
            loggedIn: true,
            isNewUser: res.data.length === 0,
            user,
            testStatus,
            progress: progress
                ? {
                      id: progress._id,
                      currentIndex: progress.currentIndex || 0,
                      totalQuestions: progress.totalQuestions || 30,
                      answers: progress.answers || []
                  }
                : null,
            result: result
                ? {
                      type: result.type,
                      typeName: result.typeName,
                      dimScores: result.dimScores,
                      typeTags: result.typeTags || [],
                      typeReport: result.typeReport || {}
                  }
                : null
        }
    }
}

async function getProgress(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const openId = wxContext.OPENID
    const userRes = await db.collection('shared_users').where({ openId }).get()
    if (userRes.data.length === 0) return { code: 1, message: '用户不存在' }
    const userId = userRes.data[0]._id

    const progressRes = await db.collection('wechat_test_progress').where({ userId }).orderBy('updatedAt', 'desc').limit(1).get()
    const progress = progressRes.data[0] || null

    const resultRes = await db.collection('wechat_test_results').where({ userId }).orderBy('createdAt', 'desc').limit(1).get()
    const result = resultRes.data[0] || null

    let testStatus = 'not_started'
    if (result) testStatus = 'completed'
    else if (progress && progress.completed === false) testStatus = 'in_progress'

    return {
        code: 0,
        data: {
            testStatus,
            progress: progress
                ? {
                      id: progress._id,
                      currentIndex: progress.currentIndex || 0,
                      totalQuestions: progress.totalQuestions || 30,
                      answers: progress.answers || []
                  }
                : null,
            result: result
                ? {
                      type: result.type,
                      typeName: result.typeName,
                      dimScores: result.dimScores,
                      typeTags: result.typeTags || [],
                      typeReport: result.typeReport || {}
                  }
                : null
        }
    }
}

async function saveProgress(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const userRes = await db.collection('shared_users').where({ openId: wxContext.OPENID }).get()
    if (userRes.data.length === 0) return { code: 1, message: '用户不存在' }
    const userId = userRes.data[0]._id
    const { currentIndex, answers } = event

    await db.collection('wechat_test_progress').add({
        data: { userId, currentIndex, answers, totalQuestions: 30, completed: false, updatedAt: db.serverDate() }
    })

    return { code: 0, message: '已保存' }
}

async function submitResult(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const openId = wxContext.OPENID
    const userRes = await db.collection('shared_users').where({ openId }).get()
    if (userRes.data.length === 0) return { code: 1, message: '用户不存在' }
    const userId = userRes.data[0]._id
    const { answers } = event

    // 简化计分逻辑：统计各维度答案
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
    for (const a of answers || []) {
        if (scores[a.val] !== undefined) scores[a.val]++
    }

    // 计算四维倾向
    const dim1 = scores.E >= scores.I ? 'E' : 'I'
    const dim2 = scores.F >= scores.T ? 'F' : 'T'
    const dim3 = scores.J >= scores.P ? 'J' : 'P'
    const dim4 = scores.S >= scores.N ? 'S' : 'N'

    // 从数据库查找匹配的人格类型
    const typeRes = await db
        .collection('shared_personality_types')
        .where({
            'dims.E': dim1,
            'dims.F': dim2,
            'dims.J': dim3,
            'dims.S': dim4
        })
        .get()

    const typeData = typeRes.data[0]
    const type = typeData?.id || dim1 + dim2 + dim3 + dim4
    const typeName = typeData?.name || '未知'
    const typeTags = typeData?.tags || []
    const typeReport = typeData?.report || {}

    const resultData = {
        userId,
        answers,
        type,
        typeName,
        dimScores: {
            E: scores.E,
            I: scores.I,
            S: scores.S,
            N: scores.N,
            T: scores.T,
            F: scores.F,
            J: scores.J,
            P: scores.P
        },
        typeTags,
        typeReport,
        createdAt: db.serverDate()
    }

    const res = await db.collection('wechat_test_results').add({ data: resultData })
    await db
        .collection('shared_users')
        .doc(userId)
        .update({
            data: { personalityType: type, personalityTypeName: typeName, testCount: db.command.inc(1), updatedAt: db.serverDate() }
        })

    return { code: 0, data: { id: res._id, type, typeName, typeTags, typeReport, dimScores: resultData.dimScores } }
}

async function getCredits(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const userRes = await db.collection('shared_users').where({ openId: wxContext.OPENID }).get()
    if (userRes.data.length === 0) return { code: 1, message: '用户不存在' }
    const user = userRes.data[0]

    return {
        code: 0,
        data: {
            creditBalance: user.creditBalance || 0,
            isVip: user.isVip || false,
            vipExpireAt: user.vipExpireAt || null,
            adRewardCount: user.adRewardCount || 0,
            dailyFreeUsed: user.dailyFreeUsed || 0
        }
    }
}

async function deductCredit(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const userRes = await db.collection('shared_users').where({ openId: wxContext.OPENID }).get()
    if (userRes.data.length === 0) return { code: 1, message: '用户不存在' }
    const user = userRes.data[0]

    if (user.isVip && user.vipExpireAt && new Date(user.vipExpireAt) > new Date()) {
        return { code: 0, data: { creditBalance: user.creditBalance, isVip: true } }
    }

    if ((user.creditBalance || 0) <= 0 && (user.dailyFreeUsed || 0) >= 3) {
        return { code: 2, message: '次数不足' }
    }

    const updateData = {}
    if ((user.creditBalance || 0) > 0) {
        updateData.creditBalance = db.command.inc(-1)
    } else {
        updateData.dailyFreeUsed = db.command.inc(1)
    }

    await db
        .collection('shared_users')
        .doc(user._id)
        .update({ data: { ...updateData, updatedAt: db.serverDate() } })

    return {
        code: 0,
        data: {
            creditBalance: Math.max(0, (user.creditBalance || 0) - 1),
            dailyFreeUsed: (user.dailyFreeUsed || 0) + 1
        }
    }
}

async function addAdReward(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const userRes = await db.collection('shared_users').where({ openId: wxContext.OPENID }).get()
    if (userRes.data.length === 0) return { code: 1, message: '用户不存在' }
    const user = userRes.data[0]

    const adRewardCount = (user.adRewardCount || 0) + 1
    await db
        .collection('shared_users')
        .doc(user._id)
        .update({
            data: { creditBalance: db.command.inc(1), adRewardCount, updatedAt: db.serverDate() }
        })

    return { code: 0, data: { creditBalance: (user.creditBalance || 0) + 1, adRewardCount } }
}

async function topUpCredits(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const userRes = await db.collection('shared_users').where({ openId: wxContext.OPENID }).get()
    if (userRes.data.length === 0) return { code: 1, message: '用户不存在' }
    const user = userRes.data[0]
    const { amount } = event

    if (amount > 0) {
        await db
            .collection('shared_users')
            .doc(user._id)
            .update({
                data: { creditBalance: db.command.inc(amount), updatedAt: db.serverDate() }
            })
    }

    return { code: 0, data: { creditBalance: (user.creditBalance || 0) + (amount || 0) } }
}

async function vipRenew(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const userRes = await db.collection('shared_users').where({ openId: wxContext.OPENID }).get()
    if (userRes.data.length === 0) return { code: 1, message: '用户不存在' }
    const user = userRes.data[0]

    const vipExpireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    await db
        .collection('shared_users')
        .doc(user._id)
        .update({
            data: { isVip: true, vipExpireAt, updatedAt: db.serverDate() }
        })

    return { code: 0, data: { vipExpireAt } }
}

async function updateProfile(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const openId = wxContext.OPENID
    const { nickName, avatarUrl } = event

    if (!nickName && !avatarUrl) {
        return { code: 1, message: '昵称和头像不能同时为空' }
    }

    const userRes = await db.collection('shared_users').where({ openId }).get()
    if (userRes.data.length === 0) return { code: 1, message: '用户不存在' }
    const user = userRes.data[0]

    const updateData = { updatedAt: db.serverDate() }
    if (nickName) updateData.nickName = nickName
    if (avatarUrl) updateData.avatarUrl = avatarUrl

    await db.collection('shared_users').doc(user._id).update({ data: updateData })

    return {
        code: 0,
        data: {
            nickName: nickName || user.nickName || '',
            avatarUrl: avatarUrl || user.avatarUrl || ''
        }
    }
}

module.exports = { login, getProgress, saveProgress, submitResult, getCredits, deductCredit, addAdReward, topUpCredits, vipRenew, updateProfile }
