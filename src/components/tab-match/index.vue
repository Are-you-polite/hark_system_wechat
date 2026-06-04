<template>
    <view class="page-match">
        <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="header-text">
                <text class="title">灵魂共振</text>
                <text class="subtitle">遇见与你同频的有趣灵魂</text>
            </view>
        </view>

        <scroll-view scroll-y class="scroll-area">
            <view v-if="hasMatches" class="match-list">
                <view v-for="(item, index) in matchList" :key="item.matchId || index" class="match-card" @click="goToMatchResult(item.matchId)">
                    <view class="mc-upper">
                        <view class="mc-avatar-wrap">
                            <image v-if="item.otherUser?.avatarUrl?.startsWith('cloud://')" :src="item.otherUser.avatarUrl" class="mc-avatar-img" mode="aspectFill" />
                            <text v-else class="mc-avatar-letter">{{ (item.otherUser?.nickName || '好')[0] }}</text>
                        </view>
                        <view class="mc-info-area">
                            <view class="mc-name-row">
                                <text class="mc-name">{{ item.otherUser?.nickName || '好友' }}</text>
                                <view class="mc-badge">{{ item.direction === 'invited' ? '你邀请了 TA' : 'TA 邀请了你' }}</view>
                            </view>
                            <text class="mc-type">{{ item.otherUser?.personalityType || '--' }} · {{ item.otherUser?.personalityTypeName || '未知' }}</text>
                            <text class="mc-match-tag">{{ item.matchTag || '深度契合 · 互补型' }}</text>
                        </view>
                        <view class="mc-score-pill">
                            <text class="mc-score-num">{{ item.compatibilityScore || 0 }}</text>
                            <text class="mc-score-unit">%</text>
                        </view>
                    </view>
                    <view class="mc-divider" />
                    <view class="mc-lower">
                        <text class="mc-date">匹配于 {{ formatMatchDate(item.matchedAt) }}</text>
                        <view class="mc-action">
                            <text class="mc-action-text">查看匹配报告</text>
                            <uni-icons type="arrow-right" color="#2d6b3f" size="12" />
                        </view>
                    </view>
                </view>
            </view>

            <view v-else-if="mStore.hasTested" class="empty-wrap">
                <view class="empty-icon-box">
                    <uni-icons type="personadd" color="#2d6b3f" size="28" />
                </view>
                <text class="empty-title">还没有匹配记录</text>
                <text class="empty-desc">分享你的性格卡片给好友，\n邀请 TA 一起来测，看看你们有多契合</text>
                <view v-if="!mStore.profileComplete" class="empty-btn" @click="handleInvite">
                    <text class="empty-btn-text">邀请好友匹配</text>
                </view>
                <button v-else class="empty-btn empty-btn-share" open-type="share">
                    <text class="empty-btn-text">邀请好友匹配</text>
                </button>
            </view>

            <view v-else class="empty-wrap">
                <view class="empty-icon-box">
                    <uni-icons type="personadd" color="#2d6b3f" size="28" />
                </view>
                <text class="empty-title">完成测试，开启匹配之旅</text>
                <text class="empty-desc">完成性格测试后，你就可以\n和好友进行灵魂匹配啦</text>
            </view>
        </scroll-view>

        <!-- 补资料弹窗（内联在页面最外层，避免 position:fixed 被父级 transform 影响） -->
        <view v-if="showProfileForm" class="pfp-overlay" @click="closeProfileForm">
            <view class="pfp-sheet" @click.stop>
                <view class="pfp-handle" />
                <text class="pfp-title">完善个人资料</text>
                <text class="pfp-desc">设置昵称和头像，让好友认出你</text>

                <!-- 微信头像 -->
                <view class="pfp-avatar-section">
                    <button class="pfp-avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
                        <image v-if="pfpAvatarUrl" :src="pfpAvatarUrl" class="pfp-avatar-img" mode="aspectFill" />
                        <text v-else class="pfp-avatar-placeholder">{{ (mStore.nickName || '我')[0] }}</text>
                        <view class="pfp-avatar-badge">
                            <text class="pfp-edit-icon">✎</text>
                        </view>
                    </button>
                    <text class="pfp-avatar-hint">点击选择微信头像</text>
                </view>

                <!-- 微信昵称 -->
                <view class="pfp-input-section">
                    <input v-model="pfpNickname" class="pfp-input" type="nickname" placeholder="你的微信昵称" maxlength="12" @blur="onNicknameBlur" />
                </view>

                <!-- 按钮 -->
                <view class="pfp-btns">
                    <view class="pfp-btn pfp-btn-cancel" @click="closeProfileForm">取消</view>
                    <view class="pfp-btn pfp-btn-confirm" :class="{ disabled: !pfpNickname.trim() || pfpSaving }" @click="saveProfile">
                        {{ pfpSaving ? '保存中...' : '确认' }}
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { matchApi } from '@/api/match'
import { userApi } from '@/api/user'

const mStore = useUserStore()
const statusBarHeight = ref(44)
const matchList = ref([])
const loading = ref(false)

// 补资料弹窗
const showProfileForm = ref(false)
const pfpNickname = ref('')
const pfpAvatarUrl = ref('')
const pfpSaving = ref(false)

const hasMatches = computed(() => matchList.value.length > 0)

onMounted(() => {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 44
    fetchMatches()
})

onShow(() => {
    if (mStore.loggedIn) fetchMatches()
})

async function fetchMatches() {
    if (loading.value) return
    loading.value = true
    try {
        const res = await matchApi.list()
        if (res.code === 0) {
            matchList.value = res.data?.list || []
        }
    } catch {
        // 静默失败
    } finally {
        loading.value = false
    }
}

function formatMatchDate(dateStr) {
    if (!dateStr) return '--'
    const d = new Date(dateStr)
    return `${d.getFullYear()}年${d.getMonth() + 1}月`
}

function goToMatchResult(matchId) {
    uni.navigateTo({ url: `/pages/match/result?matchId=${matchId}` })
}

function handleInvite() {
    pfpNickname.value = mStore.nickName || ''
    pfpAvatarUrl.value = mStore.avatarUrl || ''
    showProfileForm.value = true
}

function closeProfileForm() {
    showProfileForm.value = false
}

// 微信选择头像
async function onChooseAvatar(e) {
    const tempUrl = e.detail.avatarUrl
    if (!tempUrl) return
    uni.showLoading({ title: '上传头像...' })
    try {
        const ext = tempUrl.match(/\.(\w+)(\?|$)/)?.[1] || 'jpg'
        const cloudRes = await wx.cloud.uploadFile({
            cloudPath: `avatars/${mStore.user?._id || Date.now()}_${Date.now()}.${ext}`,
            filePath: tempUrl
        })
        pfpAvatarUrl.value = cloudRes.fileID
    } catch {
        pfpAvatarUrl.value = tempUrl
    } finally {
        uni.hideLoading()
    }
}

function onNicknameBlur(e) {
    const val = e.detail?.value
    if (val) pfpNickname.value = val
}

async function saveProfile() {
    const name = pfpNickname.value.trim()
    if (!name || pfpSaving.value) return
    pfpSaving.value = true
    try {
        const res = await userApi.updateProfile({ nickName: name, avatarUrl: pfpAvatarUrl.value })
        if (res.code === 0) {
            mStore.setProfile(res.data)
            showProfileForm.value = false
            uni.showToast({ title: '保存成功，再次点击即可分享', icon: 'success' })
        } else {
            uni.showToast({ title: res.message || '保存失败', icon: 'none' })
        }
    } catch {
        uni.showToast({ title: '网络错误', icon: 'none' })
    } finally {
        pfpSaving.value = false
    }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page-match {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: $color-bg;
    overflow: hidden;
    position: relative;
}

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

.scroll-area {
    flex: 1;
    height: 0;
    overflow: hidden;
}

.match-list {
    padding: 0 40rpx 180rpx 40rpx;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
}
.match-card {
    background: $color-surface;
    border-radius: $radius-lg;
    padding: 28rpx;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}
.mc-upper {
    display: flex;
    align-items: center;
    gap: 20rpx;
}
.mc-avatar-wrap {
    width: 80rpx;
    height: 80rpx;
    border-radius: 40rpx;
    background: $color-accent-bg;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.mc-avatar-img {
    width: 80rpx;
    height: 80rpx;
    border-radius: 40rpx;
}
.mc-avatar-letter {
    font-size: 32rpx;
    font-weight: 700;
    color: $color-accent;
}
.mc-info-area {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
}
.mc-name-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
}
.mc-name {
    font-size: 30rpx;
    font-weight: 700;
    color: $color-primary;
}
.mc-badge {
    font-size: 16rpx;
    font-weight: 600;
    color: $color-accent;
    background: $color-accent-bg;
    padding: 4rpx 16rpx;
    border-radius: 999rpx;
    flex-shrink: 0;
    line-height: 1.4;
}
.mc-type {
    font-size: 24rpx;
    color: $color-secondary;
}
.mc-match-tag {
    font-size: 20rpx;
    color: $color-muted;
}
.mc-score-pill {
    background: #eef3ee;
    border-radius: 999rpx;
    padding: 20rpx 28rpx;
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 2rpx;
    flex-shrink: 0;
}
.mc-score-num {
    font-size: 28rpx;
    font-weight: 800;
    color: $color-accent;
}
.mc-score-unit {
    font-size: 20rpx;
    font-weight: 500;
    color: $color-accent;
}
.mc-divider {
    height: 2rpx;
    background: $color-border;
}
.mc-lower {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.mc-date {
    font-size: 20rpx;
    color: $color-muted;
}
.mc-action {
    display: flex;
    align-items: center;
    gap: 8rpx;
}
.mc-action-text {
    font-size: 22rpx;
    font-weight: 600;
    color: $color-accent;
}

.empty-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 200rpx 40rpx 0;
    gap: 20rpx;
}
.empty-icon-box {
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
    line-height: 1.6;
    text-align: center;
}
.empty-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 486rpx;
    height: 88rpx;
    border-radius: $radius-btn;
    background: $color-accent;
    margin-top: 8rpx;
}
.empty-btn-text {
    font-size: 30rpx;
    font-weight: 600;
    color: #ffffff;
}
.empty-btn-share {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    line-height: normal;
    margin: 0;
    padding: 0;
    &::after {
        border: none;
    }
}

/* ===== 补资料弹窗（内联在页面最外层） ===== */
.pfp-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 200;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}
.pfp-sheet {
    width: 100%;
    background: $color-surface;
    border-radius: $radius-xl $radius-xl 0 0;
    padding: 16rpx 40rpx calc(40rpx + env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
    align-items: center;
}
.pfp-handle {
    width: 48rpx;
    height: 6rpx;
    background: $color-border;
    border-radius: 3rpx;
    margin-bottom: 32rpx;
    flex-shrink: 0;
}
.pfp-title {
    font-size: 36rpx;
    font-weight: 700;
    color: $color-primary;
    margin-bottom: 8rpx;
}
.pfp-desc {
    font-size: 26rpx;
    color: $color-secondary;
    margin-bottom: 40rpx;
}

/* 头像选择 */
.pfp-avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 40rpx;
    width: 100%;
}
.pfp-avatar-btn {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    padding: 0;
    margin: 0;
    background: $color-accent-bg;
    border: none;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
}
.pfp-avatar-btn::after {
    border: none;
}
.pfp-avatar-img {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
}
.pfp-avatar-placeholder {
    font-size: 48rpx;
    font-weight: 700;
    color: $color-accent;
}
.pfp-avatar-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background: $color-accent;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 4rpx solid $color-surface;
}
.pfp-edit-icon {
    font-size: 24rpx;
    color: #ffffff;
    line-height: 1;
}
.pfp-avatar-hint {
    font-size: 22rpx;
    color: $color-muted;
    margin-top: 16rpx;
}

/* 昵称输入 */
.pfp-input-section {
    width: 100%;
    margin-bottom: 40rpx;
}
.pfp-input {
    width: 100%;
    padding: 24rpx 32rpx;
    background: $color-surface-secondary;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    font-size: 30rpx;
    color: $color-primary;
    text-align: center;
    box-sizing: border-box;
    min-height: 80rpx;
}
.pfp-input::placeholder {
    color: $color-muted;
}

/* 按钮 */
.pfp-btns {
    display: flex;
    gap: 16rpx;
    width: 100%;
}
.pfp-btn {
    flex: 1;
    padding: 24rpx 0;
    border-radius: $radius-sm;
    font-size: 30rpx;
    font-weight: 600;
    text-align: center;
}
.pfp-btn-cancel {
    background: $color-surface-secondary;
    color: $color-secondary;
}
.pfp-btn-confirm {
    background: $color-accent;
    color: #ffffff;
}
.pfp-btn-confirm.disabled {
    opacity: 0.4;
}
</style>
