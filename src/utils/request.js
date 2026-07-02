/**
 * 统一网络请求封装层
 * 基于 @escook/request-miniprogram 补齐：401 拦截、超时提示、错误码映射、
 * 价格字段 元↔分 自动转换、请求性能计时
 *
 * 依赖关系：main.js 中调用 setupRequestInterceptors($http, store) 安装拦截器
 */

import env from '@/src/config/env.js';
import { yuanToFen, fenToYuan, PRICE_KEYS } from '@/src/utils/price.js';
import { perfStart, perfEnd } from '@/src/utils/perf.js';

// ============ 错误码 → 用户文案映射表 ============
const ERROR_MESSAGES = {
	400: '请求参数有误',
	401: '登录已过期，请重新登录',
	403: '没有访问权限',
	404: '请求的资源不存在',
	500: '服务器开小差了，请稍后重试',
	502: '服务器维护中，请稍后重试',
	503: '服务暂不可用',
	504: '网关超时，请稍后重试'
};

// ============ 全局 loading 引用计数（避免并发请求闪烁） ============
let loadingCount = 0;

function showLoading() {
	loadingCount++;
	if (loadingCount === 1) {
		uni.showLoading({ title: '加载中...', mask: true });
	}
}

function hideLoading() {
	if (loadingCount > 0) loadingCount--;
	if (loadingCount === 0) {
		uni.hideLoading();
	}
}

// ============ Token 失效处理（防抖，避免短时间内多次跳登录） ============
let isRedirectingToLogin = false;
let redirectTimer = null;

function handleUnauthorized(store) {
	if (isRedirectingToLogin) return;
	isRedirectingToLogin = true;

	// 清除本地 token
	if (store) {
		store.commit('m_user/updateToken', '');
	}

	uni.showModal({
		title: '提示',
		content: '登录已过期，请重新登录',
		showCancel: false,
		success: () => {
			// 5 秒后复位防抖标志，防止 switchTab 失败导致永真
			redirectTimer = setTimeout(() => {
				isRedirectingToLogin = false;
			}, 5000);
			uni.switchTab({
				url: '/pages/my/my',
				complete: () => {
					isRedirectingToLogin = false;
					if (redirectTimer) clearTimeout(redirectTimer);
				}
			});
		}
	});
}

// ============ 价格字段递归转换（响应：元→分；请求：分→元） ============

/**
 * 递归遍历对象/数组，对匹配的价格字段应用 convert 函数
 * @param {*} data
 * @param {(val: number) => number} convert 转换函数
 * @returns {*} 转换后的数据
 */
export function walkAndConvert(data, convert) {
	if (data === null || data === undefined) return data;

	if (Array.isArray(data)) {
		return data.map(item => walkAndConvert(item, convert));
	}

	if (typeof data === 'object' && data.constructor === Object) {
		const result = {};
		for (const key of Object.keys(data)) {
			const val = data[key];
			if (PRICE_KEYS.includes(key) && (typeof val === 'number' || typeof val === 'string')) {
				result[key] = convert(Number(val));
			} else {
				result[key] = walkAndConvert(val, convert);
			}
		}
		return result;
	}

	return data;
}

// ============ 请求错误处理（唯一的 toast 出口） ============

/**
 * 处理请求失败：分类提示 + 401 拦截
 *
 * @param {object} err 请求错误对象
 * @param {object} store Vuex store 实例（可选，用于 401 拦截）
 * @returns {boolean} 是否已处理
 */
export function handleRequestError(err, store) {
	hideLoading();

	if (env.enableLog) {
		console.error('[request error]', err);
	}

	// 超时单独提示
	if (err && err.errMsg && err.errMsg.indexOf('timeout') !== -1) {
		uni.showToast({ title: '网络不稳定，请稍后重试', icon: 'none' });
		// 提交网络错误状态到 store
		if (store) {
			store.commit('m_error/setError', { message: '网络不稳定，请稍后重试', isNetwork: true });
		}
		return false;
	}

	// 网络不通
	if (err && err.errMsg && err.errMsg.indexOf('fail') !== -1) {
		uni.showToast({ title: '网络连接失败，请检查网络', icon: 'none' });
		if (store) {
			store.commit('m_error/setError', { message: '网络连接失败，请检查网络', isNetwork: true });
		}
		return false;
	}

	// HTTP 状态码分流
	const statusCode = err && err.statusCode;
	if (statusCode === 401) {
		handleUnauthorized(store);
		return false;
	}

	const msg = ERROR_MESSAGES[statusCode] || '请求失败，请稍后重试';
	uni.showToast({ title: msg, icon: 'none' });
	return false;
}

// ============ 安装 @escook/request-miniprogram 拦截器 ============
// 记下 store 引用，供 handleRequestError 使用
let _store = null;

/** 当前正在计时的请求 URL，用于关联 beforeRequest ↔ afterRequest */
let _timingUrl = null;

/**
 * 安装请求/响应拦截器
 * 在 main.js 中调用一次即可
 *
 * @param {object} $http @escook/request-miniprogram 实例
 * @param {object} store Vuex store 实例
 */
export function setupRequestInterceptors($http, store) {
	_store = store;

	// 设置超时
	if (env.requestTimeout) {
		$http.timeout = env.requestTimeout;
	}

	// 请求拦截：注入 token + 显示 loading + 分→元转换 + 计时
	$http.beforeRequest = function (options) {
		showLoading();

		// 请求计时
		const shortUrl = (options.url || '').replace(/\?.*$/, '');
		_timingUrl = shortUrl;
		perfStart('req:' + shortUrl);

		// 权限接口约定：路径中包含 /my/ 的接口需携带身份认证 token
		if (options.url.indexOf('/my/') !== -1) {
			const existingHeaders = options.header || {};
			options.header = {
				...existingHeaders,
				Authorization: store.state.m_user.token
			};
		}

		// 请求体价格字段：分 → 元（发送给后端的是元）
		if (options.data) {
			options.data = walkAndConvert(options.data, fenToYuan);
		}

		if (env.enableLog) {
			console.log('[request]', options.method || 'GET', options.url);
		}
	};

	// 响应拦截：价格元→分转换 + 错误分流 + loading 关闭 + 计时结束
	$http.afterRequest = function (res) {
		hideLoading();

		// 结束计时
		if (_timingUrl) {
			perfEnd('req:' + _timingUrl);
			_timingUrl = null;
		}

		// 响应体价格字段：元 → 分（内部存储使用分）
		if (res && res.data) {
			res.data = walkAndConvert(res.data, yuanToFen);
		}

		// HTTP 状态码错误分流 —— 此处不弹 toast，仅处理 401 跳转
		// toast 统一由 handleRequestError 负责，避免双重提示
		if (res && res.statusCode) {
			if (res.statusCode === 401) {
				handleUnauthorized(_store);
			}
			// 成功时清除网络错误状态（如果有的话）
			if (res.statusCode >= 200 && res.statusCode < 300 && _store) {
				_store.commit('m_error/clearError');
			}
		}
	};
}

// ============ 便捷 API 封装 ============
// 简化业务侧调用，统一 .catch 处理
// 注意：catch 中调用 handleRequestError 后不 re-throw，避免
// 1) 双重 toast（afterRequest + handleRequestError 都弹 toast）
// 2) 未捕获的 rejection 触发 onUnhandledRejection
const api = {
	get(url, data = {}) {
		return uni.$http.get(url, data).catch(err => {
			handleRequestError(err, _store);
			// 返回 resolved promise 而非 rejected，避免调用方未 catch 导致 unhandled rejection
			// 返回带 meta 的响应对象，避免调用方解构后 null.meta 抛 TypeError
			return Promise.resolve({ data: { meta: { status: 0 } } });
		});
	},

	post(url, data = {}) {
		return uni.$http.post(url, data).catch(err => {
			handleRequestError(err, _store);
			// 返回带 meta 的响应对象，避免调用方解构后 null.meta 抛 TypeError
			return Promise.resolve({ data: { meta: { status: 0 } } });
		});
	},

	put(url, data = {}) {
		return uni.$http.put(url, data).catch(err => {
			handleRequestError(err, _store);
			// 返回带 meta 的响应对象，避免调用方解构后 null.meta 抛 TypeError
			return Promise.resolve({ data: { meta: { status: 0 } } });
		});
	},

	delete(url, data = {}) {
		return uni.$http.delete(url, data).catch(err => {
			handleRequestError(err, _store);
			// 返回带 meta 的响应对象，避免调用方解构后 null.meta 抛 TypeError
			return Promise.resolve({ data: { meta: { status: 0 } } });
		});
	}
};

export { api };
