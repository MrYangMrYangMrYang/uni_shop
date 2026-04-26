<script>
	/**
	 * App 根组件
	 * 负责应用级别的生命周期监控和全局样式导入
	 */
	export default {
		/**
		 * 当整个应用初始化完成时触发（全局只触发一次）
		 */
		onLaunch: function() {
			// console.log('App Launch')
		},
		/**
		 * 当应用启动，或从后台进入前台显示时触发
		 */
		onShow: function() {
			// console.log('App Show')
		},
		/**
		 * 当应用从前台进入后台隐藏时触发
		 */
		onHide: function() {
			// console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	@import '@/uni.scss';
</style>
