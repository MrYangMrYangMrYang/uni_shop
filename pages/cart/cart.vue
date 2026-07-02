<!--
  购物车页面（TabBar 页面）
  职责：登录守卫 + 自定义导航栏 + TabBar 角标同步
  购物车列表的渲染/交互逻辑由 my-cart-content 共享组件承载
-->
<template>
	<view class="u-page u-page--page">
		<!-- 自定义导航栏（margin-right 居中策略） -->
		<view class="custom-nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<view class="back-box u-pressable" @click="goBack">
					<uni-icons type="arrowleft" size="18" :color="navIconColor"></uni-icons>
				</view>
				<text class="nav-title">Sunny优购</text>
			</view>
		</view>

		<!-- 导航栏佔位 -->
		<view :style="{ height: statusBarHeight + 44 + 'px' }"></view>

		<!-- 未登录：引导去登录 -->
		<view class="login-tip" v-if="!token">
			<image src="/static/cart_empty@2x.png" class="empty-img"></image>
			<text class="tip-text">您还未登录，登录后可查看购物车</text>
			<view class="go-login-btn u-pressable" @click="goLogin">去登录</view>
		</view>

		<!-- 已登录：复用共享购物车组件 -->
		<my-cart-content
			v-else
			primary-color="#C00000"
			swipe-delete-strategy="confirm"
			@after-delete="onAfterDelete"
			@navigate-to-login="goLogin"
		/>
	</view>
</template>

<script>
import badgeMix from '@/src/mixins/tabbar-badge.js';
import customNavbar from '@/src/mixins/custom-navbar.js';
import MyCartContent from '@/components/my-cart-content/my-cart-content.vue';
import { mapState } from 'vuex';

export default {
	components: { MyCartContent },
	mixins: [badgeMix, customNavbar],

	data() {
		return {
			navIconColor: '#FFFFFF' // $color-white
		};
	},

	computed: {
		...mapState('m_user', ['token'])
	},

	methods: {
		onAfterDelete() {
			// 删除后 TabBar 角标会自动通过 badgeMix 同步，此处预留扩展点
		},

		goLogin() {
			this.$store.commit('m_user/updateRedirectInfo', {
				openType: 'switchTab',
				from: '/pages/cart/cart'
			});
			uni.switchTab({
				url: '/pages/my/my'
			});
		}
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

		.back-box {
			padding: 0 8rpx;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: flex-start;

			&:active {
				opacity: 0.7;
			}
		}

		.nav-title {
			flex: 1;
			text-align: center;
			color: $color-white;
			font-size: $font-sm;
			font-weight: 300;
			margin-right: 50rpx;
		}
	}
}

/* ---- 未登录提示 ---- */
.login-tip {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: calc(100vh - 44px);

	.empty-img {
		width: 240rpx;
		height: 240rpx;
		opacity: 0.6;
	}

	.tip-text {
		margin-top: $space-4;
		font-size: $font-md;
		color: $color-text-300;
		font-weight: 500;
	}

	.go-login-btn {
		margin-top: $space-6;
		padding: $space-2 $space-6;
		background-color: $color-primary-600;
		color: $color-white;
		font-size: $font-sm;
		border-radius: $radius-pill;
		box-shadow: 0 8rpx 20rpx $color-primary-shadow;

		&:active {
			transform: scale(0.96);
			opacity: 0.9;
		}
	}
}
</style>
