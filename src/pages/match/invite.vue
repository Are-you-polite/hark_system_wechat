<template>
    <view class="page-invite">
        <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="back-btn" @click="goBack">
                <uni-icons type="back" color="#1e3322" size="20" />
            </view>
            <text class="nav-title">灵魂匹配</text>
            <view class="nav-placeholder" />
        </view>

        <scroll-view scroll-y class="scroll-area">
            <!-- 加载中 -->
            <view v-if="loading" class="loading-wrap">
                <uni-icons type="spinner" color="#2d6b3f" size="32" />
                <text class="loading-text">加载中...</text>
            </view>

            <!-- 加载失败 -->
            <view v-else-if="loadError" class="empty-state">
                <view class="empty-icon-wrap">
                    <uni-icons type="info" color="#2d6b3f" size="40" />
                </view>
                <text class="empty-title">加载失败</text>
                <text class="empty-desc">{{ loadError }}</text>
                <view class="go-test-btn" @click="goBack">返回首页</view>
            </view>

            <!-- 已匹配过 -->
            <view v-else-if="data.alreadyMatched" class="invite-content">
                <view class="done-wrap">
                    <view class="done-icon">💚</view>
                    <text class="done-title">你们已经是灵魂伙伴啦</text>
                    <view class="btn-primary" @click="goToMatchReport">查看匹配报告</view>
                </view>
            </view>

            <!-- B 未答题 -->
            <view v-else-if="data.myTestStatus === 'not_started'" class="invite-content">
                <view class="inviter-banner">
                    <image v-if="data.inviter?.avatarUrl?.startsWith('cloud://')" :src="data.inviter.avatarUrl" class="inviter-avatar-img" mode="aspectFill" />
                    <view v-else class="inviter-avatar">
                        <text class="inviter-avatar-letter">{{ inviterAvatarLetter }}</text>
                    </view>
                    <text class="inviter-name">{{ data.inviter?.nickName || '好友' }}</text>
                    <text v-if="data.inviter?.personalityType" class="inviter-type">{{ data.inviter.personalityType }} · {{ data.inviter.personalityTypeName }}</text>
                    <text class="inviter-action">想要和你进行灵魂匹配 ✨</text>
                </view>

                <view class="info-card">
                    <view class="info-card-title">⚠️ 你还没完成测试</view>
                    <view class="info-hint">
                        先完成性格测试，就能看到你和
                        <text class="hint-highlight">{{ data.inviter?.nickName || 'TA' }}</text>
                        的契合度啦
                    </view>
                    <view class="btn-full" @click="goTest">🔮 先去完成测试</view>
                </view>
            </view>

            <!-- B 已答题 → 确认匹配 -->
            <view v-else class="invite-content">
                <view class="inviter-banner">
                    <image v-if="data.inviter?.avatarUrl?.startsWith('cloud://')" :src="data.inviter.avatarUrl" class="inviter-avatar-img" mode="aspectFill" />
                    <view v-else class="inviter-avatar">
                        <text class="inviter-avatar-letter">{{ inviterAvatarLetter }}</text>
                    </view>
                    <text class="inviter-name">{{ data.inviter?.nickName || '好友' }}</text>
                    <text v-if="data.inviter?.personalityType" class="inviter-type">{{ data.inviter.personalityType }} · {{ data.inviter.personalityTypeName }}</text>
                    <text class="inviter-action">想要和你进行灵魂匹配 ✨</text>
                </view>

                <!-- 你的信息 -->
                <view class="info-card">
                    <view class="info-card-title">你的性格档案</view>
                    <view class="my-row">
                        <image v-if="mStore.avatarUrl?.startsWith('cloud://')" :src="mStore.avatarUrl" class="my-avatar-img" mode="aspectFill" />
                        <view v-else class="my-avatar">
                            <text class="my-avatar-letter">{{ (mStore.nickName || '我')[0] }}</text>
                        </view>
                        <view class="my-info">
                            <text class="my-name">{{ mStore.nickName || data.myType }}</text>
                            <text class="my-type">{{ data.myTypeName || '' }}</text>
                        </view>
                    </view>
                </view>

                <!-- 匹配话术 -->
                <view v-if="data.preview" class="match-hint">
                    <text class="match-hint-text">{{ data.preview }}</text>
                </view>

                <view class="btn-group">
                    <view class="btn-secondary" @click="goBack">再看看</view>
                    <view class="btn-full btn-full-primary" @click="onMatchClick">💘 进行匹配</view>
                </view>
            </view>

            <view class="bottom-safe" />
        </scroll-view>

        <!-- 资料完善弹窗 -->
        <ProfileSetup v-if="showProfileSetup" @close="showProfileSetup = false" @saved="onProfileSaved" />

        <!-- 确认匹配弹窗 -->
        <view v-if="showConfirmModal" class="overlay" @click="showConfirmModal = false">
            <view class="modal" @click.stop>
                <view class="modal-icon">💞</view>
                <text class="modal-title">确认灵魂匹配？</text>
                <text class="modal-desc">
                    匹配成功后，你们可以在
                    <text class="bold">匹配列表</text>
                    中查看彼此的契合报告
                </text>
                <view class="modal-btns">
                    <view class="modal-btn modal-btn-cancel" @click="showConfirmModal = false">取消</view>
                    <view class="modal-btn modal-btn-confirm" @click="doConfirm">💘 确认匹配</view>
                </view>
            </view>
        </view>

        <!-- 匹配成功弹窗 -->
        <view v-if="showSuccess" class="match-popup">
            <view class="match-popup-icon">💞</view>
            <text class="match-popup-title">匹配成功！</text>
            <text class="match-popup-sub">{{ successText }}</text>
            <view class="match-popup-btn" @click="goToMatchReport">查看匹配报告</view>
        </view>
    </view>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { matchApi } from '@/api/match'
import ProfileSetup from '@/components/ProfileSetup.vue'

const mStore = useUserStore()
const statusBarHeight = ref(uni.getWindowInfo().statusBarHeight || 44)

const loading = ref(true)
const loadError = ref('')
const data = ref({})
const showConfirmModal = ref(false)
const showSuccess = ref(false)
const successText = ref('')
const confirming = ref(false)
const showProfileSetup = ref(false)
const pendingConfirmMatch = ref(false)

const inviterAvatarLetter = computed(() => (data.value.inviter?.nickName || '好')[0])

onMounted(async () => {
    const inviterId = mStore.inviterId
    if (!inviterId) {
        loadError.value = '缺少邀请信息'
        loading.value = false
        return
    }

    try {
        const res = await matchApi.getInviteInfo(inviterId)
        if (res.code === 0) {
            data.value = res.data
            // 如果已匹配，存下 matchId 用于跳转
            if (res.data.alreadyMatched) {
                mStore.inviteHandled = true
                matchedId.value = res.data.matchId || ''
            }
        } else {
            loadError.value = res.message || '加载失败'
        }
    } catch {
        loadError.value = '网络错误，请稍后重试'
    } finally {
        loading.value = false
    }
})

const goBack = () => uni.navigateBack()

const goTest = () => {
    mStore.pendingMatchInvite = true // 答完题后提示匹配
    uni.navigateTo({ url: '/pages/test/answer' })
}

const onMatchClick = () => {
    if (!mStore.profileComplete) {
        // 先完善资料
        pendingConfirmMatch.value = true
        showProfileSetup.value = true
    } else {
        showConfirmModal.value = true
    }
}

const onProfileSaved = () => {
    showProfileSetup.value = false
    if (pendingConfirmMatch.value) {
        pendingConfirmMatch.value = false
        showConfirmModal.value = true
    }
}

const doConfirm = async () => {
    if (confirming.value) return
    confirming.value = true

    try {
        const res = await matchApi.confirm(mStore.inviterId)
        if (res.code === 0) {
            matchedId.value = res.data.matchId
            showConfirmModal.value = false
            successText.value = `${data.value.inviter?.nickName || '好友'} · ${data.value.inviter?.personalityType || ''}  ⟷  我 · ${data.value.myType || ''}`
            showSuccess.value = true
            mStore.clearInviter()
        } else {
            uni.showToast({ title: res.message || '匹配失败', icon: 'none' })
        }
    } catch {
        uni.showToast({ title: '网络错误', icon: 'none' })
    } finally {
        confirming.value = false
    }
}

const matchedId = ref('')
const goToMatchReport = () => {
    const id = matchedId.value || data.value?.matchId || ''
    if (id) {
        uni.redirectTo({ url: `/pages/match/result?matchId=${id}` })
    } else {
        uni.redirectTo({ url: '/pages/tabbar/index' })
    }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page-invite {
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
    padding-bottom: 16rpx;
    background-color: $color-bg;
    border-bottom: 2rpx solid $color-border;
    flex-shrink: 0;

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
    overflow: hidden;
}

.loading-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 200rpx;
    gap: $spacing-md;
}
.loading-text {
    font-size: 26rpx;
    color: $color-secondary;
}

// 空状态
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 200rpx;
    gap: $spacing-md;
}
.empty-icon-wrap {
    width: 120rpx;
    height: 120rpx;
    background-color: rgba(45, 107, 63, 0.05);
    border-radius: 50%;
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
}
.go-test-btn {
    margin-top: 16rpx;
    padding: 20rpx 56rpx;
    background: linear-gradient(135deg, $color-accent, $color-accent-dark);
    border-radius: $radius-sm;
    color: #ffffff;
    font-size: 28rpx;
    font-weight: 600;
}

// 邀请内容
.invite-content {
    padding: $spacing-xl;
}

// 邀请者 banner
.inviter-banner {
    text-align: center;
    padding: 48rpx 20rpx 40rpx;
    background: linear-gradient(135deg, $color-accent, $color-accent-dark);
    border-radius: $radius-xl;
    margin-bottom: $spacing-lg;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: -40rpx;
        right: -40rpx;
        width: 160rpx;
        height: 160rpx;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.04);
    }
    &::after {
        content: '';
        position: absolute;
        bottom: -30rpx;
        left: -30rpx;
        width: 100rpx;
        height: 100rpx;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.03);
    }
}

.inviter-avatar,
.inviter-avatar-img {
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16rpx;
    overflow: hidden;
}

.inviter-avatar-letter {
    font-size: 40rpx;
    font-weight: 700;
    color: #ffffff;
}
.inviter-name {
    font-size: 36rpx;
    font-weight: 700;
    color: #ffffff;
    display: block;
    margin-bottom: 4rpx;
}
.inviter-type {
    display: inline-block;
    padding: 6rpx 24rpx;
    background: rgba(255, 255, 255, 0.12);
    border-radius: 30rpx;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 600;
}
.inviter-action {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.7);
    display: block;
    margin-top: 16rpx;
}

// 信息卡片
.info-card {
    background: $color-surface;
    border-radius: $radius-lg;
    padding: $spacing-lg;
    box-shadow: $shadow-card;
    border: 2rpx solid $color-border;
    margin-bottom: $spacing-lg;
}
.info-card-title {
    font-size: 24rpx;
    font-weight: 600;
    color: $color-accent;
    margin-bottom: $spacing-md;
    letter-spacing: 1rpx;
}
.info-hint {
    font-size: 26rpx;
    color: $color-secondary;
    line-height: 1.6;
    margin-bottom: $spacing-lg;
}
.hint-highlight {
    color: $color-accent;
    font-weight: 600;
}

// 我的信息行
.my-row {
    display: flex;
    align-items: center;
    gap: $spacing-md;
}
.my-avatar,
.my-avatar-img {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    background: rgba(90, 143, 212, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
}

.my-avatar-letter {
    font-size: 30rpx;
    font-weight: 700;
    color: #5a8fd4;
}
.my-info {
    flex: 1;
}
.my-name {
    font-size: 30rpx;
    font-weight: 700;
    color: $color-primary;
    display: block;
}
.my-type {
    font-size: 24rpx;
    color: $color-secondary;
}

// 匹配话术
.match-hint {
    padding: $spacing-md $spacing-lg;
    background: rgba(45, 107, 63, 0.06);
    border-radius: $radius-sm;
    margin-bottom: $spacing-lg;
    text-align: center;
}
.match-hint-text {
    font-size: 24rpx;
    color: $color-accent;
    line-height: 1.6;
}

// 按钮组
.btn-group {
    display: flex;
    gap: $spacing-md;
}
.btn-full {
    flex: 1;
    padding: 24rpx 0;
    border-radius: $radius-sm;
    font-size: 28rpx;
    font-weight: 600;
    text-align: center;
}
.btn-full-primary {
    background: linear-gradient(135deg, $color-accent, $color-accent-dark);
    color: #ffffff;
}
.btn-secondary {
    flex: 1;
    padding: 24rpx 0;
    border-radius: $radius-sm;
    font-size: 28rpx;
    font-weight: 500;
    text-align: center;
    background: $color-surface;
    border: 2rpx solid $color-border;
    color: $color-secondary;
}

// 已匹配
.done-wrap {
    text-align: center;
    padding: 120rpx 0 60rpx;
}
.done-icon {
    font-size: 80rpx;
    margin-bottom: $spacing-lg;
}
.done-title {
    font-size: 32rpx;
    font-weight: 700;
    color: $color-primary;
    display: block;
    margin-bottom: $spacing-xl;
}
.btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 12rpx;
    padding: 22rpx 64rpx;
    background: linear-gradient(135deg, $color-accent, $color-accent-dark);
    border-radius: $radius-sm;
    font-size: 28rpx;
    font-weight: 600;
    color: #ffffff;
}

// 弹窗
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
}
.bold {
    font-weight: 700;
    color: $color-primary;
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

// 匹配成功弹窗
.match-popup {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 200;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}
.match-popup-icon {
    font-size: 96rpx;
    margin-bottom: $spacing-md;
}
.match-popup-title {
    font-size: 40rpx;
    font-weight: 800;
    color: #ffffff;
    display: block;
    margin-bottom: 8rpx;
}
.match-popup-sub {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.7);
    display: block;
    margin-bottom: 48rpx;
}
.match-popup-btn {
    padding: 24rpx 72rpx;
    background: rgba(255, 255, 255, 0.15);
    border: 2rpx solid rgba(255, 255, 255, 0.25);
    border-radius: $radius-sm;
    font-size: 28rpx;
    font-weight: 600;
    color: #ffffff;
}

.bottom-safe {
    height: calc(80rpx + env(safe-area-inset-bottom));
}
</style>
