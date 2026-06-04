<template>
    <view class="page-subscribe">
        <!-- 导航栏 -->
        <view class="nav" :style="{ paddingTop: statusBarHeight + 'px' }">
            <text class="nav-back" @click="goBack">返回</text>
            <text class="nav-title">购买套餐</text>
            <text class="nav-ph">返回</text>
        </view>

        <scroll-view scroll-y class="scroll-area">
            <view class="scroll-inner">
                <!-- 标题 -->
                <view class="page-header">
                    <text class="page-title">选择适合你的套餐</text>
                </view>

                <!-- 加载 / 空状态 -->
                <text v-if="loading" class="loading-text">加载套餐中...</text>
                <text v-else-if="plans.length === 0" class="loading-text">暂无可购买套餐</text>

                <!-- 套餐列表 -->
                <view v-else class="plans-list">
                    <view v-for="(plan, idx) in plans" :key="idx" class="plan-card" :class="{ selected: selected === idx }" @click="selected = idx">
                        <view class="plan-header">
                            <view class="plan-name-row">
                                <text class="plan-name">{{ plan.name }}</text>
                                <view v-if="plan.popular" class="plan-tag">推荐</view>
                            </view>
                            <text class="plan-price">¥{{ plan.price }}</text>
                        </view>
                        <text class="plan-desc">{{ plan.desc }}</text>
                        <view class="plan-divider" />
                        <view class="plan-footer">
                            <text class="plan-footer-left">{{ selected === idx ? '已选中' : '可选套餐' }}</text>
                            <text class="plan-footer-right">{{ selected === idx ? '到账后立即生效' : '支持微信支付' }}</text>
                        </view>
                    </view>

                    <!-- 支付按钮 -->
                    <view class="pay-btn" :class="{ disabled: paying || selected < 0 }" @click="handlePay">
                        <text>{{ paying ? '处理中...' : '立即支付' }}</text>
                    </view>
                    <text class="pay-note">支付即表示同意《用户协议》</text>
                </view>
            </view>
        </scroll-view>

        <!-- 支付成功弹窗 -->
        <view v-if="showSuccess" class="modal-overlay" @click="showSuccess = false">
            <view class="modal-box" @click.stop>
                <view class="modal-icon">
                    <uni-icons type="checkmark" color="#ffffff" size="30" />
                </view>
                <text class="modal-title">支付成功</text>
                <text class="modal-desc">{{ successMsg }}</text>
                <view class="modal-btn" @click="showSuccess = false">知道了</view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { useCredits } from '@/hooks/useCredits'

const statusBarHeight = ref(44)
const { plans, selected, paying, showSuccess, successMsg, loading, loadProducts, handlePay } = useCredits()

const goBack = () => uni.navigateBack()

onMounted(() => {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 44
    loadProducts()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page-subscribe {
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

// ===== 标题 =====
.page-header {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    margin-top: 8rpx;
}
.page-title {
    font-size: 36rpx;
    font-weight: 600;
    color: $color-primary;
}
.loading-text {
    text-align: center;
    padding: 80rpx 0;
    font-size: 26rpx;
    color: $color-muted;
}

// ===== 套餐卡片 =====
.plans-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-top: 8rpx;
}
.plan-card {
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    padding: 24rpx;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}
.plan-card.selected {
    background: #f6faf7;
    border: 2rpx solid $color-accent;
}
.plan-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.plan-name-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
}
.plan-name {
    font-size: 32rpx;
    font-weight: 600;
    color: $color-primary;
}
.plan-tag {
    font-size: 22rpx;
    font-weight: 600;
    color: #ffffff;
    background: $color-accent;
    padding: 4rpx 20rpx;
    border-radius: 999rpx;
    line-height: 1.4;
}
.plan-price {
    font-size: 52rpx;
    font-weight: 700;
    color: $color-accent;
}
.plan-desc {
    font-size: 24rpx;
    color: $color-secondary;
    line-height: 1.5;
}
.plan-divider {
    height: 2rpx;
    background: $color-border;
}
.plan-footer {
    display: flex;
    justify-content: space-between;
}
.plan-footer-left {
    font-size: 24rpx;
    color: $color-secondary;
}
.plan-footer-left:has(.selected) {
    color: $color-accent;
    font-weight: 600;
}
.plan-footer-right {
    font-size: 24rpx;
    color: $color-muted;
}

// ===== 支付摘要 =====
// ===== 支付按钮 =====
.pay-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80rpx;
    border-radius: $radius-btn;
    background: $color-accent;
    font-size: 28rpx;
    font-weight: 600;
    color: #ffffff;
}
.pay-btn.disabled {
    opacity: 0.4;
    pointer-events: none;
}
.pay-note {
    font-size: 20rpx;
    color: $color-muted;
    text-align: center;
}

// ===== 成功弹窗 =====
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
}
.modal-box {
    width: 540rpx;
    background: $color-surface;
    border-radius: $radius-lg;
    padding: 64rpx 48rpx 48rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.modal-icon {
    width: 96rpx;
    height: 96rpx;
    background: $color-accent;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32rpx;
}
.modal-title {
    font-size: 34rpx;
    font-weight: 700;
    color: $color-primary;
    margin-bottom: 16rpx;
}
.modal-desc {
    font-size: 26rpx;
    color: $color-secondary;
    text-align: center;
    margin-bottom: 40rpx;
}
.modal-btn {
    width: 100%;
    padding: 28rpx 0;
    background: $color-accent;
    border-radius: $radius-md;
    text-align: center;
    color: #ffffff;
    font-size: 28rpx;
    font-weight: 600;
}
</style>
