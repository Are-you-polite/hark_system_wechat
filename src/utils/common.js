/* 东软 - 移动医保支付 */
const DrChsPayMent = () => {}

/* 地纬 - 移动医保支付 */
const DwChsPayMent = () => {}

/* 订阅消息 */
const SubscribeMsg = (tmplIds) => {
    return new Promise((resolve) => {
        uni.getSetting({
            withSubscriptions: true,
            success(res) {
                const { itemSettings } = res.subscriptionsSetting
                if (!itemSettings) return uni.requestSubscribeMessage({ tmplIds: tmplIds, complete: () => resolve() })
                const newArr = []
                tmplIds.forEach((item) => {
                    if (itemSettings[item] !== 'accept') newArr.push(item)
                })
                if (newArr.length) uni.requestSubscribeMessage({ tmplIds: newArr, complete: () => resolve() })
                else resolve()
            },
            fail: () => resolve()
        })
    })
}

export { DrChsPayMent, DwChsPayMent, SubscribeMsg }
