<template>
    <view class="page-result">
        <!-- 导航栏 -->
        <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
            <text class="nav-back" @click="goBack">返回</text>
            <text class="nav-title">匹配报告</text>
            <text class="nav-placeholder">返回</text>
        </view>

        <scroll-view scroll-y class="scroll-area">
            <!-- 加载中 -->
            <view v-if="loading" class="loading-box">
                <view class="loading-spin" />
                <text class="loading-text">加载中...</text>
            </view>

            <!-- 无数据 -->
            <view v-else-if="!data" class="empty-box">
                <view class="empty-icon">
                    <uni-icons type="personadd" color="#2d6b3f" size="28" />
                </view>
                <text class="empty-title">暂无匹配报告</text>
                <text class="empty-desc">完成性格测试后，匹配数据将在这里展示</text>
            </view>

            <!-- 报告内容 -->
            <view v-else class="scroll-inner">
                <!-- 关系摘要 -->
                <view class="summary-card">
                    <view class="sc-duo">
                        <view class="sc-person">
                            <image v-if="myAvatarUrl" :src="myAvatarUrl" class="sc-avatar-img" mode="aspectFill" />
                            <text v-else class="sc-avatar-txt">{{ myInitial }}</text>
                            <text class="sc-type">{{ myType }}</text>
                            <text class="sc-name">{{ myName }}</text>
                        </view>
                        <view class="sc-score-block">
                            <text class="sc-score">{{ data.compatibilityScore || 0 }}%</text>
                            <text class="sc-score-label">灵魂契合度</text>
                        </view>
                        <view class="sc-person">
                            <image v-if="otherAvatarUrl" :src="otherAvatarUrl" class="sc-avatar-img" mode="aspectFill" />
                            <text v-else class="sc-avatar-txt">{{ otherInitial }}</text>
                            <text class="sc-type">{{ otherType }}</text>
                            <text class="sc-name">{{ otherName }}</text>
                        </view>
                    </view>
                    <text class="sc-insight">{{ data.compatibilityData?.description || '你们在价值观和沟通方式上有很强的互补性。' }}</text>
                    <view class="sc-tags">
                        <text v-for="(tag, i) in matchTags" :key="i" class="sc-tag">{{ tag }}</text>
                    </view>
                </view>

                <!-- 维度对比 -->
                <view class="dims-card">
                    <view class="dims-header">
                        <view class="dims-dot" />
                        <text class="dims-title">维度对比</text>
                    </view>
                    <view v-for="(dim, key) in dimList" :key="key" class="dim-section">
                        <view class="dim-header-row">
                            <text class="dim-name">{{ dim.label }}</text>
                            <view class="dim-match-tag" :class="dim.match ? 'tag-same' : 'tag-diff'">{{ dim.match ? '相似' : '互补' }}</view>
                        </view>
                        <view class="dim-bar-row">
                            <text class="dim-who">我</text>
                            <text class="dim-letter dim-letter-me">{{ dim.myLetter }}</text>
                            <view class="dim-track">
                                <view class="dim-fill dim-fill-me" :style="{ width: dim.myPercent + '%' }" />
                            </view>
                            <text class="dim-pct dim-pct-me">{{ dim.myPercent }}%</text>
                        </view>
                        <view class="dim-bar-row">
                            <text class="dim-who dim-who-txt">{{ otherShortName }}</text>
                            <text class="dim-letter dim-letter-other">{{ dim.otherLetter }}</text>
                            <view class="dim-track">
                                <view class="dim-fill dim-fill-other" :style="{ width: dim.otherPercent + '%' }" />
                            </view>
                            <text class="dim-pct dim-pct-other">{{ dim.otherPercent }}%</text>
                        </view>
                        <text class="dim-comment">{{ dim.comment }}</text>
                    </view>
                </view>

                <!-- 关系建议 -->
                <view class="advice-card">
                    <view class="advice-header">
                        <view class="advice-dot" />
                        <text class="advice-title">关系建议</text>
                    </view>
                    <view class="advice-item">
                        <view class="advice-icon-box">
                            <uni-icons type="plus" color="#2d6b3f" size="16" />
                        </view>
                        <view class="advice-body">
                            <text class="advice-item-title">优势互补</text>
                            <text class="advice-desc">{{ data.advice?.strengths || '互相了解，发现更多可能性' }}</text>
                        </view>
                    </view>
                    <view class="advice-divider" />
                    <view class="advice-item">
                        <view class="advice-icon-box">
                            <uni-icons type="alert" color="#2d6b3f" size="16" />
                        </view>
                        <view class="advice-body">
                            <text class="advice-item-title">需要留意</text>
                            <text class="advice-desc">{{ data.advice?.weakness || '互相尊重彼此的差异' }}</text>
                        </view>
                    </view>
                    <view class="advice-divider" />
                    <view class="advice-item">
                        <view class="advice-icon-box">
                            <uni-icons type="refresh" color="#2d6b3f" size="16" />
                        </view>
                        <view class="advice-body">
                            <text class="advice-item-title">成长空间</text>
                            <text class="advice-desc">{{ data.advice?.growth || '多沟通，发挥各自优势' }}</text>
                        </view>
                    </view>
                </view>

                <!-- AI 深度解读 -->
                <view class="ai-entry-card" @click="goToAiChat">
                    <view class="ai-entry-left">
                        <view class="ai-entry-avatar">
                            <uni-icons type="chatbubble" color="#ffffff" size="16" />
                        </view>
                        <view class="ai-entry-text">
                            <text class="ai-entry-title">AI 深度解读</text>
                            <text class="ai-entry-sub">向 AI 了解你们的匹配关系</text>
                        </view>
                    </view>
                    <uni-icons type="arrow-right" color="#808a80" size="16" />
                </view>

                <!-- 分享按钮 -->
                <view class="share-report-btn" @click="handleShare">
                    <uni-icons type="redo" color="#2d6b3f" size="16" />
                    <text class="share-report-text">分享匹配报告</text>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { matchApi } from '@/api/match'

const statusBarHeight = ref(uni.getWindowInfo().statusBarHeight || 44)
const loading = ref(true)
const data = ref(null)
const matchId = ref('')

onLoad((options) => {
    matchId.value = options?.matchId || ''
})

onMounted(async () => {
    if (!matchId.value) {
        loading.value = false
        return
    }
    try {
        const res = await matchApi.getDetail(matchId.value)
        if (res.code === 0) data.value = res.data
        else uni.showToast({ title: res.message || '加载失败', icon: 'none' })
    } catch {
        uni.showToast({ title: '网络错误', icon: 'none' })
    } finally {
        loading.value = false
    }
})

const isUserA = computed(() => data.value?.isMe === 'userA')

const myType = computed(() => (isUserA.value ? data.value?.userA?.personalityType : data.value?.userB?.personalityType) || '--')
const myName = computed(() => (isUserA.value ? data.value?.userA?.nickName : data.value?.userB?.nickName) || '我')
const myAvatarUrl = computed(() => {
    const u = isUserA.value ? data.value?.userA?.avatarUrl : data.value?.userB?.avatarUrl
    return u?.startsWith('cloud://') ? u : ''
})
const myInitial = computed(() => (myName.value || '我')[0])

const otherType = computed(() => (isUserA.value ? data.value?.userB?.personalityType : data.value?.userA?.personalityType) || '--')
const otherName = computed(() => (isUserA.value ? data.value?.userB?.nickName : data.value?.userA?.nickName) || '好友')
const otherShortName = computed(() => (otherName.value.length > 3 ? otherName.value.slice(0, 3) + '..' : otherName.value))
const otherAvatarUrl = computed(() => {
    const u = isUserA.value ? data.value?.userB?.avatarUrl : data.value?.userA?.avatarUrl
    return u?.startsWith('cloud://') ? u : ''
})
const otherInitial = computed(() => (otherName.value || '好')[0])

const myDimScores = computed(() => (isUserA.value ? data.value?.userA?.dimScores : data.value?.userB?.dimScores) || {})
const otherDimScores = computed(() => (isUserA.value ? data.value?.userB?.dimScores : data.value?.userA?.dimScores) || {})

const matchTags = computed(() => {
    const tags = []
    const cd = data.value?.compatibilityData
    if (cd) {
        tags.push(cd.hasTypeMatch ? '天生一对' : '互补组合')
        const m = cd.matchedDims || 0
        if (m >= 3) tags.push('高度契合')
        else if (m >= 2) tags.push('很有缘分')
        else tags.push('互相成就')
    }
    return tags
})

const dimList = computed(() => {
    const dd = data.value?.dimDetails || {}
    const cfg = {
        EI: { label: '社交能量', ka: 'E', kb: 'I' },
        SN: { label: '认知方式', ka: 'N', kb: 'S' },
        TF: { label: '处事风格', ka: 'F', kb: 'T' },
        JP: { label: '生活态度', ka: 'J', kb: 'P' }
    }
    return Object.entries(cfg).map(([key, c]) => {
        const detail = dd[key] || {}
        const pct = (scores, letter) => {
            if (!scores) return 50
            const a = scores[c.ka] ?? 0
            const b = scores[c.kb] ?? 0
            const t = a + b
            if (t === 0) return 50
            return Math.round(((scores[letter] ?? 0) / t) * 100)
        }
        return {
            ...detail,
            key,
            label: c.label,
            match: detail.match ?? false,
            myLetter: detail.a ?? c.ka,
            otherLetter: detail.b ?? c.kb,
            myPercent: pct(myDimScores.value, detail.a ?? c.ka),
            otherPercent: pct(otherDimScores.value, detail.b ?? c.kb),
            comment: detail.comment ?? ''
        }
    })
})

function goBack() {
    uni.navigateBack()
}

function handleShare() {
    uni.share({
        provider: 'weixin',
        scene: 'session',
        type: 0,
        title: `我和 ${otherName.value} 的灵魂契合度 ${data.value?.compatibilityScore || 0}%`,
        summary: `${myType.value} ⟷ ${otherType.value}`,
        imageUrl: '',
        success: () => {}
    })
}

function goToAiChat() {
    const ctx = encodeURIComponent(
        JSON.stringify({
            matchContext: true,
            myType: myType.value,
            otherType: otherType.value,
            myName: myName.value,
            otherName: otherName.value,
            score: data.value?.compatibilityScore || 0
        })
    )
    uni.navigateTo({ url: `/pages/chat/detail?matchContext=${ctx}` })
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page-result {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: $color-bg;
    overflow: hidden;
}

// ===== 导航栏 =====
.nav-bar {
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
.nav-placeholder {
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
    padding: 0 40rpx 60rpx 40rpx;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

// ===== 加载 & 空状态 =====
.loading-box,
.empty-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 40vh;
    gap: 24rpx;
}
.loading-spin {
    width: 48rpx;
    height: 48rpx;
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
.loading-text {
    font-size: 26rpx;
    color: $color-muted;
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
.empty-title {
    font-size: 36rpx;
    font-weight: 600;
    color: $color-primary;
}
.empty-desc {
    font-size: 26rpx;
    color: $color-secondary;
    text-align: center;
    line-height: 1.6;
}

// ===== 关系摘要 =====
.summary-card {
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    padding: 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28rpx;
    margin-top: 8rpx;
}
.sc-duo {
    display: flex;
    align-items: center;
    gap: 32rpx;
}
.sc-person {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
}
.sc-avatar-img {
    width: 88rpx;
    height: 88rpx;
    border-radius: 44rpx;
}
.sc-avatar-txt {
    width: 88rpx;
    height: 88rpx;
    border-radius: 44rpx;
    background: $color-accent-bg;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: 700;
    color: $color-accent;
}
.sc-type {
    font-size: 26rpx;
    font-weight: 700;
    color: $color-primary;
    letter-spacing: 2rpx;
}
.sc-name {
    font-size: 22rpx;
    color: $color-muted;
}
.sc-score-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
}
.sc-score {
    font-size: 64rpx;
    font-weight: 800;
    color: $color-accent;
    line-height: 1;
}
.sc-score-label {
    font-size: 22rpx;
    color: $color-secondary;
}
.sc-insight {
    font-size: 24rpx;
    color: $color-secondary;
    line-height: 1.6;
    text-align: center;
}
.sc-tags {
    display: flex;
    gap: 16rpx;
    justify-content: center;
    flex-wrap: wrap;
}
.sc-tag {
    font-size: 20rpx;
    font-weight: 500;
    color: $color-accent;
    background: $color-accent-bg;
    padding: 8rpx 24rpx;
    border-radius: 999rpx;
}

// ===== 维度对比 =====
.dims-card {
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    padding: 32rpx;
    display: flex;
    flex-direction: column;
    gap: 28rpx;
}
.dims-header {
    display: flex;
    align-items: center;
    gap: 16rpx;
}
.dims-dot {
    width: 8rpx;
    height: 32rpx;
    background: $color-accent;
    border-radius: 4rpx;
}
.dims-title {
    font-size: 26rpx;
    font-weight: 600;
    color: $color-accent;
}
.dim-section {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}
.dim-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.dim-name {
    font-size: 26rpx;
    font-weight: 600;
    color: $color-primary;
}
.dim-match-tag {
    font-size: 16rpx;
    font-weight: 600;
    padding: 4rpx 20rpx;
    border-radius: 999rpx;
}
.tag-same {
    background: $color-accent-bg;
    color: $color-accent;
}
.tag-diff {
    background: #fef6ee;
    color: #a06b2b;
}
.dim-bar-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
}
.dim-who {
    font-size: 20rpx;
    width: 60rpx;
    flex-shrink: 0;
    color: $color-accent;
    font-weight: 500;
}
.dim-who-txt {
    color: $color-muted;
}
.dim-letter {
    font-size: 22rpx;
    font-weight: 700;
    width: 24rpx;
    text-align: center;
    flex-shrink: 0;
}
.dim-letter-me {
    color: $color-accent;
}
.dim-letter-other {
    color: $color-muted;
}
.dim-track {
    flex: 1;
    height: 12rpx;
    border-radius: 6rpx;
    overflow: hidden;
}
.dim-bar-row:first-of-type .dim-track {
    background: $color-accent-bg;
}
.dim-bar-row:last-of-type .dim-track {
    background: #eef0f5;
}
.dim-fill {
    height: 100%;
    border-radius: 6rpx;
}
.dim-fill-me {
    background: $color-accent;
}
.dim-fill-other {
    background: $color-muted;
}
.dim-pct {
    font-size: 20rpx;
    font-weight: 700;
    width: 48rpx;
    text-align: right;
    flex-shrink: 0;
}
.dim-pct-me {
    color: $color-accent;
}
.dim-pct-other {
    color: $color-muted;
}
.dim-comment {
    font-size: 20rpx;
    color: $color-muted;
    line-height: 1.5;
}

// ===== 关系建议 =====
.advice-card {
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    padding: 32rpx;
    display: flex;
    flex-direction: column;
}
.advice-header {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 20rpx;
}
.advice-dot {
    width: 8rpx;
    height: 32rpx;
    background: $color-accent;
    border-radius: 4rpx;
}
.advice-title {
    font-size: 26rpx;
    font-weight: 600;
    color: $color-accent;
}
.advice-item {
    display: flex;
    gap: 16rpx;
    padding: 16rpx 0;
}
.advice-icon-box {
    width: 40rpx;
    height: 40rpx;
    border-radius: 20rpx;
    background: $color-accent-bg;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 4rpx;
}
.advice-body {
    flex: 1;
}
.advice-item-title {
    font-size: 26rpx;
    font-weight: 700;
    color: $color-primary;
    display: block;
    margin-bottom: 4rpx;
}
.advice-desc {
    font-size: 22rpx;
    color: $color-secondary;
    line-height: 1.6;
    display: block;
}
.advice-divider {
    height: 2rpx;
    background: $color-border;
}

// ===== AI 入口 =====
.ai-entry-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    padding: 28rpx 32rpx;
}
.ai-entry-left {
    display: flex;
    align-items: center;
    gap: 20rpx;
}
.ai-entry-avatar {
    width: 56rpx;
    height: 56rpx;
    border-radius: 28rpx;
    background: $color-accent;
    display: flex;
    align-items: center;
    justify-content: center;
}
.ai-entry-text {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
}
.ai-entry-title {
    font-size: 28rpx;
    font-weight: 600;
    color: $color-primary;
}
.ai-entry-sub {
    font-size: 22rpx;
    color: $color-muted;
}

// ===== 分享按钮 =====
.share-report-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    padding: 28rpx;
}
.share-report-text {
    font-size: 28rpx;
    font-weight: 600;
    color: $color-accent;
}
</style>
