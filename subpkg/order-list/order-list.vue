<!--
  订单列表页面
  核心功能：
  1. 状态分类展示：通过 Tab 切换展示全部、待付款、待发货、待收货等
  2. 支付倒计时：针对待付款订单开启全局定时器，每秒更新剩余时间并自动清理过期订单
  3. 订单生命周期操作：取消订单、立即支付、确认收货、再次购买
  4. 模拟物流：演示性质的物流信息展示弹窗
  5. 自动维护：进入页面或 Tab 切换时自动触发 Vuex 的订单状态检查
  状态码：0=待付款, 1=待发货, 2=待收货, 3=已完成, 4=退款/售后
-->
<template>
	<view class="order-list-container">
		<!-- 顶部分段器：用于切换不同的订单状态 -->
		<view class="tabs u-card--shadow">
			<view
				v-for="(tab, i) in tabs"
				:key="i"
				class="tab-item"
				:class="{ active: activeTab === i }"
				@click="onTabClick(i)"
			>
				{{ tab }}
			</view>
		</view>

		<!-- 订单列表展示区域 -->
		<scroll-view scroll-y="true" class="order-scroll" v-if="filteredOrderList.length > 0">
			<view class="order-item u-card--shadow" v-for="(order, i) in filteredOrderList" :key="i">
				<view class="order-header">
					<text class="order-id">订单号: {{ order.order_id }}</text>
					<text class="order-status">{{ getStatusText(order.status) }}</text>
				</view>

				<!-- 仅在"待付款"状态且未过期时显示倒计时 -->
				<view class="expire-box" v-if="order.status === 0">
					<uni-icons type="info" size="14" :color="primaryColor"></uni-icons>
					<text class="expire-text">支付剩余时间：{{ order.countDown }}</text>
				</view>

				<view class="goods-list">
					<view class="goods-item" v-for="(goods, j) in order.goods" :key="j">
						<u-image
							:src="goods.goods_small_logo || defaultPic"
							:fallback-src="defaultPic"
							mode="aspectFill"
							class="goods-img"
						/>
						<view class="goods-info">
							<view class="goods-name">{{ goods.goods_name }}</view>
							<view class="goods-price-num">
								<text class="price">{{ goods.goods_price | formatPrice }}</text>
								<text class="num">x{{ goods.goods_count }}</text>
							</view>
						</view>
					</view>
				</view>

				<view class="order-footer">
					<text class="order-time">{{ formatTime(order.add_time) }}</text>
					<view class="total-info">
						共 {{ totalCount(order.goods) }} 件商品，合计:
						<text class="total-price">{{ order.total_price | formatPrice }}</text>
					</view>
				</view>

				<!-- 操作按钮根据订单状态动态显示 -->
				<view class="order-actions">
					<view class="action-btn outline" @click="onOrderAction('cancel', order)" v-if="order.status === 0"
						>取消订单</view
					>
					<view class="action-btn outline" @click="onOrderAction('logistics', order)" v-if="order.status === 2"
						>查看物流</view
					>
					<view class="action-btn primary" @click="onOrderAction('pay', order)" v-if="order.status === 0"
						>立即支付</view
					>
					<view class="action-btn primary" @click="onOrderAction('confirm', order)" v-if="order.status === 2"
						>确认收货</view
					>
					<view class="action-btn outline" @click="onOrderAction('buyAgain', order)" v-if="order.status === 3"
						>再次购买</view
					>
				</view>
			</view>

			<view class="no-more-data">
				<view class="line"></view>
				<text class="text">已经到底了哦~</text>
				<view class="line"></view>
			</view>
		</scroll-view>

		<!-- 订单为空时的缺省状态 -->
		<view v-else class="empty-wrapper">
			<u-empty mode="order" button-text="去逛逛" @action="goHome" />
		</view>

		<!-- 模拟物流详情弹窗（纯前端逻辑实现） -->
		<view
			class="logistics-mask"
			v-if="showLogistics"
			:class="{ 'mask-fade-out': isClosing }"
			@click="closeLogistics"
			@touchmove.stop.prevent
		>
			<view class="logistics-container" :class="{ 'container-slide-down': isClosing }" @click.stop>
				<view class="logistics-header">物流详情</view>
				<scroll-view scroll-y="true" class="logistics-content">
					<view class="logistics-item" v-for="(item, i) in mockLogistics" :key="i">
						<view class="dot-line">
							<!-- 第一条物流信息高亮 -->
							<view class="dot" :class="{ active: i === 0 }"></view>
							<view class="line" v-if="i !== mockLogistics.length - 1"></view>
						</view>
						<view class="info">
							<view class="status">{{ item.status }}</view>
							<view class="time">{{ item.time }}</view>
						</view>
					</view>
				</scroll-view>
				<view class="close-btn" @click="closeLogistics">关闭</view>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import UEmpty from '@/components/u-empty/u-empty.vue';
import UImage from '@/components/u-image/u-image.vue';
import { fenToYuan } from '@/src/utils/price.js';

import { DEMO_LOGISTICS } from '@/src/config/mock.js';
export default {
	components: {
		'u-empty': UEmpty,
		'u-image': UImage
	},
	data() {
		return {
			primaryColor: '#C00000', // $color-primary
			tabs: ['全部', '待付款', '待发货', '待收货', '已完成', '售后'],
			activeTab: 0,
			// 默认图由 u-image 组件内部兜底，不再依赖外部 CDN
			defaultPic: '',
			timer: null,
			now: Date.now(),
			showLogistics: false,
			isClosing: false,
			mockLogistics: DEMO_LOGISTICS //
		};
	},
	onLoad(options) {
		if (options.tab !== undefined) {
			this.activeTab = parseInt(options.tab);
		}
		this.checkAndCleanOrders();
		this.manageCountDown();
	},
	onShow() {
		this.checkAndCleanOrders();
		this.manageCountDown();
	},
	onHide() {
		this.stopCountDown();
	},
	onUnload() {
		this.stopCountDown();
	},
	computed: {
		...mapState('m_user', ['orderList']),
		// 是否有待付款订单（用于按需启停定时器）
		hasPendingPayment() {
			return this.orderList.some(order => order.status === 0);
		},
		filteredOrderList() {
			let list = [];
			if (this.activeTab === 0) {
				list = this.orderList;
			} else {
				list = this.orderList.filter(order => {
					if (this.activeTab === 1) return order.status === 0;
					if (this.activeTab === 2) return order.status === 1;
					if (this.activeTab === 3) return order.status === 2;
					if (this.activeTab === 4) return order.status === 3;
					if (this.activeTab === 5) return order.status === 4;
					return true;
				});
			}

			return list.map(order => {
				// 必须创建副本，禁止直接修改 Vuex 中的 state
				const orderCopy = { ...order };
				if (orderCopy.status === 0 && orderCopy.expire_time) {
					const remaining = orderCopy.expire_time - this.now;
					if (remaining > 0) {
						const m = Math.floor(remaining / 1000 / 60);
						const s = Math.floor((remaining / 1000) % 60);
						orderCopy.countDown = `${m}:${s < 10 ? '0' + s : s}`;
					} else {
						orderCopy.countDown = '已过期';
					}
				}
				return orderCopy;
			});
		}
	},
	methods: {
		...mapMutations('m_user', ['checkAndCleanOrders', 'updateOrderStatus', 'cancelOrder']),
		// 按需管理定时器：仅当存在待付款订单时启动，避免无意义的全量重算
		manageCountDown() {
			if (this.hasPendingPayment) {
				this.startCountDown();
			} else {
				this.stopCountDown();
			}
		},
		startCountDown() {
			if (this.timer) return; // 已在运行
			this.timer = setInterval(() => {
				this.now = Date.now();
				this.checkAndCleanOrders();
				// 清理后若不再有 pending 订单，自动停止
				if (!this.hasPendingPayment) {
					this.stopCountDown();
				}
			}, 1000);
		},
		stopCountDown() {
			if (this.timer) {
				clearInterval(this.timer);
				this.timer = null;
			}
		},
		onTabClick(i) {
			this.activeTab = i;
		},
		getStatusText(status) {
			const statusMap = {
				0: '待付款',
				1: '待发货',
				2: '待收货',
				3: '已完成',
				4: '退款/售后'
			};
			return statusMap[status] || '未知状态';
		},
		formatTime(time) {
			const date = new Date(time);
			const y = date.getFullYear();
			const m = (date.getMonth() + 1 + '').padStart(2, '0');
			const d = (date.getDate() + '').padStart(2, '0');
			const hh = (date.getHours() + '').padStart(2, '0');
			const mm = (date.getMinutes() + '').padStart(2, '0');
			return `${y}-${m}-${d} ${hh}:${mm}`;
		},
		totalCount(goods) {
			return goods.reduce((total, item) => total + item.goods_count, 0);
		},
		onOrderAction(type, order) {
			switch (type) {
				case 'cancel':
					this.handleCancel(order);
					break;
				case 'pay':
					this.handlePay(order);
					break;
				case 'confirm':
					this.handleConfirm(order);
					break;
				case 'logistics':
					this.showLogistics = true;
					break;
				case 'buyAgain':
					this.handleBuyAgain(order);
					break;
			}
		},
		closeLogistics() {
			this.isClosing = true;
			setTimeout(() => {
				this.showLogistics = false;
				this.isClosing = false;
			}, 300);
		},
		handleBuyAgain(order) {
			if (order.goods && order.goods.length > 0) {
				order.goods.forEach(g => {
					const goods = {
						goods_id: g.goods_id,
						goods_name: g.goods_name,
						goods_price: g.goods_price,
						goods_count: g.goods_count || 1,
						goods_small_logo: g.goods_small_logo,
						goods_state: true
					};
					this.$store.commit('m_cart/addToCart', goods);
				});
			}
			uni.switchTab({
				url: '/pages/cart/cart'
			});
		},
		goHome() {
			uni.switchTab({
				url: '/pages/home/home'
			});
		},
		async handleCancel(order) {
			uni.showModal({
				title: '提示',
				content: '确认要取消该订单吗？',
				confirmColor: this.primaryColor,
				success: res => {
					if (res.confirm) {
						this.cancelOrder(order.order_id);
						uni.showToast({ title: '订单已取消', icon: 'none' });
					}
				}
			});
		},
		async handlePay(order) {
			const displayAmount = fenToYuan(order.total_price).toFixed(2);
			uni.showModal({
				title: '支付确认',
				content: `是否支付 ￥${displayAmount}？`,
				confirmColor: this.primaryColor,
				success: res => {
					if (res.confirm) {
						uni.showLoading({ title: '支付中' });
						setTimeout(() => {
							uni.hideLoading();
							// 支付成功后状态变更为"待发货"（status: 1）
							this.updateOrderStatus({ order_id: order.order_id, status: 1 });
							uni.showToast({ title: '支付成功', icon: 'success' });
						}, 800);
					}
				}
			});
		},
		async handleConfirm(order) {
			uni.showModal({
				title: '确认收货',
				content: '是否确认已收到商品？',
				confirmColor: this.primaryColor,
				success: res => {
					if (res.confirm) {
						// 确认收货后状态变更为"已完成"（status: 3）
						this.updateOrderStatus({ order_id: order.order_id, status: 3 });
						uni.showToast({ title: '已确认收货', icon: 'success' });
					}
				}
			});
		}
	}
};
</script>

<style lang="scss">
.order-list-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: $color-bg-page-strong;

	.tabs {
		display: flex;
		background-color: $color-bg;
		height: 88rpx;
		line-height: 88rpx;
		position: sticky;
		top: 0;
		z-index: $z-sticky;
		margin-bottom: $space-2;

		.tab-item {
			flex: 1;
			text-align: center;
			font-size: $font-md;
			color: $color-text-500;
			position: relative;

			&.active {
				color: $color-primary;
				font-weight: bold;
				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 40rpx;
					height: 4rpx;
					background-color: $color-primary;
				}
			}
		}
	}

	.empty-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.order-scroll {
		flex: 1;
		padding: 0 $space-2 $space-2;
		box-sizing: border-box;

		.order-item {
			background-color: $color-bg;
			border-radius: $radius-lg;
			padding: $space-3;
			margin-bottom: $space-2;

			.order-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding-bottom: $space-2;
				border-bottom: 1rpx solid $color-border;
				margin-bottom: $space-2;

				.order-id {
					font-size: $font-xs;
					color: $color-text-muted;
				}

				.order-status {
					font-size: $font-md;
					color: $color-primary;
					font-weight: bold;
				}
			}

			.expire-box {
				display: flex;
				align-items: center;
				padding: $space-1 0;
				color: $color-primary;
				font-size: $font-sm;

				.expire-text {
					margin-left: $space-1;
				}
			}

			.goods-list {
				.goods-item {
					display: flex;
					margin-bottom: $space-2;

					.goods-img {
						width: 160rpx;
						height: 160rpx;
						border-radius: $radius-sm;
						background-color: $color-bg-soft;
					}

					.goods-info {
						flex: 1;
						padding-left: $space-2;
						display: flex;
						flex-direction: column;
						justify-content: space-between;

						.goods-name {
							font-size: $font-md;
							color: $color-text;
							display: -webkit-box;
							-webkit-box-orient: vertical;
							-webkit-line-clamp: 2;
							overflow: hidden;
						}

						.goods-price-num {
							display: flex;
							justify-content: space-between;
							align-items: center;
							.price {
								font-size: $font-lg;
								color: $color-text;
								font-weight: bold;
							}
							.num {
								font-size: $font-xs;
								color: $color-text-muted;
							}
						}
					}
				}
			}

			.order-footer {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: $space-2 0;
				font-size: $font-xs;

				.order-time {
					color: $color-text-muted;
				}

				.total-info {
					color: $color-text-secondary;
					.total-price {
						font-size: $font-lg;
						color: $color-text;
						font-weight: bold;
					}
				}
			}

			.order-actions {
				display: flex;
				justify-content: flex-end;
				gap: $space-2;
				padding-top: $space-2;
				border-top: 1rpx solid $color-border;

				.action-btn {
					min-width: 160rpx;
					height: 60rpx;
					line-height: 60rpx;
					text-align: center;
					border-radius: $radius-pill;
					font-size: $font-md;

					&.outline {
						border: 1rpx solid $color-border;
						color: $color-text-secondary;
					}

					&.primary {
						background-color: $color-primary;
						color: $color-white;
						border: 1rpx solid $color-primary;
					}
				}
			}
		}

		.no-more-data {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: $space-5 0 $space-7;
			gap: $space-3;

			.line {
				width: 100rpx;
				height: 1rpx;
				background-color: $color-border-2;
			}

			.text {
				font-size: $font-xs;
				color: $color-text-muted;
				letter-spacing: 2rpx;
			}
		}
	}

	.logistics-mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: $color-mask;
		z-index: $z-fixed;
		display: flex;
		align-items: flex-end;
		transition: opacity 0.3s ease;

		&.mask-fade-out {
			opacity: 0;
		}

		.logistics-container {
			width: 100%;
			background-color: $color-bg;
			border-radius: $radius-lg $radius-lg 0 0;
			padding: $space-5 $space-3;
			max-height: 80vh;
			display: flex;
			flex-direction: column;
			animation: slideUp 0.3s ease-out;

			&.container-slide-down {
				animation: slideDown 0.3s ease-in forwards;
			}

			.logistics-header {
				font-size: $font-lg;
				font-weight: bold;
				text-align: center;
				padding-bottom: $space-3;
				border-bottom: 1rpx solid $color-border;
			}

			.logistics-content {
				flex: 1;
				padding: $space-4 $space-2;

				.logistics-item {
					display: flex;
					padding-bottom: $space-4;

					.dot-line {
						width: 40rpx;
						display: flex;
						flex-direction: column;
						align-items: center;
						margin-right: $space-2;

						.dot {
							width: 16rpx;
							height: 16rpx;
							border-radius: 50%;
							background-color: $color-border;
							z-index: 2;
							&.active {
								background-color: $color-primary;
								box-shadow: 0 0 10rpx rgba(192, 0, 0, 0.5);
							}
						}

						.line {
							flex: 1;
							width: 2rpx;
							background-color: $color-border;
						}
					}

					.info {
						flex: 1;
						.status {
							font-size: $font-md;
							color: $color-text;
							margin-bottom: $space-1;
							line-height: 1.4;
						}

						&:first-child {
							.status {
								color: $color-primary;
								font-weight: bold;
							}
						}

						.time {
							font-size: $font-xs;
							color: $color-text-muted;
						}
					}
				}
			}

			.close-btn {
				height: 88rpx;
				line-height: 88rpx;
				background-color: $color-bg-soft;
				color: $color-text;
				text-align: center;
				border-radius: $radius-pill;
				font-size: $font-md;
				margin-top: $space-2;
				font-weight: bold;
			}
		}
	}
}

@keyframes slideUp {
	from {
		transform: translateY(100%);
	}
	to {
		transform: translateY(0);
	}
}

@keyframes slideDown {
	from {
		transform: translateY(0);
	}
	to {
		transform: translateY(100%);
	}
}
</style>
