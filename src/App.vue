<script setup>
import { useUserStore } from '@/stores/user'
import { useUser } from '@/hooks/useUser'

onLaunch(async () => {
    wx.cloud.init({ env: 'listen-inward-d9gu8craaab975d29' })
    const user = useUser()
    await user.silentLogin()
    user.fetchCredits()
})

onShow(() => {
    const store = useUserStore()
    if (store.loggedIn) {
        const { fetchCredits } = useUser()
        fetchCredits()
    }
})
</script>

<style lang="scss"></style>
