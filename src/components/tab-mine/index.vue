<template>
    <view class="page-mine">
        <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="header-text">
                <text class="title">个人档案</text>
                <text class="subtitle">记录你的每一次向内倾听</text>
            </view>
        </view>

        <scroll-view scroll-y class="scroll-area">
            <view class="scroll-inner">
                <!-- 人格卡片 -->
                <view class="type-card">
                    <template v-if="store.personalityType">
                        <view class="tc-icon">
                            <uni-icons type="person" color="#2d6b3f" size="18" />
                        </view>
                        <text class="tc-code">{{ store.personalityType }}</text>
                        <text class="tc-name">{{ store.personalityTypeName }}</text>
                        <text v-if="typeTags" class="tc-tags">{{ typeTags }}</text>
                    </template>
                    <template v-else>
                        <view class="tc-icon">
                            <uni-icons type="person" color="#2d6b3f" size="18" />
                        </view>
                        <text class="tc-empty-title">你的性格档案</text>
                        <text class="tc-empty-desc">完成 30 道性格测试题，获取你的人格类型报告、维度解读与匹配入口。</text>
                        <view class="tc-empty-btn" @click="goTest">
                            <text class="tc-empty-btn-text">开始性格测试</text>
                        </view>
                    </template>
                </view>

                <!-- 操作列表 -->
                <view class="action-card">
                    <!-- 会员中心 -->
                    <view class="action-row" @click="goMember">
                        <view class="action-icon" style="background: $color-accent-bg">
                            <uni-icons type="vip" color="#2d6b3f" size="18" />
                        </view>
                        <view class="action-info">
                            <text class="action-t1">会员中心</text>
                            <text class="action-t2">查看套餐、续费会员</text>
                        </view>
                        <uni-icons type="forward" color="#c0c4c0" size="16" />
                    </view>
                    <!-- 购买记录 -->
                    <view class="action-row" @click="goOrders">
                        <view class="action-icon" style="background: #eef0f8">
                            <uni-icons type="list" color="#2b6cb0" size="18" />
                        </view>
                        <view class="action-info">
                            <text class="action-t1">购买记录</text>
                            <text class="action-t2">查看历史购买和订单</text>
                        </view>
                        <uni-icons type="forward" color="#c0c4c0" size="16" />
                    </view>
                    <!-- 设置 -->
                    <view class="action-row" @click="goSetting">
                        <view class="action-icon" style="background: $color-surface-secondary">
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
                <view class="footer-info">
                    <text class="footer-name">向内倾听</text>
                    <text class="footer-ver">Version 1.0.0</text>
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

function goTest() {
    uni.navigateTo({ url: '/pages/test/answer' })
}
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
    width: 100%;
    height: 100%;
    background: $color-bg;
    overflow: hidden;
}

// ===== Header =====
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

// ===== Scroll =====
.scroll-area {
    flex: 1;
    height: 0;
    overflow: hidden;
}
.scroll-inner {
    padding: 0 40rpx 180rpx 40rpx;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

// ===== 人格卡片 =====
.type-card {
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    padding: 56rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24rpx;
}
.tc-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 40rpx;
    background: $color-accent-bg;
    display: flex;
    align-items: center;
    justify-content: center;
}
.tc-code {
    font-size: 72rpx;
    font-weight: 800;
    color: $color-accent;
    letter-spacing: 4rpx;
    line-height: 1;
}
.tc-name {
    font-size: 30rpx;
    font-weight: 600;
    color: $color-primary;
}
.tc-tags {
    font-size: 24rpx;
    color: $color-secondary;
}
.tc-empty-title {
    font-size: 34rpx;
    font-weight: 600;
    color: $color-primary;
}
.tc-empty-desc {
    font-size: 24rpx;
    color: $color-secondary;
    line-height: 1.6;
    text-align: center;
    width: 520rpx;
}
.tc-empty-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80rpx;
    border-radius: $radius-btn;
    background: $color-accent;
    padding: 0 48rpx;
}
.tc-empty-btn-text {
    font-size: 28rpx;
    font-weight: 600;
    color: #ffffff;
}

// ===== 统计区 =====
// ===== 操作列表 =====
.action-card {
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    overflow: hidden;
}
.action-row {
    display: flex;
    align-items: center;
    gap: 24rpx;
    padding: 28rpx 32rpx;
    border-bottom: 2rpx solid $color-border;
}
.action-row:last-child {
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

// ===== 底部 =====
.footer-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
    padding: 40rpx 0 0;
}
.footer-name {
    font-size: 26rpx;
    font-weight: 600;
    color: $color-primary;
}
.footer-ver {
    font-size: 20rpx;
    color: $color-muted;
}
</style>
