<script>
/* global Vue */
/**
 * App 根组件
 * 负责应用级别的生命周期监控、全局错误捕获和全局样式导入
 */
export default {
	onLaunch: function () {
		// 全局 Vue 渲染错误捕获（仅日志，不弹 toast 打断用户）
		if (typeof Vue !== 'undefined') {
			Vue.config.errorHandler = (err, _vm, info) => {
				console.error('[Vue error]', info, err);
			};
		}
	},

	onShow: function () {},

	onHide: function () {},

	// 小程序脚本错误（仅日志记录，避免每个小错误都弹窗）
	onError(err) {
		console.error('[App onError]', err);
	},

	// Promise 未捕获异常（仅日志记录）
	onUnhandledRejection({ promise: _promise, reason }) {
		console.error('[App onUnhandledRejection]', reason);
	},

	// 页面不存在
	onPageNotFound(res) {
		console.warn('[App onPageNotFound]', res);
		uni.switchTab({ url: '/pages/home/home' });
	}
};
</script>

<style lang="scss">
@import '@/uni.scss';
</style>
