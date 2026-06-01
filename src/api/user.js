import { request } from '@/utils/request'

export const userApi = {
    login() {
        return request('user.login')
    },

    getProgress() {
        return request('user.getProgress')
    },

    saveProgress(currentIndex, answers) {
        return request('user.saveProgress', { currentIndex, answers })
    },

    submitResult(answers) {
        return request('user.submitResult', { answers })
    },

    getCredits() {
        return request('user.getCredits')
    },

    deductCredit() {
        return request('user.deductCredit')
    },

    addAdReward() {
        return request('user.addAdReward')
    },

    topUpCredits(amount) {
        return request('user.topUpCredits', { amount })
    },

    vipRenew() {
        return request('user.vipRenew')
    }
}
