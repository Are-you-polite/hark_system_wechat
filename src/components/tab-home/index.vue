<template>
    <view class="page-home">
        <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="header-text">
                <text class="title">向内倾听</text>
                <text class="subtitle">了解自己，从倾听内心开始</text>
            </view>
        </view>
        <scroll-view scroll-y class="scroll-area">
            <view class="scroll-inner">
                <view v-if="store.loading" class="skeleton-group">
                    <view class="sk-card">
                        <view class="sk-row" style="gap: 20rpx">
                            <view class="sk-dot" />
                            <text class="sk-state-title">同步档案信息中</text>
                        </view>
                        <text class="sk-state-desc">系统正在读取测试进度、人格结果和报告摘要，完成后会恢复到最新档案状态。</text>
                    </view>
                    <view class="sk-card">
                        <view class="sk-block" style="width: 200rpx; height: 72rpx" />
                        <view class="sk-block" style="width: 160rpx; height: 28rpx" />
                        <view class="sk-block" style="width: 320rpx; height: 24rpx" />
                        <view class="sk-line" />
                    </view>
                    <view class="sk-card">
                        <view class="sk-block" style="width: 160rpx; height: 28rpx" />
                        <view v-for="i in 4" :key="'d' + i" class="sk-row" style="gap: 20rpx">
                            <view class="sk-block" style="width: 80rpx; height: 24rpx" />
                            <view class="sk-track" />
                            <view class="sk-block" style="width: 100rpx; height: 24rpx" />
                        </view>
                    </view>
                    <view class="sk-card">
                        <view class="sk-block" style="width: 140rpx; height: 28rpx" />
                        <view class="sk-line" />
                        <view class="sk-line" style="width: 520rpx" />
                        <view class="sk-line" style="width: 360rpx" />
                    </view>
                </view>

                <GuideState v-else-if="!store.loggedIn || (!store.hasTested && !store.hasProgress)" />
                <ProgressState v-else-if="store.hasProgress" />
                <ReportState v-else />
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useUser } from '@/hooks/useUser'
import GuideState from './GuideState.vue'
import ProgressState from './ProgressState.vue'
import ReportState from './ReportState.vue'

const store = useUserStore()
const { fetchCredits } = useUser()
const statusBarHeight = ref(44)

onMounted(() => {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 44
    if (store.loggedIn) fetchCredits()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page-home {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: $color-bg;
    overflow: hidden;
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
.scroll-inner {
    padding: 0 40rpx 220rpx 40rpx;
}

// 骨架屏
.skeleton-group {
    display: flex;
    flex-direction: column;
    gap: 32rpx;
    padding-top: 8rpx;
}
.sk-card {
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    padding: 32rpx;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
}
.sk-row {
    display: flex;
    align-items: center;
}
.sk-dot {
    width: 20rpx;
    height: 20rpx;
    border-radius: 50%;
    background: $color-accent;
    flex-shrink: 0;
}
.sk-state-title {
    font-size: 30rpx;
    font-weight: 600;
    color: $color-primary;
}
.sk-state-desc {
    font-size: 24rpx;
    color: $color-secondary;
    line-height: 1.6;
}
.sk-block {
    background: $color-surface-secondary;
    border-radius: 12rpx;
    animation: sk-pulse 1.5s ease-in-out infinite;
}
.sk-line {
    width: 100%;
    height: 20rpx;
    background: $color-surface-secondary;
    border-radius: 12rpx;
    animation: sk-pulse 1.5s ease-in-out infinite;
}
.sk-track {
    flex: 1;
    height: 20rpx;
    background: $color-surface-secondary;
    border-radius: 999rpx;
    animation: sk-pulse 1.5s ease-in-out infinite;
}
@keyframes sk-pulse {
    0%,
    100% {
        opacity: 0.5;
    }
    50% {
        opacity: 1;
    }
}
</style>
