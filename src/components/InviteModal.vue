<template>
    <view class="modal-overlay" @click="handleOverlayTap">
        <!-- 遮罩层 -->
        <view class="modal-mask" />

        <!-- 底部抽屉弹窗 -->
        <view class="modal-sheet" @click.stop>
            <!-- 拖拽把手 -->
            <view class="sheet-handle" />

            <!-- 通用：匹配邀请标签 -->
            <view class="sheet-tag">
                <view class="tag-dot" />
                <text class="tag-text">匹配邀请</text>
            </view>

            <!-- ===== 1-5 未测试 ===== -->
            <template v-if="inviteState === 'not_tested'">
                <text class="sheet-title">先完成测试，再开始匹配</text>
                <text class="sheet-desc">你收到一条好友匹配邀请。完成性格测试后，系统会自动继续这次匹配，并生成你们的契合度报告。</text>

                <!-- 好友信息 -->
                <view class="friend-card">
                    <view class="friend-avatar">
                        <image v-if="inviterAvatarUrl" :src="inviterAvatarUrl" class="friend-avatar-img" mode="aspectFill" />
                        <text v-else class="friend-avatar-letter">{{ inviterAvatarLetter }}</text>
                    </view>
                    <view class="friend-info">
                        <text class="friend-name">{{ inviterName }}</text>
                        <text class="friend-desc">这位好友邀请你一起完成匹配。</text>
                    </view>
                </view>

                <!-- 当前邀请提示 -->
                <view class="info-card-soft">
                    <text class="info-card-title">当前邀请</text>
                    <text class="info-card-desc">这条邀请已为你保留，无需重复进入。完成测试后即可继续查看匹配结果。</text>
                </view>

                <!-- 双列信息 -->
                <view class="info-row-duo">
                    <view class="info-item-card">
                        <text class="info-item-label">预计用时</text>
                        <text class="info-item-value">约 5 分钟</text>
                    </view>
                    <view class="info-item-card">
                        <text class="info-item-label">完成后</text>
                        <text class="info-item-value">自动解锁匹配</text>
                    </view>
                </view>

                <text class="sheet-footnote">完成测试后，系统会继续保留这条邀请，不需要再次操作。</text>

                <!-- 按钮 -->
                <view class="sheet-buttons">
                    <view class="btn-primary" @click="goTakeTest">
                        <text class="btn-primary-text">去完成测试</text>
                    </view>
                    <view class="btn-secondary" @click="closeModal">
                        <text class="btn-secondary-text">稍后处理</text>
                    </view>
                </view>
            </template>

            <!-- ===== 1-6 已测试 ===== -->
            <template v-if="inviteState === 'tested'">
                <text class="sheet-title">你已完成测试，可以开始匹配</text>
                <text class="sheet-desc">这条好友匹配邀请正在等待你确认。你的人格结果已经生成，现在可以直接继续匹配，并查看你们的契合度报告。</text>

                <view class="friend-card">
                    <view class="friend-avatar">
                        <image v-if="inviterAvatarUrl" :src="inviterAvatarUrl" class="friend-avatar-img" mode="aspectFill" />
                        <text v-else class="friend-avatar-letter">{{ inviterAvatarLetter }}</text>
                    </view>
                    <view class="friend-info">
                        <text class="friend-name">{{ inviterName }}</text>
                        <text class="friend-desc">你们已具备匹配条件，可继续查看结果。</text>
                    </view>
                </view>

                <view class="info-card-soft">
                    <text class="info-card-title">当前邀请</text>
                    <text class="info-card-desc">你已满足匹配条件。确认后将继续处理这条邀请，并进入匹配结果流程。</text>
                </view>

                <view class="info-row-duo">
                    <view class="info-item-card">
                        <text class="info-item-label">当前状态</text>
                        <text class="info-item-value">已完成测试</text>
                    </view>
                    <view class="info-item-card">
                        <text class="info-item-label">确认后</text>
                        <text class="info-item-value">生成匹配报告</text>
                    </view>
                </view>

                <view class="info-card-white">
                    <text class="info-card-title">继续后会发生什么</text>
                    <text class="info-card-desc">系统会保留你当前的人格结果，直接进入匹配流程，并生成双方的契合度与关系建议。</text>
                </view>

                <view class="sheet-buttons">
                    <view class="btn-primary" @click="doMatch">
                        <text class="btn-primary-text">继续匹配</text>
                    </view>
                    <view class="btn-secondary" @click="closeModal">
                        <text class="btn-secondary-text">稍后处理</text>
                    </view>
                </view>
            </template>

            <!-- ===== 1-7 已匹配过 ===== -->
            <template v-if="inviteState === 'already_matched'">
                <text class="sheet-title">你们已经完成过这次匹配</text>
                <text class="sheet-desc">这条好友邀请对应的匹配报告已经生成过，无需再次重复匹配。你可以直接查看上次的匹配结果与关系建议。</text>

                <view class="friend-card">
                    <view class="friend-avatar">
                        <image v-if="inviterAvatarUrl" :src="inviterAvatarUrl" class="friend-avatar-img" mode="aspectFill" />
                        <text v-else class="friend-avatar-letter">{{ inviterAvatarLetter }}</text>
                    </view>
                    <view class="friend-info">
                        <text class="friend-name">{{ inviterName }}</text>
                        <text class="friend-desc">这位好友和你已经生成过匹配报告。</text>
                    </view>
                </view>

                <view class="info-card-soft">
                    <text class="info-card-title">当前状态</text>
                    <text class="info-card-desc">这次邀请已完成处理，系统已保留双方的匹配报告与相关解读。</text>
                </view>

                <view class="info-row-duo">
                    <view class="info-item-card">
                        <text class="info-item-label">匹配状态</text>
                        <text class="info-item-value">已完成</text>
                    </view>
                    <view class="info-item-card">
                        <text class="info-item-label">下一步</text>
                        <text class="info-item-value">查看匹配报告</text>
                    </view>
                </view>

                <view class="info-card-white">
                    <text class="info-card-title">你可以查看什么</text>
                    <text class="info-card-desc">进入报告后可查看双方的契合度、维度差异和关系建议，无需重新走匹配确认流程。</text>
                </view>

                <view class="sheet-buttons">
                    <view class="btn-primary" @click="goToReport">
                        <text class="btn-primary-text">查看匹配报告</text>
                    </view>
                    <view class="btn-secondary" @click="closeModal">
                        <text class="btn-secondary-text">留在首页</text>
                    </view>
                </view>
            </template>

            <!-- ===== 1-8 补资料 ===== -->
            <template v-if="inviteState === 'need_profile'">
                <text class="sheet-title">完善个人资料</text>
                <text class="sheet-desc">补充头像与昵称后，可继续这条匹配邀请。这里会直接获取你的微信头像和昵称，方便好友识别你。</text>

                <view class="friend-row-card">
                    <view class="friend-info-col">
                        <text class="fr-label">等待匹配的好友</text>
                        <text class="fr-name">{{ inviterName }}</text>
                    </view>
                    <view class="friend-avatar-sm">
                        <image v-if="inviterAvatarUrl" :src="inviterAvatarUrl" class="friend-avatar-sm-img" mode="aspectFill" />
                        <text v-else class="friend-avatar-sm-letter">{{ inviterAvatarLetter }}</text>
                    </view>
                </view>

                <view class="wechat-info-card">
                    <text class="wi-label">微信头像和昵称</text>
                    <text class="wi-value">直接获取微信头像和昵称</text>
                    <view class="wi-preview">
                        <view class="wi-avatar">
                            <uni-icons type="person" color="#2d6b3f" size="16" />
                        </view>
                        <view class="wi-text">
                            <text class="wi-text-name">授权后自动带入头像和昵称</text>
                            <text class="wi-text-hint">无需手动填写</text>
                        </view>
                    </view>
                </view>

                <view class="sheet-buttons">
                    <view class="btn-secondary" @click="closeModal">
                        <text class="btn-secondary-text">稍后处理</text>
                    </view>
                    <view class="btn-primary" @click="doGetProfile">
                        <text class="btn-primary-text">获取微信头像和昵称</text>
                    </view>
                </view>
            </template>
        </view>
    </view>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { matchApi } from '@/api/match'

const props = defineProps({
    inviteState: { type: String, default: '' },
    inviterName: { type: String, default: '好友' },
    inviterAvatarUrl: { type: String, default: '' },
    matchId: { type: String, default: '' }
})

const emit = defineEmits(['close', 'match-done'])

const mStore = useUserStore()

const inviterAvatarLetter = computed(() => (props.inviterName || '好')[0])

function closeModal() {
    emit('close')
}

function handleOverlayTap() {
    // 点击遮罩不关闭，避免误操作
}

function goTakeTest() {
    mStore.pendingMatchInvite = true
    uni.navigateTo({ url: '/pages/test/answer' })
    emit('close')
}

function doMatch() {
    uni.showLoading({ title: '匹配中...' })
    matchApi
        .confirm(mStore.inviterId)
        .then((res) => {
            uni.hideLoading()
            if (res.code === 0) {
                emit('match-done', res.data.matchId)
            } else {
                uni.showToast({ title: res.message || '匹配失败', icon: 'none' })
            }
        })
        .catch(() => {
            uni.hideLoading()
            uni.showToast({ title: '网络错误', icon: 'none' })
        })
}

function goToReport() {
    const id = props.matchId
    if (id) {
        uni.redirectTo({ url: `/pages/match/result?matchId=${id}` })
    } else {
        uni.redirectTo({ url: '/pages/tabbar/index' })
    }
    emit('close')
}

function doGetProfile() {
    // 触发微信授权获取头像昵称
    uni.getUserProfile({
        desc: '用于匹配展示',
        success: (res) => {
            mStore.setProfile({
                nickName: res.userInfo.nickName,
                avatarUrl: res.userInfo.avatarUrl
            })
            uni.showToast({ title: '获取成功', icon: 'success' })
            // 获取后继续匹配
            doMatch()
        },
        fail: () => {
            uni.showToast({ title: '获取失败', icon: 'none' })
        }
    })
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 999;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}
.modal-mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.2);
}
.modal-sheet {
    position: relative;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    background: #ffffff;
    border-radius: 40rpx 40rpx 0 0;
    padding: 28rpx 40rpx 60rpx;
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

// 把手
.sheet-handle {
    width: 72rpx;
    height: 8rpx;
    background: #cdd4cd;
    border-radius: 999rpx;
    align-self: center;
    margin-bottom: 8rpx;
}

// 标签
.sheet-tag {
    display: flex;
    align-items: center;
    gap: 12rpx;
    background: #eef4ee;
    border-radius: 999rpx;
    padding: 14rpx 24rpx;
    width: fit-content;
}
.tag-dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 8rpx;
    background: $color-accent;
}
.tag-text {
    font-size: 22rpx;
    font-weight: 600;
    color: $color-accent;
}

// 标题与描述
.sheet-title {
    font-size: 44rpx;
    font-weight: 600;
    color: $color-primary;
    line-height: 1.3;
}
.sheet-desc {
    font-size: 26rpx;
    color: $color-secondary;
    line-height: 1.6;
}

// 好友信息卡
.friend-card {
    display: flex;
    gap: 20rpx;
    padding: 28rpx;
    background: #ffffff;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
}
.friend-avatar {
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    background: $color-accent-bg;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.friend-avatar-img {
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
}
.friend-avatar-letter {
    font-size: 36rpx;
    font-weight: 600;
    color: $color-accent;
}
.friend-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    justify-content: center;
}
.friend-name {
    font-size: 28rpx;
    font-weight: 600;
    color: $color-primary;
}
.friend-desc {
    font-size: 24rpx;
    color: $color-secondary;
    line-height: 1.5;
}

// 信息卡片（软背景）
.info-card-soft {
    background: $color-surface-secondary;
    border-radius: $radius-sm;
    padding: 28rpx;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}
.info-card-title {
    font-size: 26rpx;
    font-weight: 600;
    color: $color-primary;
}
.info-card-desc {
    font-size: 24rpx;
    color: $color-secondary;
    line-height: 1.6;
}

// 信息卡片（白底）
.info-card-white {
    background: #ffffff;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    padding: 28rpx;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

// 双列信息
.info-row-duo {
    display: flex;
    gap: 16rpx;
}
.info-item-card {
    flex: 1;
    background: #ffffff;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
    padding: 24rpx;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}
.info-item-label {
    font-size: 22rpx;
    color: $color-secondary;
}
.info-item-value {
    font-size: 32rpx;
    font-weight: 600;
    color: $color-primary;
}

// 补充说明
.sheet-footnote {
    font-size: 22rpx;
    color: $color-muted;
    line-height: 1.5;
}

// 按钮区
.sheet-buttons {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-top: 8rpx;
}
.btn-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    border-radius: $radius-btn;
    background: $color-accent;
}
.btn-primary-text {
    font-size: 30rpx;
    font-weight: 600;
    color: #ffffff;
}
.btn-secondary {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    border-radius: $radius-btn;
    background: #ffffff;
    border: 2rpx solid $color-border;
}
.btn-secondary-text {
    font-size: 30rpx;
    font-weight: 600;
    color: $color-primary;
}

// 1-8 补资料专用样式
.friend-row-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 112rpx;
    padding: 0 24rpx;
    background: #ffffff;
    border: 2rpx solid $color-border;
    border-radius: $radius-btn;
}
.friend-info-col {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
}
.fr-label {
    font-size: 24rpx;
    color: $color-secondary;
}
.fr-name {
    font-size: 28rpx;
    color: $color-primary;
}
.friend-avatar-sm {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    background: $color-accent-bg;
    display: flex;
    align-items: center;
    justify-content: center;
}
.friend-avatar-sm-img {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
}
.friend-avatar-sm-letter {
    font-size: 28rpx;
    font-weight: 600;
    color: $color-accent;
}

.wechat-info-card {
    background: #ffffff;
    border: 2rpx solid $color-border;
    border-radius: $radius-btn;
    padding: 24rpx;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}
.wi-label {
    font-size: 24rpx;
    color: $color-secondary;
}
.wi-value {
    font-size: 28rpx;
    color: $color-primary;
}
.wi-preview {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 0 24rpx;
    height: 88rpx;
    background: $color-surface-secondary;
    border-radius: $radius-btn;
}
.wi-avatar {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background: $color-accent-bg;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.wi-text {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
}
.wi-text-name {
    font-size: 24rpx;
    color: $color-primary;
}
.wi-text-hint {
    font-size: 22rpx;
    color: $color-muted;
}
</style>
