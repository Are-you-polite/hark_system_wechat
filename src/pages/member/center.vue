<template>
    <view class="page-center">
        <!-- 导航栏 -->
        <view class="nav" :style="{ paddingTop: statusBarHeight + 'px' }">
            <text class="nav-back" @click="goBack">返回</text>
            <text class="nav-title">会员中心</text>
            <text class="nav-ph">返回</text>
        </view>

        <scroll-view scroll-y class="scroll-area">
            <view class="scroll-inner">
                <!-- 会员卡片 -->
                <view class="vip-card">
                    <view class="vc-top">
                        <text class="vc-label">我的账户</text>
                        <view class="vc-badge">{{ store.isVipActive ? '月卡会员' : '普通用户' }}</view>
                    </view>
                    <view class="vc-num-row">
                        <text class="vc-num">{{ store.isVipActive ? '∞' : store.creditBalance }}</text>
                        <text class="vc-unit">次</text>
                    </view>
                    <text class="vc-desc">剩余对话次数</text>
                    <view class="vc-divider" />
                    <view class="vc-stats">
                        <view class="vc-stat-item">
                            <text class="vc-stat-num">{{ Math.max(0, store.dailyFreeTotal - store.dailyFreeUsed) }}/{{ store.dailyFreeTotal }}</text>
                            <text class="vc-stat-label">今日免费剩余</text>
                        </view>
                        <view class="vc-stat-line" />
                        <view class="vc-stat-item">
                            <text class="vc-stat-num">{{ store.user?.totalUsed || 0 }}</text>
                            <text class="vc-stat-label">累计使用</text>
                        </view>
                    </view>
                </view>

                <!-- 信息卡片 -->
                <view class="info-card">
                    <view class="info-row">
                        <text class="info-label">账户状态</text>
                        <text class="info-value">{{ store.isVipActive ? '月卡会员' : '普通用户' }}</text>
                    </view>
                    <view class="info-row">
                        <text class="info-label">免费额度</text>
                        <text class="info-value">{{ store.dailyFreeUsed }} / {{ store.dailyFreeTotal }}</text>
                    </view>
                    <view class="info-row" style="border-bottom: none">
                        <text class="info-label">到期时间</text>
                        <text class="info-value">{{ store.isVipActive && store.vipExpireAt ? new Date(store.vipExpireAt).toLocaleDateString('zh-CN') : '—' }}</text>
                    </view>
                </view>

                <!-- 购买按钮 -->
                <view class="buy-btn" @click="goSubscribe">
                    <uni-icons type="wallet" color="#ffffff" size="18" />
                    <text class="buy-btn-text">购买次数</text>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useUser } from '@/hooks/useUser'

const store = useUserStore()
const { fetchCredits } = useUser()
const statusBarHeight = ref(44)

onMounted(() => {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 44
    fetchCredits()
})

const goBack = () => uni.navigateBack()
const goSubscribe = () => uni.navigateTo({ url: '/pages/member/subscribe' })
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page-center {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: $color-bg;
    overflow: hidden;
}

// ===== 导航栏 =====
.nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    padding: 0 40rpx;
    background: $color-surface;
    border-bottom: 2rpx solid $color-border;
}
.nav-back {
    font-size: 28rpx;
    color: $color-secondary;
    width: 100rpx;
    flex-shrink: 0;
}
.nav-title {
    font-size: 32rpx;
    font-weight: 600;
    color: $color-primary;
}
.nav-ph {
    font-size: 28rpx;
    color: transparent;
    width: 100rpx;
    flex-shrink: 0;
}

// ===== Scroll =====
.scroll-area {
    flex: 1;
    height: 0;
    overflow: hidden;
}
.scroll-inner {
    padding: 0 40rpx 60rpx 40rpx;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

// ===== 会员卡片 =====
.vip-card {
    background: $color-accent;
    border-radius: $radius-sm;
    padding: 48rpx;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    margin-top: 8rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}
.vc-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.vc-label {
    font-size: 32rpx;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
}
.vc-badge {
    font-size: 18rpx;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
    background: rgba(255, 255, 255, 0.15);
    padding: 6rpx 20rpx;
    border-radius: 999rpx;
}
.vc-num-row {
    display: flex;
    align-items: flex-end;
    gap: 8rpx;
}
.vc-num {
    font-size: 96rpx;
    font-weight: 800;
    color: #ffffff;
    line-height: 1;
}
.vc-unit {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.6);
    padding-bottom: 12rpx;
}
.vc-desc {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.6);
}
.vc-divider {
    height: 2rpx;
    background: rgba(255, 255, 255, 0.15);
}
.vc-stats {
    display: flex;
    align-items: center;
}
.vc-stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
}
.vc-stat-num {
    font-size: 36rpx;
    font-weight: 700;
    color: #ffffff;
}
.vc-stat-label {
    font-size: 20rpx;
    color: rgba(255, 255, 255, 0.5);
}
.vc-stat-line {
    width: 2rpx;
    height: 72rpx;
    background: rgba(255, 255, 255, 0.15);
}

// ===== 信息卡片 =====
.info-card {
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    overflow: hidden;
}
.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28rpx 32rpx;
    border-bottom: 2rpx solid $color-border;
}
.info-label {
    font-size: 26rpx;
    color: $color-secondary;
}
.info-value {
    font-size: 26rpx;
    font-weight: 600;
    color: $color-primary;
}

// ===== 购买按钮 =====
.buy-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    height: 88rpx;
    border-radius: $radius-btn;
    background: $color-accent;
}
.buy-btn-text {
    font-size: 30rpx;
    font-weight: 600;
    color: #ffffff;
}
</style>
