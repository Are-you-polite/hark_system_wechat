<template>
    <view>
        <view class="intro-card">
            <text class="intro-title">开始你的性格测试</text>
            <text class="intro-desc">30 道单选题，约 5 分钟完成。完成后可获得人格结果、维度解读与匹配入口。</text>
            <view class="intro-stats">
                <view class="intro-stat-item">
                    <text class="stat-num">30 题</text>
                    <text class="stat-label">标准题量</text>
                </view>
                <view class="intro-stat-item">
                    <text class="stat-num">5 分钟</text>
                    <text class="stat-label">完整体验</text>
                </view>
                <view class="intro-stat-item">
                    <text class="stat-num">报告</text>
                    <text class="stat-label">完成后生成</text>
                </view>
            </view>
            <view class="intro-badges">
                <view class="intro-badge">
                    <uni-icons type="checkbox" color="#2d6b3f" size="18" />
                    <text>30 题精测</text>
                </view>
                <view class="intro-badge">
                    <uni-icons type="calendar" color="#2d6b3f" size="18" />
                    <text>5 分钟完成</text>
                </view>
            </view>
        </view>
        <view class="btn-primary" @click="goTest">
            <text class="btn-primary-text">开始性格测试</text>
        </view>
        <view class="benefits-card">
            <text class="benefits-card-title">完成后你将解锁</text>
            <view class="benefit-row">
                <view class="benefit-dot" />
                <text class="benefit-text">人格类型与标签摘要</text>
            </view>
            <view class="benefit-row">
                <view class="benefit-dot" />
                <text class="benefit-text">四个维度的比例结果</text>
            </view>
            <view class="benefit-row">
                <view class="benefit-dot" />
                <text class="benefit-text">AI 深度提问与好友匹配入口</text>
            </view>
        </view>
    </view>
</template>

<script setup>
const goTest = () => uni.navigateTo({ url: '/pages/test/answer' })
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;
.intro-card {
    background: $color-surface-secondary;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    padding: 36rpx;
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}
.intro-title {
    font-size: 48rpx;
    font-weight: 600;
    color: $color-primary;
}
.intro-desc {
    font-size: 28rpx;
    color: $color-secondary;
    line-height: 1.6;
}
.intro-stats {
    display: flex;
    gap: 24rpx;
}
.intro-stat-item {
    flex: 1;
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    padding: 24rpx 16rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
}
.stat-num {
    font-size: 34rpx;
    font-weight: 700;
    color: $color-primary;
}
.stat-label {
    font-size: 22rpx;
    color: $color-muted;
}
.intro-badges {
    display: flex;
    gap: 16rpx;
}
.intro-badge {
    height: 52rpx;
    padding: 0 24rpx;
    border-radius: 999rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    background: $color-surface;
    border: 2rpx solid $color-border;
    font-size: 24rpx;
    font-weight: 500;
    color: $color-primary;
}

.btn-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    border-radius: $radius-sm;
    background: $color-accent;
    margin-top: 24rpx;
}
.btn-primary-text {
    font-size: 30rpx;
    font-weight: 600;
    color: #ffffff;
}

.benefits-card {
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    padding: 36rpx;
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    margin-top: 32rpx;
}
.benefits-card-title {
    font-size: 32rpx;
    font-weight: 600;
    color: $color-primary;
}
.benefit-row {
    display: flex;
    align-items: center;
    gap: 20rpx;
}
.benefit-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background: $color-accent;
    flex-shrink: 0;
}
.benefit-text {
    font-size: 28rpx;
    color: $color-secondary;
    line-height: 1.5;
}
</style>
