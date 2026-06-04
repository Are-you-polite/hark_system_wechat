<template>
    <view class="page-chats">
        <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="header-text">
                <text class="title">洞察日志</text>
                <text class="subtitle">回顾你的内心探索之旅</text>
            </view>
        </view>

        <scroll-view scroll-y class="scroll-area">
            <!-- 2-3 有对话记录 -->
            <view v-if="chatList.length > 0" class="chat-list">
                <view v-for="(item, index) in chatList" :key="index" class="chat-card" @click="goToDetail(item)">
                    <view class="cc-header">
                        <text class="cc-title">{{ item.title }}</text>
                        <text class="cc-time">{{ formatTime(item.createdAt || item.updatedAt) }}</text>
                    </view>
                    <view class="cc-body">
                        <text class="cc-preview">{{ item.preview }}</text>
                    </view>
                    <view class="cc-footer">
                        <view class="cc-footer-left">
                            <uni-icons type="chatbubble" color="#808a80" size="14" />
                            <text class="cc-footer-tag">AI 深度解读</text>
                        </view>
                        <view class="cc-footer-right">
                            <text class="cc-footer-action">继续探索</text>
                            <uni-icons type="arrow-right" color="#2d6b3f" size="12" />
                        </view>
                    </view>
                </view>
            </view>

            <!-- 2-2 已测试无记录 -->
            <view v-else-if="store.hasTested" class="empty-wrap">
                <view class="empty-icon-box">
                    <uni-icons type="chatboxes" color="#2d6b3f" size="28" />
                </view>
                <text class="empty-title">开始你的第一次对话</text>
                <text class="empty-desc">已完成性格测试，现在可以开启 AI 深度对话，\n探索你内心的更多面向</text>
                <view class="empty-btn" @click="goNewChat">
                    <text class="empty-btn-text">开启对话</text>
                </view>
            </view>

            <!-- 2-1 未测试 -->
            <view v-else class="empty-wrap">
                <view class="empty-icon-box">
                    <uni-icons type="chatboxes" color="#2d6b3f" size="28" />
                </view>
                <text class="empty-title">暂无对话记录</text>
                <text class="empty-desc">完成性格测试后即可开启 AI 对话，\n深入探索你的内心世界</text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { chatApi } from '@/api/chat'
import { formatTime } from '@/utils/format'

const store = useUserStore()
const statusBarHeight = ref(44)
const chatList = ref([])

onMounted(() => {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 44
    loadChats()
})

async function loadChats() {
    try {
        const res = await chatApi.listChats()
        if (res.code === 0) {
            chatList.value = res.data.list || []
        }
    } catch (e) {
        console.error('[chats] 加载失败', e)
    }
}

function goToDetail(item) {
    uni.navigateTo({ url: '/pages/chat/detail?chatId=' + (item._id || '') })
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page-chats {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: $color-bg;
    overflow: hidden;
}

// ===== Header =====
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
// ===== Scroll =====
.scroll-area {
    flex: 1;
    height: 0;
    overflow: hidden;
}

// ===== 2-3 对话卡片列表 =====
.chat-list {
    padding: 0 40rpx 180rpx 40rpx;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
}
.chat-card {
    background: $color-surface;
    border-radius: $radius-lg;
    padding: 32rpx;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

// 卡片头部
.cc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.cc-title {
    font-size: 30rpx;
    font-weight: 700;
    color: $color-primary;
    flex: 1;
    margin-right: 16rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.cc-time {
    font-size: 22rpx;
    color: $color-muted;
    flex-shrink: 0;
}

// 卡片主体
.cc-body {
    display: flex;
    flex-direction: column;
}
.cc-preview {
    font-size: 26rpx;
    color: $color-secondary;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
}

// 卡片底部（顶部分割线 1px solid $line）
.cc-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20rpx;
    border-top: 2rpx solid $color-border;
}
.cc-footer-left {
    display: flex;
    align-items: center;
    gap: 8rpx;
}
.cc-footer-tag {
    font-size: 22rpx;
    color: $color-muted;
}
.cc-footer-right {
    display: flex;
    align-items: center;
    gap: 8rpx;
}
.cc-footer-action {
    font-size: 24rpx;
    font-weight: 600;
    color: $color-accent;
}

// ===== 2-1 / 2-2 空状态 =====
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
    border-radius: 28rpx;
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
</style>
