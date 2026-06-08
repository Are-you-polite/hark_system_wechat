<template>
    <view class="page-match">
        <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="header-text">
                <text class="title">灵魂共振</text>
                <text class="subtitle">遇见与你同频的有趣灵魂</text>
            </view>
        </view>

        <scroll-view scroll-y class="scroll-area">
            <view v-if="hasMatches" class="match-list">
                <view v-for="(item, index) in matchList" :key="item.matchId || index" class="match-card" @click="goToMatchResult(item.matchId)">
                    <view class="mc-upper">
                        <view class="mc-avatar-wrap">
                            <image v-if="item.otherUser?.avatarUrl?.startsWith('cloud://')" :src="item.otherUser.avatarUrl" class="mc-avatar-img" mode="aspectFill" />
                            <text v-else class="mc-avatar-letter">{{ (item.otherUser?.nickName || '好')[0] }}</text>
                        </view>
                        <view class="mc-info-area">
                            <view class="mc-name-row">
                                <text class="mc-name">{{ item.otherUser?.nickName || '好友' }}</text>
                                <view class="mc-badge">{{ item.direction === 'invited' ? '你邀请了 TA' : 'TA 邀请了你' }}</view>
                            </view>
                            <text class="mc-type">{{ item.otherUser?.personalityType || '--' }} · {{ item.otherUser?.personalityTypeName || '未知' }}</text>
                            <text class="mc-match-tag">{{ item.matchTag || '深度契合 · 互补型' }}</text>
                        </view>
                        <view class="mc-score-pill">
                            <text class="mc-score-num">{{ item.compatibilityScore || 0 }}</text>
                            <text class="mc-score-unit">%</text>
                        </view>
                    </view>
                    <view class="mc-divider" />
                    <view class="mc-lower">
                        <text class="mc-date">匹配于 {{ formatMatchDate(item.matchedAt) }}</text>
                        <view class="mc-action">
                            <text class="mc-action-text">查看匹配报告</text>
                            <uni-icons type="arrow-right" color="#2d6b3f" size="12" />
                        </view>
                    </view>
                </view>
            </view>

            <view v-else-if="mStore.hasTested" class="empty-wrap">
                <view class="empty-icon-box">
                    <uni-icons type="personadd" color="#2d6b3f" size="28" />
                </view>
                <text class="empty-title">还没有匹配记录</text>
                <text class="empty-desc">分享你的性格卡片给好友，\n邀请 TA 一起来测，看看你们有多契合</text>
                <view v-if="!mStore.profileComplete" class="empty-btn" @click="handleInvite">
                    <text class="empty-btn-text">邀请好友匹配</text>
                </view>
                <button v-else class="empty-btn empty-btn-share" open-type="share">
                    <text class="empty-btn-text">邀请好友匹配</text>
                </button>
            </view>

            <view v-else class="empty-wrap">
                <view class="empty-icon-box">
                    <uni-icons type="personadd" color="#2d6b3f" size="28" />
                </view>
                <text class="empty-title">完成测试，开启匹配之旅</text>
                <text class="empty-desc">完成性格测试后，你就可以\n和好友进行灵魂匹配啦</text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { matchApi } from '@/api/match'

const mStore = useUserStore()
const statusBarHeight = ref(44)
const matchList = ref([])
const loading = ref(false)

// 补资料弹窗（由父级 tabbar 渲染，通过 inject 触发）
const openProfileForm = inject('openProfileForm')

const hasMatches = computed(() => matchList.value.length > 0)

onMounted(() => {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 44
    fetchMatches()
})

onShow(() => {
    if (mStore.loggedIn) fetchMatches()
})

async function fetchMatches() {
    if (loading.value) return
    loading.value = true
    try {
        const res = await matchApi.list()
        if (res.code === 0) {
            matchList.value = res.data?.list || []
        }
    } catch {
        // 静默失败
    } finally {
        loading.value = false
    }
}

function formatMatchDate(dateStr) {
    if (!dateStr) return '--'
    const d = new Date(dateStr)
    return `${d.getFullYear()}年${d.getMonth() + 1}月`
}

function goToMatchResult(matchId) {
    uni.navigateTo({ url: `/pages/match/result?matchId=${matchId}` })
}

function handleInvite() {
    if (openProfileForm) openProfileForm()
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page-match {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: $color-bg;
    overflow: hidden;
    position: relative;
}

.header {
    padding: 0 48rpx 32rpx 48rpx;
    background: $color-bg;
}
.header-text {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}
.title {
    font-size: 44rpx;
    font-weight: 700;
    color: $color-primary;
}
.subtitle {
    font-size: 26rpx;
    color: $color-secondary;
}

.scroll-area {
    flex: 1;
    height: 0;
    overflow: hidden;
}

.match-list {
    padding: 0 40rpx 180rpx 40rpx;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
}
.match-card {
    background: $color-surface;
    border-radius: $radius-lg;
    padding: 28rpx;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}
.mc-upper {
    display: flex;
    align-items: center;
    gap: 20rpx;
}
.mc-avatar-wrap {
    width: 80rpx;
    height: 80rpx;
    border-radius: 40rpx;
    background: $color-accent-bg;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.mc-avatar-img {
    width: 80rpx;
    height: 80rpx;
    border-radius: 40rpx;
}
.mc-avatar-letter {
    font-size: 32rpx;
    font-weight: 700;
    color: $color-accent;
}
.mc-info-area {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
}
.mc-name-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
}
.mc-name {
    font-size: 30rpx;
    font-weight: 700;
    color: $color-primary;
}
.mc-badge {
    font-size: 16rpx;
    font-weight: 600;
    color: $color-accent;
    background: $color-accent-bg;
    padding: 4rpx 16rpx;
    border-radius: 999rpx;
    flex-shrink: 0;
    line-height: 1.4;
}
.mc-type {
    font-size: 24rpx;
    color: $color-secondary;
}
.mc-match-tag {
    font-size: 20rpx;
    color: $color-muted;
}
.mc-score-pill {
    background: #eef3ee;
    border-radius: 999rpx;
    padding: 20rpx 28rpx;
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 2rpx;
    flex-shrink: 0;
}
.mc-score-num {
    font-size: 28rpx;
    font-weight: 800;
    color: $color-accent;
}
.mc-score-unit {
    font-size: 20rpx;
    font-weight: 500;
    color: $color-accent;
}
.mc-divider {
    height: 2rpx;
    background: $color-border;
}
.mc-lower {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.mc-date {
    font-size: 20rpx;
    color: $color-muted;
}
.mc-action {
    display: flex;
    align-items: center;
    gap: 8rpx;
}
.mc-action-text {
    font-size: 22rpx;
    font-weight: 600;
    color: $color-accent;
}

.empty-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 200rpx 40rpx 0;
    gap: 20rpx;
}
.empty-icon-box {
    width: 112rpx;
    height: 112rpx;
    border-radius: 56rpx;
    background: $color-accent-bg;
    display: flex;
    align-items: center;
    justify-content: center;
}
.empty-title {
    font-size: 36rpx;
    font-weight: 600;
    color: $color-primary;
}
.empty-desc {
    font-size: 26rpx;
    color: $color-secondary;
    line-height: 1.6;
    text-align: center;
}
.empty-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 486rpx;
    height: 88rpx;
    border-radius: $radius-btn;
    background: $color-accent;
    margin-top: 8rpx;
}
.empty-btn-text {
    font-size: 30rpx;
    font-weight: 600;
    color: #ffffff;
}
.empty-btn-share {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    line-height: normal;
    margin: 0;
    padding: 0;
    &::after {
        border: none;
    }
}
</style>
