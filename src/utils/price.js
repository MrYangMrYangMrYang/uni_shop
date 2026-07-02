/**
 * 价格工具模块
 *
 * 核心约定：项目中所有金额统一以「分」（整数）存储，消除浮点精度问题。
 * API 边界自动完成 元 ↔ 分 转换（参见 utils/request.js 中的拦截器）。
 *
 * 显示层使用全局 filter: {{ price | formatPrice }} → ￥XX.XX
 */

/** 元 ↔ 分 换算比例 */
export const FEN_RATIO = 100;

/** API 响应 / 请求体中需要自动转换的价格字段名 */
export const PRICE_KEYS = ['goods_price', 'order_price', 'total_price'];

// ============ 基础转换 ============

/**
 * 元（浮点数 / 字符串）→ 分（整数）
 * Math.round 避免 0.1 * 100 ≈ 10.000000000000002 的问题
 *
 * @param {number|string} yuan
 * @returns {number} 整数分
 */
export function yuanToFen(yuan) {
	return Math.round(Number(yuan) * FEN_RATIO);
}

/**
 * 分（整数）→ 元（浮点数）
 *
 * @param {number} fen
 * @returns {number}
 */
export function fenToYuan(fen) {
	return Number(fen) / FEN_RATIO;
}

// ============ 显示格式化 ============

/**
 * 分（整数）→ 显示字符串 "￥XX.XX"
 * 用于 Vue filter：{{ price | formatPrice }}
 *
 * @param {number|string} fen
 * @returns {string}
 */
export function formatPrice(fen) {
	const num = Number(fen);
	if (Number.isNaN(num)) return '￥0.00';
	return '￥' + (num / FEN_RATIO).toFixed(2);
}

// ============ 计算辅助 ============

/**
 * 数量 × 单价（分）→ 总价（分）— 纯整数运算，永不丢失精度
 *
 * @param {number} count  商品数量
 * @param {number} priceFen  单价（分）
 * @returns {number} 整数分
 */
export function multiplyPrice(count, priceFen) {
	return Math.round(count) * Math.round(priceFen);
}

// ============ 数据迁移 ============

const MIGRATION_KEY = '__price_migration_v1__';

/**
 * 检测一个值是否为旧 float-元 格式（启发式：非整数数字很可能是旧的元）
 * @param {*} value
 * @returns {boolean}
 */
function looksLikeYuan(value) {
	return typeof value === 'number' && !Number.isInteger(value) && value > 0;
}

/**
 * 递归遍历对象/数组，将所有匹配的价格字段从元转为分
 * @param {*} data
 * @returns {*} 转换后的数据
 */
function deepConvertPrices(data) {
	if (data === null || data === undefined) return data;

	if (Array.isArray(data)) {
		return data.map(item => deepConvertPrices(item));
	}

	if (typeof data === 'object') {
		const result = {};
		for (const key of Object.keys(data)) {
			const val = data[key];
			if (PRICE_KEYS.includes(key) && typeof val === 'number') {
				// 如果值很小（< 100 且不是整数）则有可能是元 —— 但 API 价格通常在 0.01-99999 范围
				// 更安全的方式：检测值是否为旧格式（非整数 或 看起来像是元的小数）
				if (looksLikeYuan(val) || (val < 100 && val > 0)) {
					// 启发式：如果值 < 100 且为小数，极大概率是元
					result[key] = looksLikeYuan(val) ? yuanToFen(val) : val;
				} else {
					result[key] = val;
				}
			} else {
				result[key] = deepConvertPrices(val);
			}
		}
		return result;
	}

	return data;
}

/**
 * 启动时迁移：将本地存储中的旧 float-元 格式数据转换为 分
 * 使用哨兵 key 防止重复迁移
 *
 * @returns {boolean} 是否执行了迁移
 */
export function migrateStoredPrices() {
	if (uni.getStorageSync(MIGRATION_KEY) === '1') return false;

	const KEYS_TO_CHECK = ['cart', 'orderList'];
	let didMigrate = false;

	KEYS_TO_CHECK.forEach(key => {
		const raw = uni.getStorageSync(key);
		if (!raw) return;
		try {
			const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
			if (Array.isArray(data) && data.length > 0) {
				const migrated = deepConvertPrices(data);
				uni.setStorageSync(key, JSON.stringify(migrated));
				didMigrate = true;
			}
		} catch (e) {
			// 损坏数据，跳过
		}
	});

	// 标记迁移完成
	uni.setStorageSync(MIGRATION_KEY, '1');
	return didMigrate;
}
