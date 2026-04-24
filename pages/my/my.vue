<template>
	<view class="my-page u-page u-page--page">
		<!-- 用户未登录时，显示登录组件；用户已登录时，显示用户信息组件 -->
		<my-login v-if="!token"></my-login>
		<my-userinfo v-else></my-userinfo>
	</view>
</template>

<script>
	// 导入自己封装的 mixin 模块
	import badgeMix from '@/mixins/tabbar-badge.js'
	import { mapState } from 'vuex'

	export default {
		mixins: [badgeMix],
		computed: {
			...mapState('m_user', ['token']),
		},
	}
</script>

<style lang="scss">
	.my-page {
		min-height: 100%;
	}
</style>
