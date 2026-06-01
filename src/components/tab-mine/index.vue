<template>
    <view class="page-mine">
        <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
            <text class="title">个人档案</text>
            <text class="subtitle">记录你的每一次向内倾听</text>
        </view>

        <scroll-view scroll-y class="scroll-area">
            <view class="scroll-inner">
                <!-- 人格卡片 -->
                <view class="type-card" :class="{ empty: !store.personalityType }">
                    <template v-if="store.personalityType">
                        <text class="tc-code">{{ store.personalityType }}</text>
                        <text class="tc-name">{{ store.personalityTypeName }}</text>
                        <text v-if="typeTags" class="tc-tags">{{ typeTags }}</text>
                    </template>
                    <template v-else>
                        <text class="tc-code">未进行性格测试</text>
                        <text class="tc-name">完成测试后在这里查看</text>
                    </template>
                </view>

                <!-- 统计 -->
                <view class="stats-row">
                    <view class="stat-item">
                        <text class="stat-num">{{ store.user?.testCount || 0 }}</text>
                        <text class="stat-label">完成测试</text>
                    </view>
                    <view class="stat-divider" />
                    <view class="stat-item">
                        <text class="stat-num">{{ store.creditBalance }}</text>
                        <text class="stat-label">剩余次数</text>
                    </view>
                    <view class="stat-divider" />
                    <view class="stat-item">
                        <text class="stat-num">{{ Math.max(0, store.dailyFreeTotal - store.dailyFreeUsed) }}</text>
                        <text class="stat-label">免费额度</text>
                    </view>
                </view>

                <!-- 操作列表 -->
                <view class="action-card">
                    <view class="action-row" @tap="goMember">
                        <view class="action-icon" style="background: rgba(45, 107, 63, 0.1); color: #2d6b3f">
                            <uni-icons type="vip" color="#2d6b3f" size="18" />
                        </view>
                        <view class="action-info">
                            <text class="action-t1">会员中心</text>
                            <text class="action-t2">查看套餐、续费会员</text>
                        </view>
                        <uni-icons type="forward" color="#c0c4c0" size="16" />
                    </view>
                    <view class="action-row" @tap="goOrders">
                        <view class="action-icon" style="background: rgba(43, 108, 176, 0.1); color: #2b6cb0">
                            <uni-icons type="list" color="#2b6cb0" size="18" />
                        </view>
                        <view class="action-info">
                            <text class="action-t1">购买记录</text>
                            <text class="action-t2">查看历史购买和订单</text>
                        </view>
                        <uni-icons type="forward" color="#c0c4c0" size="16" />
                    </view>
                    <view class="action-row" @tap="goSetting">
                        <view class="action-icon" style="background: rgba(128, 138, 128, 0.1); color: #808a80">
                            <uni-icons type="gear" color="#808a80" size="18" />
                        </view>
                        <view class="action-info">
                            <text class="action-t1">设置</text>
                            <text class="action-t2">偏好设置与关于</text>
                        </view>
                        <uni-icons type="forward" color="#c0c4c0" size="16" />
                    </view>
                </view>

                <!-- 底部 -->
                <view class="footer">
                    <text class="footer-name">向内倾听</text>
                    <text class="footer-ver">Version 1.0.0</text>
                </view>

                <view class="bottom-safe" />
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

const typeTags = computed(() => {
    const tags = store.result?.typeTags
    if (tags && tags.length > 0) return tags.join(' · ')
    return ''
})

onMounted(() => {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 44
    fetchCredits()
})

function goMember() {
    uni.navigateTo({ url: '/pages/member/center' })
}
function goOrders() {
    uni.navigateTo({ url: '/pages/member/orders' })
}
function goSetting() {
    uni.showToast({ title: '设置', icon: 'none' })
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page-mine {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: $color-bg;
    overflow: hidden;
}

.header {
    padding: 16rpx 48rpx 24rpx;

    .title {
        display: block;
        font-size: 48rpx;
        font-weight: 700;
        color: $color-primary;
    }
    .subtitle {
        display: block;
        font-size: 26rpx;
        color: $color-secondary;
        margin-top: 4rpx;
    }
}

.scroll-area {
    flex: 1;
    height: 0;
    overflow: hidden;
}
.scroll-inner {
    padding: 0 $spacing-xl;
}

// 人格卡片
.type-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 56rpx 48rpx 48rpx;
    background: linear-gradient(135deg, $color-accent, $color-accent-dark);
    border-radius: $radius-lg;
    margin-top: $spacing-md;

    .tc-code {
        font-size: 80rpx;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: 4rpx;
    }
    .tc-name {
        font-size: 36rpx;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
        margin-top: 8rpx;
    }
    .tc-tags {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.6);
        margin-top: 16rpx;
        letter-spacing: 2rpx;
    }

    &.empty {
        background: linear-gradient(135deg, #edf1ee, #dfe8e1);
        .tc-code {
            font-size: 28rpx;
            color: $color-secondary;
            font-weight: 600;
            letter-spacing: 0;
        }
        .tc-name {
            font-size: 24rpx;
            color: $color-secondary;
            margin-top: $spacing-xs;
        }
    }
}

// 统计
.stats-row {
    display: flex;
    margin-top: 28rpx;
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-md;
    overflow: hidden;

    .stat-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32rpx 0;

        .stat-num {
            font-size: 44rpx;
            font-weight: 800;
            color: $color-accent;
        }
        .stat-label {
            font-size: 22rpx;
            color: $color-muted;
            margin-top: 8rpx;
        }
    }
    .stat-divider {
        width: 2rpx;
        background: $color-border;
        opacity: 0.5;
    }
}

// 操作列表
.action-card {
    margin-top: 28rpx;
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-md;
    overflow: hidden;

    .action-row {
        display: flex;
        align-items: center;
        gap: 28rpx;
        padding: 36rpx 40rpx;
        border-bottom: 2rpx solid $color-border;

        &:last-child {
            border-bottom: none;
        }

        .action-icon {
            width: 72rpx;
            height: 72rpx;
            border-radius: 16rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .action-info {
            flex: 1;
        }
        .action-t1 {
            font-size: 28rpx;
            font-weight: 600;
            color: $color-primary;
        }
        .action-t2 {
            font-size: 22rpx;
            color: $color-muted;
            margin-top: 4rpx;
        }
    }
}

// 底部
.footer {
    text-align: center;
    margin-top: 48rpx;
    padding-bottom: $spacing-xs;
    .footer-name {
        font-size: 26rpx;
        font-weight: 600;
        color: $color-primary;
    }
    .footer-ver {
        font-size: 20rpx;
        color: #c0c4c0;
        margin-top: 4rpx;
        display: block;
    }
}

.bottom-safe {
    height: calc(180rpx + env(safe-area-inset-bottom));
}
</style>
