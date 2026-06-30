/**
 * 统一网络请求封装层
 * 基于 @escook/request-miniprogram 补齐：401 拦截、超时提示、错误码映射
 *
 * 依赖关系：main.js 中调用 setupRequestInterceptors($http, store) 安装拦截器
 */

import env from '@/config/env.js';

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

/**
 * 处理请求失败：分类提示 + 401 拦截
 * 业务侧用法：
 *   try {
 *     const { data: res } = await uni.$http.get(url)
 *   } catch (err) {
 *     handleRequestError(err, store)  // store 参数可选
 *   }
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
		return false;
	}

	// 网络不通
	if (err && err.errMsg && err.errMsg.indexOf('fail') !== -1) {
		uni.showToast({ title: '网络连接失败，请检查网络', icon: 'none' });
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

	// 请求拦截：注入 token + 显示 loading
	$http.beforeRequest = function (options) {
		showLoading();

		// 权限接口约定：路径中包含 /my/ 的接口需携带身份认证 token
		if (options.url.indexOf('/my/') !== -1) {
			// 合并已有 header，而非覆盖
			const existingHeaders = options.header || {};
			options.header = {
				...existingHeaders,
				Authorization: store.state.m_user.token
			};
		}

		if (env.enableLog) {
			console.log('[request]', options.method || 'GET', options.url);
		}
	};

	// 响应拦截：统一错误处理 + loading 关闭
	$http.afterRequest = function (res) {
		hideLoading();

		// HTTP 状态码错误分流
		if (res && res.statusCode) {
			if (res.statusCode === 401) {
				handleUnauthorized(_store);
			} else if (res.statusCode >= 400) {
				const msg = ERROR_MESSAGES[res.statusCode] || '请求失败，请稍后重试';
				uni.showToast({ title: msg, icon: 'none' });
			}
		}
	};
}

// ============ 便捷 API 封装 ============
// 简化业务侧调用，统一 .catch 处理
const api = {
	get(url, data = {}) {
		return uni.$http.get(url, data).catch(err => {
			handleRequestError(err, _store);
			throw err;
		});
	},

	post(url, data = {}) {
		return uni.$http.post(url, data).catch(err => {
			handleRequestError(err, _store);
			throw err;
		});
	},

	put(url, data = {}) {
		return uni.$http.put(url, data).catch(err => {
			handleRequestError(err, _store);
			throw err;
		});
	},

	delete(url, data = {}) {
		return uni.$http.delete(url, data).catch(err => {
			handleRequestError(err, _store);
			throw err;
		});
	}
};

export { api };
