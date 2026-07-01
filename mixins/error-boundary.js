/**
 * 错误边界 Mixin
 *
 * 为页面提供结构化的错误恢复能力：
 * - withErrorBoundary(fetchFn)：包装异步请求，失败时自动提交 m_error/setError
 * - retry()：清除错误并重新执行上次失败的请求
 * - pageError / isPageNetworkError：模板中可直接用于条件渲染 fallback UI
 *
 * 用法：
 *   mixins: [errorBoundary],
 *   methods: {
 *     async loadData() {
 *       await this.withErrorBoundary(() => this.fetchFromApi(), { name: 'loadData' });
 *     }
 *   }
 */

import { mapState, mapMutations } from 'vuex';

export default {
	data() {
		return {
			/** 上次失败的异步函数引用，供 retry() 使用 */
			__retryFn: null
		};
	},

	computed: {
		...mapState('m_error', ['hasError', 'errorMessage', 'isNetworkError']),

		/** 当前页面是否处于错误状态 */
		pageError() {
			return this.hasError;
		},

		/** 当前错误是否为网络错误 */
		isPageNetworkError() {
			return this.isNetworkError;
		}
	},

	methods: {
		...mapMutations('m_error', ['setError', 'clearError']),

		/**
		 * 包装异步数据请求，失败时自动设置错误状态
		 *
		 * @param {Function} fetchFn  要包装的异步函数
		 * @param {object} [options]
		 * @param {string} [options.name]        计时名称（用于调试）
		 * @param {string} [options.errorMessage] 自定义错误文案
		 * @returns {Promise<any>} fetchFn 的返回值，失败时返回 undefined
		 */
		async withErrorBoundary(fetchFn, options = {}) {
			const { errorMessage = '数据加载失败，请稍后重试' } = options;

			// 保存引用以便 retry
			this.__retryFn = fetchFn;

			// 先清除旧错误
			this.clearError();

			try {
				const result = await fetchFn();
				return result;
			} catch (err) {
				const isNetwork =
					err && err.errMsg && (err.errMsg.indexOf('timeout') !== -1 || err.errMsg.indexOf('fail') !== -1);

				this.setError({
					message: isNetwork ? '网络连接失败，请检查网络' : errorMessage,
					isNetwork
				});
				return undefined;
			}
		},

		/**
		 * 重试上次失败的请求
		 * 若当前无错误状态或没有可重试的函数，则不做任何操作
		 */
		async retry() {
			if (!this.hasError || !this.__retryFn) return;
			await this.withErrorBoundary(this.__retryFn);
		}
	},

	// 下拉刷新时自动重试（适用于配置了 enablePullDownRefresh 的页面）
	onPullDownRefresh() {
		if (this.hasError && this.__retryFn) {
			this.retry();
		}
	}
};
