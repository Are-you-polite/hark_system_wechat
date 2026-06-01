<template>
    <view class="page-test">
        <!-- 顶部导航 -->
        <view class="nav" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="nav-left" @tap="localIndex > 0 ? prevQuestion() : goBack()">
                <text class="nav-label">{{ localIndex > 0 ? '上一题' : '退出' }}</text>
            </view>
            <text class="nav-count">{{ localIndex + 1 }} / {{ total }}</text>
            <view class="nav-ph" />
        </view>

        <!-- 进度条 -->
        <view class="progress-wrap">
            <view class="progress-bar">
                <view class="progress-fill" :style="{ width: progressPercent + '%' }" />
            </view>
        </view>

        <!-- 加载态 -->
        <view v-if="loading" class="loading-wrap">
            <view class="spinner" />
            <text class="loading-text">加载题目中...</text>
        </view>

        <!-- 答题内容 -->
        <template v-else>
            <view class="content">
                <view class="dim-tag">
                    <view class="dim-dot" />
                    <text>{{ dimLabel(currentQ.dim) }}</text>
                </view>

                <text class="question">{{ currentQ.text }}</text>

                <view class="options">
                    <view class="option" :class="{ selected: localSelected === 'a' }" @tap="selectOption('a')">
                        <view class="radio">
                            <view class="radio-dot" />
                        </view>
                        <text class="opt-text">{{ currentQ.a.text }}</text>
                    </view>
                    <view class="option" :class="{ selected: localSelected === 'b' }" @tap="selectOption('b')">
                        <view class="radio">
                            <view class="radio-dot" />
                        </view>
                        <text class="opt-text">{{ currentQ.b.text }}</text>
                    </view>
                </view>
            </view>

            <!-- 底部按钮 -->
            <view class="bottom-bar">
                <view class="btn-next" :class="{ disabled: !localSelected }" @tap="nextQuestion">
                    <text>{{ localIndex === total - 1 ? '完成' : '下一题' }}</text>
                    <text v-if="localIndex !== total - 1">→</text>
                    <text v-else>✓</text>
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
    background-color: $color-bg;
    overflow: hidden;
}

// ===== 导航 =====
.nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40rpx 16rpx;
    background-color: $color-bg;
    border-bottom: 2rpx solid $color-border;
    flex-shrink: 0;

    .nav-left {
        padding: 8rpx;
        cursor: pointer;
    }
    .nav-label {
        font-size: 26rpx;
        color: $color-secondary;
        font-weight: 500;
    }
    .nav-count {
        font-size: 26rpx;
        font-weight: 600;
        color: $color-muted;
    }
    .nav-ph {
        width: 80rpx;
    }
}

// ===== 进度条 =====
.progress-wrap {
    padding: 0 40rpx;
    flex-shrink: 0;
    background-color: $color-bg;
}
.progress-bar {
    height: 8rpx;
    background: $color-surface-secondary;
    border-radius: 2rpx;
    overflow: hidden;
}
.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, $color-accent, #4a9f5e);
    border-radius: 2rpx;
    transition: width 0.4s;
}

// ===== 加载态 =====
.loading-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;

    .loading-text {
        font-size: 24rpx;
        color: $color-muted;
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
.spinner {
    width: 40rpx;
    height: 40rpx;
    border: 4rpx solid $color-border;
    border-top-color: $color-accent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

// ===== 内容 =====
.content {
    flex: 1;
    padding: 48rpx 40rpx 0;
    overflow-y: auto;
}

.dim-tag {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 32rpx;

    .dim-dot {
        width: 8rpx;
        height: 8rpx;
        background: $color-accent;
        border-radius: 50%;
    }
    text {
        font-size: 22rpx;
        font-weight: 600;
        color: $color-accent;
        letter-spacing: 2rpx;
    }
}

.question {
    display: block;
    font-size: 40rpx;
    font-weight: 700;
    color: $color-primary;
    line-height: 1.45;
    margin-bottom: 48rpx;
}

.options {
    display: flex;
    flex-direction: column;
    gap: 20rpx;

    .option {
        display: flex;
        align-items: center;
        gap: 16rpx;
        padding: 32rpx 40rpx;
        background: $color-surface;
        border: 2rpx solid $color-border;
        border-radius: $radius-lg;
        transition: all 0.2s;

        .radio {
            width: 40rpx;
            height: 40rpx;
            border-radius: 50%;
            border: 4rpx solid $color-muted;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: all 0.2s;

            .radio-dot {
                width: 20rpx;
                height: 20rpx;
                border-radius: 50%;
                background: transparent;
                transition: all 0.2s;
            }
        }

        .opt-text {
            font-size: 28rpx;
            color: $color-primary;
            line-height: 1.4;
            flex: 1;
        }

        &.selected {
            border-color: $color-accent;
            background: rgba($color-accent, 0.02);

            .radio {
                border-color: $color-accent;
                background: $color-accent;
                .radio-dot {
                    background: #ffffff;
                }
            }
            .opt-text {
                color: $color-accent;
                font-weight: 600;
            }
        }
    }
}

// ===== 底部按钮 =====
.bottom-bar {
    padding: 32rpx 40rpx 64rpx;
    flex-shrink: 0;
    border-top: 2rpx solid $color-border;
    background-color: $color-bg;
}

.btn-next {
    width: 100%;
    padding: 28rpx 0;
    background: linear-gradient(135deg, $color-accent, $color-accent-dark);
    border-radius: $radius-lg;
    text-align: center;
    font-size: 32rpx;
    font-weight: 600;
    color: #ffffff;

    &.disabled {
        pointer-events: none;
        opacity: 0.4;
    }
}
</style>
