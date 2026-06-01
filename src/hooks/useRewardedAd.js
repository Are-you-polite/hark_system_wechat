export function useRewardedAd(adUnitId = '') {
    const rewardedAd = ref(null)
    const isReady = ref(false)

    function initAd() {
        if (rewardedAd.value) return
        try {
            const ad = wx.createRewardedVideoAd({ adUnitId })
            ad.onLoad(() => {
                isReady.value = true
            })
            ad.onError(() => {
                isReady.value = false
            })
            rewardedAd.value = ad
        } catch (e) {
            console.error('[ad] 创建失败', e)
        }
    }

    function showAd() {
        initAd()
        const ad = rewardedAd.value
        if (!ad) return Promise.resolve(false)

        return new Promise((resolve) => {
            ad.show()
                .then(() => {
                    ad.onClose((res) => resolve(res && res.isEnded))
                })
                .catch(() => {
                    ad.load()
                        .then(() => ad.show().then(() => ad.onClose((res) => resolve(res && res.isEnded))))
                        .catch(() => resolve(false))
                })
        })
    }

    return { showAd, isReady, initAd }
}
