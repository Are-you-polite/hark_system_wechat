<script setup>
import { useUserStore } from '@/stores/user'
import { useUser } from '@/hooks/useUser'

onLaunch(async (options) => {
    wx.cloud.init({ env: 'listen-inward-d9gu8craaab975d29' })
    const store = useUserStore()
    const user = useUser()
    await user.silentLogin()
    user.fetchCredits()

    const query = options?.query || {}
    if (query.inviterId) {
        store.setInviter(query.inviterId, query.inviterType || '', query.inviterName || '')
    }
})

onShow((options) => {
    const store = useUserStore()

    const query = options?.query || {}
    if (query.inviterId) {
        store.setInviter(query.inviterId, query.inviterType || '', query.inviterName ? decodeURIComponent(query.inviterName) : '')
        store.freshInviteEntry = true
    }

    if (store.loggedIn) {
        const { fetchCredits } = useUser()
        fetchCredits()
    }
})
</script>

<style lang="scss"></style>
