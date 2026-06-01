export async function request(action, data = {}) {
    const res = await wx.cloud.callFunction({
        name: 'wechat_api',
        data: { action, ...data }
    })
    return res.result
}
