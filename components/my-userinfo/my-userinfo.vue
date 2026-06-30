<!--
  个人中心用户信息组件
  展示用户头像、昵称、订单统计面板以及常用功能列表
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
						<text class="num">8</text>
						<text class="txt">收藏店铺</text>
					</view>
					<view class="panel-item u-pressable">
						<text class="num">14</text>
						<text class="txt">收藏商品</text>
					</view>
					<view class="panel-item u-pressable">
						<text class="num">18</text>
						<text class="txt">关注商品</text>
					</view>
					<view class="panel-item u-pressable">
						<text class="num">84</text>
						<text class="txt">足迹</text>
					</view>
				</view>
			</view>

			<!-- 第2个面板：我的订单状态统计 -->
			<view class="panel u-card--shadow">
				<view class="panel-title">
					<text>我的订单</text>
					<view class="all-order" @click="gotoOrderList(0)">
						<text>全部订单</text>
						<uni-icons type="arrowright" size="14" :color="primaryColor"></uni-icons>
					</view>
				</view>
				<view class="panel-body">
					<view class="panel-item u-pressable" @click="gotoOrderList(1)">
						<view class="icon-wrap">
							<image src="/static/my-icons/icon1.png" class="icon"></image>
							<text class="badge" v-if="orderCounts.pendingPayment > 0">{{ orderCounts.pendingPayment }}</text>
						</view>
						<text class="txt">待付款</text>
					</view>
					<view class="panel-item u-pressable" @click="gotoOrderList(2)">
						<view class="icon-wrap">
							<image src="/static/my-icons/icon2.png" class="icon"></image>
							<text class="badge" v-if="orderCounts.toShip > 0">{{ orderCounts.toShip }}</text>
						</view>
						<text class="txt">待发货</text>
					</view>
					<view class="panel-item u-pressable" @click="gotoOrderList(3)">
						<view class="icon-wrap">
							<image src="/static/my-icons/icon3.png" class="icon"></image>
							<text class="badge" v-if="orderCounts.toReceive > 0">{{ orderCounts.toReceive }}</text>
						</view>
						<text class="txt">待收货</text>
					</view>
					<view class="panel-item u-pressable panel-item--completed" @click="gotoOrderList(4)">
						<view class="icon-wrap">
							<view class="icon icon--completed">
								<uni-icons type="checkmarkempty" size="30" color="#e07070"></uni-icons>
							</view>
							<text class="badge" v-if="orderCounts.completed > 0">{{ orderCounts.completed }}</text>
						</view>
						<text class="txt">已完成</text>
					</view>
					<view class="panel-item u-pressable" @click="gotoOrderList(5)">
						<view class="icon-wrap">
							<image src="/static/my-icons/icon4.png" class="icon"></image>
							<text class="badge" v-if="orderCounts.afterSales > 0">{{ orderCounts.afterSales }}</text>
						</view>
						<text class="txt">售后</text>
					</view>
				</view>
			</view>

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
import { mapState, mapMutations, mapGetters } from 'vuex';

export default {
	name: 'my-userinfo',
	data() {
		return {
			primaryColor: '#C00000',
			mutedColor: '#909399'
		};
	},
	computed: {
		...mapState('m_user', ['userinfo', 'orderList']),
		...mapGetters('m_user', ['orderCounts']),
		// 徽标颜色：比主题红柔和，比灰色醒目
		badgeColor() {
			return '#ef5350';
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
				cancelColor: '#999999',
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

		// tab: 0-全部, 1-待付款, 2-待发货, 3-待收货, 4-已完成, 5-售后
		gotoOrderList(tab) {
			uni.navigateTo({
				url: '/subpkg/order_list/order_list?tab=' + tab
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
			box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
		}

		.nickname {
			font-size: $font-lg;
			color: #fff;
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

		.panel-title {
			display: flex;
			justify-content: space-between;
			align-items: center;
			line-height: 88rpx;
			padding: 0 $space-3;
			font-size: $font-md;
			font-weight: 800;
			color: $color-text-900;
			border-bottom: 1px solid $color-border-1;

			.all-order {
				display: flex;
				align-items: center;
				gap: 4rpx;
				font-size: $font-xs;
				color: $color-primary;
				font-weight: normal;
			}
		}

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

				&--completed .txt {
					margin-top: 15rpx;
				}

				.icon-wrap {
					position: relative;

					.icon {
						width: 56rpx;
						height: 56rpx;
					}

					.icon--completed {
						display: flex;
						align-items: center;
						justify-content: center;
					}

					.icon-uni {
						display: block;
					}

					.badge {
						position: absolute;
						top: -10rpx;
						right: -6rpx;
						min-width: 30rpx;
						height: 30rpx;
						padding: 0 6rpx;
						background-color: #ef5350; // 比主题红柔和，比灰色醒目
						color: #ffffff;
						font-size: 20rpx;
						line-height: 30rpx;
						text-align: center;
						border-radius: $radius-pill;
						border: 2rpx solid #ffffff;
						z-index: 10;
						font-weight: 600;
						box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
					}
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
