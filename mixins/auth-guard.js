import { mapState, mapMutations } from 'vuex'

export default {
	computed: {
		...mapState('m_user', ['token'])
	},
	methods: {
		...mapMutations('m_user', ['updateRedirectInfo']),

		checkLogin(fromPath, message = '请先登录！') {
			if (this.token) return true
			uni.showToast({ title: message, icon: 'none', duration: 1500 })
			setTimeout(() => {
				this.navigateToLogin(fromPath)
			}, 1500)
			return false
		},

		navigateToLogin(fromPath) {
			uni.switchTab({
				url: '/pages/my/my',
				success: () => {
					this.updateRedirectInfo({
						openType: 'switchTab',
						from: fromPath
					})
				}
			})
		}
	}
}
