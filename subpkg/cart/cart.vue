<!--
  购物车详情页（分包页面）
  职责：自定义导航栏（placeholder 居中策略）
  购物车列表的渲染/交互逻辑由 my-cart-content 共享组件承载
-->
<template>
	<view class="u-page u-page--page">
		<!-- 自定义导航栏（placeholder 居中策略） -->
		<view class="custom-nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<view class="back-box" @click="goBack">
					<uni-icons type="arrowleft" size="18" :color="navIconColor"></uni-icons>
				</view>
				<text class="nav-title">Sunny优购</text>
				<view class="placeholder"></view>
			</view>
		</view>

		<!-- 导航栏佔位 -->
		<view :style="{ height: statusBarHeight + 44 + 'px' }"></view>

		<!-- 复用共享购物车组件：直接删除，无登录守卫 -->
		<my-cart-content primary-color="#C00000" swipe-delete-strategy="direct" />
	</view>
</template>

<script>
import MyCartContent from '@/components/my-cart-content/my-cart-content.vue';
import customNavbar from '@/src/mixins/custom-navbar.js';

export default {
	components: { MyCartContent },
	mixins: [customNavbar],

	data() {
		return {
			navIconColor: '#FFFFFF' // $color-white
		};
	}
};
</script>

<style lang="scss">
/* ---- 自定义导航栏 ---- */
.custom-nav-bar {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	background-color: $color-primary;
	z-index: $z-sticky;

	.nav-content {
		height: 44px;
		display: flex;
		align-items: center;
		padding: 0 $space-2;

		.back-box {
			width: 100rpx;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.nav-title {
			flex: 1;
			text-align: center;
			color: $color-white;
			font-size: $font-sm;
			font-weight: 300;
		}

		.placeholder {
			width: 100rpx;
		}
	}
}
</style>
