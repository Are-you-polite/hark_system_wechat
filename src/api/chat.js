import { request } from '@/utils/request'

export const chatApi = {
    getAiConfig() {
        return request('chat.getConfig')
    },

    saveChat(chatId, title, preview, messages) {
        return request('chat.save', { chatId, title, preview, messages })
    },

    listChats() {
        return request('chat.list')
    },

    getDetail(chatId) {
        return request('chat.getDetail', { chatId })
    },

    async stream(systemPrompt, messages, config) {
        if (!config || !config.group) {
            throw new Error('AI 配置未加载')
        }

        const model = wx.cloud.extend.AI.createModel(config.group)
        const apiMessages = [{ role: 'system', content: systemPrompt }, ...messages.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))]

        return model.streamText({
            data: {
                model: config.model,
                messages: apiMessages,
                temperature: config.temperature || 0.7,
                max_tokens: config.maxTokens || 2048
            }
        })
    }
}
