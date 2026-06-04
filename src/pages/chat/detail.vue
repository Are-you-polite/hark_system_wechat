<template>
    <view class="page-chat-detail">
        <!-- 导航栏 -->
        <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
            <text class="nav-back" @click="goBack">返回</text>
            <view class="nav-center">
                <text class="nav-title">AI 性格解读</text>
                <text class="nav-subtitle">{{ store.personalityType }} · {{ store.personalityTypeName }} · 剩余 {{ store.isVipActive ? '∞' : store.creditBalance }} 次</text>
            </view>
            <text class="nav-placeholder">返回</text>
        </view>

        <!-- 聊天区 -->
        <scroll-view class="chat-area" scroll-y :scroll-into-view="scrollToId">
            <view class="chat-content">
                <!-- AI 介绍卡片（仅欢迎页显示） -->
                <view v-if="messages.length === 0" class="ai-intro-card">
                    <view class="ai-avatar">
                        <uni-icons type="chatbubble" color="#ffffff" size="16" />
                    </view>
                    <view class="ai-intro-body">
                        <text class="ai-intro-name">AI 分析师</text>
                        <text class="ai-intro-text">{{ greetingText }}</text>
                    </view>
                </view>

                <!-- 推荐问题 -->
                <view v-if="messages.length === 0" class="suggestions">
                    <text class="suggestions-label">试试这些问题</text>
                    <view class="suggestions-tags">
                        <view v-for="(s, i) in suggestions" :key="i" class="suggestion-tag" @click="sendSuggestion(s)">
                            <text class="tag-text">{{ s }}</text>
                        </view>
                    </view>
                </view>

                <!-- 消息列表 -->
                <view class="msg-list">
                    <view v-for="(msg, index) in messages" :key="index" class="msg-item" :class="msg.role === 'user' ? 'msg-user' : 'msg-ai'">
                        <!-- AI 头像 -->
                        <view v-if="msg.role === 'ai'" class="msg-avatar">
                            <uni-icons type="chatbubble" color="#ffffff" size="16" />
                        </view>

                        <view class="msg-bubble">
                            <!-- 推理过程 -->
                            <view v-if="msg.role === 'ai' && msg.reasoning_content" class="reasoning-toggle" @click="msg.reasoningExpanded = !msg.reasoningExpanded">
                                <uni-icons :type="msg.reasoningExpanded ? 'bottom' : 'right'" color="#808a80" size="14" />
                                <text class="reasoning-toggle-text">思考过程</text>
                            </view>
                            <view v-if="msg.role === 'ai' && msg.reasoning_content && msg.reasoningExpanded" class="reasoning-content">
                                <text class="reasoning-text">{{ msg.reasoning_content }}</text>
                            </view>

                            <text class="bubble-text">{{ msg.content }}</text>
                            <text v-if="msg.role === 'ai' && index === messages.length - 1 && streaming" class="streaming-dot">▍</text>
                        </view>
                    </view>
                </view>

                <view id="scroll-bottom" class="scroll-bottom" />
            </view>
        </scroll-view>

        <!-- 输入栏 -->
        <view class="input-bar">
            <input v-model="inputText" class="input-box" type="text" placeholder="输入你的问题..." :disabled="streaming" cursor-spacing="20" @confirm="sendMessage" />
            <view class="send-btn" :class="{ disabled: streaming }" @click="sendMessage">
                <uni-icons type="arrow-up" color="#ffffff" size="18" />
            </view>
        </view>

        <!-- 次数不足底部面板（2-6） -->
        <view v-if="showNoCredits" class="modal-overlay" @click="showNoCredits = false">
            <view class="bottom-sheet" @click.stop>
                <view class="sheet-handle" />
                <text class="sheet-title">对话次数已用完</text>
                <text class="sheet-desc">选择以下方式获取更多对话次数</text>
                <view class="sheet-actions">
                    <view class="sheet-btn btn-primary" @click="goBuy">
                        <uni-icons type="wallet" color="#ffffff" size="20" />
                        <text class="btn-label">购买次数 ¥9.9 起</text>
                    </view>
                    <view class="sheet-btn btn-secondary" @click="watchAd">
                        <uni-icons type="star-filled" color="#2d6b3f" size="20" />
                        <text class="btn-label">看广告得 1 次</text>
                    </view>
                </view>
                <text class="sheet-ad-info">今日还可通过广告获得 {{ Math.max(0, store.adRewardMax - store.adRewardCount) }} 次</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useChat } from '@/hooks/useChat'

const store = useUserStore()
const statusBarHeight = ref(uni.getWindowInfo().statusBarHeight || 44)

const { messages, inputText, scrollToId, streaming, showNoCredits, greetingText, suggestions, initChat, sendMessage, sendSuggestion, watchAd, goBuy } = useChat()

const goBack = () => uni.navigateBack()

onLoad((query) => {
    initChat(query.chatId || '')
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page-chat-detail {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: $color-bg;
    overflow: hidden;
}

// ===== 导航栏 (height:88, fill:$surface, border-bottom:1px $line) =====
.nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    padding: 0 40rpx;
    background: $color-surface;
    border-bottom: 2rpx solid $color-border;
}
.nav-back {
    font-size: 28rpx;
    color: $color-secondary;
    width: 100rpx;
    flex-shrink: 0;
}
.nav-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rpx;
}
.nav-title {
    font-size: 32rpx;
    font-weight: 600;
    color: $color-primary;
}
.nav-subtitle {
    font-size: 20rpx;
    color: $color-muted;
}
.nav-placeholder {
    font-size: 28rpx;
    color: transparent;
    width: 100rpx;
    flex-shrink: 0;
}

// ===== 聊天区 =====
.chat-area {
    flex: 1;
    height: 0;
    background: $color-bg;
}
.chat-content {
    padding: 40rpx 40rpx 48rpx;
    display: flex;
    flex-direction: column;
    gap: 32rpx;
}
.scroll-bottom {
    height: 20rpx;
}

// ===== AI 介绍卡片 (cornerRadius:12, fill:$surface, padding:16, stroke:$line) =====
.ai-intro-card {
    display: flex;
    gap: 24rpx;
    padding: 32rpx;
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-sm;
}
.ai-avatar {
    width: 56rpx;
    height: 56rpx;
    border-radius: 28rpx;
    background: $color-accent;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 4rpx;
}
.ai-intro-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}
.ai-intro-name {
    font-size: 22rpx;
    font-weight: 600;
    color: $color-accent;
}
.ai-intro-text {
    font-size: 24rpx;
    color: $color-secondary;
    line-height: 1.6;
}

// ===== 推荐问题 =====
.suggestions {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}
.suggestions-label {
    font-size: 20rpx;
    font-weight: 600;
    color: $color-accent;
    letter-spacing: 2rpx;
}
.suggestions-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
}
.suggestion-tag {
    padding: 16rpx 28rpx;
    border: 2rpx solid $color-border;
    border-radius: 16rpx;
    background: $color-surface;
}
.tag-text {
    font-size: 24rpx;
    color: $color-primary;
    white-space: nowrap;
}

// ===== 消息列表 =====
.msg-list {
    display: flex;
    flex-direction: column;
    gap: 32rpx;
}
.msg-item {
    display: flex;
    gap: 16rpx;
    max-width: 88%;
}
.msg-ai {
    align-self: flex-start;
}
.msg-user {
    align-self: flex-end;
    flex-direction: row-reverse;
}

// AI 头像 (28×28, cornerRadius:14, $brand)
.msg-avatar {
    width: 56rpx;
    height: 56rpx;
    border-radius: 28rpx;
    background: $color-accent;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 8rpx;
}

// 消息气泡
.msg-bubble {
    padding: 24rpx;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
}
.bubble-text {
    font-size: 24rpx;
    line-height: 1.6;
    white-space: pre-line;
}

// AI 气泡 (cornerRadius:[12,12,12,4], $surface, stroke:$line)
.msg-ai .msg-bubble {
    background: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: 24rpx 24rpx 24rpx 8rpx;
}
.msg-ai .bubble-text {
    color: $color-primary;
}

// 用户气泡 (cornerRadius:[12,12,4,12], $brand)
.msg-user .msg-bubble {
    background: $color-accent;
    border-radius: 24rpx 24rpx 8rpx 24rpx;
}
.msg-user .bubble-text {
    color: #ffffff;
}

// ===== 推理过程 =====
.reasoning-toggle {
    display: flex;
    align-items: center;
    gap: 6rpx;
    margin-bottom: 12rpx;
    padding: 8rpx 12rpx;
    border-radius: 8rpx;
    background: $color-bg;
}
.reasoning-toggle-text {
    font-size: 22rpx;
    color: $color-muted;
    font-weight: 500;
}
.reasoning-content {
    margin-bottom: 16rpx;
    padding: 16rpx;
    border-radius: 8rpx;
    background: $color-surface-secondary;
    border-left: 4rpx solid $color-muted;
}
.reasoning-text {
    font-size: 22rpx;
    color: $color-muted;
    line-height: 1.7;
    white-space: pre-line;
}

// ===== 流式指示器 =====
.streaming-dot {
    display: inline;
    font-size: 24rpx;
    color: $color-accent;
    animation: blink 0.8s infinite;
}
@keyframes blink {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
}

// ===== 输入栏 (fill:$surface, padding:[12,20], border-top:1px $line) =====
.input-bar {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 24rpx 40rpx;
    padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
    background: $color-surface;
    border-top: 2rpx solid $color-border;
}
.input-box {
    flex: 1;
    height: 72rpx;
    padding: 0 24rpx;
    font-size: 26rpx;
    color: $color-primary;
    background: $color-bg;
    border-radius: 16rpx;
}
.send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72rpx;
    height: 72rpx;
    border-radius: 20rpx;
    background: $color-accent;
    flex-shrink: 0;
}
.send-btn.disabled {
    opacity: 0.4;
    pointer-events: none;
}

// ===== 次数不足底部面板 (2-6) =====
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 999;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}
.bottom-sheet {
    width: 100%;
    background: #ffffff;
    border-radius: 32rpx 32rpx 0 0;
    padding: 48rpx 40rpx;
    padding-bottom: calc(64rpx + env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;
}
.sheet-handle {
    width: 80rpx;
    height: 6rpx;
    background: #ddd;
    border-radius: 3rpx;
    margin-bottom: 16rpx;
}
.sheet-title {
    font-size: 36rpx;
    font-weight: 700;
    color: $color-primary;
}
.sheet-desc {
    font-size: 26rpx;
    color: $color-secondary;
}
.sheet-actions {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-top: 8rpx;
}
.sheet-btn {
    width: 100%;
    padding: 24rpx 0;
    border-radius: $radius-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
}
.sheet-btn.btn-primary {
    background: $color-accent;
}
.sheet-btn.btn-secondary {
    background: $color-accent-bg;
}
.btn-label {
    font-size: 30rpx;
    font-weight: 600;
}
.btn-primary .btn-label {
    color: #ffffff;
}
.btn-secondary .btn-label {
    color: $color-accent;
}
.sheet-ad-info {
    font-size: 22rpx;
    color: $color-muted;
    margin-top: 8rpx;
}
</style>
