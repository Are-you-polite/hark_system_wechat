<template>
    <view class="page-home">
        <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="header-text">
                <text class="title">向内倾听</text>
                <text class="subtitle">了解自己，从倾听内心开始</text>
            </view>
        </view>

        <scroll-view scroll-y class="scroll-area">
            <view class="scroll-inner">
                <!-- 加载中 -->
                <view v-if="store.loading" class="loading-init">
                    <view class="loading-spinner" />
                    <text class="loading-init-text">加载中...</text>
                </view>

                <!-- 未登录 -->
                <view v-else-if="!store.loggedIn">
                    <view class="hero-card">
                        <view class="card-content">
                            <text class="card-title">你的性格{{ '\n' }}藏着无限可能</text>
                            <text class="card-desc">完成性格测试，获取专属于你的深度解读报告与个人成长指南</text>
                            <view class="btn-start" @click="goTest">
                                <text class="btn-text">开始性格测试</text>
                                <uni-icons type="arrow-right" color="#ffffff" size="18" />
                            </view>
                        </view>
                    </view>
                    <text class="hero-note">只需要 30 道选择题 · 约 5 分钟即可完成</text>
                    <view class="bottom-safe" />
                </view>

                <!-- 已登录未完成 -->
                <view v-else-if="!store.hasTested">
                    <view class="progress-card">
                        <view class="pc-top">
                            <text class="pc-label">答题进度</text>
                            <text class="pc-num">{{ store.currentIndex }}/{{ store.totalQuestions }}</text>
                        </view>
                        <view class="pc-bar">
                            <view class="pc-track" :style="{ width: store.progressPercent + '%' }" />
                        </view>
                    </view>

                    <view class="resume-card">
                        <text class="rc-title">{{ store.hasProgress ? '继续完成测试' : '你的性格' }}{{ '\n' }}{{ store.hasProgress ? '离结果只差一步' : '藏着无限可能' }}</text>
                        <text class="rc-desc">{{ store.hasProgress ? `已完成 ${store.currentIndex}/${store.totalQuestions} 题，继续答题即可生成报告` : '完成性格测试，获取专属于你的深度解读报告与个人成长指南' }}</text>
                        <view class="btn-start" @click="goTest">
                            <text class="btn-text">{{ store.hasProgress ? '继续答题' : '开始性格测试' }}</text>
                            <uni-icons type="arrow-right" color="#ffffff" size="18" />
                        </view>
                    </view>

                    <view class="bottom-safe" />
                </view>

                <!-- 已完成 -->
                <view v-else>
                    <view class="type-card">
                        <text class="tc-code">{{ store.personalityType }}</text>
                        <text class="tc-name">{{ store.personalityTypeName }}</text>
                        <view v-if="typeTags" class="tc-badge">
                            <text class="tc-badge-text">{{ typeTags }}</text>
                        </view>
                    </view>

                    <view class="dims-card">
                        <view class="dim-row">
                            <text class="dim-label">社交</text>
                            <view class="dim-track"><view class="dim-fill" :style="{ width: dimPercent.E + '%' }" /></view>
                            <text class="dim-val">{{ dimPercent.E }}% {{ dimPercent.E >= 50 ? '外向' : '内向' }}</text>
                        </view>
                        <view class="dim-row">
                            <text class="dim-label">认知</text>
                            <view class="dim-track"><view class="dim-fill" :style="{ width: dimPercent.N + '%' }" /></view>
                            <text class="dim-val">{{ dimPercent.N }}% {{ dimPercent.N >= 50 ? '直觉' : '实感' }}</text>
                        </view>
                        <view class="dim-row">
                            <text class="dim-label">决策</text>
                            <view class="dim-track"><view class="dim-fill" :style="{ width: dimPercent.T + '%' }" /></view>
                            <text class="dim-val">{{ dimPercent.T }}% {{ dimPercent.T >= 50 ? '理性' : '感性' }}</text>
                        </view>
                        <view class="dim-row">
                            <text class="dim-label">生活</text>
                            <view class="dim-track"><view class="dim-fill" :style="{ width: dimPercent.J + '%' }" /></view>
                            <text class="dim-val">{{ dimPercent.J }}% {{ dimPercent.J >= 50 ? '计划' : '随性' }}</text>
                        </view>
                    </view>

                    <view v-if="typeSummary" class="report-card">
                        <text class="r-title">类型解读</text>
                        <text class="r-body">{{ typeSummary }}</text>
                    </view>

                    <view v-if="strengthTags.length > 0" class="report-card">
                        <text class="r-title">优势特质</text>
                        <view class="r-tags">
                            <text v-for="(tag, i) in strengthTags" :key="i" class="r-tag">{{ tag }}</text>
                        </view>
                    </view>

                    <view v-if="growthAdvice" class="report-card">
                        <text class="r-title">成长建议</text>
                        <text class="r-body">{{ growthAdvice }}</text>
                    </view>

                    <view v-if="weaknessTags.length > 0" class="report-card">
                        <text class="r-title">盲点</text>
                        <view class="r-tags">
                            <text v-for="(tag, i) in weaknessTags" :key="i" class="r-tag">{{ tag }}</text>
                        </view>
                    </view>

                    <view v-if="careerTags.length > 0" class="report-card">
                        <text class="r-title">职场建议</text>
                        <text class="r-body">{{ careerTags.join(' · ') }}</text>
                    </view>

                    <view v-if="socialAdvice" class="report-card">
                        <text class="r-title">人际关系</text>
                        <text class="r-body">{{ socialAdvice }}</text>
                    </view>

                    <view class="ai-entry" @click="goAiChat">
                        <view class="ai-left">
                            <view class="ai-icon">
                                <uni-icons type="chatboxes" color="#ffffff" size="18" />
                            </view>
                            <view class="ai-text">
                                <text class="ai-t1">AI 深度解读</text>
                                <text class="ai-t2">向 AI 提问，深入了解你的性格特质</text>
                            </view>
                        </view>
                        <uni-icons type="arrow-right" color="rgba(255,255,255,0.5)" size="20" />
                    </view>

                    <view class="action-row">
                        <view class="ar-btn" @click="handleRetest">重新测试</view>
                        <button class="ar-btn" open-type="share">分享</button>
                    </view>

                    <view class="bottom-safe" />
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
    if (store.loggedIn) fetchCredits()
})

// 维度百分比计算
const dimScores = computed(() => store.result?.dimScores || store.user?.dimScores || {})
const dimPercent = computed(() => {
    const calc = (a, b) => {
        const total = (a || 0) + (b || 0)
        return total > 0 ? Math.round(((a || 0) / total) * 100) : 50
    }
    return {
        E: calc(dimScores.value.E, dimScores.value.I),
        N: calc(dimScores.value.N, dimScores.value.S),
        T: calc(dimScores.value.T, dimScores.value.F),
        J: calc(dimScores.value.J, dimScores.value.P)
    }
})

// 类型标签（优先从数据库读取）
const typeTags = computed(() => {
    const tags = store.result?.typeTags
    if (tags && tags.length > 0) return tags.join(' · ')
    return ''
})

// 类型描述
const typeSummary = computed(() => {
    return store.result?.typeReport?.summary || ''
})

const strengthTags = computed(() => {
    const s = store.result?.typeReport?.strengths
    if (s && s.length > 0) return s
    return []
})

const growthAdvice = computed(() => {
    const g = store.result?.typeReport?.growth
    if (g && g.length > 0) return g.join('')
    return ''
})

const weaknessTags = computed(() => {
    return store.result?.typeReport?.weaknesses || []
})

const careerTags = computed(() => {
    const c = store.result?.typeReport?.career
    if (c && c.length > 0) return c
    return []
})

const socialAdvice = computed(() => {
    return store.result?.typeReport?.social || ''
})

function goTest() {
    uni.navigateTo({ url: '/pages/test/answer' })
}
function goAiChat() {
    uni.navigateTo({ url: '/pages/chat/detail' })
}
function handleRetest() {
    uni.showModal({
        title: '重新测试',
        content: '确定重新测试？当前结果将被清除',
        success: (res) => {
            if (res.confirm) store.resetTest()
        }
    })
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page-home {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background-color: $color-bg;
    overflow: hidden;
}

.header {
    padding: $spacing-md 0 0;
    margin: 0 $spacing-xl $spacing-md;

    .header-text {
        display: flex;
        flex-direction: column;
        .title {
            font-size: 44rpx;
            font-weight: 700;
            color: $color-primary;
            margin-bottom: $spacing-xs;
        }
        .subtitle {
            font-size: 26rpx;
            color: $color-secondary;
        }
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

// ===== 通用 =====
.btn-start {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    background-color: $color-accent;
    padding: $spacing-md $spacing-xl;
    border-radius: $radius-sm;
    width: fit-content;
    margin-top: 32rpx;
    box-shadow: $shadow-btn;
    .btn-text {
        color: #ffffff;
        font-size: 30rpx;
        font-weight: 600;
    }
}

.bottom-safe {
    height: calc(180rpx + env(safe-area-inset-bottom));
}

// ===== 未登录 =====
.hero-card {
    position: relative;
    overflow: hidden;
    margin-top: $spacing-xl;
    background: linear-gradient(135deg, #edf1ee 0%, #dfe8e1 100%);
    border: 2rpx solid $color-border;
    border-radius: $radius-lg;
    padding: 32rpx;

    &::before {
        content: '';
        position: absolute;
        width: 300rpx;
        height: 300rpx;
        background: rgba($color-accent, 0.05);
        border-radius: 50%;
        top: -80rpx;
        right: -100rpx;
        pointer-events: none;
    }

    .card-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        .card-title {
            font-size: 48rpx;
            font-weight: 800;
            color: $color-primary;
            line-height: 1.35;
        }
        .card-desc {
            margin-top: 20rpx;
            font-size: 26rpx;
            color: $color-secondary;
            line-height: 1.5;
        }
    }
}

.hero-note {
    display: block;
    text-align: center;
    font-size: 24rpx;
    color: $color-muted;
    margin-top: 24rpx;
}

// 加载中
.loading-init {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 40vh;

    .loading-spinner {
        width: 48rpx;
        height: 48rpx;
        border: 4rpx solid $color-border;
        border-top-color: $color-accent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
    .loading-init-text {
        font-size: 26rpx;
        color: $color-muted;
        margin-top: 24rpx;
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

// ===== 答题中 =====
.progress-card {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    padding: $spacing-lg;
    margin-top: $spacing-xl;
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-md;

    .pc-top {
        display: flex;
        justify-content: space-between;
        .pc-label {
            font-size: 24rpx;
            color: $color-muted;
        }
        .pc-num {
            font-size: 24rpx;
            font-weight: 600;
            color: $color-accent;
        }
    }
    .pc-bar {
        height: 8rpx;
        background: $color-surface-secondary;
        border-radius: 4rpx;
        overflow: hidden;
        .pc-track {
            height: 100%;
            background: linear-gradient(90deg, $color-accent 0%, #4a9f5e 100%);
            border-radius: 4rpx;
            transition: width 0.4s;
        }
    }
}

.resume-card {
    margin-top: $spacing-lg;
    padding: 32rpx;
    background: linear-gradient(135deg, #edf1ee 0%, #dfe8e1 100%);
    border: 2rpx solid $color-border;
    border-radius: $radius-lg;

    .rc-title {
        font-size: 40rpx;
        font-weight: 800;
        color: $color-primary;
        line-height: 1.35;
    }
    .rc-desc {
        font-size: 26rpx;
        color: $color-secondary;
        line-height: 1.5;
        margin-top: 14rpx;
    }
}

// ===== 已完成 =====
.type-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: $spacing-xl;
    padding: 72rpx 56rpx 64rpx;
    background: linear-gradient(135deg, $color-accent 0%, $color-accent-dark 100%);
    border-radius: $radius-lg;
    box-shadow: 0 16rpx 48rpx rgba(45, 107, 63, 0.25);

    .tc-code {
        font-size: 112rpx;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: 8rpx;
        line-height: 1;
    }
    .tc-name {
        font-size: 44rpx;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
        margin-top: $spacing-sm;
    }
    .tc-badge {
        margin-top: $spacing-md;
        padding: 6rpx 24rpx;
        border: 2rpx solid rgba(255, 255, 255, 0.25);
        border-radius: 30rpx;
        .tc-badge-text {
            font-size: 22rpx;
            color: rgba(255, 255, 255, 0.7);
            letter-spacing: 2rpx;
        }
    }
}

.dims-card {
    background: rgba(255, 255, 255, 0.88);
    border-radius: $radius-md;
    padding: 36rpx 40rpx;
    margin-top: $spacing-md;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

    .dim-row {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        .dim-label {
            font-size: 22rpx;
            color: #4a5a4a;
            width: 100rpx;
            flex-shrink: 0;
            font-weight: 600;
        }
        .dim-track {
            flex: 1;
            height: 10rpx;
            background: #e8ece8;
            border-radius: 4rpx;
            overflow: hidden;
        }
        .dim-fill {
            height: 100%;
            border-radius: 4rpx;
            background: linear-gradient(90deg, $color-accent, #4a9f5e);
        }
        .dim-val {
            font-size: 22rpx;
            font-weight: 700;
            color: $color-accent;
            width: 140rpx;
            text-align: right;
            white-space: nowrap;
        }
    }
}

.report-card {
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-md;
    padding: $spacing-lg;
    margin-top: $spacing-md;

    .r-title {
        font-size: 24rpx;
        font-weight: 700;
        color: $color-accent;
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        margin-bottom: $spacing-sm;
        &::before {
            content: '';
            width: 4rpx;
            height: 20rpx;
            background: $color-accent;
            border-radius: 2rpx;
        }
    }
    .r-body {
        font-size: 26rpx;
        color: #4a5a4a;
        line-height: 1.8;
    }
    .r-tags {
        display: flex;
        flex-wrap: wrap;
        gap: $spacing-sm;
    }
    .r-tag {
        font-size: 22rpx;
        padding: $spacing-xs $spacing-md;
        background: rgba($color-accent, 0.06);
        color: $color-accent;
        border-radius: $radius-sm;
        font-weight: 500;
    }
}

.ai-entry {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(135deg, $color-accent 0%, $color-accent-dark 100%);
    border-radius: $radius-md;
    padding: $spacing-lg;
    margin-top: $spacing-md;

    .ai-left {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        .ai-icon {
            width: 56rpx;
            height: 56rpx;
            background: rgba(255, 255, 255, 0.12);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .ai-text {
            display: flex;
            flex-direction: column;
            gap: 4rpx;
            .ai-t1 {
                font-size: 28rpx;
                font-weight: 700;
                color: #ffffff;
            }
            .ai-t2 {
                font-size: 22rpx;
                color: rgba(255, 255, 255, 0.7);
            }
        }
    }
}

.action-row {
    display: flex;
    align-items: center;
    margin-top: $spacing-lg;
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-md;

    .ar-btn {
        flex: 1;
        text-align: center;
        font-size: 26rpx;
        color: $color-accent;
        font-weight: 600;
        padding: 20rpx 0;
        border-radius: $radius-md;
        background: none;
        border: none;
        line-height: normal;

        &::after {
            border: none;
        }

        &:last-child {
            border-left: 2rpx solid $color-border;
        }
    }
}
</style>
