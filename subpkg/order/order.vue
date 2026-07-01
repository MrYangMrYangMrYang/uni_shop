<template>
	<view class="order-container">
		<!-- 收货地址展示区域 -->
		<view class="address-section u-card--shadow">
			<my-address></my-address>
		</view>

		<!-- 待结算商品清单区域 -->
		<view class="goods-section u-card--shadow">
			<view class="section-title">商品清单</view>
			<view class="goods-list">
				<view class="goods-item" v-for="(item, i) in orderGoods" :key="i">
					<my-goods :goods="item" :show-num="false"></my-goods>
					<!-- 右下角显示购买数量 -->
					<view class="goods-info-footer">
						<text class="count">x{{ item.goods_count }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 订单金额详情计算区域 -->
		<view class="detail-section u-card--shadow">
			<view class="detail-item">
				<text>商品总额</text>
				<text class="price">{{ totalPrice | formatPrice }}</text>
			</view>
			<view class="detail-item">
				<text>运费</text>
				<text class="price">{{ 0 | formatPrice }}</text>
			</view>
			<!-- 实付款（总额 + 运费） -->
			<view class="detail-item total">
				<text>实付款</text>
				<text class="price">{{ totalPrice | formatPrice }}</text>
			</view>
		</view>

		<!-- 底部固定定位的支付栏 -->
		<view class="footer-pay u-fixed-footer">
			<view class="pay-info">
				合计：<text class="total-price">{{ totalPrice | formatPrice }}</text>
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
 *    - 路径A：从购物车点击"结算"进入，携带购物车中勾选的商品。
 *    - 路径B：从商品详情点击"立即购买"进入，携带单件商品数据（通过 URL query 传递）。
 * 2. 支付流程模拟：
 *    - 提交订单时校验地址。
 *    - 提供"立即支付"和"稍后支付"两种模拟路径。
 *    - 支付成功跳转至订单列表-待发货；取消支付跳转至订单列表-待付款。
 * 3. 状态清理：订单生成后，需同步清理购物车中对应的选中项。
 */
import { mapState, mapMutations } from 'vuex';
import { fenToYuan } from '@/utils/price.js';

export default {
	data() {
		return {};
	},
	onLoad() {
		// buyNowGoods 由 goods_detail 通过 m_cart/setBuyNowGoods 写入 store
		// 不再从 URL query 解析 JSON（P2-23）
	},
	computed: {
		...mapState('m_cart', ['cart', 'buyNowGoods']),
		...mapState('m_user', ['address']),
		// 优先级：立即购买 > 购物车勾选
		orderGoods() {
			if (this.buyNowGoods) return this.buyNowGoods;
			return this.cart.filter(x => x.goods_state);
		},
		// 总价为整数分，模板通过 | formatPrice 显示
		totalPrice() {
			return this.orderGoods.reduce((total, item) => total + item.goods_count * item.goods_price, 0);
		}
	},
	methods: {
		...mapMutations('m_cart', ['removeCheckedGoods']),
		...mapMutations('m_user', ['addOrder']),
		// 流程：校验 -> 模拟支付弹窗 -> 持久化订单 -> 跳转
		onPayment() {
			// 防抖：避免连续点击触发多次下单
			if (this._submitLock) return;
			// 1. 强校验：必须有收货地址才能下单
			if (!this.address.userName) return uni.$showMsg('请选择收货地址！');
			this._submitLock = true;

			// 2. 弹出模拟支付选择框
			const displayAmount = fenToYuan(this.totalPrice).toFixed(2);
			uni.showModal({
				title: '确认下单',
				content: `订单金额 ￥${displayAmount}，是否支付？`,
				cancelText: '稍后支付',
				confirmText: '立即支付',
				confirmColor: '#C00000',
				success: res => {
					// 3. 封装统一的订单基础数据结构
					const orderBase = {
						order_id: 'ORDER_' + Date.now(),
						add_time: Date.now(),
						// 过期时间：默认 30 分钟
						expire_time: Date.now() + 30 * 60 * 1000,
						total_price: this.totalPrice,
						goods: this.orderGoods,
						address: this.address
					};

					if (res.confirm) {
						// --- 路径1：立即支付成功 ---
						uni.showLoading({ title: '正在支付' });
						setTimeout(() => {
							uni.hideLoading();

							// status: 1 = 待发货
							this.addOrder({ ...orderBase, status: 1 });

							// 购物车结算需移除已选商品
							if (!this.buyNowGoods) {
								this.removeCheckedGoods();
							}

							uni.showToast({
								title: '支付成功',
								icon: 'none',
								duration: 1000
							});

							// 跳转至订单列表"待发货"页签（tab=2）
							setTimeout(() => {
								uni.redirectTo({ url: '/subpkg/order_list/order_list?tab=2' });
							}, 1000);
						}, 800);
					} else if (res.cancel) {
						// --- 路径2：取消支付/稍后支付 ---
						// status: 0 = 待付款
						this.addOrder({ ...orderBase, status: 0 });

						// 订单已生成，即便未支付也需从购物车移除选中项
						if (!this.buyNowGoods) {
							this.removeCheckedGoods();
						}

						uni.showToast({
							title: '订单已存入待付款',
							icon: 'none',
							duration: 1500
						});

						// 跳转至订单列表"待付款"页签（tab=1）
						setTimeout(() => {
							uni.redirectTo({ url: '/subpkg/order_list/order_list?tab=1' });
						}, 1500);
					}
				}
			});
		}
	}
};
</script>

<style lang="scss">
.order-container {
	padding: $space-2;
	background-color: $color-bg-base;
	min-height: 100vh;

	.section-title {
		padding: $space-2 0;
		font-size: $font-md;
		font-weight: bold;
		border-bottom: 1px solid $color-border;
		margin-bottom: $space-2;
	}

	.address-section {
		background-color: $color-bg;
		border-radius: $radius-lg;
		margin-bottom: $space-2;
		overflow: hidden;
	}

	.goods-section {
		background-color: $color-bg;
		border-radius: $radius-lg;
		padding: 0 $space-2;
		margin-bottom: $space-2;

		.goods-item {
			position: relative;
			border-bottom: 1px solid $color-bg-soft;
			&:last-child {
				border-bottom: none;
			}

			.goods-info-footer {
				position: absolute;
				right: $space-2;
				bottom: $space-3;
				.count {
					font-size: $font-sm;
					color: $color-text-muted;
				}
			}
		}
	}

	.detail-section {
		background-color: $color-bg;
		border-radius: $radius-lg;
		padding: $space-2 $space-3;
		margin-bottom: $space-2;

		.detail-item {
			display: flex;
			justify-content: space-between;
			padding: 15rpx 0;
			font-size: $font-md;
			color: $color-text-secondary;

			.price {
				color: $color-text;
			}

			&.total {
				border-top: 1px solid $color-border;
				margin-top: $space-1;
				padding-top: 25rpx;
				font-size: $font-lg;
				font-weight: bold;
				color: $color-text;
				.price {
					color: $color-primary;
				}
			}
		}
	}

	.footer-pay {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 0 0 $space-3;
		background-color: $color-bg;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

		.pay-info {
			font-size: $font-md;
			.total-price {
				color: $color-primary;
				font-size: 36rpx;
				font-weight: bold;
			}
		}

		.pay-btn {
			width: 240rpx;
			height: 100rpx;
			line-height: 100rpx;
			background-color: $color-primary;
			color: #fff;
			text-align: center;
			font-size: $font-md;
			font-weight: bold;
		}
	}
}
</style>
