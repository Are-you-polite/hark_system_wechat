export const useUserStore = defineStore('user', () => {
    const loggedIn = ref(false)
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

    // 个人资料
    const nickName = ref('')
    const avatarUrl = ref('')

    const profileComplete = computed(() => !!nickName.value)

    // 匹配邀请相关
    const inviterId = ref('')
    const inviterType = ref('')
    const inviterName = ref('')
    const pendingMatchInvite = ref(false) // 有邀请待处理（答题完成后弹窗）
    const inviteHandled = ref(false) // 本会话已处理过邀请，防止重复

    const loading = ref(false)

    const hasTested = computed(() => testStatus.value === 'completed')
    const hasProgress = computed(() => testStatus.value === 'in_progress')
    const progressPercent = computed(() => (totalQuestions.value > 0 ? (currentIndex.value / totalQuestions.value) * 100 : 0))

    const personalityType = computed(() => result.value?.type || user.value?.personalityType || '')
    const personalityTypeName = computed(() => result.value?.typeName || user.value?.personalityTypeName || '')
    const isVipActive = computed(() => isVip.value && vipExpireAt.value && new Date(vipExpireAt.value) > new Date())

    function setUser(userData) {
        user.value = userData
        loggedIn.value = true
        creditBalance.value = userData.creditBalance || 0
        isVip.value = userData.isVip || false
        vipExpireAt.value = userData.vipExpireAt || null
        adRewardCount.value = userData.adRewardCount || 0
        nickName.value = userData.nickName || ''
        avatarUrl.value = userData.avatarUrl || ''
    }

    function setProfile(data) {
        if (data.nickName) nickName.value = data.nickName
        if (data.avatarUrl) avatarUrl.value = data.avatarUrl
        if (user.value) {
            if (data.nickName) user.value.nickName = data.nickName
            if (data.avatarUrl) user.value.avatarUrl = data.avatarUrl
        }
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

    function setInviter(id, type, name) {
        inviterId.value = id
        inviterType.value = type || ''
        inviterName.value = name || ''
    }

    function clearInviter() {
        inviterId.value = ''
        inviterType.value = ''
        inviterName.value = ''
        pendingMatchInvite.value = false
    }

    function logout() {
        loggedIn.value = false
        user.value = null
        nickName.value = ''
        avatarUrl.value = ''
        testStatus.value = 'not_started'
        currentIndex.value = 0
        answers.value = []
        result.value = null
        creditBalance.value = 0
        isVip.value = false
        vipExpireAt.value = null
        adRewardCount.value = 0
        clearInviter()
    }

    return {
        loggedIn,
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
        inviterId,
        inviterType,
        inviterName,
        pendingMatchInvite,
        inviteHandled,
        nickName,
        avatarUrl,
        profileComplete,
        loading,
        hasTested,
        hasProgress,
        progressPercent,
        personalityType,
        personalityTypeName,
        isVipActive,
        setUser,
        setTestProgress,
        updateProgress,
        setTestResult,
        resetTest,
        setCredits,
        setInviter,
        clearInviter,
        setProfile,
        logout
    }
})
