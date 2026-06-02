<template>
    <view class="page-match">
        <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="header-text">
                <text class="title">灵魂共振</text>
                <text class="subtitle">遇见与你同频的有趣灵魂</text>
            </view>
        </view>

        <scroll-view scroll-y class="scroll-area">
            <!-- 有匹配记录 -->
            <view v-if="hasMatches" class="match-list">
                <view v-for="(item, index) in matchList" :key="item.matchId || index" class="match-card" @click="goToMatchResult(item.matchId)">
                    <view class="mc-avatar" :class="item.direction === 'invited' ? 'mc-avatar-m' : 'mc-avatar-f'">
                        <image v-if="item.otherUser?.avatarUrl?.startsWith('cloud://')" :src="item.otherUser.avatarUrl" class="mc-avatar-img" mode="aspectFill" />
                        <text v-else class="mc-avatar-letter">{{ (item.otherUser?.nickName || '好')[0] }}</text>
                    </view>
                    <view class="mc-info">
                        <view class="mc-name-row">
                            <text class="mc-name">{{ item.otherUser?.nickName || '好友' }}</text>
                            <text class="mc-badge" :class="item.direction === 'invited' ? 'mc-badge-inviter' : 'mc-badge-invitee'">
                                {{ item.direction === 'invited' ? '你邀请了 TA' : 'TA 邀请了你' }}
                            </text>
                        </view>
                        <text class="mc-type">
                            {{ item.otherUser?.personalityType || '--' }} ·
                            {{ item.otherUser?.personalityTypeName || '未知' }}
                        </text>
                    </view>
                    <view class="mc-score">
                        {{ item.compatibilityScore || 0 }}
                        <text class="mc-score-unit">%</text>
                    </view>
                </view>
                <view class="bottom-safe" />
            </view>

            <!-- 未测试 -->
            <view v-else-if="!mStore.hasTested" class="empty-state">
                <view class="empty-icon-wrap">
                    <uni-icons type="personadd-filled" color="#2d6b3f" size="40" />
                </view>
                <text class="empty-title">完成测试，开启匹配之旅</text>
                <text class="empty-desc">
                    完成性格测试后，你就可以
                    <br />
                    和好友进行灵魂匹配啦
                </text>
                <view class="go-test-btn" @click="goTest">🔮 去完成测试</view>
            </view>

            <!-- 已测试但无匹配 -->
            <view v-else class="empty-state">
                <view class="empty-icon-wrap">
                    <uni-icons type="personadd-filled" color="#2d6b3f" size="40" />
                </view>
                <text class="empty-title">还没有匹配记录</text>
                <text class="empty-desc">
                    分享你的性格卡片给好友
                    <br />
                    邀请 TA 一起来测，看看你们有多契合
                </text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { matchApi } from '@/api/match'

const mStore = useUserStore()
const statusBarHeight = ref(44)
const matchList = ref([])
const loading = ref(false)

const hasMatches = computed(() => matchList.value.length > 0)

onMounted(() => {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 44
    fetchMatches()
})

// 页面显示时刷新（比如匹配成功后回来能看到新数据）
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

const goToMatchResult = (matchId) => {
    uni.navigateTo({ url: `/pages/match/result?matchId=${matchId}` })
}

const goTest = () => uni.navigateTo({ url: '/pages/test/answer' })
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page-match {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: $color-bg;
    overflow: hidden;
    position: relative;
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

/* ========== 匹配列表 ========== */
.match-list {
    padding: 0 $spacing-xl;
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
}

.match-card {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    background: $color-surface;
    border-radius: $radius-lg;
    padding: $spacing-md $spacing-lg;
    box-shadow: $shadow-card;
    border: 2rpx solid rgba($color-primary, 0.04);
}

.mc-avatar {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    flex-shrink: 0;
}

.mc-avatar-img {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
}

.mc-avatar-letter {
    font-size: 28rpx;
    font-weight: 700;
    color: inherit;
}

.mc-avatar-m {
    background: rgba(45, 107, 63, 0.08);
    color: $color-accent;
}

.mc-avatar-f {
    background: rgba(90, 143, 212, 0.08);
    color: #5a8fd4;
}

.mc-info {
    flex: 1;
    min-width: 0;
}

.mc-name-row {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    margin-bottom: 2rpx;
}

.mc-name {
    font-size: 30rpx;
    font-weight: 700;
    color: $color-primary;
}

.mc-badge {
    font-size: 18rpx;
    font-weight: 600;
    padding: 4rpx 16rpx;
    border-radius: 30rpx;
    flex-shrink: 0;
}

.mc-badge-inviter {
    background: rgba(45, 107, 63, 0.08);
    color: $color-accent;
}

.mc-badge-invitee {
    background: rgba(90, 143, 212, 0.08);
    color: #5a8fd4;
}

.mc-type {
    font-size: 24rpx;
    color: $color-secondary;
}

.mc-score {
    font-size: 28rpx;
    font-weight: 800;
    color: $color-accent;
    padding: 8rpx 20rpx;
    background: rgba(45, 107, 63, 0.06);
    border-radius: 30rpx;
    flex-shrink: 0;
    text-align: center;
    line-height: 1;
}

.mc-score-unit {
    font-size: 20rpx;
    font-weight: 500;
}

/* ========== 空状态 ========== */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 100rpx;
}

.empty-icon-wrap {
    width: 120rpx;
    height: 120rpx;
    background-color: rgba(45, 107, 63, 0.05);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $spacing-lg;
}

.empty-title {
    font-size: 32rpx;
    font-weight: 700;
    color: $color-primary;
    margin-bottom: $spacing-sm;
}

.empty-desc {
    font-size: 26rpx;
    color: $color-secondary;
    text-align: center;
    line-height: 1.5;
}

.go-test-btn {
    margin-top: 32rpx;
    padding: 20rpx 56rpx;
    background: linear-gradient(135deg, $color-accent, $color-accent-dark);
    border-radius: $radius-sm;
    color: #ffffff;
    font-size: 28rpx;
    font-weight: 600;
}

.bottom-safe {
    height: calc(180rpx + env(safe-area-inset-bottom));
}
</style>
