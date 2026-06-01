export const useUserStore = defineStore('user', () => {
    const loggedIn = ref(false)
    const isNewUser = ref(false)
    const user = ref(null)

    const creditBalance = ref(0)
    const isVip = ref(false)
    const vipExpireAt = ref(null)
    const adRewardCount = ref(0)
    const adRewardMax = ref(5)
    const dailyFreeUsed = ref(0)
    const dailyFreeTotal = ref(3)

    const testStatus = ref('not_started')
    const currentIndex = ref(0)
    const totalQuestions = ref(30)
    const answers = ref([])
    const progressId = ref(null)
    const result = ref(null)

    const loading = ref(false)

    const hasTested = computed(() => testStatus.value === 'completed')
    const hasProgress = computed(() => testStatus.value === 'in_progress')
    const progressPercent = computed(() => (totalQuestions.value > 0 ? (currentIndex.value / totalQuestions.value) * 100 : 0))

    const personalityType = computed(() => result.value?.type || user.value?.personalityType || '')
    const personalityTypeName = computed(() => result.value?.typeName || user.value?.personalityTypeName || '')
    const isVipActive = computed(() => isVip.value && vipExpireAt.value && new Date(vipExpireAt.value) > new Date())
    const remainingCredits = computed(() => creditBalance.value)

    function setUser(userData) {
        user.value = userData
        loggedIn.value = true
        creditBalance.value = userData.creditBalance || 0
        isVip.value = userData.isVip || false
        vipExpireAt.value = userData.vipExpireAt || null
        adRewardCount.value = userData.adRewardCount || 0
    }

    function setTestProgress(data) {
        testStatus.value = data.testStatus
        if (data.progress) {
            currentIndex.value = data.progress.currentIndex || 0
            totalQuestions.value = data.progress.totalQuestions || 30
            answers.value = data.progress.answers || []
            progressId.value = data.progress.id || null
        }
        if (data.result) result.value = data.result
    }

    function updateProgress(index, ans) {
        currentIndex.value = index
        answers.value = ans
        testStatus.value = 'in_progress'
    }

    function setTestResult(r) {
        testStatus.value = 'completed'
        result.value = r
        if (user.value) {
            user.value.personalityType = r.type
            user.value.personalityTypeName = r.typeName
        }
    }

    function resetTest() {
        testStatus.value = 'not_started'
        currentIndex.value = 0
        answers.value = []
        progressId.value = null
        result.value = null
    }

    function setCredits(data) {
        creditBalance.value = Number(data.creditBalance) || 0
        isVip.value = data.isVip || false
        vipExpireAt.value = data.vipExpireAt || null
        adRewardCount.value = data.adRewardCount || 0
        dailyFreeUsed.value = data.dailyFreeUsed || 0
    }

    function logout() {
        loggedIn.value = false
        user.value = null
        testStatus.value = 'not_started'
        currentIndex.value = 0
        answers.value = []
        result.value = null
        creditBalance.value = 0
        isVip.value = false
        vipExpireAt.value = null
        adRewardCount.value = 0
    }

    return {
        loggedIn,
        isNewUser,
        user,
        creditBalance,
        isVip,
        vipExpireAt,
        adRewardCount,
        adRewardMax,
        dailyFreeUsed,
        dailyFreeTotal,
        testStatus,
        currentIndex,
        totalQuestions,
        answers,
        progressId,
        result,
        loading,
        hasTested,
        hasProgress,
        progressPercent,
        personalityType,
        personalityTypeName,
        isVipActive,
        remainingCredits,
        setUser,
        setTestProgress,
        updateProgress,
        setTestResult,
        resetTest,
        setCredits,
        logout
    }
})
