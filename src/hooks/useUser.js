import { useUserStore } from '@/stores/user'
import { userApi } from '@/api/user'

export function useUser() {
    const store = useUserStore()

    async function silentLogin() {
        if (store.loggedIn) return true
        store.loading = true
        try {
            const res = await userApi.login()
            if (res.code === 0) {
                store.setUser(res.data.user || res.data)
                await fetchProgress()
                return true
            }
            return false
        } catch (e) {
            console.error('[user] 登录失败', e)
            return false
        } finally {
            store.loading = false
        }
    }

    async function fetchProgress() {
        try {
            const res = await userApi.getProgress()
            if (res.code === 0) {
                store.setTestProgress(res.data)
            }
        } catch (e) {
            console.error('[user] 查询进度失败', e)
        }
    }

    async function fetchCredits() {
        try {
            const res = await userApi.getCredits()
            if (res.code === 0) {
                store.setCredits(res.data)
                return res.data
            }
        } catch (e) {
            console.error('[credits] 获取失败', e)
        }
    }

    async function deductCredit() {
        try {
            const res = await userApi.deductCredit()
            if (res.code === 0) {
                store.creditBalance = res.data.creditBalance
                store.dailyFreeUsed = res.data.dailyFreeUsed || store.dailyFreeUsed
                return true
            }
            if (res.code === 2) {
                store.creditBalance = 0
                return false
            }
            return false
        } catch {
            return false
        }
    }

    async function addAdReward() {
        try {
            const res = await userApi.addAdReward()
            if (res.code === 0) {
                store.creditBalance = res.data.creditBalance
                store.adRewardCount = res.data.adRewardCount
                return true
            }
            return false
        } catch {
            return false
        }
    }

    return { silentLogin, fetchProgress, fetchCredits, deductCredit, addAdReward, logout: store.logout }
}
