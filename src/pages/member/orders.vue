<template>
    <view class="page-orders">
        <view class="top-area" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="top-back" @click="goBack">
                <uni-icons type="back" color="#1e3322" size="22" />
            </view>
            <text class="top-title">购买记录</text>
            <view class="top-ph" />
        </view>

        <scroll-view scroll-y class="scroll-area">
            <view class="scroll-inner">
                <!-- 空态 -->
                <view v-if="loading" class="empty-state">
                    <text class="empty-text">加载中...</text>
                </view>

                <view v-else-if="list.length === 0" class="empty-state">
                    <view class="empty-icon">📋</view>
                    <text class="empty-t1">暂无购买记录</text>
                    <text class="empty-t2">去购买次数后，记录会显示在这里</text>
                </view>

                <template v-else>
                    <!-- 累计 -->
                    <view class="total-row">
                        <text class="total-label">累计消费</text>
                        <text class="total-amount">¥{{ totalAmount }}</text>
                    </view>

                    <!-- 按月分组 -->
                    <view v-for="(group, gi) in groupedList" :key="gi" class="month-group">
                        <text class="month-label">{{ group.month }}</text>
                        <view v-for="(item, idx) in group.items" :key="idx" class="order-row">
                            <view class="order-dot" :class="item.status === 'completed' ? 'green' : ''" />
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

// 累计消费
const totalAmount = computed(() => {
    return list.value.reduce((s, o) => s + Number(o.price || 0), 0).toFixed(1)
})

// 按月分组
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
    background-color: $color-surface;
    overflow: hidden;
}

// 导航
.top-area {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 48rpx 28rpx;
    border-bottom: 2rpx solid $color-border;
    flex-shrink: 0;

    .top-back {
        width: 64rpx;
    }
    .top-title {
        font-size: 34rpx;
        font-weight: 600;
        color: $color-primary;
    }
    .top-ph {
        width: 64rpx;
    }
}

.scroll-area {
    flex: 1;
    height: 0;
    overflow: hidden;
}
.scroll-inner {
    padding: 40rpx 48rpx 48rpx;
}

// 空态
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 40vh;

    .empty-icon {
        width: 112rpx;
        height: 112rpx;
        background: #f5f5f5;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 32rpx;
        font-size: 48rpx;
    }
    .empty-t1 {
        font-size: 32rpx;
        font-weight: 600;
        color: $color-primary;
    }
    .empty-t2 {
        font-size: 26rpx;
        color: #bbb;
        margin-top: 12rpx;
    }
    .empty-text {
        font-size: 26rpx;
        color: $color-muted;
    }
}

// 累计
.total-row {
    display: flex;
    align-items: baseline;
    gap: 16rpx;
    margin-bottom: 56rpx;

    .total-label {
        font-size: 28rpx;
        color: #999;
    }
    .total-amount {
        font-size: 56rpx;
        font-weight: 700;
        color: $color-primary;
    }
}

// 月份组
.month-group {
    margin-bottom: 48rpx;
    &:last-child {
        margin-bottom: 0;
    }
}

.month-label {
    display: block;
    font-size: 26rpx;
    font-weight: 600;
    color: #999;
    margin-bottom: 24rpx;
    letter-spacing: 1rpx;
}

// 订单行
.order-row {
    display: flex;
    gap: 28rpx;
    padding: 28rpx 0;
    border-bottom: 2rpx solid #f2f2f2;

    &:last-child {
        border-bottom: none;
    }
}

.order-dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background: #ddd;
    margin-top: 12rpx;
    flex-shrink: 0;

    &.green {
        background: $color-accent;
    }
}

.order-body {
    flex: 1;
}

.order-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;

    .order-name {
        font-size: 30rpx;
        font-weight: 600;
        color: $color-primary;
    }
    .order-price {
        font-size: 30rpx;
        font-weight: 700;
        color: $color-primary;
    }
}

.order-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8rpx;

    .order-date {
        font-size: 24rpx;
        color: #bbb;
    }
    .order-status {
        font-size: 24rpx;
        color: $color-accent;
    }
}
</style>
