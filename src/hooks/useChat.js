import { useUserStore } from '@/stores/user'
import { chatApi } from '@/api/chat'
import { useUser } from './useUser'

export function useChat() {
    const store = useUserStore()
    const { deductCredit, addAdReward, fetchCredits } = useUser()

    const messages = ref([])
    const inputText = ref('')
    const scrollToId = ref('')
    const streaming = ref(false)
    const aiConfig = ref(null)
    const showNoCredits = ref(false)
    const currentChatId = ref('')

    const greetingText = ref('你好！我是你的专属AI性格分析师。我已经阅读了你的性格报告，随时准备为你解答任何关于性格、人际关系、职业发展等方面的问题。')

    const suggestions = ref(['我的性格适合什么工作？', '如何提升人际关系？', '我的优势和短板是什么？', '如何在压力下保持冷静？'])

    function scrollToBottom() {
        scrollToId.value = ''
        nextTick(() => {
            scrollToId.value = 'scroll-bottom'
        })
    }

    async function initChat(chatId) {
        await fetchCredits()
        try {
            const res = await chatApi.getAiConfig()
            if (res.code === 0) {
                aiConfig.value = res.data
                if (store.personalityTypeName) {
                    greetingText.value = `你好！我是你的专属AI性格分析师。我已经了解了你的性格类型「${store.personalityTypeName}」，随时准备为你解答关于性格、人际关系、职业发展等方面的问题。`
                }
            }
        } catch (e) {
            console.error('[chat] 获取AI配置失败', e)
        }

        // 加载历史消息
        if (chatId) {
            currentChatId.value = chatId
            try {
                const detail = await chatApi.getDetail(chatId)
                if (detail.code === 0 && detail.data.messages) {
                    messages.value = detail.data.messages
                }
            } catch (e) {
                console.error('[chat] 加载历史消息失败', e)
            }
        }
    }

    async function sendMessage() {
        const text = inputText.value.trim()
        if (!text || streaming.value) return

        if (!aiConfig.value) {
            uni.showToast({ title: 'AI 配置未加载，请稍后再试', icon: 'none' })
            return
        }

        if (!store.isVipActive && store.creditBalance <= 0) {
            const d = await fetchCredits()
            if (!store.isVipActive && (d?.creditBalance || 0) <= 0) {
                showNoCredits.value = true
                return
            }
        }

        if (!store.isVipActive) {
            const ok = await deductCredit()
            if (!ok) {
                showNoCredits.value = true
                return
            }
        }

        inputText.value = ''
        messages.value.push({ role: 'user', content: text })
        scrollToBottom()

        if (!currentChatId.value) {
            const saveRes = await chatApi.saveChat('', text, text.slice(0, 50), [])
            if (saveRes.code === 0) {
                currentChatId.value = saveRes.data.chatId
            }
        }

        const aiIndex = messages.value.length
        messages.value.push({ role: 'ai', content: '', reasoning_content: '', reasoningExpanded: false })
        streaming.value = true
        scrollToBottom()

        try {
            const history = messages.value.slice(0, -1).map((m) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content
            }))

            const streamRes = await chatApi.stream(aiConfig.value?.systemPrompt || '', history, aiConfig.value)

            for await (const event of streamRes.eventStream) {
                if (event.data === '[DONE]') break
                try {
                    const data = JSON.parse(event.data)
                    const delta = data?.choices?.[0]?.delta || data?.delta || data
                    let updated = false

                    if (delta.reasoning_content || delta.reasoning || delta.thinking) {
                        messages.value[aiIndex].reasoning_content += delta.reasoning_content || delta.reasoning || delta.thinking || ''
                        messages.value[aiIndex].reasoningExpanded = true
                        updated = true
                    }
                    if (delta.content) {
                        messages.value[aiIndex].content += delta.content
                        updated = true
                    }
                    if (updated) {
                        messages.value = [...messages.value]
                        scrollToBottom()
                    }
                } catch {
                    // skip malformed event
                }
            }
        } catch {
            messages.value[aiIndex].content = '抱歉，我暂时无法回答，请稍后再试。'
        } finally {
            streaming.value = false
            messages.value = [...messages.value]
            scrollToBottom()

            // 更新聊天记录摘要
            if (currentChatId.value) {
                const reply = messages.value[aiIndex]?.content || ''
                const preview = (text + ' ' + reply).slice(0, 80)
                chatApi.saveChat(
                    currentChatId.value,
                    text,
                    preview,
                    messages.value.map((m) => ({ role: m.role, content: m.content }))
                )
            }
        }
    }

    function sendSuggestion(text) {
        inputText.value = text
        sendMessage()
    }

    async function watchAd() {
        uni.showToast({ title: '观看广告...', icon: 'none' })
        const ok = await addAdReward()
        if (ok) showNoCredits.value = false
    }

    function goBuy() {
        showNoCredits.value = false
        uni.navigateTo({ url: '/pages/member/subscribe' })
    }

    return {
        messages,
        inputText,
        scrollToId,
        streaming,
        showNoCredits,
        greetingText,
        suggestions,
        initChat,
        sendMessage,
        sendSuggestion,
        watchAd,
        goBuy,
        scrollToBottom
    }
}
