<template>
	<view class="order-list-container">
		<!-- 顶部分段器，切换订单状态 -->
		<view class="tabs u-card--shadow">
			<view v-for="(tab, i) in tabs" :key="i" class="tab-item" :class="{active: activeTab === i}" @click="onTabClick(i)">
				{{tab}}
			</view>
		</view>

		<!-- 订单列表 -->
		<scroll-view scroll-y="true" class="order-scroll" v-if="filteredOrderList.length > 0">
			<view class="order-item u-card--shadow" v-for="(order, i) in filteredOrderList" :key="i">
				<view class="order-header">
					<text class="order-id">订单号: {{order.order_id}}</text>
					<text class="order-status">{{getStatusText(order.status)}}</text>
				</view>
				
				<!-- 倒计时区域：仅在待付款时显示 -->
				<view class="expire-box" v-if="order.status === 0">
					<uni-icons type="auth" size="14" color="#C00000"></uni-icons>
					<text class="expire-text">支付剩余时间：{{order.countDown}}</text>
				</view>
				
				<view class="goods-list">
					<view class="goods-item" v-for="(goods, j) in order.goods" :key="j">
						<image :src="goods.goods_small_logo || defaultPic" class="goods-img"></image>
						<view class="goods-info">
							<view class="goods-name">{{goods.goods_name}}</view>
							<view class="goods-price-num">
								<text class="price">￥{{goods.goods_price}}</text>
								<text class="num">x{{goods.goods_count}}</text>
							</view>
						</view>
					</view>
				</view>
				
				<view class="order-footer">
					<text class="order-time">{{formatTime(order.add_time)}}</text>
					<view class="total-info">
						共 {{totalCount(order.goods)}} 件商品，合计: <text class="total-price">￥{{order.total_price}}</text>
					</view>
				</view>
				
				<view class="order-actions">
					<view class="action-btn outline" @click="onOrderAction('cancel', order)" v-if="order.status === 0">取消订单</view>
					<view class="action-btn outline" @click="onOrderAction('logistics', order)" v-if="order.status > 0">查看物流</view>
					<view class="action-btn primary" @click="onOrderAction('pay', order)" v-if="order.status === 0">立即支付</view>
					<view class="action-btn primary" @click="onOrderAction('confirm', order)" v-if="order.status === 2">确认收货</view>
				</view>
			</view>
		</scroll-view>

		<!-- 空白提示 -->
		<view class="empty-box" v-else>
			<image src="https://img01.yzcdn.cn/vant/empty-image-default.png" class="empty-img"></image>
			<text>您还没有相关的订单</text>
		</view>
	</view>
</template>

<script>
	import { mapState, mapMutations } from 'vuex'

	export default {
		data() {
			return {
				tabs: ['全部', '待付款', '待发货', '待收货', '退款/售后'],
				activeTab: 0,
				defaultPic: 'https://img3.doubanio.com/f/movie/8dd0dc302259694a347b207198a58682024b8980/pics/movie/celebrity-default-medium.png',
				timer: null, // 定时器
				now: Date.now() // 当前时间
			};
		},
		onLoad(options) {
			// 如果有参数传过来，自动切换到对应的 tab
			if (options.tab !== undefined) {
				this.activeTab = parseInt(options.tab)
			}
			this.checkAndCleanOrders()
			this.startCountDown()
		},
		onShow() {
			this.checkAndCleanOrders()
		},
		onUnload() {
			// 页面卸载时清除定时器
			if (this.timer) clearInterval(this.timer)
		},
		computed: {
			...mapState('m_user', ['orderList']),
			// 根据当前 tab 过滤订单并处理倒计时
			filteredOrderList() {
				let list = []
				if (this.activeTab === 0) {
					list = this.orderList
				} else {
					list = this.orderList.filter(order => {
						if (this.activeTab === 1) return order.status === 0
						if (this.activeTab === 2) return order.status === 1
						if (this.activeTab === 3) return order.status === 2
						if (this.activeTab === 4) return order.status === 4
						return true
					})
				}

				// 为每个待付款订单计算倒计时文本
				return list.map(order => {
					if (order.status === 0 && order.expire_time) {
						const remaining = order.expire_time - this.now
						if (remaining > 0) {
							const m = Math.floor(remaining / 1000 / 60)
							const s = Math.floor((remaining / 1000) % 60)
							order.countDown = `${m}:${s < 10 ? '0' + s : s}`
						} else {
							order.countDown = '已过期'
						}
					}
					return order
				})
			}
		},
		methods: {
			...mapMutations('m_user', ['checkAndCleanOrders']),
			// 启动全局定时器，每秒更新一次 now
			startCountDown() {
				this.timer = setInterval(() => {
					this.now = Date.now()
					// 如果发现有订单刚好过期，触发一次清理
					this.checkAndCleanOrders()
				}, 1000)
			},
			onTabClick(i) {
				this.activeTab = i
			},
			getStatusText(status) {
				const statusMap = {
					0: '待付款',
					1: '待发货',
					2: '待收货',
					3: '已完成',
					4: '退款/售后'
				}
				return statusMap[status] || '未知状态'
			},
			formatTime(time) {
				const date = new Date(time)
				const y = date.getFullYear()
				const m = (date.getMonth() + 1 + '').padStart(2, '0')
				const d = (date.getDate() + '').padStart(2, '0')
				const hh = (date.getHours() + '').padStart(2, '0')
				const mm = (date.getMinutes() + '').padStart(2, '0')
				return `${y}-${m}-${d} ${hh}:${mm}`
			},
			totalCount(goods) {
				return goods.reduce((total, item) => total + item.goods_count, 0)
			},
			onOrderAction(type, order) {
				uni.showToast({
					title: '功能开发中...',
					icon: 'none'
				})
			}
		}
	}
</script>

<style lang="scss">
.order-list-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f8f8f8;

	.tabs {
		display: flex;
		background-color: #fff;
		height: 88rpx;
		line-height: 88rpx;
		position: sticky;
		top: 0;
		z-index: 10;
		margin-bottom: 20rpx;

		.tab-item {
			flex: 1;
			text-align: center;
			font-size: 28rpx;
			color: #666;
			position: relative;

			&.active {
				color: #C00000;
				font-weight: bold;
				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 40rpx;
					height: 4rpx;
					background-color: #C00000;
				}
			}
		}
	}

	.order-scroll {
		flex: 1;
		padding: 0 20rpx 20rpx;
		box-sizing: border-box;

		.order-item {
			background-color: #fff;
			border-radius: 16rpx;
			padding: 24rpx;
			margin-bottom: 20rpx;

			.order-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding-bottom: 20rpx;
				border-bottom: 1rpx solid #f5f5f5;
				margin-bottom: 20rpx;

				.order-id {
					font-size: 24rpx;
					color: #999;
				}

				.order-status {
					font-size: 26rpx;
					color: #C00000;
					font-weight: bold;
				}
			}

			.expire-box {
				display: flex;
				align-items: center;
				padding: 8px 0;
				color: #C00000;
				font-size: 12px;

				.expire-text {
					margin-left: 5px;
				}
			}

			.goods-list {
				.goods-item {
					display: flex;
					margin-bottom: 20rpx;

					.goods-img {
						width: 160rpx;
						height: 160rpx;
						border-radius: 8rpx;
						background-color: #f5f5f5;
					}

					.goods-info {
						flex: 1;
						padding-left: 20rpx;
						display: flex;
						flex-direction: column;
						justify-content: space-between;

						.goods-name {
							font-size: 26rpx;
							color: #333;
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
								font-size: 30rpx;
								color: #333;
								font-weight: bold;
							}
							.num {
								font-size: 24rpx;
								color: #999;
							}
						}
					}
				}
			}

			.order-footer {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 20rpx 0;
				font-size: 24rpx;

				.order-time {
					color: #999;
				}

				.total-info {
					color: #666;
					.total-price {
						font-size: 32rpx;
						color: #333;
						font-weight: bold;
					}
				}
			}

			.order-actions {
				display: flex;
				justify-content: flex-end;
				gap: 20rpx;
				padding-top: 20rpx;
				border-top: 1rpx solid #f5f5f5;

				.action-btn {
					min-width: 160rpx;
					height: 60rpx;
					line-height: 60rpx;
					text-align: center;
					border-radius: 30rpx;
					font-size: 26rpx;

					&.outline {
						border: 1rpx solid #ddd;
						color: #666;
					}

					&.primary {
						background-color: #C00000;
						color: #fff;
						border: 1rpx solid #C00000;
					}
				}
			}
		}
	}

	.empty-box {
		padding-top: 200rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #999;
		font-size: 28rpx;

		.empty-img {
			width: 320rpx;
			height: 320rpx;
			margin-bottom: 30rpx;
		}
	}
}
</style>
