/**
 * 全局错误状态 Vuex 模块
 *
 * 管理应用级错误状态，供 error-boundary mixin 和页面使用。
 * 不持久化 —— 错误状态应在每次页面加载时重置。
 */
export default {
	namespaced: true,

	state: () => ({
		/** 当前是否存在未恢复的错误 */
		hasError: false,
		/** 错误描述文案 */
		errorMessage: '',
		/** 是否为网络相关错误（用于选择不同的 fallback UI） */
		isNetworkError: false
	}),

	mutations: {
		/**
		 * 设置错误状态
		 * @param {object} state
		 * @param {object} payload
		 * @param {string} [payload.message] 错误描述
		 * @param {boolean} [payload.isNetwork] 是否为网络错误
		 */
		setError(state, { message = '数据加载失败，请稍后重试', isNetwork = false } = {}) {
			state.hasError = true;
			state.errorMessage = message;
			state.isNetworkError = isNetwork;
		},

		/** 清除错误状态 */
		clearError(state) {
			state.hasError = false;
			state.errorMessage = '';
			state.isNetworkError = false;
		}
	}
};
