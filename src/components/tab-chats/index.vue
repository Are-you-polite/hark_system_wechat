<template>
    <view class="page-chats">
        <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="header-text">
                <text class="title">洞察日志</text>
                <text class="subtitle">回顾你的内心探索之旅</text>
            </view>
        </view>

        <scroll-view scroll-y class="scroll-area">
            <view v-if="chatList.length > 0" class="chat-list">
                <view v-for="(item, index) in chatList" :key="index" class="chat-card" @tap="goToDetail(item)">
                    <view class="card-header">
                        <text class="card-title">{{ item.title }}</text>
                        <text class="time">{{ formatTime(item.createdAt || item.updatedAt) }}</text>
                    </view>
                    <view class="card-body">
                        <text class="card-preview">{{ item.preview }}</text>
                    </view>
                    <view class="card-footer">
                        <view class="footer-left">
                            <uni-icons type="chatbubble" color="#a0a8a0" size="14" />
                            <text class="footer-text">AI 深度解读</text>
                        </view>
                        <view class="btn-continue">
                            <text>继续探索</text>
                            <uni-icons type="arrow-right" color="#2d6b3f" size="12" />
                        </view>
                    </view>
                </view>
                <view class="bottom-safe" />
            </view>

            <view v-else class="empty-state">
                <view class="empty-icon-wrap">
                    <uni-icons type="star-filled" color="#2d6b3f" size="40" />
                </view>
                <text class="empty-title">一切从这里开始</text>
                <text class="empty-desc">开启你的第一次 AI 性格探索之旅</text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { chatApi } from '@/api/chat'
import { formatTime } from '@/utils/format'

const statusBarHeight = ref(44)
const chatList = ref([])
const loading = ref(false)

onMounted(() => {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 44
    loadChats()
})

async function loadChats() {
    loading.value = true
    try {
        const res = await chatApi.listChats()
        if (res.code === 0) {
            chatList.value = res.data.list || []
        }
    } catch (e) {
        console.error('[chats] 加载失败', e)
    } finally {
        loading.value = false
    }
}

const goToDetail = (item) => uni.navigateTo({ url: '/pages/chat/detail?chatId=' + (item._id || '') })
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page-chats {
    display: flex;
    flex-direction: column;
    background-color: $color-bg;
    height: 100%;
    overflow: hidden;
    position: relative;
}

.header {
    padding: $spacing-md 0 0;
    margin: 0 $spacing-xl $spacing-md;
}

.header-text {
    display: flex;
    flex-direction: column;
}

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

.scroll-area {
    flex: 1;
    height: 0;
    overflow: hidden;
}

.chat-list {
    padding: 0 $spacing-xl;
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
}

.chat-card {
    background-color: #ffffff;
    border-radius: $radius-lg;
    padding: $spacing-lg;
    box-shadow: $shadow-card;
    display: flex;
    flex-direction: column;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;
}

.card-title {
    font-size: 30rpx;
    font-weight: 700;
    color: $color-primary;
    line-height: 1.4;
    flex: 1;
    margin-right: $spacing-sm;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.time {
    font-size: 22rpx;
    color: $color-muted;
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
}

.card-body {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    margin-bottom: 28rpx;
}

.card-preview {
    font-size: 26rpx;
    color: $color-secondary;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: $spacing-md;
    border-top: 2rpx dashed $color-border;
}

.footer-left {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
}

.footer-text {
    font-size: 22rpx;
    color: $color-muted;
}

.btn-continue {
    display: flex;
    align-items: center;
    gap: 6rpx;
    font-size: 24rpx;
    font-weight: 600;
    color: $color-accent;
    padding: 8rpx;
}

.bottom-safe {
    height: calc(180rpx + env(safe-area-inset-bottom));
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
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
}
</style>
