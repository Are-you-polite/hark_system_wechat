<template>
    <view>
        <view class="progress-card">
            <text class="progress-main-title">测试进行中</text>
            <text class="progress-desc">你已经建立了一部分答题进度，继续完成即可生成正式结果。</text>
            <view class="progress-bar-area">
                <view class="progress-bar-label">
                    <text class="progress-lb-text">当前进度</text>
                    <text class="progress-num">{{ store.currentIndex }} / {{ store.totalQuestions }}</text>
                </view>
                <view class="progress-track">
                    <view class="progress-fill" :style="{ width: pct + '%' }" />
                </view>
            </view>
        </view>
        <view class="stats-row">
            <view class="stats-card-item">
                <text class="stats-item-label">已完成</text>
                <text class="stats-item-value">{{ store.currentIndex }} 题</text>
            </view>
            <view class="stats-card-item">
                <text class="stats-item-label">剩余</text>
                <text class="stats-item-value">{{ store.totalQuestions - store.currentIndex }} 题</text>
            </view>
        </view>
        <view class="continue-card">
            <text class="continue-title">继续上次测试</text>
            <text class="continue-desc">系统已保存到第 {{ store.currentIndex }} 题。继续答题后，将自动生成你的性格结果与报告首页。</text>
            <view class="btn-continue" @click="goTest">
                <text class="btn-continue-text">继续答题</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
const store = useUserStore()
const pct = computed(() => (store.totalQuestions > 0 ? (store.currentIndex / store.totalQuestions) * 100 : 0))
function goTest() {
    uni.navigateTo({ url: '/pages/test/answer' })
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;
.progress-card {
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    padding: 32rpx;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-top: 8rpx;
}
.progress-main-title {
    font-size: 44rpx;
    font-weight: 600;
    color: $color-primary;
}
.progress-desc {
    font-size: 28rpx;
    color: $color-secondary;
    line-height: 1.6;
}
.progress-bar-area {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}
.progress-bar-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.progress-lb-text {
    font-size: 28rpx;
    color: #808a80;
}
.progress-num {
    font-size: 28rpx;
    color: #6b7b6b;
}
.progress-track {
    height: 16rpx;
    border-radius: 16rpx;
    background: $color-surface-secondary;
    overflow: hidden;
}
.progress-fill {
    height: 100%;
    border-radius: 16rpx;
    background: $color-accent;
    transition: width 0.4s;
}

.stats-row {
    display: flex;
    gap: 24rpx;
    margin-top: 24rpx;
}
.stats-card-item {
    flex: 1;
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    padding: 24rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
}
.stats-item-label {
    font-size: 24rpx;
    color: $color-secondary;
}
.stats-item-value {
    font-size: 36rpx;
    font-weight: 600;
    color: $color-primary;
}

.continue-card {
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    padding: 32rpx;
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    margin-top: 24rpx;
}
.continue-title {
    font-size: 32rpx;
    font-weight: 600;
    color: $color-primary;
}
.continue-desc {
    font-size: 28rpx;
    color: $color-secondary;
    line-height: 1.6;
}
.btn-continue {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    border-radius: $radius-btn;
    background: $color-accent;
}
.btn-continue-text {
    font-size: 30rpx;
    font-weight: 600;
    color: #ffffff;
}
</style>
