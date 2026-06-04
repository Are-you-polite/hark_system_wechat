<template>
    <view class="page-orders">
        <!-- 导航栏 -->
        <view class="nav" :style="{ paddingTop: statusBarHeight + 'px' }">
            <text class="nav-back" @click="goBack">返回</text>
            <text class="nav-title">购买记录</text>
            <text class="nav-ph">返回</text>
        </view>

        <scroll-view scroll-y class="scroll-area">
            <view class="scroll-inner">
                <!-- 空态 -->
                <view v-if="loading" class="empty-wrap">
                    <text class="empty-text">加载中...</text>
                </view>

                <view v-else-if="list.length === 0" class="empty-wrap">
                    <view class="empty-icon">
                        <uni-icons type="list" color="#2d6b3f" size="28" />
                    </view>
                    <text class="empty-t1">暂无购买记录</text>
                    <text class="empty-t2">去购买次数后，记录会显示在这里</text>
                </view>

                <template v-else>
                    <!-- 累计消费 -->
                    <view class="total-row">
                        <text class="total-label">累计消费</text>
                        <text class="total-amount">¥{{ totalAmount }}</text>
                    </view>

                    <!-- 按月分组 -->
                    <view v-for="(group, gi) in groupedList" :key="gi" class="month-group">
                        <text class="month-label">{{ group.month }}</text>
                        <view v-for="(item, idx) in group.items" :key="idx" class="order-row">
                            <view class="order-dot" />
                            <view class="order-body">
                                <view class="order-top">
                                    <text class="order-name">{{ productName(item.product) }}</text>
                                    <text class="order-price">¥{{ item.price }}</text>
                                </view>
                                <view class="order-meta">
                                    <text class="order-date">{{ formatTime(item.createdAt) }}</text>
                                    <text class="order-status">{{ statusText(item.status) }}</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </template>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { paymentApi } from '@/api/payment'
import { formatTime } from '@/utils/format'

const statusBarHeight = ref(44)
const list = ref([])
const loading = ref(true)

const productNames = { credit_10: '10 次对话包', credit_50: '50 次对话包', vip_month: '月卡会员' }
const statusTexts = { completed: '已完成', refunded: '已退款' }

function productName(key) {
    return productNames[key] || key || '—'
}
function statusText(s) {
    return statusTexts[s] || s || '—'
}

const totalAmount = computed(() => {
    return list.value.reduce((s, o) => s + Number(o.price || 0), 0).toFixed(1)
})

const groupedList = computed(() => {
    const map = {}
    for (const o of list.value) {
        const d = new Date(o.createdAt)
        const key = d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月'
        if (!map[key]) map[key] = { month: key, items: [] }
        map[key].items.push(o)
    }
    return Object.values(map)
})

onMounted(async () => {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 44
    try {
        const res = await paymentApi.getList()
        if (res.code === 0) {
            list.value = (res.data.orders || []).filter((o) => o.status !== 'pending')
        }
    } catch {
        /* ignore */
    } finally {
        loading.value = false
    }
})

const goBack = () => uni.navigateBack()
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page-orders {
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
    padding: 40rpx 40rpx 60rpx 40rpx;
}

// ===== 空态 =====
.empty-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 40vh;
    gap: 16rpx;
}
.empty-icon {
    width: 112rpx;
    height: 112rpx;
    border-radius: 56rpx;
    background: $color-accent-bg;
    display: flex;
    align-items: center;
    justify-content: center;
}
.empty-t1 {
    font-size: 32rpx;
    font-weight: 600;
    color: $color-primary;
}
.empty-t2 {
    font-size: 24rpx;
    color: $color-muted;
}
.empty-text {
    font-size: 26rpx;
    color: $color-muted;
}

// ===== 累计消费 =====
.total-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 0 0 32rpx 0;
}
.total-label {
    font-size: 26rpx;
    color: $color-muted;
}
.total-amount {
    font-size: 56rpx;
    font-weight: 700;
    color: $color-primary;
}

// ===== 月份组 =====
.month-group {
    margin-bottom: 24rpx;
}
.month-label {
    display: block;
    font-size: 24rpx;
    font-weight: 600;
    color: $color-muted;
    padding: 16rpx 0 24rpx 0;
}

// ===== 订单行 =====
.order-row {
    display: flex;
    gap: 20rpx;
    padding: 24rpx 0;
    border-bottom: 2rpx solid $color-border;
}
.order-row:last-child {
    border-bottom: none;
}
.order-dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 8rpx;
    background: $color-accent;
    margin-top: 10rpx;
    flex-shrink: 0;
}
.order-body {
    flex: 1;
}
.order-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}
.order-name {
    font-size: 28rpx;
    font-weight: 600;
    color: $color-primary;
}
.order-price {
    font-size: 28rpx;
    font-weight: 700;
    color: $color-primary;
}
.order-meta {
    display: flex;
    justify-content: space-between;
    margin-top: 8rpx;
}
.order-date {
    font-size: 22rpx;
    color: $color-muted;
}
.order-status {
    font-size: 22rpx;
    font-weight: 500;
    color: $color-accent;
}
</style>
