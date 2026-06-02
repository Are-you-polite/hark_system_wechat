/**
 * 匹配功能云函数路由
 * getInviteInfo  — 获取邀请者信息 + B 的测试状态
 * confirm        — 确认匹配（计算契合度 + 生成匹配记录）
 * list           — 获取我的匹配列表
 * getDetail      — 获取匹配报告详情（所有数据来自 DB，无硬编码）
 */

// ====== 维度字母 → 中文标签 ======
const DIM_LABELS = {
    E: '外向',
    I: '内向',
    S: '实感',
    N: '直觉',
    T: '理性',
    F: '感性',
    J: '计划',
    P: '随性'
}

const DIM_NAMES = { EI: '社交能量', SN: '认知方式', TF: '处事风格', JP: '生活态度' }

// ====== 契合度计算 ======
function calcCompatibility(typeA, typeB) {
    if (!typeA || !typeB) {
        return { score: 0, dimComparison: {}, matchedDims: 0, totalDims: 4, hasTypeMatch: false }
    }

    const dimKeys = ['EI', 'SN', 'TF', 'JP']
    function getDimVal(type, dim) {
        if (dim === 'EI') return type.dims?.E || type.id?.[0] || ''
        if (dim === 'SN') return type.dims?.S || type.id?.[1] || ''
        if (dim === 'TF') return type.dims?.F || type.id?.[2] || ''
        if (dim === 'JP') return type.dims?.J || type.id?.[3] || ''
        return ''
    }

    let matchedDims = 0
    const dimComparison = {}
    for (const d of dimKeys) {
        const a = getDimVal(typeA, d)
        const b = getDimVal(typeB, d)
        const match = a === b
        if (match) matchedDims++
        dimComparison[d] = { a, b, match }
    }

    const baseScore = (matchedDims / 4) * 100
    const matchTypes = typeA?.report?.matchTypes || []
    const hasTypeMatch = matchTypes.includes(typeB?.id || '')
    const score = Math.min(100, baseScore + (hasTypeMatch ? 15 : 0))

    return { score, dimComparison, matchedDims, totalDims: 4, hasTypeMatch }
}

// ====== 从数据库生成维度解读 ======
function buildDimDetail(dim, valA, valB, match, typeA, typeB) {
    const aTag = DIM_LABELS[valA] || valA
    const bTag = DIM_LABELS[valB] || valB

    // 从双方数据库内容提取关键词用于评语
    const tagsA = (typeA?.tags || []).slice(0, 2).join('、')
    const tagsB = (typeB?.tags || []).slice(0, 2).join('、')

    const comment = match ? `双方都偏${aTag}，在${DIM_NAMES[dim] || dim}上容易达成一致` + (tagsA && tagsB ? `。${typeA?.name || ''} 的 ${tagsA} 与 ${typeB?.name || ''} 的 ${tagsB} 互相印证` : '') : `${typeA?.name || '一方'}偏${aTag}，${typeB?.name || '另一方'}偏${bTag}，形成自然互补` + (tagsA ? `。${typeA?.name || ''}的${tagsA}与${typeB?.name || ''}的${bTag}特质可以互相借鉴` : '')

    return {
        a: valA,
        b: valB,
        match,
        aLabel: aTag,
        bLabel: bTag,
        comment
    }
}

// ====== 从数据库生成关系建议 ======
function buildAdvice(typeA, typeB) {
    const reportA = typeA?.report || {}
    const reportB = typeB?.report || {}

    // 从数据库的真实数据生成建议
    const strengths = []
    if (reportA.summary) strengths.push(`${typeA?.name}：${reportA.summary}`)
    if (reportB.summary) strengths.push(`${typeB?.name}：${reportB.summary}`)
    if (reportA.strengths?.length) strengths.push(`✨ ${typeA?.name}优势：${reportA.strengths.slice(0, 2).join('、')}`)
    if (reportB.strengths?.length) strengths.push(`✨ ${typeB?.name}优势：${reportB.strengths.slice(0, 2).join('、')}`)
    if (strengths.length === 0) strengths.push('互相了解，发现更多可能性')

    const weaknesses = []
    if (reportA.weaknesses?.length) weaknesses.push(`${typeA?.name}需留意：${reportA.weaknesses.slice(0, 2).join('、')}`)
    if (reportB.weaknesses?.length) weaknesses.push(`${typeB?.name}需留意：${reportB.weaknesses.slice(0, 2).join('、')}`)
    if (weaknesses.length === 0) weaknesses.push('互相尊重彼此的差异')

    const growth = []
    if (reportA.growth?.length) growth.push(`${typeA?.name}成长建议：${reportA.growth[0]}`)
    if (reportB.growth?.length) growth.push(`${typeB?.name}成长建议：${reportB.growth[0]}`)
    if (growth.length === 0) growth.push('多沟通，发挥各自优势，理解彼此的不同')

    return {
        strengths: strengths.join('\n'),
        weakness: weaknesses.join('\n'),
        growth: growth.join('\n')
    }
}

async function getInviteInfo(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const openId = wxContext.OPENID
    const { inviterId } = event

    if (!inviterId) return { code: 1, message: '缺少邀请者信息' }

    const inviterRes = await db.collection('shared_users').doc(inviterId).get()
    if (!inviterRes.data) return { code: 1, message: '邀请者不存在' }
    const inviter = inviterRes.data

    const userRes = await db.collection('shared_users').where({ openId }).get()
    if (userRes.data.length === 0) return { code: 1, message: '用户不存在' }
    const user = userRes.data[0]

    const matchRes = await db
        .collection('shared_match_records')
        .where({
            $or: [
                { userA: inviterId, userB: user._id },
                { userA: user._id, userB: inviterId }
            ]
        })
        .get()

    // 从 DB 查 personality type 数据
    const typesToFetch = [inviter.personalityType, user.personalityType].filter(Boolean)
    let typeData = []
    for (const t of typesToFetch) {
        const tr = await db.collection('shared_personality_types').where({ id: t }).get()
        if (tr.data.length > 0) typeData.push(tr.data[0])
    }

    const typeA = typeData.find((t) => t.id === inviter.personalityType)
    const typeB = typeData.find((t) => t.id === user.personalityType)

    let preview = ''
    if (typeA && typeB) {
        const comp = calcCompatibility(typeA, typeB)
        preview = comp.hasTypeMatch ? `${typeA.name} 和 ${typeB.name} 是互相吸引的组合 ✨` : `${typeA.name} 和 ${typeB.name} 有不一样的精彩`
    }

    return {
        code: 0,
        data: {
            inviter: {
                _id: inviter._id,
                nickName: inviter.nickName || '好友',
                avatarUrl: inviter.avatarUrl || '',
                personalityType: inviter.personalityType || '',
                personalityTypeName: inviter.personalityTypeName || ''
            },
            myTestStatus: user.personalityType ? 'completed' : 'not_started',
            myType: user.personalityType || '',
            myTypeName: user.personalityTypeName || '',
            alreadyMatched: matchRes.data.length > 0,
            matchId: matchRes.data.length > 0 ? matchRes.data[0]._id : '',
            preview,
            inviterTags: typeA?.tags || []
        }
    }
}

async function confirm(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const openId = wxContext.OPENID
    const { inviterId } = event

    if (!inviterId) return { code: 1, message: '缺少邀请者信息' }

    const inviterRes = await db.collection('shared_users').doc(inviterId).get()
    if (!inviterRes.data) return { code: 1, message: '邀请者不存在' }
    const inviter = inviterRes.data

    const userRes = await db.collection('shared_users').where({ openId }).get()
    if (userRes.data.length === 0) return { code: 1, message: '用户不存在' }
    const user = userRes.data[0]

    const existingRes = await db
        .collection('shared_match_records')
        .where({
            $or: [
                { userA: inviterId, userB: user._id },
                { userA: user._id, userB: inviterId }
            ]
        })
        .get()
    if (existingRes.data.length > 0) {
        return { code: 0, data: { matchId: existingRes.data[0]._id, alreadyMatched: true } }
    }

    // 从 DB 查 personality type
    const typeIds = [inviter.personalityType, user.personalityType].filter(Boolean)
    let typeData = []
    for (const t of typeIds) {
        const tr = await db.collection('shared_personality_types').where({ id: t }).get()
        if (tr.data.length > 0) typeData.push(tr.data[0])
    }
    const typeA = typeData.find((t) => t.id === inviter.personalityType)
    const typeB = typeData.find((t) => t.id === user.personalityType)

    const compatibility = calcCompatibility(typeA, typeB)

    const resultsRes = await db
        .collection('wechat_test_results')
        .where({
            $or: [{ userId: inviterId }, { userId: user._id }]
        })
        .orderBy('createdAt', 'desc')
        .get()

    const resultA = resultsRes.data.find((r) => r.userId === inviterId)
    const resultB = resultsRes.data.find((r) => r.userId === user._id)

    const now = db.serverDate()
    const matchData = {
        userA: inviterId,
        userB: user._id,
        typeA: inviter.personalityType,
        typeB: user.personalityType,
        typeNameA: inviter.personalityTypeName || typeA?.name || '',
        typeNameB: user.personalityTypeName || typeB?.name || '',
        userAName: inviter.nickName || '好友',
        userBName: user.nickName || '我',
        inviterId,
        dimScoresA: resultA?.dimScores || {},
        dimScoresB: resultB?.dimScores || {},
        compatibilityScore: compatibility.score,
        compatibilityData: compatibility,
        tags: [],
        status: 'matched',
        createdAt: now,
        matchedAt: now
    }

    const createRes = await db.collection('shared_match_records').add({ data: matchData })

    return {
        code: 0,
        data: {
            matchId: createRes._id,
            alreadyMatched: false,
            ...matchData,
            matchedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        }
    }
}

async function list(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const openId = wxContext.OPENID

    const userRes = await db.collection('shared_users').where({ openId }).get()
    if (userRes.data.length === 0) return { code: 1, message: '用户不存在' }
    const userId = userRes.data[0]._id

    const matchRes = await db
        .collection('shared_match_records')
        .where({
            $or: [{ userA: userId }, { userB: userId }]
        })
        .orderBy('matchedAt', 'desc')
        .get()

    if (matchRes.data.length === 0) {
        return { code: 0, data: { list: [] } }
    }

    const otherIds = matchRes.data.map((m) => (m.userA === userId ? m.userB : m.userA))
    const otherUsers = {}
    for (const id of otherIds) {
        const ur = await db.collection('shared_users').doc(id).get()
        if (ur.data) {
            otherUsers[id] = {
                nickName: ur.data.nickName,
                avatarUrl: ur.data.avatarUrl,
                personalityType: ur.data.personalityType,
                personalityTypeName: ur.data.personalityTypeName || ''
            }
        }
    }

    const list = matchRes.data.map((m) => {
        const isInviter = m.inviterId === userId
        const otherId = m.userA === userId ? m.userB : m.userA
        const other = otherUsers[otherId] || {}
        return {
            matchId: m._id,
            otherUser: {
                _id: otherId,
                nickName: other.nickName || '好友',
                avatarUrl: other.avatarUrl || '',
                personalityType: other.personalityType || '',
                personalityTypeName: other.personalityTypeName || ''
            },
            typeA: m.typeA,
            typeB: m.typeB,
            typeNameA: m.typeNameA || '',
            typeNameB: m.typeNameB || '',
            compatibilityScore: m.compatibilityScore || 0,
            direction: isInviter ? 'invited' : 'received',
            matchedAt: m.matchedAt
        }
    })

    return { code: 0, data: { list } }
}

async function getDetail(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const openId = wxContext.OPENID
    const { matchId } = event

    if (!matchId) return { code: 1, message: '缺少匹配记录ID' }

    const userRes = await db.collection('shared_users').where({ openId }).get()
    if (userRes.data.length === 0) return { code: 1, message: '用户不存在' }
    const userId = userRes.data[0]._id

    const matchRes = await db.collection('shared_match_records').doc(matchId).get()
    if (!matchRes.data) return { code: 1, message: '匹配记录不存在' }
    const match = matchRes.data

    // 查双方用户信息
    const ids = [match.userA, match.userB]
    const users = {}
    for (const id of ids) {
        const ur = await db.collection('shared_users').doc(id).get()
        if (ur.data) users[id] = ur.data
    }

    // 从 DB 查双方 personality type 完整数据
    const typeIds = [match.typeA, match.typeB].filter(Boolean)
    let typeData = []
    for (const t of typeIds) {
        const tr = await db.collection('shared_personality_types').where({ id: t }).get()
        if (tr.data.length > 0) typeData.push(tr.data[0])
    }
    const typeA = typeData.find((t) => t.id === match.typeA)
    const typeB = typeData.find((t) => t.id === match.typeB)

    // 重新计算匹配度
    const compatibility = match.compatibilityData || calcCompatibility(typeA, typeB)

    // 用数据库内容生成每个维度的解读
    const dimDetails = {}
    for (const [dim, val] of Object.entries(compatibility.dimComparison || {})) {
        dimDetails[dim] = buildDimDetail(dim, val.a, val.b, val.match, typeA, typeB)
    }

    const dimScoresA = match.dimScoresA || {}
    const dimScoresB = match.dimScoresB || {}

    const userA = users[match.userA] || {}
    const userB = users[match.userB] || {}

    return {
        code: 0,
        data: {
            matchId: match._id,
            userA: {
                _id: match.userA,
                nickName: userA.nickName || match.userAName || '好友',
                avatarUrl: userA.avatarUrl || '',
                personalityType: match.typeA,
                personalityTypeName: match.typeNameA || typeA?.name || '',
                tags: typeA?.tags || [],
                dimScores: dimScoresA
            },
            userB: {
                _id: match.userB,
                nickName: userB.nickName || match.userBName || '我',
                avatarUrl: userB.avatarUrl || '',
                personalityType: match.typeB,
                personalityTypeName: match.typeNameB || typeB?.name || '',
                tags: typeB?.tags || [],
                dimScores: dimScoresB
            },
            compatibilityScore: match.compatibilityScore || compatibility.score,
            compatibilityData: compatibility,
            dimDetails,
            advice: buildAdvice(typeA, typeB),
            isMe: match.userA === userId ? 'userA' : 'userB',
            matchedAt: match.matchedAt
        }
    }
}

module.exports = { getInviteInfo, confirm, list, getDetail }
