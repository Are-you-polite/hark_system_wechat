<template>
    <view v-if="visible" class="fab-wrapper" :class="{ snapping: snapping }" :style="{ left: posX + 'px', top: posY + 'px' }" @touchstart="onTouchStart" @touchmove.stop="onTouchMove" @touchend="onTouchEnd" @click="onClick">
        <uni-icons :type="icon" :color="iconColor" :size="iconSize" />
    </view>
</template>

<script setup>
defineProps({
    icon: { type: String, default: 'plusempty' },
    iconColor: { type: String, default: '#ffffff' },
    iconSize: { type: Number, default: 24 },
    visible: { type: Boolean, default: true }
})

const emit = defineEmits(['tap'])

const FAB_SIZE = 50
const EDGE_GAP = 12
const BOTTOM = 130
const winW = ref(375)
const winH = ref(667)
const posX = ref(0)
const posY = ref(0)
const dragging = ref(false)
const snapping = ref(false)
const sx = ref(0)
const sy = ref(0)
const lx = ref(0)
const ly = ref(0)

onMounted(() => {
    const info = uni.getSystemInfoSync()
    winW.value = info.windowWidth
    winH.value = info.windowHeight
    posX.value = winW.value - FAB_SIZE - EDGE_GAP
    posY.value = winH.value - FAB_SIZE - BOTTOM
})

function onTouchStart(e) {
    const t = e.touches[0]
    dragging.value = true
    snapping.value = false
    sx.value = t.clientX
    sy.value = t.clientY
    lx.value = posX.value
    ly.value = posY.value
}

function onTouchMove(e) {
    if (!dragging.value) return
    const t = e.touches[0]
    posX.value = Math.max(EDGE_GAP, Math.min(lx.value + (t.clientX - sx.value), winW.value - FAB_SIZE))
    posY.value = Math.max(0, Math.min(ly.value + (t.clientY - sy.value), winH.value - FAB_SIZE - 50))
}

function onTouchEnd() {
    dragging.value = false
    snapping.value = true
    const rightGap = winW.value - FAB_SIZE - posX.value
    posX.value = posX.value < rightGap ? EDGE_GAP : winW.value - FAB_SIZE - EDGE_GAP
}

function onClick() {
    if (!dragging.value) emit('tap')
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.fab-wrapper {
    position: fixed;
    width: 100rpx;
    height: 100rpx;
    background: $color-accent;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 32rpx rgba(45, 107, 63, 0.4);
    z-index: 999;
    &.snapping {
        transition:
            left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
            top 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
}
</style>
