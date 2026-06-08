<template>
    <view class="pages-wrapper">
        <view class="pages-container" :style="pageStyle">
            <view v-for="tab in tabsList" :key="tab.key" class="page-content">
                <tab-home v-if="tab.key === 'home'" />
                <tab-chats v-else-if="tab.key === 'chats'" />
                <tab-match v-else-if="tab.key === 'match'" />
                <tab-mine v-else-if="tab.key === 'mine'" />
            </view>
        </view>
        <InviteModal v-if="showInviteModal" :invite-state="inviteState" :inviter-name="inviterName" :inviter-avatar-url="inviterAvatarUrl" :match-id="matchedId" @close="showInviteModal = false" @match-done="onMatchDone" />

        <!-- 补资料弹窗（放在 pages-container 外面，避免 transform 破坏 position: fixed） -->
        <view v-if="showProfileForm" class="pfp-overlay" @click="closeProfileForm">
            <view class="pfp-sheet" @click.stop>
                <view class="pfp-handle" />
                <text class="pfp-title">完善个人资料</text>
                <text class="pfp-desc">设置昵称和头像，让好友认出你</text>

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

                <view class="pfp-input-section">
                    <input v-model="pfpNickname" class="pfp-input" type="nickname" placeholder="你的微信昵称" maxlength="12" @blur="onNicknameBlur" />
                </view>

                <view class="pfp-btns">
                    <view class="pfp-btn pfp-btn-cancel" @click="closeProfileForm">取消</view>
                    <view class="pfp-btn pfp-btn-confirm" :class="{ disabled: !pfpNickname.trim() || pfpSaving }" @click="saveProfile">
                        {{ pfpSaving ? '保存中...' : '确认' }}
                    </view>
                </view>
            </view>
        </view>
    </view>
    <view class="custom-tabbar">
        <view class="tabbar-list">
            <view class="tabbar-pill" :style="pillStyle" />
            <view v-for="tab in tabsList" :key="tab.key" class="tabbar-item" @click="currentTab = tab.key">
                <uni-icons :type="tab.icon" size="26" :color="currentTab === tab.key ? '#FFFFFF' : '#808A80'" />
                <text class="tabbar-item-label" :class="{ active: currentTab === tab.key }">{{ tab.label }}</text>
            </view>
        </view>
    </view>
</template>
<script setup>
import tabHome from '@/components/tab-home/index.vue'
import tabChats from '@/components/tab-chats/index.vue'
import tabMatch from '@/components/tab-match/index.vue'
import tabMine from '@/components/tab-mine/index.vue'
import InviteModal from '@/components/InviteModal.vue'
import { useUserStore } from '@/stores/user'
import { matchApi } from '@/api/match'
import { userApi } from '@/api/user'

const currentTab = ref('home')
const mStore = useUserStore()

// 邀请弹窗状态
const showInviteModal = ref(false)
const inviteState = ref('')
const inviterName = ref('')
const inviterAvatarUrl = ref('')
const matchedId = ref('')

onShareAppMessage(() => {
    const p = mStore.user?._id ? `/pages/tabbar/index?inviterId=${encodeURIComponent(mStore.user._id)}&inviterType=${encodeURIComponent(mStore.personalityType)}&inviterName=${encodeURIComponent(mStore.nickName || '')}` : '/pages/tabbar/index'
    return { title: mStore.personalityType ? `我是 ${mStore.personalityType} · ${mStore.personalityTypeName} — 来测测你的性格类型` : '向内倾听 — 了解自己，从倾听内心开始', path: p }
})

onLoad((options) => {
    if (options?.inviterId) {
        mStore.setInviter(options.inviterId, options.inviterType || '', options.inviterName ? decodeURIComponent(options.inviterName) : '')
        waitForLoginAndProcessInvite()
    }
})

onShow(() => {
    if (mStore.freshInviteEntry && mStore.inviterId && !showInviteModal.value) {
        mStore.freshInviteEntry = false
        waitForLoginAndProcessInvite()
    }
})

function waitForLoginAndProcessInvite() {
    const timer = setInterval(async () => {
        if (mStore.loggedIn) {
            clearInterval(timer)
            await loadInviteInfo()
        }
    }, 200)
    setTimeout(() => clearInterval(timer), 10000)
}

async function loadInviteInfo() {
    try {
        const res = await matchApi.getInviteInfo(mStore.inviterId)
        if (res.code === 0) {
            const data = res.data
            inviterName.value = data.inviter?.nickName || '好友'
            inviterAvatarUrl.value = data.inviter?.avatarUrl?.startsWith('cloud://') ? data.inviter.avatarUrl : ''
            matchedId.value = data.matchId || ''

            if (data.alreadyMatched) {
                inviteState.value = 'already_matched'
            } else if (data.myTestStatus === 'not_started' || data.myTestStatus === 'in_progress') {
                inviteState.value = 'not_tested'
            } else if (!mStore.profileComplete) {
                inviteState.value = 'need_profile'
            } else {
                inviteState.value = 'tested'
            }
            showInviteModal.value = true
        }
    } catch (e) {
        console.error('[invite] 加载失败', e)
    }
}

function onMatchDone(matchId) {
    showInviteModal.value = false
    uni.redirectTo({ url: `/pages/match/result?matchId=${matchId}` })
}

// 补资料弹窗
const showProfileForm = ref(false)
const pfpNickname = ref('')
const pfpAvatarUrl = ref('')
const pfpSaving = ref(false)

function openProfileForm() {
    pfpNickname.value = mStore.nickName || ''
    pfpAvatarUrl.value = mStore.avatarUrl || ''
    showProfileForm.value = true
}
provide('openProfileForm', openProfileForm)

function closeProfileForm() {
    showProfileForm.value = false
}

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

const tabsList = [
    { key: 'home', label: '档案', icon: 'calendar' },
    { key: 'chats', label: '对话', icon: 'chatboxes' },
    { key: 'match', label: '匹配', icon: 'color' },
    { key: 'mine', label: '我的', icon: 'person' }
]
const pillStyle = computed(() => {
    const idx = tabsList.findIndex((tab) => tab.key === currentTab.value)
    return { transform: `translateX(${idx * 100}%)` }
})
const pageStyle = computed(() => {
    const idx = tabsList.findIndex((tab) => tab.key === currentTab.value)
    return { transform: `translateX(-${idx * 100}%)` }
})
</script>
<style lang="scss">
@use '@/styles/variables.scss' as *;
::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
    color: transparent !important;
    background: transparent !important;
}
</style>
<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;
.pages-wrapper {
    width: 100%;
    height: 100vh;
    overflow: hidden;
}
.pages-container {
    display: flex;
    width: 100%;
    height: 100%;
    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.page-content {
    width: 100%;
    height: 100%;
    flex-shrink: 0;
    overflow: hidden;
}
.custom-tabbar {
    position: fixed;
    bottom: 0;
    width: 100%;
    box-sizing: border-box;
    background: #ffffff;
    padding: 24rpx 20rpx 60rpx;
    .tabbar-list {
        position: relative;
        display: flex;
        align-items: center;
        border: 2rpx solid $color-border;
        border-radius: 60rpx;
    }
    .tabbar-pill {
        position: absolute;
        inset: 0;
        width: 25%;
        background: $color-accent;
        border-radius: 60rpx;
        transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .tabbar-item {
        position: relative;
        z-index: 1;
        width: 25%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        padding: 12rpx 0;
    }
    .tabbar-item-label {
        color: $color-muted;
        &.active {
            color: #ffffff;
        }
    }
}

/* ===== 补资料弹窗 ===== */
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
