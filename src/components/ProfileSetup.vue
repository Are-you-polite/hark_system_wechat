<template>
    <view class="profile-overlay" @click="handleCancel">
        <view class="profile-sheet" @click.stop>
            <view class="sheet-handle" />
            <text class="sheet-title">完善个人资料</text>
            <text class="sheet-desc">设置昵称和头像，让好友认出你</text>

            <!-- 微信头像选择 -->
            <view class="avatar-section">
                <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
                    <image v-if="avatarUrl" :src="avatarUrl" class="avatar-img" mode="aspectFill" />
                    <text v-else class="avatar-placeholder">{{ (mStore.nickName || '我')[0] }}</text>
                    <view class="avatar-edit-badge">
                        <text class="edit-icon">✎</text>
                    </view>
                </button>
                <text class="avatar-hint">点击选择微信头像</text>
            </view>

            <!-- 微信昵称输入 -->
            <view class="input-section">
                <input v-model="nickname" class="nickname-input" type="nickname" placeholder="你的微信昵称" maxlength="12" @blur="onNicknameBlur" />
            </view>

            <!-- 按钮 -->
            <view class="sheet-btns">
                <view class="sheet-btn sheet-btn-cancel" @click="handleCancel">取消</view>
                <view class="sheet-btn sheet-btn-confirm" :class="{ disabled: !nickname.trim() }" @click="handleSave">
                    {{ saving ? '保存中...' : '确认' }}
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api/user'

const emit = defineEmits(['close', 'saved'])

const mStore = useUserStore()
const nickname = ref(mStore.nickName || '')
const avatarUrl = ref(mStore.avatarUrl || '')
const saving = ref(false)

// 微信选择头像 → 上传到云存储（永久有效）
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
        avatarUrl.value = cloudRes.fileID
    } catch {
        avatarUrl.value = tempUrl
    } finally {
        uni.hideLoading()
    }
}

// 微信昵称输入失去焦点时，拿到输入的值
function onNicknameBlur(e) {
    const val = e.detail?.value
    if (val) {
        nickname.value = val
    }
}

function handleCancel() {
    emit('close')
}

async function handleSave() {
    const name = nickname.value.trim()
    if (!name) return
    if (saving.value) return
    saving.value = true

    try {
        const res = await userApi.updateProfile({
            nickName: name,
            avatarUrl: avatarUrl.value
        })
        if (res.code === 0) {
            mStore.setProfile(res.data)
            uni.showToast({ title: '保存成功', icon: 'success' })
            emit('saved', res.data)
        } else {
            uni.showToast({ title: res.message || '保存失败', icon: 'none' })
        }
    } catch {
        uni.showToast({ title: '网络错误', icon: 'none' })
    } finally {
        saving.value = false
    }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.profile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 200;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.profile-sheet {
    width: 100%;
    background: $color-surface;
    border-radius: $radius-xl $radius-xl 0 0;
    padding: $spacing-sm $spacing-xl calc(40rpx + env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
    align-items: center;
    max-height: 70vh;
    overflow-y: auto;
}

.sheet-handle {
    width: 48rpx;
    height: 6rpx;
    background: $color-border;
    border-radius: 3rpx;
    margin-bottom: $spacing-lg;
    flex-shrink: 0;
}

.sheet-title {
    font-size: 36rpx;
    font-weight: 700;
    color: $color-primary;
    margin-bottom: $spacing-xs;
    flex-shrink: 0;
}

.sheet-desc {
    font-size: 26rpx;
    color: $color-secondary;
    margin-bottom: $spacing-xl;
    flex-shrink: 0;
}

/* ===== 微信头像 ===== */
.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: $spacing-xl;
    width: 100%;
    flex-shrink: 0;
}

.avatar-btn {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    padding: 0;
    margin: 0;
    background: rgba(45, 107, 63, 0.08);
    border: none;
    outline: none;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
}

.avatar-btn::after {
    border: none;
}

.avatar-img {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
}

.avatar-placeholder {
    font-size: 48rpx;
    font-weight: 700;
    color: $color-accent;
}

.avatar-edit-badge {
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

.edit-icon {
    font-size: 24rpx;
    color: #ffffff;
    line-height: 1;
}

.avatar-hint {
    font-size: 22rpx;
    color: $color-muted;
    margin-top: $spacing-sm;
}

/* ===== 微信昵称输入 ===== */
.input-section {
    width: 100%;
    margin-bottom: $spacing-xl;
    flex-shrink: 0;
}

.nickname-input {
    width: 100%;
    padding: 24rpx $spacing-md;
    background: $color-surface-secondary;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    font-size: 30rpx;
    color: $color-primary;
    text-align: center;
    box-sizing: border-box;
    min-height: 80rpx;
}

.nickname-input::placeholder {
    color: $color-muted;
}

/* ===== 按钮 ===== */
.sheet-btns {
    display: flex;
    gap: $spacing-md;
    width: 100%;
    flex-shrink: 0;
}

.sheet-btn {
    flex: 1;
    padding: 24rpx 0;
    border-radius: $radius-sm;
    font-size: 30rpx;
    font-weight: 600;
    text-align: center;
}

.sheet-btn-cancel {
    background: $color-surface-secondary;
    color: $color-secondary;
}

.sheet-btn-confirm {
    background: linear-gradient(135deg, $color-accent, $color-accent-dark);
    color: #ffffff;

    &.disabled {
        opacity: 0.4;
    }
}
</style>
