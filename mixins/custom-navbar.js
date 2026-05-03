export default {
	data() {
		return {
			statusBarHeight: uni.getSystemInfoSync().statusBarHeight || 0,
			navBarHeight: 44
		}
	},
	computed: {
		navBarTotalHeight() {
			return this.statusBarHeight + this.navBarHeight
		}
	},
	methods: {
		goBack() {
			uni.navigateBack({
				fail: () => {
					uni.switchTab({ url: '/pages/home/home' })
				}
			})
		}
	}
}
