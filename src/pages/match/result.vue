<template>
    <view class="page-match-result">
        <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="back-btn" @tap="goBack">
                <uni-icons type="back" color="#1e3322" size="20" />
            </view>
            <text class="nav-title">匹配报告</text>
            <view class="nav-placeholder" />
        </view>

        <view class="empty-state">
            <view class="empty-icon-wrap">
                <uni-icons type="personadd-filled" color="#2d6b3f" size="48" />
            </view>
            <text class="empty-title">暂无匹配报告</text>
            <text class="empty-desc">完成性格测试后，匹配数据将在这里展示</text>
        </view>
    </view>
</template>

<script setup>
const statusBarHeight = ref(uni.getWindowInfo().statusBarHeight || 44)

const goBack = () => uni.navigateBack()
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page-match-result {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: $color-bg;
}

.nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 $spacing-xl;
    padding-bottom: 16rpx;
    background-color: $color-bg;
    border-bottom: 2rpx solid $color-border;

    .back-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
    }
    .nav-title {
        font-size: 36rpx;
        font-weight: 700;
        color: $color-primary;
    }
    .nav-placeholder {
        width: 60rpx;
    }
}

.empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-md;
    padding-bottom: 20vh;
}

.empty-icon-wrap {
    width: 140rpx;
    height: 140rpx;
    background-color: rgba(45, 107, 63, 0.05);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $spacing-sm;
}

.empty-title {
    font-size: 32rpx;
    font-weight: 700;
    color: $color-primary;
}

.empty-desc {
    font-size: 26rpx;
    color: $color-secondary;
    text-align: center;
    line-height: 1.5;
}
</style>
