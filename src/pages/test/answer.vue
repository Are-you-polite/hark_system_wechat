<template>
    <view class="page-test">
        <!-- 顶部导航 -->
        <view class="nav" :style="{ paddingTop: statusBarHeight + 'px' }">
            <text class="nav-left" @click="localIndex > 0 ? prevQuestion() : goBack()">
                {{ localIndex > 0 ? '上一题' : '退出' }}
            </text>
            <text class="nav-count">{{ localIndex + 1 }} / {{ total }}</text>
            <text class="nav-ph">{{ localIndex > 0 ? '上一题' : '退出' }}</text>
        </view>

        <!-- 进度条 -->
        <view class="progress-track">
            <view class="progress-fill" :style="{ width: progressPercent + '%' }" />
        </view>

        <!-- 加载态 -->
        <view v-if="loading" class="loading-wrap">
            <view class="spinner" />
            <text class="loading-text">加载题目中...</text>
        </view>

        <!-- 答题内容 -->
        <template v-else>
            <view class="content">
                <!-- 维度标签 -->
                <view class="dim-tag">
                    <view class="dim-dot" />
                    <text>{{ dimLabel(currentQ.dim) }}</text>
                </view>

                <!-- 题目 -->
                <text class="question">{{ currentQ.text }}</text>

                <!-- 选项 -->
                <view class="options">
                    <view class="option" :class="{ selected: localSelected === 'a' }" @click="selectOption('a')">
                        <view class="radio-outer">
                            <view v-if="localSelected === 'a'" class="radio-inner" />
                        </view>
                        <text class="opt-text" :class="{ 'opt-selected': localSelected === 'a' }">{{ currentQ.a.text }}</text>
                    </view>
                    <view class="option" :class="{ selected: localSelected === 'b' }" @click="selectOption('b')">
                        <view class="radio-outer">
                            <view v-if="localSelected === 'b'" class="radio-inner" />
                        </view>
                        <text class="opt-text" :class="{ 'opt-selected': localSelected === 'b' }">{{ currentQ.b.text }}</text>
                    </view>
                </view>
            </view>

            <!-- 底部按钮 -->
            <view class="bottom-bar">
                <view class="btn-next" :class="{ disabled: !localSelected }" @click="nextQuestion">
                    <text>{{ localIndex === total - 1 ? '完成  ✓' : '下一题' }}</text>
                </view>
            </view>
        </template>
    </view>
</template>

<script setup>
import { useTest } from '@/hooks/useTest'

const { localIndex, localSelected, loading, total, currentQ, progressPercent, dimLabel, selectOption, prevQuestion, nextQuestion, loadQuestions, goBack } = useTest()

const statusBarHeight = ref(uni.getWindowInfo().statusBarHeight || 44)

onMounted(() => {
    loadQuestions()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page-test {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: $color-bg;
    overflow: hidden;
}

// ===== 导航 (height:88, fill:$surface, border-bottom:1px $line) =====
.nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    padding: 0 40rpx;
    background: $color-surface;
    border-bottom: 2rpx solid $color-border;
}
.nav-left {
    font-size: 26rpx;
    color: $color-secondary;
    width: 100rpx;
    flex-shrink: 0;
}
.nav-count {
    font-size: 26rpx;
    font-weight: 600;
    color: $color-muted;
}
.nav-ph {
    font-size: 26rpx;
    color: transparent;
    width: 100rpx;
    flex-shrink: 0;
}

// ===== 进度条 (height:3, $brand-soft bg, $brand fill) =====
.progress-track {
    height: 6rpx;
    background: $color-surface-secondary;
    overflow: hidden;
}
.progress-fill {
    height: 100%;
    background: $color-accent;
    transition: width 0.4s;
}

// ===== 加载态 =====
.loading-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
}
.loading-text {
    font-size: 24rpx;
    color: $color-muted;
}
.spinner {
    width: 40rpx;
    height: 40rpx;
    border: 4rpx solid $color-border;
    border-top-color: $color-accent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

// ===== 内容区 =====
.content {
    flex: 1;
    padding: 40rpx 40rpx 0;
    display: flex;
    flex-direction: column;
    gap: 32rpx;
    overflow-y: auto;
}

// 维度标签
.dim-tag {
    display: flex;
    align-items: center;
    gap: 12rpx;
}
.dim-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 6rpx;
    background: $color-accent;
}
.dim-tag text {
    font-size: 22rpx;
    font-weight: 600;
    color: $color-accent;
    letter-spacing: 2rpx;
}

// 题目
.question {
    font-size: 40rpx;
    font-weight: 700;
    color: $color-primary;
    line-height: 1.4;
}

// 选项
.options {
    display: flex;
    flex-direction: column;
    gap: 32rpx;
}
.option {
    display: flex;
    align-items: center;
    gap: 24rpx;
    padding: 32rpx;
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
}
.option.selected {
    border: 3rpx solid $color-accent;
}
.radio-outer {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    border: 3rpx solid $color-muted;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.option.selected .radio-outer {
    border: 3rpx solid $color-accent;
    background: $color-accent;
}
.radio-inner {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background: #ffffff;
}
.opt-text {
    font-size: 28rpx;
    color: $color-primary;
    line-height: 1.5;
    flex: 1;
}
.opt-selected {
    color: $color-accent;
    font-weight: 600;
}

// ===== 底部按钮 =====
.bottom-bar {
    padding: 24rpx 40rpx 56rpx;
    border-top: 2rpx solid $color-border;
    background: $color-bg;
}
.btn-next {
    width: 100%;
    height: 96rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $color-accent;
    border-radius: $radius-btn;
    font-size: 32rpx;
    font-weight: 600;
    color: #ffffff;
}
.btn-next.disabled {
    opacity: 0.4;
    pointer-events: none;
}
</style>
