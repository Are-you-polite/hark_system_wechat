const baseUrl = import.meta.env.VITE_API_BASE_URL

// 记录正在处理的请求，用于防重复提交
const pendingRequests = new Set()

// 参数序列化 (扁平化一层对象)
const transParams = (params) => {
    let result = []
    for (const key of Object.keys(params)) {
        const value = params[key]
        if (value === null || value === '' || value === undefined) continue
        if (typeof value === 'object') {
            for (const subKey of Object.keys(value)) {
                const subValue = value[subKey]
                if (subValue === null || subValue === '' || subValue === undefined) continue
                const partKey = encodeURIComponent(`${key}[${subKey}]`)
                const partValue = encodeURIComponent(subValue)
                result.push(`${partKey}=${partValue}`)
            }
        } else {
            const partKey = encodeURIComponent(key)
            const partValue = encodeURIComponent(value)
            result.push(`${partKey}=${partValue}`)
        }
    }
    return result.join('&')
}

/* 发送请求 */
const request = async (config) => {
    const { url, method = 'GET', header = {}, params, data, loading = true, preventRepeat = true } = config
    // 生成请求的唯一标识
    const requestKey = `${method.toUpperCase()}:${url}?${JSON.stringify(params || {})}&${JSON.stringify(data || {})}`
    if (preventRepeat) {
        if (pendingRequests.has(requestKey)) {
            uni.showToast({ title: '正在处理中,请耐心等待', icon: 'none', duration: 2000 })
            return null
        }
        pendingRequests.add(requestKey)
    }
    if (uni.getStorageSync('token')) header['Authorization'] = `Bearer ${uni.getStorageSync('token')}`
    const urlWithParams = `${baseUrl}${url}${params ? `?${transParams(params)}` : ''}`
    if (loading) uni.showLoading({ title: '加载中...' })
    try {
        const response = await uni.request({ url: urlWithParams, method, header, data, timeout: 20000, dataType: 'json' })
        if (response.data.code === 401) {
            if (loading) uni.hideLoading()
            uni.clearStorageSync()
            uni.showToast({ title: '登录已过期，请重新登录', icon: 'none', duration: 2000 })
            setTimeout(() => uni.reLaunch({ url: '/pages/login/index' }), 1800)
            return null
        }
        return response.data
    } catch {
        uni.showToast({ title: '服务器网络异常', icon: 'none', duration: 2000 })
    } finally {
        if (loading) uni.hideLoading()
        if (preventRepeat) pendingRequests.delete(requestKey)
    }
}

export { request }
