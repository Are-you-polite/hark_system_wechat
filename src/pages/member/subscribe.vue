<template>
    <view class="page-subscribe">
        <view class="nav" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="back" @tap="goBack">
                <uni-icons type="back" color="#1e3322" size="22" />
            </view>
            <text class="nav-title">购买次数</text>
            <view class="nav-ph" />
        </view>

        <scroll-view scroll-y class="scroll-area">
            <view class="scroll-inner">
                <text class="sec-title">选择套餐</text>

                <view v-if="loading" class="loading-text">加载套餐中...</view>
                <view v-else-if="plans.length === 0" class="loading-text">暂无可购买套餐</view>
                <view v-else class="plans-list">
                    <view v-for="(plan, idx) in plans" :key="idx" class="plan-card" :class="{ selected: selected === idx, popular: plan.popular }" @tap="selected = idx">
                        <view v-if="plan.popular" class="popular-tag">推荐</view>
                        <view class="plan-top">
                            <text class="plan-name">{{ plan.name }}</text>
                            <text class="plan-price">
                                <text class="price-sign">¥</text>
                                {{ plan.price }}
                            </text>
                        </view>
                        <text class="plan-desc">{{ plan.desc }}</text>
                        <view class="plan-feats">
                            <view v-for="(f, fi) in plan.features" :key="fi" class="pf-row">
                                <text class="pf-check">✓</text>
                                <text class="pf-text">{{ f }}</text>
                            </view>
                        </view>
                    </view>
                </view>

                <view v-if="plans.length > 0" class="pay-btn" :class="{ disabled: paying || selected < 0 }" @tap="handlePay">
                    <text>{{ paying ? '处理中...' : selected < 0 ? '请选择套餐' : '立即支付 ¥' + plans[selected].price }}</text>
                </view>
                <text v-if="plans.length > 0" class="pay-note">支付即表示同意《用户协议》</text>
            </view>
        </scroll-view>

        <!-- 支付成功弹窗 -->
        <view v-if="showSuccess" class="modal-overlay" @tap="showSuccess = false">
            <view class="modal-box" @tap.stop>
                <view class="modal-icon">✓</view>
                <text class="modal-title">支付成功</text>
                <text class="modal-desc">{{ successMsg }}</text>
                <view class="modal-btn" @tap="showSuccess = false">知道了</view>
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
    background-color: $color-bg;
    overflow: hidden;
}

.nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 48rpx 24rpx;
    border-bottom: 2rpx solid $color-border;
    background-color: $color-bg;
    flex-shrink: 0;

    .back {
        width: 64rpx;
        height: 64rpx;
        display: flex;
        align-items: center;
    }
    .nav-title {
        font-size: 34rpx;
        font-weight: 600;
        color: $color-primary;
    }
    .nav-ph {
        width: 64rpx;
    }
}

.scroll-area {
    flex: 1;
    height: 0;
    overflow: hidden;
}
.scroll-inner {
    padding: 24rpx 48rpx 0;
}

.sec-title {
    display: block;
    font-size: 30rpx;
    font-weight: 700;
    color: $color-primary;
    margin: 0 0 24rpx;
}

.loading-text {
    text-align: center;
    padding: 80rpx 0;
    font-size: 26rpx;
    color: $color-muted;
}

// 套餐列表
.plans-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.plan-card {
    position: relative;
    padding: 40rpx;
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-md;
    transition: all 0.2s;

    &.selected {
        border-color: $color-accent;
        box-shadow: 0 0 0 2rpx $color-accent;
    }

    .popular-tag {
        position: absolute;
        top: -14rpx;
        right: 40rpx;
        padding: 6rpx 28rpx;
        background: linear-gradient(135deg, $color-accent, #4a9f5e);
        border-radius: 24rpx;
        font-size: 22rpx;
        font-weight: 600;
        color: #ffffff;
    }

    .plan-top {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
    }
    .plan-name {
        font-size: 32rpx;
        font-weight: 700;
        color: $color-primary;
    }
    .plan-price {
        font-size: 44rpx;
        font-weight: 800;
        color: $color-accent;
    }
    .price-sign {
        font-size: 26rpx;
    }

    .plan-desc {
        font-size: 24rpx;
        color: $color-secondary;
        margin-top: 12rpx;
    }

    .plan-feats {
        display: flex;
        flex-direction: column;
        gap: 12rpx;
        margin-top: 24rpx;
    }
    .pf-row {
        display: flex;
        align-items: center;
        gap: 12rpx;
    }
    .pf-check {
        font-size: 24rpx;
        color: $color-accent;
        font-weight: 700;
    }
    .pf-text {
        font-size: 24rpx;
        color: $color-secondary;
    }
}

// 支付按钮
.pay-btn {
    width: 100%;
    padding: 32rpx 0;
    margin-top: 40rpx;
    background: linear-gradient(135deg, $color-accent, $color-accent-dark);
    border-radius: $radius-md;
    text-align: center;
    font-size: 32rpx;
    font-weight: 600;
    color: #ffffff;

    &.disabled {
        opacity: 0.4;
        pointer-events: none;
    }
}

.pay-note {
    display: block;
    text-align: center;
    font-size: 22rpx;
    color: $color-muted;
    margin: 24rpx 0 40rpx;
}

// 成功弹窗
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

    .modal-icon {
        width: 96rpx;
        height: 96rpx;
        background: $color-accent;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 44rpx;
        color: #ffffff;
        font-weight: 700;
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
}
</style>
