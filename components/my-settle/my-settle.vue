<!--
  结算组件
  用于购物车底部，展示合计金额、全选控制以及跳转结算
-->
<template>
	<view class="my-settle-container u-fixed-footer">
		<!-- 全选控制区域 -->
		<label class="radio" @click="changeAllState">
			<radio :color="primaryColor" :checked="isFullCheck" /><text>全选</text>
		</label>

		<!-- 合计金额展示 -->
		<view class="amount-box">
			合计:<text class="amount">{{ checkedGoodsAmount | formatPrice }}</text>
		</view>

		<!-- 结算按钮：展示已选商品数量 -->
		<view class="btn-settle u-btn-primary u-pressable" @click="settlement">结算({{ checkedCount }})</view>
	</view>
</template>

<script>
import { showToast } from '@/src/utils/toast.js';
import { mapGetters, mapMutations, mapState } from 'vuex';
import authGuard from '@/src/mixins/auth-guard.js';

export default {
	name: 'my-settle',
	mixins: [authGuard],
	data() {
		return {
			seconds: 3,
			timer: null,
			primaryColor: '#C00000' // $color-primary
		};
	},
	computed: {
		...mapGetters('m_cart', ['checkedCount', 'total', 'checkedGoodsAmount']),
		...mapGetters('m_user', ['addstr']),
		...mapState('m_cart', ['cart']),

		isFullCheck() {
			return this.total === this.checkedCount;
		}
	},
	methods: {
		...mapMutations('m_cart', ['updateAllGoodsState']),

		changeAllState() {
			this.updateAllGoodsState(!this.isFullCheck);
		},

		settlement() {
			// 防抖：避免连续点击
			if (this._settleLock) return;
			if (!this.checkedCount) return showToast('请选择要结算的商品！');
			if (!this.token) return this.delayNavigate();
			this._settleLock = true;
			// 清除"立即购买"标记，否则 order 页会优先展示上一次立即购买的商品
			this.$store.commit('m_cart/clearBuyNowGoods');
			uni.navigateTo({
				url: '/subpkg/order/order',
				complete: () => {
					this._settleLock = false;
				}
			});
		},

		// 微信支付完整流程参考（业务参考，未在 settlement 中调用）
		// 流程：创建订单 -> 获取预支付参数 -> 发起微信支付 -> 验证支付结果
		async payOrder() {
			const orderInfo = {
				order_price: 1, // 演示金额（1分），实际应使用 this.checkedGoodsAmount
				consignee_addr: this.addstr,
				goods: this.cart
					.filter(x => x.goods_state)
					.map(x => ({
						goods_id: x.goods_id,
						goods_number: x.goods_count,
						goods_price: x.goods_price
					}))
			};

			const { data: res } = await uni.$http.post('/api/public/v1/my/orders/create', orderInfo);
			if (res.meta.status !== 200) return showToast('创建订单失败！');
			const orderNumber = res.message.order_number;

			const { data: res2 } = await uni.$http.post('/api/public/v1/my/orders/req_unifiedorder', {
				order_number: orderNumber
			});
			if (res2.meta.status !== 200) return showToast('预付订单生成失败！');
			const payInfo = res2.message.pay;

			const [err] = await uni.requestPayment(payInfo);
			if (err) return showToast('订单未支付！');

			const { data: res3 } = await uni.$http.post('/api/public/v1/my/orders/chkOrder', { order_number: orderNumber });
			if (res3.meta.status !== 200) return showToast('订单未支付！');

			uni.showToast({
				title: '订单支付完成！',
				icon: 'success'
			});
		},

		// 未登录时的延时导航：3 秒倒计时，每秒更新 Toast，结束后跳转登录页
		delayNavigate() {
			this.seconds = 3;
			this.showTips(this.seconds);

			this.timer = setInterval(() => {
				this.seconds--;
				if (this.seconds <= 0) {
					clearInterval(this.timer);
					this.timer = null;
					this.navigateToLogin('/pages/cart/cart');
					return;
				}
				this.showTips(this.seconds);
			}, 1000);
		},

		showTips(n) {
			uni.showToast({
				icon: 'none',
				title: '请登录后再结算！' + n + '秒之后自动跳转到登录页',
				mask: true, // 防止点击穿透
				duration: 1500
			});
		}
	},

	// 组件销毁前清理定时器，防止内存泄漏
	beforeDestroy() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}
};
</script>

<style lang="scss">
.my-settle-container {
	height: 50px;
	background-color: $color-bg;
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: $font-md;
	padding-left: $space-1;

	.radio {
		display: flex;
		align-items: center;
	}

	.amount-box {
		.amount {
			color: $color-primary-600;
			font-weight: bold;
		}
	}

	.btn-settle {
		height: 50px;
		line-height: 50px;
		padding: 0 10px;
		min-width: 100px;
		text-align: center;
	}
}
</style>
