import io from '@hyoga/uni-socket.io'
import { defineStore } from 'pinia'
import { shallowRef } from 'vue' // 显式引入以防 auto-import 在普通 js 文件中加载滞后
const socketUrl = import.meta.env.VITE_SOCKET_URL

export const useSocketClientStore = defineStore('socketClient', () => {
    console.log(io, socketUrl)
    const socket = shallowRef(null)
    return { socket }
})
