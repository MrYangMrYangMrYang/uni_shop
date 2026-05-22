/**
 * 购物车详情页 (子包页面)
 * 作用：展示用户已加入购物车的商品列表，支持修改数量、选中状态、侧滑删除及结算跳转
 */
<template>
	<view class="u-page u-page--page">
		<!-- 自定义红色导航栏 -->
		<view class="custom-nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<!-- 返回按钮 -->
				<view class="back-box" @click="goBack">
					<uni-icons type="arrowleft" size="18" color="#FFF"></uni-icons>
				</view>
				<text class="nav-title">Sunny优购</text>
				<!-- 占位，保持标题居中 -->
				<view class="placeholder"></view>
			</view>
		</view>
		
		<!-- 为固定定位的导航栏占位 -->
		<view :style="{ height: (statusBarHeight + 44) + 'px' }"></view>

		<!-- 空白购物车区域：当购物车无商品时展示 -->
		<view class="empty-cart" v-if="cart.length === 0">
			<image src="/static/cart_empty@2x.png" class="empty-img"></image>
			<text class="tip-text">空空如也，去选购几件商品吧~</text>
			<view class="go-shopping-btn u-pressable" @click="goHome">去逛逛</view>
		</view>
		
		<!-- 有商品的区域 -->
		<view class="cart-container" v-else>
			<!-- 购物车商品列表的标题区域 -->
			<view class="cart-header u-card--shadow">
				<view class="title-left">
					<uni-icons type="shop" size="20" color="#C00000"></uni-icons>
					<text class="title-text">我的清单</text>
				</view>
				<text class="goods-count">共 {{cart.length}} 件商品</text>
			</view>
			
			<!-- 商品列表区域：支持侧滑删除 -->
			<uni-swipe-action class="cart-list">
			    <block v-for="(goods, i) in cart" :key="i">
			        <uni-swipe-action-item :options="options" @click="swipeItemClickHandler(goods)">
						<view class="cart-list-item u-card--shadow">
							<!-- 商品行组件：展示信息并处理交互 -->
							<my-goods :goods="goods" :show-radio="true" :show-num="true" @radio-change="radioChangeHandler" @num-change="numberChangeHandler" @click="gotoDetail"></my-goods>
						</view>
			        </uni-swipe-action-item>
			    </block>
			</uni-swipe-action>
			
			<!-- 自定义结算区域组件：处理总价计算与结算逻辑 -->
			<my-settle></my-settle>
			
			<!-- 底部 fixed 结算栏占位，避免列表内容被遮挡 -->
			<view class="u-fixed-footer-spacer"></view>
		</view>
	</view>
</template>

<script>
	import { mapState, mapMutations } from 'vuex'
	import customNavbar from '@/mixins/custom-navbar.js'
	
	export default {
		mixins: [customNavbar],
		data() {
			return {
				options: [{
					text: '删除',
					style: {
						backgroundColor: '#C00000'
					}
				}]
			};
		},
		computed: {
			// 映射 m_cart 模块中的 cart 数组
			...mapState('m_cart', ['cart']),
		},
		methods: {
			// 映射 m_cart 模块中的 Mutation 方法
			...mapMutations('m_cart', ['updateGoodsState','updateGoodsCount','removeGoodsById']),
			
			/**
			 * 商品选中状态发生变化
			 * @param {Object} e 包含 goods_id 和 goods_state
			 */
			radioChangeHandler(e) {
				this.updateGoodsState(e)
			},
			
			/**
			 * 商品数量发生变化
			 * @param {Object} e 包含 goods_id 和 goods_count
			 */
			numberChangeHandler(e) {
				this.updateGoodsCount(e)
			},
			
			/**
			 * 点击侧滑删除按钮
			 * @param {Object} goods 当前操作的商品对象
			 */
			swipeItemClickHandler(goods) {
				this.removeGoodsById(goods.goods_id)
			},
			
			/**
			 * 点击商品图片或文字，跳转到详情页
			 * @param {Object} goods 商品对象
			 */
			gotoDetail(goods) {
				uni.navigateTo({
					url: '/subpkg/goods_detail/goods_detail?goods_id=' + goods.goods_id
				})
			},
			
			goHome() {
				uni.switchTab({
					url: '/pages/home/home'
				})
			}
		}
	}
</script>

<style lang="scss">
	/* 自定义导航栏样式 */
	.custom-nav-bar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: #C00000;
		z-index: 999;

		.nav-content {
			height: 44px;
			display: flex;
			align-items: center;
			padding: 0 $space-2;

			.back-box {
				width: 50px;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.nav-title {
				flex: 1;
				text-align: center;
				color: #FFF;
				font-size: 12px;
				font-weight: 300;
			}

			.placeholder {
				width: 50px;
			}
		}
	}

	/* 购物车主容器 */
	.cart-container {
		padding: $space-2;
		padding-bottom: 2px;
	}

	/* 购物车头部标题栏 */
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

	/* 商品列表样式 */
	.cart-list {
		display: flex;
		flex-direction: column;
		gap: $space-2;
	}

	.cart-list-item {
		overflow: hidden;
		border-radius: $radius-lg;
		background: #fff;
		margin-bottom: $space-2;
		
		:deep(.goods-item) {
			border-bottom: none; // 移除内部边框，由卡片容器控制
		}
	}

	/* 空购物车展示样式 */
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
			color: #fff;
			font-size: $font-sm;
			border-radius: $radius-pill;
			box-shadow: 0 8rpx 20rpx rgba(192, 0, 0, 0.2);
			
			&:active {
				transform: scale(0.96);
				opacity: 0.9;
			}
		}
	}
</style>
