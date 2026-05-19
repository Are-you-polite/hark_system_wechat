/* 页面白名单 */
const whiteList = ['/pages/home/index', '/pages/chats/index', '/pages/mine/index', '/pages/login/index']
/* 检查地址白名单 */
const checkWhite = (url) => whiteList.indexOf(url.split('?')[0]) !== -1
/* 页面跳转验证拦截器 */
let list = ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab']
/* 路由拦截 */
list.forEach((item) => {
    uni.addInterceptor(item, {
        invoke(to) {
            const pages = getCurrentPages()
            const currentPage = pages.length ? pages[pages.length - 1].route : ''
            if (currentPage === 'pages/login/index' && to.url === '/pages/login/index') return false
            if (uni.getStorageSync('token') || checkWhite(to.url)) return true
            uni.navigateTo({ url: '/pages/login/index' })
            return false
        }
    })
})
