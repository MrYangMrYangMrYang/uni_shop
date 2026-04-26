<template>
	<view class="order-container">
		<!-- 收货地址展示区域 -->
		<view class="address-section u-card--shadow">
			<!-- 复用 my-address 组件展示/选择地址 -->
			<my-address></my-address>
		</view>

		<!-- 待结算商品清单区域 -->
		<view class="goods-section u-card--shadow">
			<view class="section-title">商品清单</view>
			<view class="goods-list">
				<view class="goods-item" v-for="(item, i) in orderGoods" :key="i">
					<!-- 复用 my-goods 组件展示商品基本信息 -->
					<my-goods :goods="item" :show-num="false"></my-goods>
					<!-- 右下角显示购买数量 -->
					<view class="goods-info-footer">
						<text class="count">x{{item.goods_count}}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 订单金额详情计算区域 -->
		<view class="detail-section u-card--shadow">
			<view class="detail-item">
				<text>商品总额</text>
				<text class="price">￥{{totalPrice}}</text>
			</view>
			<view class="detail-item">
				<text>运费</text>
				<text class="price">￥0.00</text>
			</view>
			<!-- 实付款（总额 + 运费） -->
			<view class="detail-item total">
				<text>实付款</text>
				<text class="price">￥{{totalPrice}}</text>
			</view>
		</view>

		<!-- 底部固定定位的支付栏 -->
		<view class="footer-pay u-fixed-footer">
			<view class="pay-info">
				合计：<text class="total-price">￥{{totalPrice}}</text>
			</view>
			<view class="pay-btn u-pressable" @click="onPayment">提交订单</view>
		</view>
		<!-- 底部占位符，防止内容被固定定位的支付栏遮挡 -->
		<view class="u-fixed-footer-spacer"></view>
	</view>
</template>

<script>
	/**
	 * 订单确认及支付页面
	 * 
	 * 业务逻辑说明：
	 * 1. 支持两种进入路径：
	 *    - 路径A：从购物车点击“结算”进入，携带购物车中勾选的商品。
	 *    - 路径B：从商品详情点击“立即购买”进入，携带单件商品数据（通过 URL query 传递）。
	 * 2. 支付流程模拟：
	 *    - 提交订单时校验地址。
	 *    - 提供“立即支付”和“稍后支付”两种模拟路径。
	 *    - 支付成功跳转至订单列表-待发货；取消支付跳转至订单列表-待付款。
	 * 3. 状态清理：订单生成后，需同步清理购物车中对应的选中项。
	 */
	import { mapState, mapMutations } from 'vuex'

	export default {
		data() {
			return {
				// 存储“立即购买”流程传过来的单件商品信息
				buyNowGoods: null
			};
		},
		/**
		 * 页面加载
		 * @param {Object} options 包含 goods 字符串（URI编码的 JSON）
		 */
		onLoad(options) {
			// 解析“立即购买”携带的商品数据
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
			/**
			 * 确定最终要展示和结算的商品列表
			 * @returns {Array} 商品对象数组
			 */
			orderGoods() {
				// 优先级：立即购买 > 购物车勾选
				if (this.buyNowGoods) return this.buyNowGoods
				return this.cart.filter(x => x.goods_state)
			},
			/**
			 * 动态计算订单总价
			 * @returns {string} 格式化后的两位小数总价
			 */
			totalPrice() {
				return this.orderGoods.reduce((total, item) => total + item.goods_count * item.goods_price, 0).toFixed(2)
			}
		},
		methods: {
			...mapMutations('m_cart', ['removeCheckedGoods']),
			...mapMutations('m_user', ['addOrder']),
			/**
			 * 点击提交订单/支付按钮
			 * 流程：校验 -> 模拟弹窗 -> 数据持久化 -> 页面重定向
			 */
			async onPayment() {
				// 1. 强校验：必须有收货地址才能下单
				if (!this.address.userName) return uni.$showMsg('请选择收货地址！')
				
				// 2. 弹出模拟支付选择框
				uni.showModal({
					title: '确认下单',
					content: `订单金额 ￥${this.totalPrice}，是否支付？`,
					cancelText: '稍后支付',
					confirmText: '立即支付',
					confirmColor: '#C00000',
					success: (res) => {
						// 3. 封装统一的订单基础数据结构
						const orderBase = {
							order_id: 'ORDER_' + Date.now(),
							add_time: Date.now(),
							// 设置过期时间：默认 30 分钟
							expire_time: Date.now() + 30 * 60 * 1000,
							total_price: this.totalPrice,
							goods: this.orderGoods,
							address: this.address
						}

						if (res.confirm) {
							// --- 路径1：立即支付成功 ---
							uni.showLoading({ title: '正在支付' })
							setTimeout(() => {
								uni.hideLoading()
								
								// 存入 Vuex 订单列表，状态设为 1 (待发货)
								this.addOrder({ ...orderBase, status: 1 })
								
								// 清理购物车：如果是从购物车结算的，需要移除选中项
								if (!this.buyNowGoods) {
									this.removeCheckedGoods()
								}

								uni.showToast({
									title: '支付成功',
									icon: 'none',
									duration: 1000
								})
								
								// 跳转至订单列表页的“待发货”页签
								setTimeout(() => {
									uni.redirectTo({ url: '/subpkg/order_list/order_list?tab=2' })
								}, 1000)
							}, 800)
						} else if (res.cancel) {
							// --- 路径2：取消支付/稍后支付 ---
							// 存入 Vuex 订单列表，状态设为 0 (待付款)
							this.addOrder({ ...orderBase, status: 0 })
							
							// 即使未支付，订单已生成，也需要从购物车移除选中项
							if (!this.buyNowGoods) {
								this.removeCheckedGoods()
							}

							uni.showToast({
								title: '订单已存入待付款',
								icon: 'none',
								duration: 1500
							})

							// 跳转至订单列表页的“待付款”页签
							setTimeout(() => {
								uni.redirectTo({ url: '/subpkg/order_list/order_list?tab=1' })
							}, 1500)
						}
					}
				})
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
