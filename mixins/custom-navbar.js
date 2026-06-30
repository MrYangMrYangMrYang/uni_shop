/**
 * 自定义导航栏 Mixin
 * 提供状态栏高度、导航栏高度计算，以及 goBack 通用返回方法
 */
export default {
	data() {
		return {
			statusBarHeight: uni.getSystemInfoSync().statusBarHeight || 0,
			navBarHeight: 44
		};
	},
	computed: {
		navBarTotalHeight() {
			return this.statusBarHeight + this.navBarHeight;
		}
	},
	methods: {
		goBack() {
			uni.navigateBack({
				fail: () => {
					uni.switchTab({ url: '/pages/home/home' });
				}
			});
		}
	}
};
