<!--
  共享购物车内容组件
  用途：封装购物车列表的通用逻辑（空状态 / 头部 / 侧滑列表 / 结算栏），供
        pages/cart/cart.vue（TabBar）和 subpkg/cart/cart.vue（内部跳转）
        两个页面复用，避免约 70% 的重复代码。

  Props:
    swipeDeleteStrategy - 'direct'（直接删除）| 'confirm'（弹窗确认）
    primaryColor        - 主色（删除按钮 / 确认弹窗 / 店铺图标）

  Events:
    after-delete        - 商品被删除后触发（可选，用于额外回调）
    navigate-to-login   - 当未登录用户尝试操作时通知父页面跳登录（仅 TabBar 页面使用）
-->
<template>
	<view>
		<!-- 空白购物车缺省页 -->
		<view class="empty-cart" v-if="cart.length === 0">
			<image src="/static/cart_empty@2x.png" class="empty-img"></image>
			<text class="tip-text">空空如也，去选购几件商品吧~</text>
			<view class="go-shopping-btn u-pressable" @click="goHome">去逛逛</view>
		</view>

		<!-- 有商品时的完整购物车区域 -->
		<view class="cart-container" v-else>
			<!-- 头部统计卡片 -->
			<view class="cart-header u-card--shadow">
				<view class="title-left">
					<uni-icons type="shop" size="20" :color="primaryColor"></uni-icons>
					<text class="title-text">我的清单</text>
				</view>
				<text class="goods-count">共 {{ cart.length }} 件商品</text>
			</view>

			<!-- 商品列表：支持侧滑删除 -->
			<uni-swipe-action class="cart-list">
				<block v-for="(goods, i) in cart" :key="i">
					<uni-swipe-action-item :options="deleteOptions" @click="swipeItemClickHandler(goods)">
						<view class="cart-list-item u-card--shadow">
							<my-goods
								:goods="goods"
								:show-radio="true"
								:show-num="true"
								@radio-change="radioChangeHandler"
								@num-change="numberChangeHandler"
								@click="gotoDetail"
							></my-goods>
						</view>
					</uni-swipe-action-item>
				</block>
			</uni-swipe-action>

			<!-- 底部全选与结算工具栏 -->
			<my-settle></my-settle>

			<!-- 底部固定栏占位 -->
			<view class="u-fixed-footer-spacer"></view>
		</view>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
	name: 'MyCartContent',

	props: {
		/** 侧滑删除策略：'direct' 直接删除 / 'confirm' 弹窗确认 */
		swipeDeleteStrategy: {
			type: String,
			default: 'direct',
			validator: val => ['direct', 'confirm'].includes(val)
		},
		/** 主色（删除按钮、确认弹窗、店铺图标） */
		primaryColor: {
			type: String,
			default: '#C00000' // $color-primary
		}
	},

	data() {
		return {
			// 侧滑删除按钮配置（颜色跟随主色）
			deleteOptions: []
		};
	},

	computed: {
		...mapState('m_cart', ['cart'])
	},

	created() {
		// data() 初始化时 computed 尚未就绪，在 created 中构建依赖 props 的数据
		this.deleteOptions = [
			{
				text: '删除',
				style: {
					backgroundColor: this.primaryColor
				}
			}
		];
	},

	methods: {
		...mapMutations('m_cart', ['updateGoodsState', 'updateGoodsCount', 'removeGoodsById']),

		// ---- 勾选 / 数量变更 ----
		radioChangeHandler(e) {
			this.updateGoodsState(e);
		},

		numberChangeHandler(e) {
			this.updateGoodsCount(e);
		},

		// ---- 侧滑删除 ----
		swipeItemClickHandler(goods) {
			if (this.swipeDeleteStrategy === 'confirm') {
				uni.showModal({
					title: '操作提示',
					content: '确认要从购物车中移除该商品吗？',
					confirmColor: this.primaryColor,
					success: res => {
						if (res.confirm) {
							this.removeGoodsById(goods.goods_id);
							uni.showToast({ title: '已移除', icon: 'none' });
							this.$emit('after-delete', goods);
						}
					}
				});
			} else {
				this.removeGoodsById(goods.goods_id);
				this.$emit('after-delete', goods);
			}
		},

		// ---- 跳转 ----
		gotoDetail(goods) {
			uni.navigateTo({
				url: '/subpkg/goods-detail/goods-detail?goods_id=' + goods.goods_id
			});
		},

		goHome() {
			uni.switchTab({
				url: '/pages/home/home'
			});
		}
	}
};
</script>

<style lang="scss">
/* ---- 购物车主容器 ---- */
.cart-container {
	padding: $space-2;
	padding-bottom: $space-1;
}

/* ---- 头部统计卡片 ---- */
.cart-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: $space-3;
	background: $color-bg-card;
	border-radius: $radius-lg;
	margin-bottom: $space-3;

	.title-left {
		display: flex;
		align-items: center;
		gap: $space-2;

		.title-text {
			font-size: $font-md;
			font-weight: 800;
			color: $color-text-900;
			letter-spacing: 1rpx;
		}
	}

	.goods-count {
		font-size: $font-xs;
		color: $color-text-300;
		background: $color-bg-soft;
		padding: 4rpx 16rpx;
		border-radius: $radius-pill;
	}
}

/* ---- 商品列表 ---- */
.cart-list {
	display: flex;
	flex-direction: column;
	gap: $space-2;
}

.cart-list-item {
	overflow: hidden;
	border-radius: $radius-lg;
	background: $color-bg;
	margin-bottom: $space-2;

	:deep(.goods-item) {
		border-bottom: none;
	}
}

/* ---- 空购物车状态 ---- */
.empty-cart {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: calc(100vh - 44px);

	.empty-img {
		width: 240rpx;
		height: 240rpx;
		opacity: 0.8;
	}

	.tip-text {
		margin-top: $space-4;
		font-size: $font-md;
		color: $color-text-300;
		font-weight: 500;
	}

	.go-shopping-btn {
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
