<template>
    <view>
        <view class="result-card">
            <text class="result-type-code">{{ store.personalityType }}</text>
            <text class="result-type-name">{{ store.personalityTypeName }}</text>
            <text v-if="typeTags" class="result-tags">{{ typeTags }}</text>
        </view>
        <view class="dims-card">
            <text class="dims-title">四维度画像</text>
            <view v-for="d in dimData" :key="d.key" class="dim-row-item">
                <text class="dim-label-txt">{{ d.label }}</text>
                <view class="dim-bar-wrap">
                    <text class="dim-trait">{{ d.traitB }}</text>
                    <view class="dim-track-wrap">
                        <view class="dim-track-fill" :style="{ width: d.percent + '%' }" />
                    </view>
                    <text class="dim-trait">{{ d.traitA }}</text>
                </view>
            </view>
        </view>
        <view class="interpret-group">
            <template v-for="(sec, i) in sections" :key="i">
                <view v-if="i > 0 && sec.show" class="ig-divider" />
                <view v-if="sec.show" class="ig-section">
                    <text class="ig-title">{{ sec.title }}</text>
                    <text v-if="sec.type === 'text'" class="ig-body">{{ sec.content }}</text>
                    <view v-else class="ig-tags-row">
                        <text v-for="(tag, ti) in sec.tags" :key="ti" class="ig-tag">{{ tag }}</text>
                    </view>
                </view>
            </template>
        </view>
    </view>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
const store = useUserStore()
const dims = computed(() => {
    const s = store.result?.dimScores || store.user?.dimScores || {}
    const calc = (a, b) => {
        const t = (a || 0) + (b || 0)
        return t > 0 ? Math.round(((a || 0) / t) * 100) : 50
    }
    return { E: calc(s.E, s.I), N: calc(s.N, s.S), T: calc(s.T, s.F), J: calc(s.J, s.P) }
})
const dimData = computed(() => [
    { key: 'E', label: '社交倾向', percent: dims.value.E, traitA: '外向', traitB: '内向' },
    { key: 'N', label: '认知方式', percent: dims.value.N, traitA: '直觉', traitB: '实感' },
    { key: 'T', label: '决策偏好', percent: dims.value.T, traitA: '情感', traitB: '理性' },
    { key: 'J', label: '生活态度', percent: dims.value.J, traitA: '计划', traitB: '随性' }
])

const tags = computed(() => store.result?.typeTags)
const typeTags = computed(() => (tags.value?.length ? tags.value.join(' · ') : ''))
const summary = computed(() => {
    const s = store.result?.typeReport?.summary
    return s?.length > 60 ? s.slice(0, 60) + '…' : s
})
const strengths = computed(() => store.result?.typeReport?.strengths || [])
const growth = computed(() => {
    const g = store.result?.typeReport?.growth
    return g?.length ? g.join('') : ''
})
const weaknesses = computed(() => store.result?.typeReport?.weaknesses || [])
const careers = computed(() => store.result?.typeReport?.career || [])
const social = computed(() => store.result?.typeReport?.social || '')
const sections = computed(() => [
    { title: '类型解读', type: 'text', content: summary.value, show: !!summary.value },
    { title: '优势特质', type: 'tags', tags: strengths.value, show: strengths.value.length > 0 },
    { title: '成长建议', type: 'text', content: growth.value, show: !!growth.value },
    { title: '盲点', type: 'tags', tags: weaknesses.value, show: weaknesses.value.length > 0 },
    { title: '职场建议', type: 'text', content: careers.value.join(' · '), show: careers.value.length > 0 },
    { title: '人际关系', type: 'text', content: social.value, show: !!social.value }
])
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;
.result-card {
    background: linear-gradient(135deg, $color-accent 0%, $color-accent-dark 100%);
    border-radius: $radius-lg;
    padding: 48rpx 40rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
    margin-top: 8rpx;
    position: relative;
}
.result-type-code {
    font-size: 96rpx;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 8rpx;
    line-height: 1.1;
    margin-bottom: 4rpx;
}
.result-type-name {
    font-size: 32rpx;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
}
.result-tags {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.65);
    margin-top: 8rpx;
    padding: 6rpx 20rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.2);
    border-radius: 999rpx;
}
.dims-card {
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    padding: 28rpx;
    margin-top: 16rpx;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
}
.dims-title {
    font-size: 28rpx;
    font-weight: 600;
    color: $color-primary;
}
.dim-row-item {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}
.dim-label-txt {
    font-size: 24rpx;
    font-weight: 600;
    color: $color-primary;
}
.dim-bar-wrap {
    display: flex;
    align-items: center;
    gap: 12rpx;
}
.dim-trait {
    font-size: 22rpx;
    color: $color-muted;
    white-space: nowrap;
    width: 60rpx;
    flex-shrink: 0;
    text-align: center;
}
.dim-track-wrap {
    flex: 1;
    height: 16rpx;
    border-radius: 999rpx;
    background: $color-accent-bg;
    overflow: hidden;
}
.dim-track-fill {
    height: 100%;
    border-radius: 999rpx;
    background: $color-accent;
}
.interpret-group {
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    margin-top: 16rpx;
    overflow: hidden;
}
.ig-section {
    padding: 20rpx 28rpx 16rpx;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}
.ig-title {
    font-size: 30rpx;
    font-weight: 600;
    color: $color-accent;
}
.ig-body {
    font-size: 24rpx;
    color: $color-secondary;
    line-height: 1.6;
}
.ig-tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
}
.ig-tag {
    font-size: 22rpx;
    font-weight: 500;
    color: $color-accent;
    background: $color-accent-bg;
    border-radius: 20rpx;
    padding: 12rpx 24rpx;
}
.ig-divider {
    height: 2rpx;
    background: $color-border;
    margin: 0 28rpx;
}
</style>
