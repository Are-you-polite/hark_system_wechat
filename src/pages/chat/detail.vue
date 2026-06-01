<template>
    <view class="page-chat-detail">
        <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="back-btn" @tap="goBack">
                <uni-icons type="back" color="#1e3322" size="20" />
            </view>
            <view class="nav-info">
                <text class="nav-title">AI 性格解读</text>
                <text class="nav-subtitle">{{ store.personalityType }} · {{ store.personalityTypeName }} · 剩余 {{ store.isVipActive ? '∞' : store.creditBalance }} 次</text>
            </view>
            <view class="nav-ph" />
        </view>

        <scroll-view class="chat-area" scroll-y :scroll-into-view="scrollToId">
            <view class="chat-content">
                <view class="ai-intro">
                    <view class="ai-intro-avatar">
                        <uni-icons type="chatbubble-filled" color="#ffffff" size="18" />
                    </view>
                    <view class="ai-intro-body">
                        <text class="ai-intro-name">AI 分析师</text>
                        <text class="intro-text">{{ greetingText }}</text>
                    </view>
                </view>

                <view v-if="messages.length === 0" class="suggestions-section">
                    <text class="suggestions-label">试试这些问题</text>
                    <view class="suggestions-grid">
                        <view v-for="(s, i) in suggestions" :key="i" class="suggestion-pill" @tap="sendSuggestion(s)">
                            <text class="pill-text">{{ s }}</text>
                        </view>
                    </view>
                </view>

                <view class="message-list">
                    <view v-for="(msg, index) in messages" :key="index" class="message-item" :class="msg.role === 'user' ? 'message-user' : 'message-ai'">
                        <view v-if="msg.role === 'ai'" class="avatar">
                            <uni-icons type="chatbubble-filled" color="#ffffff" size="16" />
                        </view>
                        <view class="bubble">
                            <view v-if="msg.role === 'ai' && msg.reasoning_content" class="reasoning-toggle" @tap="msg.reasoningExpanded = !msg.reasoningExpanded">
                                <uni-icons :type="msg.reasoningExpanded ? 'bottom' : 'right'" color="#808a80" size="14" />
                                <text class="reasoning-toggle-text">思考过程</text>
                            </view>
                            <view v-if="msg.role === 'ai' && msg.reasoning_content && msg.reasoningExpanded" class="reasoning-content">
                                <text class="reasoning-text">{{ msg.reasoning_content }}</text>
                            </view>
                            <text class="bubble-text">{{ msg.content }}</text>
                            <text v-if="msg.role === 'ai' && index === messages.length - 1 && streaming" class="streaming-indicator">▍</text>
                        </view>
                    </view>
                </view>

                <view id="scroll-bottom" class="scroll-bottom" />
            </view>
        </scroll-view>

        <view class="input-bar">
            <input v-model="inputText" class="input-box" type="text" placeholder="输入你的问题..." :disabled="streaming" cursor-spacing="20" @confirm="sendMessage" />
            <view class="send-btn" :class="{ disabled: streaming }" @tap="sendMessage">
                <uni-icons type="arrow-up" color="#ffffff" size="20" />
            </view>
        </view>

        <!-- 次数不足底部面板 -->
        <view v-if="showNoCredits" class="modal-overlay" @tap="showNoCredits = false">
            <view class="bottom-sheet" @tap.stop>
                <view class="sheet-handle" />
                <text class="sheet-title">对话次数已用完</text>
                <text class="sheet-desc">选择以下方式获取更多对话次数</text>
                <view class="sheet-actions">
                    <view class="sheet-btn btn-primary" @tap="goBuy">
                        <uni-icons type="wallet" color="#ffffff" size="20" />
                        <text class="btn-label">购买次数 ¥9.9 起</text>
                    </view>
                    <view class="sheet-btn btn-secondary" @tap="watchAd">
                        <uni-icons type="star-filled" color="#2d6b3f" size="20" />
                        <text class="btn-label">看广告得 1 次</text>
                    </view>
                </view>
                <view class="sheet-ad-info">今日还可通过广告获得 {{ Math.max(0, store.adRewardMax - store.adRewardCount) }} 次</view>
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
    .nav-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4rpx;

        .nav-title {
            font-size: 36rpx;
            font-weight: 700;
            color: $color-primary;
        }
        .nav-subtitle {
            font-size: 20rpx;
            color: $color-muted;
        }
        .nav-ph {
            width: 60rpx;
        }
    }
}

.chat-area {
    flex: 1;
    height: 0;
    background-color: $color-bg;
}

.chat-content {
    padding: $spacing-md $spacing-xl 48rpx;
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
}

.scroll-bottom {
    height: 20rpx;
}

.ai-intro {
    display: flex;
    gap: $spacing-sm;
    padding: $spacing-lg;
    background-color: $color-surface;
    border: 2rpx solid $color-border;
    border-radius: $radius-lg;
    box-shadow: $shadow-card;

    .ai-intro-avatar {
        width: 56rpx;
        height: 56rpx;
        background: linear-gradient(135deg, $color-accent 0%, $color-accent-dark 100%);
        border-radius: 50%;
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
        gap: $spacing-xs;

        .ai-intro-name {
            font-size: 22rpx;
            font-weight: 600;
            color: $color-accent;
        }
        .intro-text {
            font-size: 24rpx;
            color: $color-secondary;
            line-height: 1.7;
        }
    }
}

.suggestions-section {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

    .suggestions-label {
        font-size: 20rpx;
        font-weight: 600;
        color: $color-accent;
        letter-spacing: 2rpx;
    }
    .suggestions-grid {
        display: flex;
        flex-wrap: wrap;
        gap: $spacing-sm;

        .suggestion-pill {
            padding: 18rpx 28rpx;
            border: 2rpx solid $color-border;
            border-radius: $radius-sm;
            background-color: $color-surface;
            box-shadow: $shadow-card;

            .pill-text {
                font-size: 24rpx;
                color: $color-primary;
                white-space: nowrap;
            }
        }
    }
}

.message-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;

    .message-item {
        display: flex;
        gap: $spacing-sm;
        max-width: 88%;

        .avatar {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 56rpx;
            height: 56rpx;
            border-radius: 50%;
            background: linear-gradient(135deg, $color-accent 0%, $color-accent-dark 100%);
            flex-shrink: 0;
            margin-top: 8rpx;
        }
        .bubble {
            padding: $spacing-md;
            border-radius: $radius-md;

            .bubble-text {
                font-size: 26rpx;
                line-height: 1.7;
                white-space: pre-line;
            }
        }
    }

    .message-ai {
        align-self: flex-start;

        .bubble {
            background-color: $color-surface;
            border: 2rpx solid $color-border;
            box-shadow: $shadow-card;
            border-bottom-left-radius: 4rpx;

            .bubble-text {
                color: $color-primary;
            }
        }
    }

    .message-user {
        align-self: flex-end;
        flex-direction: row-reverse;

        .bubble {
            background: linear-gradient(135deg, $color-accent 0%, $color-accent-dark 100%);
            border-bottom-right-radius: 4rpx;
            box-shadow: 0 4rpx 12rpx rgba(45, 107, 63, 0.2);

            .bubble-text {
                color: #ffffff;
            }
        }
    }
}

.streaming-indicator {
    display: inline;
    font-size: 26rpx;
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

.reasoning-toggle {
    display: flex;
    align-items: center;
    gap: 6rpx;
    margin-bottom: 12rpx;
    padding: 8rpx 12rpx;
    border-radius: 8rpx;
    background-color: $color-bg;

    .reasoning-toggle-text {
        font-size: 22rpx;
        color: $color-muted;
        font-weight: 500;
    }
}

.reasoning-content {
    margin-bottom: 16rpx;
    padding: 16rpx;
    border-radius: 8rpx;
    background-color: $color-surface-secondary;
    border-left: 4rpx solid $color-muted;

    .reasoning-text {
        font-size: 22rpx;
        color: $color-muted;
        line-height: 1.7;
        white-space: pre-line;
    }
}

.input-bar {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-md $spacing-xl;
    padding-bottom: calc($spacing-md + env(safe-area-inset-bottom));
    background-color: $color-surface;
    border-top: 2rpx solid $color-border;
    flex-shrink: 0;

    .input-box {
        flex: 1;
        height: 72rpx;
        padding: 0 $spacing-md;
        font-size: 26rpx;
        color: $color-primary;
        background-color: $color-bg;
        border-radius: $radius-sm;
    }
    .send-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 72rpx;
        height: 72rpx;
        background: linear-gradient(135deg, $color-accent 0%, $color-accent-dark 100%);
        border-radius: 50%;
        box-shadow: 0 4rpx 12rpx rgba(45, 107, 63, 0.3);
        flex-shrink: 0;
    }
    .send-btn.disabled {
        opacity: 0.4;
        pointer-events: none;
    }
}

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
    border-radius: $radius-xl $radius-xl 0 0;
    padding: $spacing-lg $spacing-xl calc($spacing-xl + env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
    align-items: center;

    .sheet-handle {
        width: 80rpx;
        height: 6rpx;
        background: #ddd;
        border-radius: 3rpx;
        margin-bottom: $spacing-lg;
    }
    .sheet-title {
        font-size: 36rpx;
        font-weight: 700;
        color: $color-primary;
        margin-bottom: $spacing-xs;
    }
    .sheet-desc {
        font-size: 26rpx;
        color: $color-secondary;
        margin-bottom: $spacing-xl;
    }
    .sheet-actions {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: $spacing-md;
    }
    .sheet-btn {
        width: 100%;
        padding: $spacing-md 0;
        border-radius: $radius-md;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $spacing-sm;

        &.btn-primary {
            background: linear-gradient(135deg, $color-accent, $color-accent-dark);
        }
        &.btn-secondary {
            background: rgba(45, 107, 63, 0.08);
        }
        .btn-label {
            font-size: 30rpx;
            font-weight: 600;
        }
        &.btn-primary .btn-label {
            color: #ffffff;
        }
        &.btn-secondary .btn-label {
            color: $color-accent;
        }
    }
    .sheet-ad-info {
        font-size: 22rpx;
        color: $color-muted;
        margin-top: $spacing-lg;
    }
}
</style>
