<script>
/* global Vue */
/**
 * App 根组件
 * 负责应用级别的生命周期监控、全局错误捕获和全局样式导入
 */
import { perfStart, perfEnd } from '@/utils/perf.js';
import env from '@/config/env.js';

export default {
	onLaunch: function () {
		perfStart('app_launch');

		// 全局 Vue 渲染错误捕获：区分严重程度，严重错误提交到 store 让页面感知
		if (typeof Vue !== 'undefined') {
			Vue.config.errorHandler = (err, _vm, info) => {
				if (env.enableLog) {
					console.error('[Vue error]', info, err);
				}
				// 渲染错误不一定是致命的 —— 仅当有 store 实例时提交到全局错误状态
				if (_vm && _vm.$store) {
					_vm.$store.commit('m_error/setError', {
						message: '页面渲染异常，请尝试刷新',
						isNetwork: false
					});
				}
			};
		}
	},

	onShow: function () {
		// 首次 onShow 结束启动计时
		if (!this._firstShowDone) {
			this._firstShowDone = true;
			perfEnd('app_launch');
		}
	},

	onHide: function () {},

	// 小程序脚本错误：区分网络/超时类错误
	onError(err) {
		if (env.enableLog) {
			console.error('[App onError]', err);
		}
		const errStr = String(err || '');
		const isNetwork = errStr.indexOf('timeout') !== -1 || errStr.indexOf('fail') !== -1;
		// 通过 getApp() 获取 store（小程序环境中 this 可能不可用）
		const app = getApp();
		if (app && app.$store) {
			app.$store.commit('m_error/setError', {
				message: isNetwork ? '网络连接失败，请检查网络' : '应用发生异常，请尝试重启',
				isNetwork
			});
		}
	},

	// Promise 未捕获异常
	onUnhandledRejection({ promise: _promise, reason }) {
		if (env.enableLog) {
			console.error('[App onUnhandledRejection]', reason);
		}
		const app = getApp();
		if (app && app.$store) {
			app.$store.commit('m_error/setError', {
				message: '数据加载异常，请稍后重试',
				isNetwork: false
			});
		}
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
