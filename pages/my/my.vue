/**
 * 个人中心页面
 * 职责：
 * 1. 充当用户入口容器
 * 2. 根据 Vuex 中的 token 状态，动态切换展示登录页 (my-login) 或个人信息页 (my-userinfo)
 * 3. 继承 TabBar 徽标更新逻辑
 */
<template>
	<view class="my-page u-page u-page--page">
		<!-- 登录状态条件渲染 -->
		<!-- 未登录：展示登录引导组件 -->
		<my-login v-if="!token"></my-login>
		
		<!-- 已登录：展示用户信息及订单列表组件 -->
		<my-userinfo v-else></my-userinfo>
	</view>
</template>

<script>
	// 导入购物车徽标混入逻辑，确保个人中心也能同步显示购物车数量
	import badgeMix from '@/mixins/tabbar-badge.js'
	// 导入 Vuex 映射工具
	import { mapState } from 'vuex'

	export default {
		// 混入设置购物车徽标逻辑
		mixins: [badgeMix],
		
		data() {
			return {}
		},
		
		computed: {
			// 将 m_user 模块中的 token 映射为计算属性
			// token 存在代表已登录，不存在代表未登录
			...mapState('m_user', ['token']),
		},
	}
</script>

<style lang="scss">
	/* 个人中心页面容器样式 */
	.my-page {
		/* 确保页面至少占满全屏，方便背景色平铺 */
		min-height: 100vh;
		background-color: $color-bg-base;
	}
</style>
