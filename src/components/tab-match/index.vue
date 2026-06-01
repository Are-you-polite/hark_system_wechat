<template>
    <view class="page-match">
        <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="header-text">
                <text class="title">灵魂共振</text>
                <text class="subtitle">遇见与你同频的有趣灵魂</text>
            </view>
        </view>

        <scroll-view scroll-y class="scroll-area">
            <view v-if="friendList.length > 0" class="match-list">
                <view v-for="(item, index) in friendList" :key="index" class="match-card" @tap="goToMatchResult">
                    <view class="card-main">
                        <view class="main-header">
                            <text class="name">{{ item.type }}</text>
                            <view class="score-badge">
                                <uni-icons type="fire-filled" color="#2d6b3f" size="14" />
                                <text class="score-text">{{ item.score }} 契合</text>
                            </view>
                        </view>
                        <text class="desc">{{ item.desc }}</text>
                    </view>
                </view>
                <view class="bottom-safe" />
            </view>

            <view v-else-if="!mStore.hasTested" class="empty-state">
                <view class="empty-icon-wrap">
                    <uni-icons type="personadd-filled" color="#2d6b3f" size="40" />
                </view>
                <text class="empty-title">完成测试，开启灵魂匹配</text>
                <text class="empty-desc">
                    完成性格测试后，即可查看
                    <br />
                    与你灵魂契合的好友推荐
                </text>
                <view class="go-test-btn" @tap="goTest">去完成测试</view>
            </view>
            <view v-else class="empty-state">
                <view class="empty-icon-wrap">
                    <uni-icons type="personadd-filled" color="#2d6b3f" size="40" />
                </view>
                <text class="empty-title">暂无推荐好友</text>
                <text class="empty-desc">邀请好友一起来测，寻找同频灵魂</text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { useUserStore } from '@/stores/user'

const mStore = useUserStore()
const statusBarHeight = ref(44)
const friendList = ref([])

onMounted(() => {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 44
})

const goToMatchResult = () => uni.navigateTo({ url: '/pages/match/result' })
const goTest = () => uni.navigateTo({ url: '/pages/test/answer' })
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page-match {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: $color-bg;
    overflow: hidden;
    position: relative;
}

.header {
    padding: $spacing-md 0 0;
    margin: 0 $spacing-xl $spacing-md;

    .header-text {
        display: flex;
        flex-direction: column;
        .title {
            font-size: 44rpx;
            font-weight: 700;
            color: $color-primary;
            margin-bottom: $spacing-xs;
        }
        .subtitle {
            font-size: 26rpx;
            color: $color-secondary;
        }
    }
}

.scroll-area {
    flex: 1;
    height: 0;
    overflow: hidden;
}

.match-list {
    padding: 0 $spacing-xl;
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
}

.match-card {
    display: flex;
    align-items: flex-start;
    padding: $spacing-xl;
    background-color: #ffffff;
    border-radius: $radius-xl;
    box-shadow: $shadow-card;
    border: 2rpx solid rgba($color-primary, 0.04);
}

.card-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
}

.main-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.name {
    font-size: 34rpx;
    font-weight: 800;
    color: $color-primary;
    line-height: 1.2;
}

.score-badge {
    display: flex;
    align-items: center;
    gap: 4rpx;
    background-color: rgba(45, 107, 63, 0.08);
    padding: 8rpx 16rpx;
    border-radius: 30rpx;
    .score-text {
        font-size: 22rpx;
        font-weight: 700;
        color: $color-accent;
    }
}

.desc {
    font-size: 26rpx;
    color: $color-secondary;
    line-height: 1.5;
}

.bottom-safe {
    height: calc(180rpx + env(safe-area-inset-bottom));
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 100rpx;
}
.empty-icon-wrap {
    width: 120rpx;
    height: 120rpx;
    background-color: rgba(45, 107, 63, 0.05);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $spacing-lg;
}
.empty-title {
    font-size: 32rpx;
    font-weight: 700;
    color: $color-primary;
    margin-bottom: $spacing-sm;
}
.empty-desc {
    font-size: 26rpx;
    color: $color-secondary;
}

.go-test-btn {
    margin-top: 32rpx;
    padding: 20rpx 56rpx;
    background: linear-gradient(135deg, $color-accent, $color-accent-dark);
    border-radius: $radius-sm;
    color: #ffffff;
    font-size: 28rpx;
    font-weight: 600;
}
</style>
