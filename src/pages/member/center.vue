<template>
    <view class="page-center">
        <view class="nav" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="back" @tap="goBack">
                <uni-icons type="back" color="#1e3322" size="22" />
            </view>
            <text class="nav-title">会员中心</text>
            <view class="nav-ph" />
        </view>

        <scroll-view scroll-y class="scroll-area">
            <view class="scroll-inner">
                <!-- 余额卡片 -->
                <view class="balance-card">
                    <text class="bc-num">{{ store.isVipActive ? '∞' : store.creditBalance }}</text>
                    <view class="bc-right">
                        <text class="bc-label">剩余对话次数</text>
                        <text class="bc-sub">今日免费剩余 {{ Math.max(0, store.dailyFreeTotal - store.dailyFreeUsed) }} / {{ store.dailyFreeTotal }} 次</text>
                        <text v-if="store.isVipActive" class="bc-badge">月卡会员 · {{ store.vipExpireAt ? new Date(store.vipExpireAt).toLocaleDateString('zh-CN') : '' }} 到期</text>
                    </view>
                </view>

                <!-- 信息 -->
                <view class="info-card">
                    <view class="info-row">
                        <text class="info-label">账户状态</text>
                        <text class="info-value" :class="{ vip: store.isVipActive }">{{ store.isVipActive ? '月卡会员' : '普通用户' }}</text>
                    </view>
                    <view class="info-row" style="border: none">
                        <text class="info-label">免费额度</text>
                        <text class="info-value">{{ store.dailyFreeUsed }} / {{ store.dailyFreeTotal }}</text>
                    </view>
                </view>

                <!-- 购买按钮 -->
                <view class="buy-btn" @tap="goSubscribe">
                    <text>💰 购买次数</text>
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
    padding: 24rpx 48rpx 32rpx;
}

// 余额卡片
.balance-card {
    display: flex;
    align-items: center;
    gap: 32rpx;
    padding: 48rpx;
    background: $color-surface;
    border-radius: $radius-md;
    box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);

    .bc-num {
        font-size: 84rpx;
        font-weight: 700;
        color: $color-accent;
        flex-shrink: 0;
        min-width: 128rpx;
        text-align: center;
    }
    .bc-right {
        flex: 1;
    }
    .bc-label {
        font-size: 28rpx;
        color: $color-primary;
        font-weight: 600;
    }
    .bc-sub {
        font-size: 24rpx;
        color: $color-muted;
        margin-top: 4rpx;
        display: block;
    }
    .bc-badge {
        display: inline-block;
        margin-top: 12rpx;
        padding: 4rpx 20rpx;
        background: rgba($color-accent, 0.06);
        border-radius: 20rpx;
        font-size: 22rpx;
        color: $color-accent;
    }
}

// 信息
.info-card {
    margin-top: 28rpx;
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-md;
    padding: 0 40rpx;

    .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 32rpx 0;
        border-bottom: 2rpx solid $color-border;

        .info-label {
            font-size: 26rpx;
            color: $color-secondary;
        }
        .info-value {
            font-size: 26rpx;
            font-weight: 600;
            color: $color-primary;
        }
        .info-value.vip {
            color: $color-accent;
        }
    }
}

// 购买按钮
.buy-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    width: 100%;
    padding: 32rpx 0;
    margin-top: 40rpx;
    background: linear-gradient(135deg, $color-accent, $color-accent-dark);
    border-radius: $radius-md;
    font-size: 32rpx;
    font-weight: 600;
    color: #ffffff;
}
</style>
