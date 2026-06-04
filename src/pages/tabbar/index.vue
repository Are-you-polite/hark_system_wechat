<template>
    <view class="pages-wrapper">
        <view class="pages-container" :style="pageStyle">
            <view v-for="tab in tabsList" :key="tab.key" class="page-content">
                <tab-home v-if="tab.key === 'home'" />
                <tab-chats v-else-if="tab.key === 'chats'" />
                <tab-match v-else-if="tab.key === 'match'" />
                <tab-mine v-else-if="tab.key === 'mine'" />
            </view>
        </view>
        <InviteModal v-if="showInviteModal" :invite-state="inviteState" :inviter-name="inviterName" :inviter-avatar-url="inviterAvatarUrl" :match-id="matchedId" @close="showInviteModal = false" @match-done="onMatchDone" />
    </view>
    <view class="custom-tabbar">
        <view class="tabbar-list">
            <view class="tabbar-pill" :style="pillStyle" />
            <view v-for="tab in tabsList" :key="tab.key" class="tabbar-item" @click="currentTab = tab.key">
                <uni-icons :type="tab.icon" size="26" :color="currentTab === tab.key ? '#FFFFFF' : '#808A80'" />
                <text class="tabbar-item-label" :class="{ active: currentTab === tab.key }">{{ tab.label }}</text>
            </view>
        </view>
    </view>
</template>
<script setup>
import tabHome from '@/components/tab-home/index.vue'
import tabChats from '@/components/tab-chats/index.vue'
import tabMatch from '@/components/tab-match/index.vue'
import tabMine from '@/components/tab-mine/index.vue'
import InviteModal from '@/components/InviteModal.vue'
import { useUserStore } from '@/stores/user'
import { matchApi } from '@/api/match'

const currentTab = ref('home')
const mStore = useUserStore()

// 邀请弹窗状态
const showInviteModal = ref(false)
const inviteState = ref('')
const inviterName = ref('')
const inviterAvatarUrl = ref('')
const matchedId = ref('')

onShareAppMessage(() => {
    const p = mStore.user?._id ? `/pages/tabbar/index?inviterId=${encodeURIComponent(mStore.user._id)}&inviterType=${encodeURIComponent(mStore.personalityType)}&inviterName=${encodeURIComponent(mStore.nickName || '')}` : '/pages/tabbar/index'
    return { title: mStore.personalityType ? `我是 ${mStore.personalityType} · ${mStore.personalityTypeName} — 来测测你的性格类型` : '向内倾听 — 了解自己，从倾听内心开始', path: p }
})

onLoad((options) => {
    if (options?.inviterId && !mStore.inviteHandled) {
        mStore.setInviter(options.inviterId, options.inviterType || '', options.inviterName ? decodeURIComponent(options.inviterName) : '')
        mStore.inviteHandled = true
        // 等待登录后拉取邀请信息
        const timer = setInterval(async () => {
            if (mStore.loggedIn) {
                clearInterval(timer)
                await loadInviteInfo()
            }
        }, 200)
        setTimeout(() => clearInterval(timer), 10000)
    }
})

async function loadInviteInfo() {
    try {
        const res = await matchApi.getInviteInfo(mStore.inviterId)
        if (res.code === 0) {
            const data = res.data
            inviterName.value = data.inviter?.nickName || '好友'
            inviterAvatarUrl.value = data.inviter?.avatarUrl?.startsWith('cloud://') ? data.inviter.avatarUrl : ''
            matchedId.value = data.matchId || ''

            if (data.alreadyMatched) {
                inviteState.value = 'already_matched'
            } else if (data.myTestStatus === 'not_started' || data.myTestStatus === 'in_progress') {
                inviteState.value = 'not_tested'
            } else if (!mStore.profileComplete) {
                inviteState.value = 'need_profile'
            } else {
                inviteState.value = 'tested'
            }
            showInviteModal.value = true
        }
    } catch (e) {
        console.error('[invite] 加载失败', e)
    }
}

function onMatchDone(matchId) {
    showInviteModal.value = false
    uni.redirectTo({ url: `/pages/match/result?matchId=${matchId}` })
}
const tabsList = [
    { key: 'home', label: '档案', icon: 'calendar' },
    { key: 'chats', label: '对话', icon: 'chatboxes' },
    { key: 'match', label: '匹配', icon: 'color' },
    { key: 'mine', label: '我的', icon: 'person' }
]
const pillStyle = computed(() => {
    const idx = tabsList.findIndex((tab) => tab.key === currentTab.value)
    return { transform: `translateX(${idx * 100}%)` }
})
const pageStyle = computed(() => {
    const idx = tabsList.findIndex((tab) => tab.key === currentTab.value)
    return { transform: `translateX(-${idx * 100}%)` }
})
</script>
<style lang="scss">
@use '@/styles/variables.scss' as *;
::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
    color: transparent !important;
    background: transparent !important;
}
</style>
<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;
.pages-wrapper {
    width: 100%;
    height: 100vh;
    overflow: hidden;
}
.pages-container {
    display: flex;
    width: 100%;
    height: 100%;
    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.page-content {
    width: 100%;
    height: 100%;
    flex-shrink: 0;
    overflow: hidden;
}
.custom-tabbar {
    position: fixed;
    bottom: 0;
    width: 100%;
    box-sizing: border-box;
    background: #ffffff;
    padding: 24rpx 20rpx 60rpx;
    .tabbar-list {
        position: relative;
        display: flex;
        align-items: center;
        border: 2rpx solid $color-border;
        border-radius: 60rpx;
    }
    .tabbar-pill {
        position: absolute;
        inset: 0;
        width: 25%;
        background: $color-accent;
        border-radius: 60rpx;
        transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .tabbar-item {
        position: relative;
        z-index: 1;
        width: 25%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        padding: 12rpx 0;
    }
    .tabbar-item-label {
        color: $color-muted;
        &.active {
            color: #ffffff;
        }
    }
}
</style>
