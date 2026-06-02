<template>
    <view class="page-report">
        <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="back-btn" @click="goBack">
                <uni-icons type="back" color="#1e3322" size="20" />
            </view>
            <text class="nav-title">我的性格报告</text>
            <view class="nav-placeholder" />
        </view>

        <scroll-view scroll-y class="scroll-area">
            <view class="scroll-content">
                <view class="type-card">
                    <view class="type-badge">{{ store.personalityType }}</view>
                    <text class="type-name">{{ store.personalityTypeName }}</text>
                    <text class="type-nickname">探索你的性格特质与无限可能</text>
                </view>

                <view class="section-card">
                    <view class="section-header">
                        <view class="section-dot" />
                        <text class="section-label">性格维度</text>
                    </view>
                    <view class="trait-list">
                        <view class="trait-item">
                            <view class="trait-top">
                                <text class="trait-name">内向 (I) vs 外向 (E)</text>
                                <text class="trait-value">{{ iePercent }}%</text>
                            </view>
                            <view class="bar-container">
                                <view class="bar-track" :style="{ width: iePercent + '%' }" />
                            </view>
                        </view>
                        <view class="trait-item">
                            <view class="trait-top">
                                <text class="trait-name">实感 (S) vs 直觉 (N)</text>
                                <text class="trait-value">{{ snPercent }}%</text>
                            </view>
                            <view class="bar-container">
                                <view class="bar-track" :style="{ width: snPercent + '%' }" />
                            </view>
                        </view>
                        <view class="trait-item">
                            <view class="trait-top">
                                <text class="trait-name">理性 (T) vs 感性 (F)</text>
                                <text class="trait-value">{{ tfPercent }}%</text>
                            </view>
                            <view class="bar-container">
                                <view class="bar-track" :style="{ width: tfPercent + '%' }" />
                            </view>
                        </view>
                        <view class="trait-item">
                            <view class="trait-top">
                                <text class="trait-name">计划 (J) vs 随性 (P)</text>
                                <text class="trait-value">{{ jpPercent }}%</text>
                            </view>
                            <view class="bar-container">
                                <view class="bar-track" :style="{ width: jpPercent + '%' }" />
                            </view>
                        </view>
                    </view>
                </view>

                <view class="ai-entry" @click="goToAiChat">
                    <view class="ai-entry-left">
                        <view class="ai-icon-wrap">
                            <uni-icons type="chatboxes" color="#ffffff" size="22" />
                        </view>
                        <view class="ai-text">
                            <text class="ai-title">与 AI 深度解读</text>
                            <text class="ai-desc">向 AI 提问，深入了解你的性格特质</text>
                        </view>
                    </view>
                    <uni-icons type="arrow-right" color="rgba(255,255,255,0.6)" size="22" />
                </view>

                <!-- 匹配邀请入口 -->
                <view class="match-entry" @click="shareMatchCard">
                    <view class="match-entry-left">
                        <view class="match-icon-wrap">
                            <text class="match-icon">💫</text>
                        </view>
                        <view class="match-text">
                            <text class="match-title">寻找你的灵魂伙伴</text>
                            <text class="match-desc">分享性格卡片，邀请好友进行匹配</text>
                        </view>
                    </view>
                    <view class="match-entry-btn">💚 邀请匹配</view>
                </view>

                <view class="bottom-safe" />
            </view>
        </scroll-view>

        <!-- 资料完善弹窗 -->
        <ProfileSetup v-if="showProfileSetup" @close="showProfileSetup = false" @saved="onProfileSaved" />

        <!-- 有邀请待处理弹窗 -->
        <view v-if="showPendingInvite" class="overlay" @click="showPendingInvite = false">
            <view class="modal" @click.stop>
                <view class="modal-icon">💌</view>
                <text class="modal-title">{{ modalTitle }}</text>
                <text class="modal-desc">{{ modalDesc }}</text>
                <view class="modal-btns">
                    <view class="modal-btn modal-btn-cancel" @click="dismissInvite">稍后再说</view>
                    <view class="modal-btn modal-btn-confirm" @click="acceptInvite">💘 看看契合度</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { matchApi } from '@/api/match'
import ProfileSetup from '@/components/ProfileSetup.vue'

const store = useUserStore()
const statusBarHeight = ref(uni.getWindowInfo().statusBarHeight || 44)

// 邀请弹窗
const showPendingInvite = ref(false)
const modalTitle = ref('')
const modalDesc = ref('')
const modalInviterId = ref('')

function calcPercent(a, b) {
    const total = (a || 0) + (b || 0)
    return total > 0 ? Math.round((Math.max(a || 0, b || 0) / total) * 100) : 50
}

const dimScores = computed(() => store.result?.dimScores || store.user?.dimScores || {})
const iePercent = computed(() => calcPercent(dimScores.value.E, dimScores.value.I))
const snPercent = computed(() => calcPercent(dimScores.value.S, dimScores.value.N))
const tfPercent = computed(() => calcPercent(dimScores.value.T, dimScores.value.F))
const jpPercent = computed(() => calcPercent(dimScores.value.J, dimScores.value.P))

onMounted(() => {
    // 检查是否有待处理的匹配邀请
    if (store.pendingMatchInvite && store.inviterId) {
        modalInviterId.value = store.inviterId
        const name = store.inviterName || '好友'
        const type = store.inviterType || ''
        modalTitle.value = `好友${name}想和你匹配`
        modalDesc.value = type ? `${name} (${type}) 已经完成了测试\n要看看你们之间有多契合吗？` : `${name} 邀请你进行灵魂匹配\n要看看你们有多契合吗？`
        showPendingInvite.value = true
    }
})

const goBack = () => uni.navigateBack()
const goToAiChat = () => uni.navigateTo({ url: '/pages/chat/detail' })

const showProfileSetup = ref(false)

const shareMatchCard = () => {
    if (!store.profileComplete) {
        showProfileSetup.value = true
        return
    }
    // 触发微信原生分享
    uni.share({
        provider: 'weixin',
        scene: 'session',
        type: 0,
        title: store.personalityType ? `我是 ${store.personalityType} · ${store.personalityTypeName} — 来和我进行灵魂匹配吧` : '向内倾听 — 了解自己，从倾听内心开始',
        imageUrl: '',
        success: () => {}
    })
}

const onProfileSaved = () => {
    showProfileSetup.value = false
    // 保存后自动触发分享
    uni.share({
        provider: 'weixin',
        scene: 'session',
        type: 0,
        title: store.personalityType ? `我是 ${store.personalityType} · ${store.personalityTypeName} — 来和我进行灵魂匹配吧` : '向内倾听 — 了解自己，从倾听内心开始',
        imageUrl: '',
        success: () => {}
    })
}

const dismissInvite = () => {
    showPendingInvite.value = false
    store.pendingMatchInvite = false
}

const acceptInvite = async () => {
    showPendingInvite.value = false
    uni.showLoading({ title: '匹配中...' })
    try {
        const res = await matchApi.confirm(modalInviterId.value)
        uni.hideLoading()
        if (res.code === 0 && res.data.matchId) {
            store.clearInviter()
            uni.navigateTo({ url: `/pages/match/result?matchId=${res.data.matchId}` })
        } else {
            uni.showToast({ title: res.message || '匹配失败', icon: 'none' })
        }
    } catch {
        uni.hideLoading()
        uni.showToast({ title: '网络错误', icon: 'none' })
    }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page-report {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: $color-bg;
    overflow: hidden;
}

.nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 $spacing-xl;
    padding-bottom: $spacing-sm;
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

.scroll-area {
    flex: 1;
    height: 0;
}

.scroll-content {
    padding: $spacing-md $spacing-xl;
}

.type-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-xl $spacing-lg 48rpx;
    background: linear-gradient(135deg, $color-accent 0%, $color-accent-dark 100%);
    border-radius: $radius-xl;
    box-shadow: 0 12rpx 48rpx rgba(45, 107, 63, 0.25);

    .type-badge {
        font-size: 72rpx;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: 8rpx;
        line-height: 1;
        margin-bottom: $spacing-xs;
    }
    .type-name {
        font-size: 36rpx;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
    }
    .type-nickname {
        font-size: 26rpx;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.5;
        text-align: center;
    }
}

.section-card {
    margin-top: $spacing-lg;
    padding: $spacing-lg;
    background-color: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-lg;
    box-shadow: $shadow-card;
}

.section-header {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    margin-bottom: $spacing-md;

    .section-dot {
        width: 10rpx;
        height: 10rpx;
        background-color: $color-accent;
        border-radius: 50%;
    }
    .section-label {
        font-size: 20rpx;
        font-weight: 600;
        color: $color-accent;
        letter-spacing: 2rpx;
        text-transform: uppercase;
    }
}

.trait-list {
    display: flex;
    flex-direction: column;

    .trait-item {
        display: flex;
        flex-direction: column;
        gap: $spacing-xs;
        padding: $spacing-md 0;
        border-bottom: 2rpx solid $color-border;

        &:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }

        .trait-top {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .trait-name {
                font-size: 24rpx;
                color: $color-primary;
                font-weight: 500;
            }
            .trait-value {
                font-size: 22rpx;
                font-weight: 700;
                color: $color-accent;
                font-variant-numeric: tabular-nums;
            }
        }

        .bar-container {
            height: 8rpx;
            background-color: $color-surface-secondary;
            border-radius: 4rpx;
            overflow: hidden;

            .bar-track {
                height: 100%;
                background: linear-gradient(90deg, $color-accent 0%, #4a9f5e 100%);
                border-radius: 4rpx;
                transition: width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
        }
    }
}

.ai-entry {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-lg;
    margin-top: $spacing-lg;
    background: linear-gradient(135deg, $color-accent 0%, $color-accent-dark 100%);
    border-radius: $radius-lg;
    box-shadow: 0 8rpx 32rpx rgba(45, 107, 63, 0.25);

    .ai-entry-left {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        flex: 1;

        .ai-icon-wrap {
            width: 72rpx;
            height: 72rpx;
            background-color: rgba(255, 255, 255, 0.15);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .ai-text {
            display: flex;
            flex-direction: column;
            gap: 4rpx;

            .ai-title {
                font-size: 30rpx;
                font-weight: 700;
                color: #ffffff;
            }
            .ai-desc {
                font-size: 24rpx;
                color: rgba(255, 255, 255, 0.75);
            }
        }
    }
}

.bottom-safe {
    height: calc(40rpx + env(safe-area-inset-bottom));
}

/* ========== 匹配邀请入口 ========== */
.match-entry {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg;
    margin-top: $spacing-lg;
    background: linear-gradient(135deg, $color-accent 0%, $color-accent-dark 100%);
    border-radius: $radius-lg;
    box-shadow: 0 8rpx 32rpx rgba(45, 107, 63, 0.25);
}

.match-entry-left {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    flex: 1;
}

.match-icon-wrap {
    width: 72rpx;
    height: 72rpx;
    background-color: rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.match-icon {
    font-size: 32rpx;
}

.match-text {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
}

.match-title {
    font-size: 28rpx;
    font-weight: 700;
    color: #ffffff;
}

.match-desc {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.7);
}

.match-entry-btn {
    padding: 12rpx 24rpx;
    background: rgba(255, 255, 255, 0.15);
    border: 2rpx solid rgba(255, 255, 255, 0.2);
    border-radius: $radius-sm;
    font-size: 24rpx;
    font-weight: 600;
    color: #ffffff;
    flex-shrink: 0;
}

/* ========== 邀请弹窗 ========== */
.overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal {
    width: 540rpx;
    background: $color-surface;
    border-radius: $radius-lg;
    padding: 48rpx 40rpx 40rpx;
    text-align: center;
}

.modal-icon {
    font-size: 64rpx;
    margin-bottom: $spacing-md;
}

.modal-title {
    font-size: 34rpx;
    font-weight: 700;
    color: $color-primary;
    display: block;
    margin-bottom: $spacing-md;
}

.modal-desc {
    font-size: 26rpx;
    color: $color-secondary;
    line-height: 1.6;
    display: block;
    margin-bottom: 40rpx;
    white-space: pre-line;
}

.modal-btns {
    display: flex;
    gap: $spacing-md;
}

.modal-btn {
    flex: 1;
    padding: 22rpx 0;
    border-radius: $radius-sm;
    font-size: 28rpx;
    font-weight: 600;
    text-align: center;
}

.modal-btn-cancel {
    background: $color-surface-secondary;
    color: $color-secondary;
}

.modal-btn-confirm {
    background: linear-gradient(135deg, $color-accent, $color-accent-dark);
    color: #ffffff;
}
</style>
