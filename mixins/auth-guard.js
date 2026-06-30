/**
 * 登录守卫 Mixin
 * 提供 checkLogin 方法，未登录时引导用户跳转到登录页
 *
 * 注意：与 tabbar-badge.js 都映射了 token 计算属性，
 * 不要同时混入同一个组件，否则会冲突。
 */
import { mapState, mapMutations } from 'vuex';

export default {
	computed: {
		...mapState('m_user', ['token'])
	},
	methods: {
		...mapMutations('m_user', ['updateRedirectInfo']),

		checkLogin(fromPath, message = '请先登录！') {
			if (this.token) return true;
			uni.showToast({ title: message, icon: 'none', duration: 1500 });

			// 清理旧定时器，防止内存泄漏
			if (this.__loginTimer) clearTimeout(this.__loginTimer);
			this.__loginTimer = setTimeout(() => {
				this.navigateToLogin(fromPath);
			}, 1500);
			return false;
		},

		navigateToLogin(fromPath) {
			uni.switchTab({
				url: '/pages/my/my',
				success: () => {
					this.updateRedirectInfo({
						openType: 'switchTab',
						from: fromPath
					});
				}
			});
		}
	},

	// 页面卸载时清理定时器
	onUnload() {
		if (this.__loginTimer) {
			clearTimeout(this.__loginTimer);
			this.__loginTimer = null;
		}
	}
};
