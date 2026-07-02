<!--
  个人中心用户信息组件
  展示用户头像、昵称、统计面板、订单状态及常用功能列表

  子组件：my-order-panel — 订单状态面板（含动态角标）
-->
<template>
	<view class="my-userinfo-container">
		<!-- 顶部头像和昵称区域 -->
		<view class="top-box">
			<image :src="userinfo.avatarUrl" class="avatar"></image>
			<view class="nickname">{{ userinfo.nickName }}</view>
		</view>

		<!-- 面板列表区域 -->
		<view class="panel-list">
			<!-- 第1个面板：资产/足迹统计 -->
			<view class="panel u-card--shadow">
				<view class="panel-body">
					<view class="panel-item u-pressable">
						<text class="num">{{ userStats.favShops }}</text>
						<text class="txt">收藏店铺</text>
					</view>
					<view class="panel-item u-pressable">
						<text class="num">{{ userStats.favGoods }}</text>
						<text class="txt">收藏商品</text>
					</view>
					<view class="panel-item u-pressable">
						<text class="num">{{ userStats.watchedGoods }}</text>
						<text class="txt">关注商品</text>
					</view>
					<view class="panel-item u-pressable">
						<text class="num">{{ userStats.history }}</text>
						<text class="txt">足迹</text>
					</view>
				</view>
			</view>

			<!-- 第2个面板：订单状态（my-order-panel 组件） -->
			<my-order-panel :primary-color="primaryColor" />

			<!-- 第3个面板：功能列表 -->
			<view class="panel u-card--shadow">
				<view class="panel-list-item u-pressable" @click="gotoAddressList">
					<view class="item-left">
						<uni-icons type="location-filled" size="18" :color="primaryColor"></uni-icons>
						<text>收货地址</text>
					</view>
					<uni-icons type="arrowright" size="14" :color="mutedColor"></uni-icons>
				</view>
				<view class="panel-list-item u-pressable" @click="contactService">
					<view class="item-left">
						<uni-icons type="headphones" size="18" :color="primaryColor"></uni-icons>
						<text>联系客服</text>
					</view>
					<uni-icons type="arrowright" size="14" :color="mutedColor"></uni-icons>
				</view>
				<view class="panel-list-item u-pressable" @click="logout">
					<view class="item-left">
						<uni-icons type="clear" size="18" :color="primaryColor"></uni-icons>
						<text>退出登录</text>
					</view>
					<uni-icons type="arrowright" size="14" :color="mutedColor"></uni-icons>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { DEMO_USER_STATS } from '@/src/config/mock.js';
import MyOrderPanel from '@/components/my-order-panel/my-order-panel.vue';

export default {
	name: 'my-userinfo',
	components: { MyOrderPanel },

	data() {
		return {
			primaryColor: '#C00000', // $color-primary
			mutedColor: '#909399' // $color-text-300
		};
	},

	computed: {
		...mapState('m_user', ['userinfo', 'orderList']),
		// 演示统计数据，详见 config/mock.js
		userStats() {
			return DEMO_USER_STATS;
		}
	},

	methods: {
		...mapMutations('m_user', ['updateAddress', 'updateUserInfo', 'updateToken']),

		// 退出登录：购物车数据保留在本地存储中，重新登录后可继续使用
		logout() {
			uni.showModal({
				title: '退出登录',
				content: '确定要退出当前账号吗？',
				confirmText: '确认退出',
				confirmColor: this.primaryColor,
				cancelText: '再想想',
				cancelColor: '#999999', // $color-text-300
				success: async res => {
					if (!res.confirm) return;

					uni.showLoading({
						title: '正在退出...',
						mask: true
					});

					this.updateAddress({});
					this.updateUserInfo({});
					this.updateToken('');

					uni.hideLoading();

					uni.showToast({
						title: '已安全退出',
						icon: 'success',
						duration: 1500,
						mask: true
					});
				}
			});
		},

		contactService() {
			uni.navigateTo({
				url: '/subpkg/contact/contact'
			});
		},

		gotoAddressList() {
			uni.navigateTo({
				url: '/subpkg/address-list/address-list'
			});
		}
	}
};
</script>

<style lang="scss">
page,
.my-userinfo-container {
	height: 100%;
	background-color: $color-bg-page-strong;

	.top-box {
		height: 400rpx;
		background-color: $color-primary-600;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		position: relative;
		overflow: hidden;

		&::before {
			content: ' ';
			position: absolute;
			inset: -120rpx;
			background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0) 55%);
			pointer-events: none;
		}

		.avatar {
			width: 160rpx;
			height: 160rpx;
			border-radius: $radius-pill;
			border: 4rpx solid rgba(255, 255, 255, 0.6);
			box-shadow: 0 8rpx 24rpx $color-overlay-shadow;
		}

		.nickname {
			font-size: $font-lg;
			color: $color-white;
			font-weight: 800;
			margin-top: $space-3;
			text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
		}
	}
}

.panel-list {
	padding: 0 $space-3;
	position: relative;
	top: -40rpx;

	.panel {
		background-color: $color-bg;
		border-radius: $radius-lg;
		margin-bottom: $space-3;
		overflow: hidden;

		.panel-body {
			display: flex;
			justify-content: space-around;

			.panel-item {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				padding: $space-3 0;

				.num {
					font-size: $font-md;
					color: $color-text-900;
					font-weight: bold;
				}

				.txt {
					font-size: $font-xs;
					color: $color-text-500;
					margin-top: $space-1;
				}
			}
		}
	}
}

.panel-list-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	line-height: 90rpx;
	padding: 0 $space-3;
	font-size: $font-md;
	color: $color-text-700;
	border-bottom: 1px solid $color-border-1;

	&:last-child {
		border-bottom: none;
	}

	.item-left {
		display: flex;
		align-items: center;
		gap: $space-2;
	}
}
</style>
