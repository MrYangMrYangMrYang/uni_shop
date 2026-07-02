<!--
  订单状态面板组件
  展示"我的订单"入口及按状态分类的订单数量角标（待付款/待发货/待收货/已完成/售后）
  数据来源于 Vuex m_user/orderCounts getter，支持动态角标显示
-->
<template>
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
</template>

<script>
import { mapGetters } from 'vuex';

export default {
	name: 'MyOrderPanel',

	props: {
		/** 主色（与父组件保持一致） */
		primaryColor: {
			type: String,
			default: '#C00000' // $color-primary
		}
	},

	computed: {
		...mapGetters('m_user', ['orderCounts'])
	},

	methods: {
		// tab: 0-全部, 1-待付款, 2-待发货, 3-待收货, 4-已完成, 5-售后
		gotoOrderList(tab) {
			uni.navigateTo({
				url: '/subpkg/order-list/order-list?tab=' + tab
			});
		}
	}
};
</script>

<style lang="scss">
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

				.badge {
					position: absolute;
					top: -10rpx;
					right: -6rpx;
					min-width: 30rpx;
					height: 30rpx;
					padding: 0 6rpx;
					background-color: $color-accent-red;
					color: $color-white;
					font-size: $font-2xs;
					line-height: 30rpx;
					text-align: center;
					border-radius: $radius-pill;
					border: 2rpx solid $color-white;
					z-index: $z-badge;
					font-weight: 600;
					box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
				}
			}
		}
	}
}
</style>
