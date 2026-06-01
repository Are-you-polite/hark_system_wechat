import { request } from '@/utils/request'

export const paymentApi = {
    prepay(product, amount, price) {
        return request('payment.prepay', { product, amount, price })
    },

    confirm(orderId) {
        return request('payment.confirm', { orderId })
    },

    getList() {
        return request('payment.list')
    },

    getProducts() {
        return request('products.list')
    }
}
