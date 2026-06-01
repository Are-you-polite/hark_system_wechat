const https = require('https')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const mchId = '1712801729'
const APPID = process.env.APPID || ''
const productMap = { credit_10: '10 次对话包', credit_50: '50 次对话包', vip_month: '月卡会员' }

function httpPostJSON(host, urlPath, body, auth) {
    return new Promise((resolve, reject) => {
        const buf = Buffer.from(body)
        const req = https.request(
            {
                hostname: host,
                path: urlPath,
                method: 'POST',
                timeout: 15000,
                headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'Content-Length': buf.length, Authorization: auth, 'User-Agent': 'cloud-function/1.0' }
            },
            (res) => {
                let d = ''
                res.on('data', (c) => (d += c))
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode, body: JSON.parse(d) })
                    } catch {
                        resolve({ status: res.statusCode, body: d })
                    }
                })
            }
        )
        req.on('error', reject)
        req.write(buf)
        req.end()
    })
}

function createApiV3Auth(method, urlPath, body) {
    const pk = fs.readFileSync(path.join(__dirname, '..', 'cert', 'apiclient_key.pem'), 'utf8')
    const cert = new crypto.X509Certificate(fs.readFileSync(path.join(__dirname, '..', 'cert', 'apiclient_cert.pem')))
    const serial = cert.serialNumber.replace(/[^0-9A-Fa-f]/g, '').toUpperCase()
    const ts = Math.floor(Date.now() / 1000)
    const nonce = Math.random().toString(36).substring(2, 34)
    const sign = crypto
        .createSign('RSA-SHA256')
        .update(`${method}\n${urlPath}\n${ts}\n${nonce}\n${body || ''}\n`)
        .sign(pk, 'base64')
    return `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",nonce_str="${nonce}",timestamp="${ts}",serial_no="${serial}",signature="${sign}"`
}

async function prepay(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const openId = wxContext.OPENID
    if (!openId) return { code: 1, message: '获取用户身份失败' }

    const userRes = await db.collection('shared_users').where({ openId }).get()
    if (userRes.data.length === 0) return { code: 1, message: '用户不存在' }
    const userId = userRes.data[0]._id

    const { product, amount, price } = event
    if (!product || !price) return { code: 1, message: '参数不完整' }
    if (!APPID) return { code: 1, message: '未配置 APPID' }

    // 创建订单记录
    const orderData = { userId, openId, product, amount: Number(amount) || 0, price: Number(price), status: 'pending', createdAt: db.serverDate() }
    const orderRes = await db.collection('shared_payment_records').add({ data: orderData })
    const orderId = orderRes._id

    // 调微信支付统一下单
    const totalFee = Math.round(parseFloat(price) * 100)
    const body = JSON.stringify({
        appid: APPID,
        mchid: mchId,
        description: `向内倾听 - ${productMap[product] || product}`,
        out_trade_no: orderId,
        notify_url: 'https://www.weixin.qq.com/',
        amount: { total: totalFee, currency: 'CNY' },
        payer: { openid: openId }
    })

    const auth = createApiV3Auth('POST', '/v3/pay/transactions/jsapi', body)
    const payRes = await httpPostJSON('api.mch.weixin.qq.com', '/v3/pay/transactions/jsapi', body, auth)

    if (payRes.status !== 200 || !payRes.body.prepay_id) {
        return { code: 1, message: (payRes.body && payRes.body.message) || '统一下单失败' }
    }

    // 生成 JSAPI 支付签名
    const ts = Math.floor(Date.now() / 1000).toString()
    const ns = Math.random().toString(36).substring(2, 34)
    const pk = fs.readFileSync(path.join(__dirname, '..', 'cert', 'apiclient_key.pem'), 'utf8')
    const ps = crypto.createSign('RSA-SHA256').update(`${APPID}\n${ts}\n${ns}\nprepay_id=${payRes.body.prepay_id}\n`).sign(pk, 'base64')

    return {
        code: 0,
        data: {
            orderId,
            payment: { timeStamp: ts, nonceStr: ns, package: 'prepay_id=' + payRes.body.prepay_id, signType: 'RSA', paySign: ps }
        }
    }
}

async function confirm(event, { db }) {
    const { orderId } = event
    if (!orderId) return { code: 1, message: '缺少订单号' }

    const res = await db.collection('shared_payment_records').doc(orderId).get()
    if (!res.data) return { code: 1, message: '订单不存在' }
    const order = res.data

    if (order.status === 'completed') {
        return { code: 0, data: { product: order.product, amount: order.amount, productName: productMap[order.product] || order.product } }
    }

    await db
        .collection('shared_payment_records')
        .doc(orderId)
        .update({ data: { status: 'completed', paidAt: db.serverDate() } })

    if (order.product === 'vip_month') {
        const vipExpireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        await db
            .collection('shared_users')
            .doc(order.userId)
            .update({ data: { isVip: true, vipExpireAt, updatedAt: db.serverDate() } })
        return { code: 0, data: { product: 'vip_month', creditBalance: 0, vipExpireAt, productName: '月卡会员' } }
    }

    await db
        .collection('shared_users')
        .doc(order.userId)
        .update({ data: { creditBalance: db.command.inc(order.amount || 0), updatedAt: db.serverDate() } })

    return { code: 0, data: { product: order.product, productName: productMap[order.product] || order.product, amount: order.amount || 0, creditBalance: order.amount || 0 } }
}

async function listOrders(event, { db, cloud }) {
    const wxContext = cloud.getWXContext()
    const userRes = await db.collection('shared_users').where({ openId: wxContext.OPENID }).get()
    if (userRes.data.length === 0) return { code: 1, message: '用户不存在' }

    const res = await db.collection('shared_payment_records').where({ userId: userRes.data[0]._id }).orderBy('createdAt', 'desc').limit(50).get()
    return { code: 0, data: { orders: res.data || [] } }
}

async function listProducts(event, { db }) {
    try {
        const res = await db.collection('shared_products').where({ status: 'active' }).orderBy('sort', 'asc').get()
        return { code: 0, data: { list: res.data || [] } }
    } catch {
        return { code: 0, data: { list: [] } }
    }
}

module.exports = { prepay, confirm, listOrders, listProducts }
