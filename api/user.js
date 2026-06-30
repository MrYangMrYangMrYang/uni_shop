/**
 * 用户 / 订单 / 地址相关 API
 */
import { api } from '@/utils/request.js';

// ============ 订单 ============

/**
 * 创建订单
 * @param {object} orderInfo
 */
export function createOrder(orderInfo) {
	return api.post('/api/public/v1/my/orders/create', orderInfo);
}

/**
 * 获取预支付参数
 * @param {string} orderNumber
 */
export function getPrepayParams(orderNumber) {
	return api.post('/api/public/v1/my/orders/req_unifiedorder', { order_number: orderNumber });
}

/**
 * 验证支付结果
 * @param {string} orderNumber
 */
export function checkOrderPay(orderNumber) {
	return api.post('/api/public/v1/my/orders/chkOrder', { order_number: orderNumber });
}

// ============ 地址 ============

/**
 * 获取地址列表（微信原生接口）
 */
export function getWxAddress() {
	return new Promise((resolve, reject) => {
		uni.chooseAddress({
			success: resolve,
			fail: reject
		});
	});
}
