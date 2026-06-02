<template>
    <view class="page-result">
        <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="back-btn" @click="goBack">
                <uni-icons type="back" color="#1e3322" size="20" />
            </view>
            <text class="nav-title">匹配报告</text>
            <view class="nav-placeholder" />
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
                    <uni-icons type="personadd-filled" color="#2d6b3f" size="48" />
                </view>
                <text class="empty-title">暂无匹配报告</text>
                <text class="empty-desc">完成性格测试后，匹配数据将在这里展示</text>
            </view>

            <!-- 匹配报告内容 -->
            <view v-else class="scroll-inner">
                <!-- 双人头像 + 契合度 -->
                <view class="hero-card">
                    <view class="hc-duo">
                        <view class="hc-person">
                            <image v-if="myAvatarUrl" :src="myAvatarUrl" class="hc-avatar" mode="aspectFill" />
                            <view v-else class="hc-avatar hc-avatar-a">
                                <text class="hc-initial">{{ myInitial }}</text>
                            </view>
                            <text class="hc-type">{{ myType }}</text>
                            <text class="hc-name">{{ myName }}</text>
                        </view>
                        <view class="hc-heart">💚</view>
                        <view class="hc-person">
                            <image v-if="otherAvatarUrl" :src="otherAvatarUrl" class="hc-avatar" mode="aspectFill" />
                            <view v-else class="hc-avatar hc-avatar-b">
                                <text class="hc-initial">{{ otherInitial }}</text>
                            </view>
                            <text class="hc-type">{{ otherType }}</text>
                            <text class="hc-name">{{ otherName }}</text>
                        </view>
                    </view>
                    <text class="hc-score">{{ data.compatibilityScore || 0 }}%</text>
                    <text class="hc-label">灵魂契合度</text>
                    <view class="hc-tags">
                        <text v-for="tag in matchTags" :key="tag" class="hc-tag">{{ tag }}</text>
                    </view>
                </view>

                <!-- 维度对比 -->
                <view class="dims-card">
                    <view class="dims-hd">
                        <view class="dims-dot" />
                        <text class="dims-title">维度对比</text>
                    </view>
                    <view v-for="(dim, key) in dimList" :key="key" class="dim-block">
                        <view class="dim-hd">
                            <text class="dim-name">{{ dim.label }}</text>
                            <text class="dim-tag" :class="dim.match ? 'dim-tag-on' : 'dim-tag-off'">{{ dim.match ? '相似' : '互补' }}</text>
                        </view>
                        <view class="dim-bar">
                            <text class="dim-l dim-la">{{ myShortName }}</text>
                            <text class="dim-lv dim-lv-a">{{ dim.myLetter }}</text>
                            <view class="dim-track"><view class="dim-fill dim-fill-a" :style="{ width: dim.myPercent + '%' }" /></view>
                            <text class="dim-pct">{{ dim.myPercent }}%</text>
                        </view>
                        <view class="dim-bar">
                            <text class="dim-l dim-lb">{{ otherShortName }}</text>
                            <text class="dim-lv dim-lv-b">{{ dim.otherLetter }}</text>
                            <view class="dim-track"><view class="dim-fill dim-fill-b" :style="{ width: dim.otherPercent + '%' }" /></view>
                            <text class="dim-pct">{{ dim.otherPercent }}%</text>
                        </view>
                        <view class="dim-msg">{{ dim.comment }}</view>
                    </view>
                </view>

                <!-- 关系建议 -->
                <view class="sec-card">
                    <view class="sec-hd">
                        <view class="sec-dot" />
                        <text class="sec-title">关系建议</text>
                    </view>
                    <view class="adv-item">
                        <text class="adv-icon">💡</text>
                        <view class="adv-body">
                            <text class="adv-t">优势互补</text>
                            <text class="adv-d">{{ data.advice?.strengths || '互相了解，发现更多可能性' }}</text>
                        </view>
                    </view>
                    <view class="adv-item">
                        <text class="adv-icon">🌱</text>
                        <view class="adv-body">
                            <text class="adv-t">需要留意</text>
                            <text class="adv-d">{{ data.advice?.weakness || '互相尊重彼此的差异' }}</text>
                        </view>
                    </view>
                    <view class="adv-item" style="border: none; margin-bottom: 0; padding-bottom: 0">
                        <text class="adv-icon">💬</text>
                        <view class="adv-body">
                            <text class="adv-t">成长空间</text>
                            <text class="adv-d">{{ data.advice?.growth || '多沟通，发挥各自优势' }}</text>
                        </view>
                    </view>
                </view>

                <!-- AI 深度解读 -->
                <view class="ai-card" @click="goToAiChat">
                    <view class="ai-left">
                        <view class="ai-icon-bg">
                            <uni-icons type="chatboxes" color="#ffffff" size="18" />
                        </view>
                        <view class="ai-text">
                            <text class="ai-t1">AI 深度解读</text>
                            <text class="ai-t2">向 AI 了解你们的匹配关系</text>
                        </view>
                    </view>
                    <uni-icons type="arrow-right" color="rgba(255,255,255,0.5)" size="20" />
                </view>

                <!-- 操作栏 -->
                <view class="action-row">
                    <view class="ar-btn" @click="handleShare">📤 分享报告</view>
                </view>

                <view class="bottom-safe" />
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

// === 我 ===
const myType = computed(() => (isUserA.value ? data.value?.userA?.personalityType : data.value?.userB?.personalityType) || '--')
const myTypeName = computed(() => (isUserA.value ? data.value?.userA?.personalityTypeName : data.value?.userB?.personalityTypeName) || '')
const myName = computed(() => (isUserA.value ? data.value?.userA?.nickName : data.value?.userB?.nickName) || '我')
const myShortName = computed(() => (myName.value.length > 3 ? myName.value.slice(0, 3) + '..' : myName.value))
const myAvatarUrl = computed(() => {
    const u = isUserA.value ? data.value?.userA?.avatarUrl : data.value?.userB?.avatarUrl
    return u?.startsWith('cloud://') ? u : ''
})
const myInitial = computed(() => (myName.value || '我')[0])

// === 对方 ===
const otherType = computed(() => (isUserA.value ? data.value?.userB?.personalityType : data.value?.userA?.personalityType) || '--')
const otherTypeName = computed(() => (isUserA.value ? data.value?.userB?.personalityTypeName : data.value?.userA?.personalityTypeName) || '')
const otherName = computed(() => (isUserA.value ? data.value?.userB?.nickName : data.value?.userA?.nickName) || '好友')
const otherShortName = computed(() => (otherName.value.length > 3 ? otherName.value.slice(0, 3) + '..' : otherName.value))
const otherAvatarUrl = computed(() => {
    const u = isUserA.value ? data.value?.userB?.avatarUrl : data.value?.userA?.avatarUrl
    return u?.startsWith('cloud://') ? u : ''
})
const otherInitial = computed(() => (otherName.value || '好')[0])

const myDimScores = computed(() => (isUserA.value ? data.value?.userA?.dimScores : data.value?.userB?.dimScores) || {})
const otherDimScores = computed(() => (isUserA.value ? data.value?.userB?.dimScores : data.value?.userA?.dimScores) || {})

// === 匹配标签 ===
const matchTags = computed(() => {
    const tags = []
    const cd = data.value?.compatibilityData
    if (cd) {
        tags.push(cd.hasTypeMatch ? '🧩 天生一对' : '🧩 互补组合')
        const m = cd.matchedDims || 0
        if (m >= 3) tags.push('🔥 高度契合')
        else if (m >= 2) tags.push('✨ 很有缘分')
        else tags.push('💪 互相成就')
    }
    return tags
})

// === 维度列表 ===
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
        summary: `${myType.value} · ${myTypeName.value} ⟷ ${otherType.value} · ${otherTypeName.value}`,
        imageUrl: '',
        success: () => {}
    })
}

function goToAiChat() {
    const ctx = encodeURIComponent(
        JSON.stringify({
            matchContext: true,
            myType: myType.value,
            myTypeName: myTypeName.value,
            otherType: otherType.value,
            otherTypeName: otherTypeName.value,
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
}

.nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32rpx;
    padding-bottom: 16rpx;
    background: $color-bg;
    border-bottom: 2rpx solid $color-border;
    flex-shrink: 0;
    .back-btn,
    .nav-placeholder {
        width: 60rpx;
        height: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .nav-title {
        font-size: 34rpx;
        font-weight: 700;
        color: $color-primary;
    }
}

.scroll-area {
    flex: 1;
    height: 0;
    overflow: hidden;
}
.scroll-inner {
    padding: 0 32rpx;
}

// ===== 加载 & 空状态 =====
.loading-box,
.empty-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 40vh;
    gap: $spacing-md;
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
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    background: rgba(45, 107, 63, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
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

// ===== Hero 卡片（对齐首页 type-card）=====
.hero-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: $spacing-xl;
    padding: 48rpx 40rpx 40rpx;
    background: linear-gradient(135deg, $color-accent 0%, $color-accent-dark 100%);
    border-radius: $radius-lg;
    box-shadow: 0 16rpx 48rpx rgba(45, 107, 63, 0.25);
}

.hc-duo {
    display: flex;
    align-items: center;
    gap: 40rpx;
    margin-bottom: 24rpx;
}
.hc-person {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
}
.hc-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    font-weight: 700;
    color: #fff;
    overflow: hidden;
}
.hc-avatar-a {
    background: rgba(255, 255, 255, 0.15);
}
.hc-avatar-b {
    background: rgba(255, 255, 255, 0.1);
}
.hc-initial {
    font-size: 32rpx;
    font-weight: 700;
    color: #ffffff;
}
.hc-type {
    font-size: 28rpx;
    font-weight: 800;
    color: #fff;
    letter-spacing: 2rpx;
}
.hc-name {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.7);
}
.hc-heart {
    font-size: 36rpx;
}

.hc-score {
    font-size: 72rpx;
    font-weight: 800;
    color: #fff;
    line-height: 1;
}
.hc-label {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 4rpx;
}

.hc-tags {
    display: flex;
    gap: 12rpx;
    justify-content: center;
    margin-top: 20rpx;
    flex-wrap: wrap;
}
.hc-tag {
    font-size: 20rpx;
    padding: 6rpx 20rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 30rpx;
    color: rgba(255, 255, 255, 0.8);
}

// ===== 维度对比（对齐首页 dims-card）=====
.dims-card {
    background: rgba(255, 255, 255, 0.88);
    border-radius: $radius-md;
    padding: 32rpx;
    margin-top: $spacing-md;
}

.dims-hd {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: $spacing-lg;
}
.dims-dot {
    width: 4rpx;
    height: 20rpx;
    background: $color-accent;
    border-radius: 2rpx;
}
.dims-title {
    font-size: 24rpx;
    font-weight: 700;
    color: $color-accent;
}

.dim-block {
    margin-bottom: 24rpx;
}
.dim-block:last-child {
    margin-bottom: 0;
}
.dim-hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12rpx;
}
.dim-name {
    font-size: 26rpx;
    font-weight: 600;
    color: $color-primary;
}
.dim-tag {
    font-size: 18rpx;
    padding: 4rpx 18rpx;
    border-radius: 30rpx;
    font-weight: 600;
}
.dim-tag-on {
    background: rgba(45, 107, 63, 0.08);
    color: $color-accent;
}
.dim-tag-off {
    background: rgba(230, 126, 34, 0.08);
    color: #e67e22;
}

.dim-bar {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 6rpx;
}
.dim-l {
    font-size: 22rpx;
    width: 100rpx;
    text-align: right;
    flex-shrink: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.dim-la {
    color: $color-accent;
}
.dim-lb {
    color: #5a8fd4;
}
.dim-lv {
    font-size: 22rpx;
    font-weight: 700;
    width: 24rpx;
    text-align: center;
    flex-shrink: 0;
}
.dim-lv-a {
    color: $color-accent;
}
.dim-lv-b {
    color: #5a8fd4;
}

.dim-track {
    flex: 1;
    height: 10rpx;
    background: #e8ece8;
    border-radius: 4rpx;
    overflow: hidden;
    min-width: 0;
}
.dim-fill {
    height: 100%;
    border-radius: 4rpx;
}
.dim-fill-a {
    background: linear-gradient(90deg, $color-accent, #4a9f5e);
}
.dim-fill-b {
    background: linear-gradient(90deg, #7db0f0, #a0c4ff);
}

.dim-pct {
    font-size: 22rpx;
    font-weight: 700;
    color: $color-accent;
    width: 44rpx;
    text-align: right;
    flex-shrink: 0;
}

.dim-msg {
    font-size: 22rpx;
    color: $color-secondary;
    line-height: 1.5;
    padding: 10rpx 14rpx;
    background: $color-surface-secondary;
    border-radius: $radius-sm;
    margin-top: 4rpx;
}

// ===== 关系建议（对齐首页 report-card）=====
.sec-card {
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-md;
    padding: $spacing-lg;
    margin-top: $spacing-md;
}
.sec-hd {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: $spacing-lg;
}
.sec-dot {
    width: 4rpx;
    height: 20rpx;
    background: $color-accent;
    border-radius: 2rpx;
}
.sec-title {
    font-size: 24rpx;
    font-weight: 700;
    color: $color-accent;
}

.adv-item {
    display: flex;
    gap: 16rpx;
    padding-bottom: 20rpx;
    margin-bottom: 20rpx;
    border-bottom: 2rpx solid $color-border;
}
.adv-icon {
    font-size: 32rpx;
    flex-shrink: 0;
    line-height: 1.4;
}
.adv-body {
    flex: 1;
    min-width: 0;
}
.adv-t {
    font-size: 26rpx;
    font-weight: 700;
    color: $color-primary;
    display: block;
    margin-bottom: 4rpx;
}
.adv-d {
    font-size: 24rpx;
    color: $color-secondary;
    line-height: 1.6;
    display: block;
}

// ===== AI 入口（对齐首页 ai-entry）=====
.ai-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(135deg, $color-accent 0%, $color-accent-dark 100%);
    border-radius: $radius-md;
    padding: $spacing-lg;
    margin-top: $spacing-md;
}
.ai-left {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
}
.ai-icon-bg {
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
}
.ai-t1 {
    font-size: 28rpx;
    font-weight: 700;
    color: #ffffff;
}
.ai-t2 {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.7);
}

// ===== 操作栏（对齐首页 action-row）=====
.action-row {
    display: flex;
    align-items: center;
    margin-top: $spacing-lg;
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-md;
}
.ar-btn {
    flex: 1;
    text-align: center;
    font-size: 26rpx;
    color: $color-accent;
    font-weight: 600;
    padding: 20rpx 0;
    border-radius: $radius-md;
}

.bottom-safe {
    height: calc(40rpx + env(safe-area-inset-bottom) + 40rpx);
}
</style>
