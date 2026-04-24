<template>
	<view class="order-container">
		<!-- 收货地址区域 -->
		<view class="address-section u-card--shadow">
			<my-address></my-address>
		</view>

		<!-- 商品列表区域 -->
		<view class="goods-section u-card--shadow">
			<view class="section-title">商品清单</view>
			<view class="goods-list">
				<view class="goods-item" v-for="(item, i) in orderGoods" :key="i">
					<my-goods :goods="item" :show-num="false"></my-goods>
					<view class="goods-info-footer">
						<text class="count">x{{item.goods_count}}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 订单详情区域 -->
		<view class="detail-section u-card--shadow">
			<view class="detail-item">
				<text>商品总额</text>
				<text class="price">￥{{totalPrice}}</text>
			</view>
			<view class="detail-item">
				<text>运费</text>
				<text class="price">￥0.00</text>
			</view>
			<view class="detail-item total">
				<text>实付款</text>
				<text class="price">￥{{totalPrice}}</text>
			</view>
		</view>

		<!-- 底部支付栏 -->
		<view class="footer-pay u-fixed-footer">
			<view class="pay-info">
				合计：<text class="total-price">￥{{totalPrice}}</text>
			</view>
			<view class="pay-btn u-pressable" @click="onPayment">提交订单</view>
		</view>
		<view class="u-fixed-footer-spacer"></view>
	</view>
</template>

<script>
	import { mapState, mapMutations } from 'vuex'

	export default {
		data() {
			return {
				// 存储“立即购买”传过来的商品信息
				buyNowGoods: null
			};
		},
		onLoad(options) {
			// 如果 URL 中有 goods 参数，说明是“立即购买”流程
			if (options.goods) {
				try {
					this.buyNowGoods = [JSON.parse(decodeURIComponent(options.goods))]
				} catch (e) {
					console.error('解析立即购买商品失败', e)
				}
			}
		},
		computed: {
			...mapState('m_cart', ['cart']),
			...mapState('m_user', ['address']),
			// 确定最终要展示和结算的商品列表
			orderGoods() {
				// 如果是“立即购买”，优先使用传过来的单件商品
				if (this.buyNowGoods) return this.buyNowGoods
				// 否则使用购物车中选中的商品
				return this.cart.filter(x => x.goods_state)
			},
			// 动态计算总价
			totalPrice() {
				return this.orderGoods.reduce((total, item) => total + item.goods_count * item.goods_price, 0).toFixed(2)
			}
		},
		methods: {
			...mapMutations('m_cart', ['removeCheckedGoods']),
			...mapMutations('m_user', ['addOrder']),
			async onPayment() {
				// 1. 校验地址
				if (!this.address.userName) return uni.$showMsg('请选择收货地址！')
				
				// 2. 模拟支付流程
				const [err, succ] = await uni.showModal({
					title: '确认下单',
					content: `订单金额 ￥${this.totalPrice}，是否支付？`,
					cancelText: '稍后支付',
					confirmText: '立即支付',
					confirmColor: '#C00000'
				})

				// 准备基础订单数据
				const orderBase = {
					order_id: 'ORDER_' + Date.now(),
					add_time: Date.now(),
					// 设置过期时间：30分钟后过期 (30 * 60 * 1000 毫秒)
					expire_time: Date.now() + 30 * 60 * 1000,
					total_price: this.totalPrice,
					goods: this.orderGoods,
					address: this.address
				}

				if (succ && succ.confirm) {
					// --- 用户点击立即支付 ---
					uni.showLoading({ title: '正在支付' })
					setTimeout(() => {
						uni.hideLoading()
						
						// 保存为已支付订单 (状态1: 待发货)
						this.addOrder({ ...orderBase, status: 1 })
						
						// 如果不是“立即购买”，则需要移除购物车中已选中的商品
						if (!this.buyNowGoods) {
							this.removeCheckedGoods()
						}

						uni.showToast({
							title: '支付成功',
							icon: 'none', // 改为 none 减少突兀感
							duration: 1000
						})
						
						setTimeout(() => {
							uni.navigateTo({ url: '/subpkg/order_list/order_list?tab=2' })
						}, 1000)
					}, 800)
				} else {
					// --- 用户点击稍后支付 或 取消 ---
					// 保存为未支付订单 (状态0: 待付款)
					this.addOrder({ ...orderBase, status: 0 })
					
					// 同样需要从购物车移除，因为已经生成了订单
					if (!this.buyNowGoods) {
						this.removeCheckedGoods()
					}

					uni.showToast({
						title: '订单已存入待付款',
						icon: 'none',
						duration: 1500
					})

					setTimeout(() => {
						uni.navigateTo({ url: '/subpkg/order_list/order_list?tab=1' })
					}, 1500)
				}
			}
		}
	}
</script>

<style lang="scss">
.order-container {
	padding: 20rpx;
	background-color: #f4f4f4;
	min-height: 100vh;

	.section-title {
		padding: 20rpx 0;
		font-size: 30rpx;
		font-weight: bold;
		border-bottom: 1px solid #eee;
		margin-bottom: 20rpx;
	}

	.address-section {
		background-color: #fff;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
	}

	.goods-section {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 0 20rpx;
		margin-bottom: 20rpx;

		.goods-item {
			position: relative;
			border-bottom: 1px solid #f8f8f8;
			&:last-child { border-bottom: none; }

			.goods-info-footer {
				position: absolute;
				right: 20rpx;
				bottom: 30rpx;
				.count {
					font-size: 24rpx;
					color: #999;
				}
			}
		}
	}

	.detail-section {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 20rpx 30rpx;
		margin-bottom: 20rpx;

		.detail-item {
			display: flex;
			justify-content: space-between;
			padding: 15rpx 0;
			font-size: 28rpx;
			color: #666;

			.price { color: #333; }

			&.total {
				border-top: 1px solid #eee;
				margin-top: 10rpx;
				padding-top: 25rpx;
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
				.price { color: #C00000; }
			}
		}
	}

	.footer-pay {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 0 0 30rpx;
		background-color: #fff;
		box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);

		.pay-info {
			font-size: 28rpx;
			.total-price {
				color: #C00000;
				font-size: 36rpx;
				font-weight: bold;
			}
		}

		.pay-btn {
			width: 240rpx;
			height: 100rpx;
			line-height: 100rpx;
			background-color: #C00000;
			color: #fff;
			text-align: center;
			font-size: 30rpx;
			font-weight: bold;
		}
	}
}
</style>
