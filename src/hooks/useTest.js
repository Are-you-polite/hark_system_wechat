import { useUserStore } from '@/stores/user'
import { questionsApi } from '@/api/questions'
import { userApi } from '@/api/user'

export function useTest() {
    const store = useUserStore()
    const questions = ref([])
    const localIndex = ref(0)
    const localAnswers = ref([])
    const localSelected = ref(null)
    const loading = ref(true)

    const total = computed(() => questions.value.length)
    const currentQ = computed(() => questions.value[localIndex.value] || { a: {}, b: {} })
    const progressPercent = computed(() => (total.value > 0 ? ((localIndex.value + 1) / total.value) * 100 : 0))

    const dimLabels = { E: '社交能量', I: '社交能量', F: '处事风格', T: '处事风格', J: '生活态度', P: '生活态度', S: '情绪特质', N: '情绪特质' }

    function dimLabel(d) {
        return dimLabels[d] || ''
    }

    function restoreSelected() {
        const exist = localAnswers.value.find((a) => a.index === localIndex.value)
        localSelected.value = exist ? exist.selected : null
    }

    function selectOption(opt) {
        localSelected.value = opt
        const idx = localAnswers.value.findIndex((a) => a.index === localIndex.value)
        const entry = { index: localIndex.value, selected: opt, val: opt === 'a' ? currentQ.value.a.val : currentQ.value.b.val, questionId: currentQ.value._id }
        if (idx >= 0) localAnswers.value[idx] = entry
        else localAnswers.value.push(entry)
    }

    function prevQuestion() {
        if (localIndex.value > 0) {
            localIndex.value--
            restoreSelected()
        }
    }

    async function nextQuestion() {
        if (!localSelected.value) return
        if (localIndex.value < total.value - 1) {
            localIndex.value++
            restoreSelected()
            if (localIndex.value % 5 === 0) {
                await saveProgress()
            }
        } else {
            await submitResult()
        }
    }

    async function saveProgress() {
        store.updateProgress(localIndex.value, localAnswers.value)
        try {
            await userApi.saveProgress(localIndex.value, localAnswers.value)
        } catch (e) {
            console.error('[test] 保存进度失败', e)
        }
    }

    async function submitResult() {
        uni.showLoading({ title: '生成报告中...' })
        try {
            const answers = localAnswers.value.map((a) => ({
                questionIndex: a.index,
                selected: a.selected,
                val: a.val,
                questionId: a.questionId
            }))
            const res = await userApi.submitResult(answers)
            if (res.code === 0) {
                store.setTestResult(res.data)
                uni.hideLoading()
                uni.showToast({ title: '测试完成！', icon: 'success' })
                setTimeout(() => uni.navigateBack(), 500)
            } else {
                throw new Error(res.message || '提交失败')
            }
        } catch (e) {
            uni.hideLoading()
            uni.showToast({ title: e.message || '提交失败', icon: 'error' })
        }
    }

    async function loadQuestions() {
        loading.value = true
        try {
            if (store.hasProgress && store.answers.length > 0) {
                localIndex.value = store.currentIndex
                localAnswers.value = store.answers.map((a) => ({ ...a }))
            }
            const res = await questionsApi.list()
            if (res.code === 0) {
                questions.value = (res.data.list || []).sort((a, b) => a.sort - b.sort)
                restoreSelected()
            }
        } catch (e) {
            console.error(e)
            uni.showToast({ title: '加载失败', icon: 'error' })
        } finally {
            loading.value = false
        }
    }

    function goBack() {
        if (localAnswers.value.length > 0) {
            store.updateProgress(localIndex.value, localAnswers.value)
            userApi.saveProgress(localIndex.value, localAnswers.value)
        }
        uni.navigateBack()
    }

    return {
        questions,
        localIndex,
        localAnswers,
        localSelected,
        loading,
        total,
        currentQ,
        progressPercent,
        dimLabel,
        selectOption,
        prevQuestion,
        nextQuestion,
        loadQuestions,
        saveProgress,
        submitResult,
        goBack
    }
}
