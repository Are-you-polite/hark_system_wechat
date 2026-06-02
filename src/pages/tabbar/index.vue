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
    </view>

    <FabButton icon="plusempty" :visible="currentTab === 'chats'" @click="onNewChat" />
    <FabButton icon="personadd-filled" :visible="currentTab === 'match'" @click="onShowMatchCard" />

    <!-- 资料完善弹窗 -->
    <ProfileSetup v-if="showProfileSetup" @close="showProfileSetup = false" @saved="onProfileSaved" />

    <view v-if="showMatchCard" class="m-overlay" @click="showMatchCard = false">
        <view class="m-card" @click.stop>
            <view class="m-close" @click="showMatchCard = false">✕</view>
            <view class="m-code">{{ mStore.personalityType || '--' }}</view>
            <view class="m-name">{{ mStore.personalityTypeName || '未测试' }}</view>
            <view class="m-tags">{{ mTags || '完成测试后查看你的性格类型' }}</view>
            <view class="m-divider" />
            <button class="m-share" open-type="share">
                <text class="ms-icon">💬</text>
                <text class="ms-text">分享我的性格卡片</text>
            </button>
        </view>
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
import FabButton from '@/components/FabButton.vue'
import ProfileSetup from '@/components/ProfileSetup.vue'
import { useUserStore } from '@/stores/user'

const mStore = useUserStore()

onShareAppMessage(() => {
    const p = mStore.user?._id ? `/pages/tabbar/index?inviterId=${encodeURIComponent(mStore.user._id)}&inviterType=${encodeURIComponent(mStore.personalityType)}&inviterName=${encodeURIComponent(mStore.nickName || '')}` : '/pages/tabbar/index'
    return {
        title: mStore.personalityType ? `我是 ${mStore.personalityType} · ${mStore.personalityTypeName} — 来测测你的性格类型` : '向内倾听 — 了解自己，从倾听内心开始',
        path: p
    }
})

const currentTab = ref('home')
const showMatchCard = ref(false)
const showProfileSetup = ref(false)
const pendingShowCard = ref(false) // 完善资料后是否要显示分享卡片

function onShowMatchCard() {
    if (!mStore.profileComplete) {
        // 先完善资料
        pendingShowCard.value = true
        showProfileSetup.value = true
    } else {
        showMatchCard.value = true
    }
}

function onProfileSaved() {
    showProfileSetup.value = false
    if (pendingShowCard.value) {
        pendingShowCard.value = false
        showMatchCard.value = true
    }
}

onLoad((options) => {
    if (options?.inviterId && !mStore.inviteHandled) {
        mStore.setInviter(options.inviterId, options.inviterType || '', options.inviterName ? decodeURIComponent(options.inviterName) : '')
        mStore.inviteHandled = true

        const timer = setInterval(() => {
            if (mStore.loggedIn) {
                clearInterval(timer)
                uni.navigateTo({ url: '/pages/match/invite' })
            }
        }, 200)
        setTimeout(() => clearInterval(timer), 10000)
    }
})

const mTags = computed(() => {
    const tags = mStore.result?.typeTags
    if (tags && tags.length > 0) return tags.join(' · ')
    return ''
})

const onNewChat = () => uni.navigateTo({ url: '/pages/chat/detail' })

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

// 匹配弹窗
.m-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
}
.m-card {
    width: 540rpx;
    background: linear-gradient(135deg, $color-accent, $color-accent-dark);
    border-radius: 32rpx;
    padding: 64rpx 48rpx 48rpx;
    text-align: center;
    box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
    position: relative;
}
.m-close {
    position: absolute;
    top: 24rpx;
    right: 24rpx;
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.6);
}
.m-code {
    font-size: 80rpx;
    font-weight: 800;
    color: #fff;
    letter-spacing: 8rpx;
}
.m-name {
    font-size: 32rpx;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin-top: 8rpx;
}
.m-tags {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 16rpx;
    letter-spacing: 2rpx;
}
.m-divider {
    height: 2rpx;
    background: rgba(255, 255, 255, 0.12);
    margin: 32rpx 0 24rpx;
}
.m-share {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    line-height: normal;
    outline: none;
}
.m-share::after {
    border: none;
}
.ms-icon {
    font-size: 28rpx;
}
.ms-text {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
}
</style>
