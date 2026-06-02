export function useRewardedAd(adUnitId = '') {
    const isReady = ref(false)
    let ad = null
    let closeResolve = null

    function initAd() {
        if (ad) return
        try {
            ad = wx.createRewardedVideoAd({ adUnitId })
            ad.onLoad(() => {
                isReady.value = true
            })
            ad.onError(() => {
                isReady.value = false
            })
            ad.onClose((res) => {
                isReady.value = false
                if (closeResolve) {
                    closeResolve(res && res.isEnded)
                    closeResolve = null
                }
            })
        } catch (e) {
            console.error('[ad] 创建失败', e)
        }
    }

    function showAd() {
        initAd()
        if (!ad) return Promise.resolve(false)

        return new Promise((resolve) => {
            closeResolve = resolve
            ad.show().catch(() => {
                ad.load()
                    .then(() => ad.show())
                    .catch(() => {
                        closeResolve = null
                        resolve(false)
                    })
            })
        })
    }

    return { showAd, isReady, initAd }
}
