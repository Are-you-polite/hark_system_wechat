// 从云函数调用上下文中获取当前用户 openId
// 仅在通过 wx.cloud.callFunction 调用时有效
function getWxContext(cloud) {
    const wxContext = cloud.getWXContext()
    return {
        openId: wxContext.OPENID,
        appId: wxContext.APPID,
        unionId: wxContext.UNIONID
    }
}

module.exports = { getWxContext }
