import { useUserStore } from '@/stores/user'
import { paymentApi } from '@/api/payment'

export function useCredits() {
    const store = useUserStore()

    const plans = ref([])
    const selected = ref(-1)
    const paying = ref(false)
    const showSuccess = ref(false)
    const successMsg = ref('')
    const loading = ref(true)

    async function loadProducts() {
        loading.value = true
        try {
            const res = await paymentApi.getProducts()
            if (res.code === 0) {
                plans.value = (res.data.list || []).map((p) => ({
                    name: p.name,
                    price: p.price,
                    product: p.product,
                    amount: Number(p.amount),
                    desc: p.desc,
                    features: p.features || [],
                    popular: p.popular
                }))
            }
        } catch {
            plans.value = []
        } finally {
            loading.value = false
        }
    }

    async function handlePay() {
        if (paying.value) return
        paying.value = true
        const plan = plans.value[selected.value]
        if (!plan) {
            paying.value = false
            return
        }

        try {
            const payRes = await paymentApi.prepay(plan.product, plan.amount, plan.price)
            if (payRes.code !== 0) throw new Error(payRes.message || '下单失败')

            const pay = payRes.data.payment
            await new Promise((resolve, reject) => {
                wx.requestPayment({
                    timeStamp: pay.timeStamp,
                    nonceStr: pay.nonceStr,
                    package: pay.package,
                    signType: pay.signType || 'MD5',
                    paySign: pay.paySign,
                    success: resolve,
                    fail: (e) => reject(new Error(e.errMsg || '支付取消'))
                })
            })

            const confirmRes = await paymentApi.confirm(payRes.data.orderId)
            if (confirmRes.code !== 0) throw new Error(confirmRes.message || '入账失败')

            const cd = confirmRes.data
            if (cd.product === 'vip_month') {
                store.isVip = true
                store.vipExpireAt = cd.vipExpireAt
            } else {
                store.creditBalance = cd.creditBalance
            }
            successMsg.value = cd.product === 'vip_month' ? '月卡已生效，30 天内无限次 AI 对话' : `已购买「${cd.productName}」，${cd.amount} 次对话已到账`
            showSuccess.value = true
        } catch (e) {
            uni.showToast({ title: e.message || '支付失败', icon: 'none' })
        } finally {
            paying.value = false
        }
    }

    return { plans, selected, paying, showSuccess, successMsg, loading, loadProducts, handlePay }
}
