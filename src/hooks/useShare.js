import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

/**
 * 微信小程序分享全局 Hook
 * @param {Object|Function} options - 分享配置项，支持传入对象或返回对象的函数（用于动态配置）
 * @param {string} options.title - 分享标题
 * @param {string} options.path - 分享路径 (onShareAppMessage 使用，默认当前页面路径)
 * @param {string} options.query - 分享参数 (onShareTimeline 使用，格式如 'id=1&type=2')
 * @param {string} options.imageUrl - 分享图片 URL
 */
export function useShare(options = {}) {
    // 分享给好友
    onShareAppMessage((res) => {
        const config = typeof options === 'function' ? options(res) : options
        const shareObj = { title: config.title || '互联网医院' }
        if (config.path) shareObj.path = config.path
        if (config.imageUrl) shareObj.imageUrl = config.imageUrl
        return shareObj
    })
    // 分享到朋友圈
    onShareTimeline(() => {
        const config = typeof options === 'function' ? options() : options
        const shareObj = { title: config.title || '互联网医院' }
        if (config.query) shareObj.query = config.query
        if (config.imageUrl) shareObj.imageUrl = config.imageUrl
        return shareObj
    })
}
