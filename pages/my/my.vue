/** * 个人中心页面 * 职责： * 1. 充当用户入口容器 * 2. 根据 Vuex 中的 token 状态，动态切换展示登录页 (my-login)
或个人信息页 (my-userinfo) * 3. 继承 TabBar 徽标更新逻辑 */
<template>
	<view class="my-page u-page u-page--page">
		<!-- 未登录：展示登录引导组件 -->
		<my-login v-if="!token"></my-login>

		<!-- 已登录：展示用户信息及订单列表组件 -->
		<my-userinfo v-else></my-userinfo>
	</view>
</template>

<script>
import badgeMix from '@/src/mixins/tabbar-badge.js';
import { mapState } from 'vuex';

export default {
	mixins: [badgeMix],

	data() {
		return {};
	},

	computed: {
		...mapState('m_user', ['token'])
	}
};
</script>

<style lang="scss">
/* 个人中心页面容器样式 */
.my-page {
	/* 确保页面至少占满全屏，方便背景色平铺 */
	min-height: 100vh;
	background-color: $color-bg-base;
}
</style>
