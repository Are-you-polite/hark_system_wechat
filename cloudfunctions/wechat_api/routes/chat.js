async function getConfig(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const openId = wxContext.OPENID

    const modelRes = await db.collection('shared_ai_models').where({ isActive: true }).get()
    const modelConfig = modelRes.data[0]

    if (!modelConfig) {
        return { code: 1, message: '未配置AI模型' }
    }

    let personalityInfo = ''
    const userRes = await db.collection('shared_users').where({ openId }).get()
    const user = userRes.data[0]
    if (user?.personalityType) {
        const typeRes = await db.collection('shared_personality_types').where({ id: user.personalityType }).get()
        const typeData = typeRes.data[0]
        if (typeData) {
            const tags = (typeData.tags || []).join('、')
            personalityInfo = `用户的性格类型是「${typeData.name}」(${typeData.id})，特征标签：${tags}。`
        }
    }

    const basePrompt = modelConfig.systemPrompt || '你是一个专业的性格分析师，根据用户的性格类型提供深入的分析和建议。'
    const systemPrompt = personalityInfo ? `${basePrompt}\n\n${personalityInfo}` : basePrompt

    return {
        code: 0,
        data: {
            group: modelConfig.group,
            model: modelConfig.model,
            systemPrompt,
            temperature: modelConfig.temperature || 0.7,
            maxTokens: modelConfig.maxTokens || 2048
        }
    }
}

// 保存聊天记录（含消息列表）
async function save(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const userRes = await db.collection('shared_users').where({ openId: wxContext.OPENID }).get()
    if (userRes.data.length === 0) return { code: 1, message: '用户不存在' }
    const userId = userRes.data[0]._id

    const { chatId, title, preview, messages } = event
    const now = db.serverDate()

    if (chatId) {
        const updateData = { preview, updatedAt: now }
        if (messages) updateData.messages = messages
        await db.collection('shared_chat_records').doc(chatId).update({ data: updateData })
        return { code: 0, data: { chatId } }
    }

    const res = await db.collection('shared_chat_records').add({
        data: { userId, title: title || '新的对话', preview: preview || '', messages: messages || [], createdAt: now, updatedAt: now }
    })
    return { code: 0, data: { chatId: res._id } }
}

// 获取用户聊天记录列表
async function list(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const userRes = await db.collection('shared_users').where({ openId: wxContext.OPENID }).get()
    if (userRes.data.length === 0) return { code: 1, message: '用户不存在' }
    const userId = userRes.data[0]._id

    const res = await db.collection('shared_chat_records').where({ userId }).orderBy('updatedAt', 'desc').limit(50).get()

    return { code: 0, data: { list: res.data || [] } }
}

// 获取单条聊天记录详情（含消息）
async function getDetail(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const userRes = await db.collection('shared_users').where({ openId: wxContext.OPENID }).get()
    if (userRes.data.length === 0) return { code: 1, message: '用户不存在' }

    const { chatId } = event
    if (!chatId) return { code: 1, message: '缺少聊天记录 ID' }

    const res = await db.collection('shared_chat_records').doc(chatId).get()
    if (!res.data) return { code: 1, message: '聊天记录不存在' }

    return { code: 0, data: res.data }
}

module.exports = { getConfig, save, list, getDetail }
