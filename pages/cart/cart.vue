/**
 * 购物车页面
 * 展示已添加至购物车的商品列表，支持修改数量、勾选状态及删除商品
 */
<template>
	<view class="u-page u-page--page">
		<!-- 自定义置顶导航栏：兼容不同设备的 statusBarHeight -->
		<view class="custom-nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<view class="back-box"></view>
				<text class="nav-title">Sunny优购</text>
				<view class="placeholder"></view>
			</view>
		</view>
		
		<!-- 为固定定位的导航栏提供占位高度，确保内容不被遮挡 -->
		<view :style="{ height: (statusBarHeight + 44) + 'px' }"></view>

		<!-- 空白购物车缺省页：当 cart 数组为空时显示 -->
		<view class="empty-cart" v-if="cart.length === 0">
			<image src="/static/cart_empty@2x.png" class="empty-img"></image>
			<text class="tip-text">空空如也，去选购几件商品吧~</text>
			<!-- 跳转首页继续购物 -->
			<view class="go-shopping-btn u-pressable" @click="goHome">去逛逛</view>
		</view>
		
		<!-- 购物车商品列表区域 -->
		<view class="cart-container" v-else>
			<!-- 列表头部卡片：显示店铺图标及商品总数统计 -->
			<view class="cart-header u-card--shadow">
				<view class="title-left">
					<uni-icons type="shop" size="20" :color="primaryColor"></uni-icons>
					<text class="title-text">我的清单</text>
				</view>
				<text class="goods-count">共 {{cart.length}} 件商品</text>
			</view>
			
			<!-- 商品列表容器：支持侧滑删除操作 -->
			<uni-swipe-action class="cart-list">
			    <block v-for="(goods, i) in cart" :key="i">
					<!-- 滑动操作项：配置 options 按钮 -->
			        <uni-swipe-action-item :options="options" @click="swipeItemClickHandler(goods)">
						<view class="cart-list-item u-card--shadow">
							<!-- 
							 复用 my-goods 组件：
							 1. show-radio: 开启左侧复选框
							 2. show-num: 开启右侧数字步进器
							 -->
							<my-goods 
								:goods="goods" 
								:show-radio="true" 
								:show-num="true" 
								@radio-change="radioChangeHandler" 
								@num-change="numberChangeHandler" 
								@click="gotoDetail">
							</my-goods>
						</view>
			        </uni-swipe-action-item>
			    </block>
			</uni-swipe-action>
			
			<!-- 底部全选与结算工具栏 -->
			<my-settle></my-settle>
			
			<!-- 底部占位：防止固定定位的结算栏遮挡列表最后一项内容 -->
			<view class="u-fixed-footer-spacer"></view>
		</view>
	</view>
</template>

<script>
	// 导入购物车徽标混入逻辑，实时更新 TabBar 徽标数量
	import badgeMix from '@/mixins/tabbar-badge.js'
	// 导入 Vuex 映射工具
	import { mapState, mapMutations } from 'vuex'
	
	export default {
		// 混入设置购物车徽标
		mixins: [badgeMix],
		
		data() {
			return {
				// 主题色常量，保持 UI 一致性
				primaryColor: '#C00000',
				// 设备的系统状态栏高度（用于导航栏适配）
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight || 0,
				// 滑动操作按钮配置项
				options: [{
					text: '删除',
					style: {
						backgroundColor: '#C00000'
					}
				}]
			};
		},

		computed: {
			// 将 m_cart 模块中的 cart 数组映射到当前组件
			...mapState('m_cart', ['cart']),
		},

		methods: {
			// 映射 m_cart 模块中的 Mutations 方法，用于更新状态和数据持久化
			...mapMutations('m_cart', ['updateGoodsState','updateGoodsCount','removeGoodsById']),
			
			/**
			 * 商品勾选状态改变回调
			 * @param {Object} e 包含 goods_id 和 goods_state 的变更对象
			 */
			radioChangeHandler(e) {
				this.updateGoodsState(e)
			},
			
			/**
			 * 商品购买数量改变回调
			 * @param {Object} e 包含 goods_id 和 goods_count 的变更对象
			 */
			numberChangeHandler(e) {
				this.updateGoodsCount(e)
			},
			
			/**
			 * 滑动删除按钮点击回调
			 * @param {Object} goods 待删除的目标商品对象
			 */
			swipeItemClickHandler(goods) {
				uni.showModal({
					title: '操作提示',
					content: '确认要从购物车中移除该商品吗？',
					confirmColor: this.primaryColor,
					success: (res) => {
						if (res.confirm) {
							// 1. 调用 Vuex 方法从列表中移除该商品
							this.removeGoodsById(goods.goods_id)
							// 2. 提示用户移除成功
							uni.showToast({
								title: '已移除',
								icon: 'none'
							})
						}
					}
				})
			},
			
			/**
			 * 跳转至商品详情页面
			 * @param {Object} goods 被点击的商品数据对象
			 */
			gotoDetail(goods) {
				uni.navigateTo({
					url: '/subpkg/goods_detail/goods_detail?goods_id=' + goods.goods_id
				})
			},
			
			/**
			 * 跳转至首页进行购物
			 */
			goHome() {
				uni.switchTab({
					url: '/pages/home/home'
				})
			}
		}
	}
</script>

<style lang="scss">
	/* 自定义沉浸式导航栏样式 */
	  .custom-nav-bar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: $color-primary-600;
		z-index: $z-sticky;

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
				font-size: $font-sm;
				font-weight: 300;
			}

			.placeholder {
				width: 50px;
			}
		}
	  }

	/* 购物车列表内容区域容器 */
	  .cart-container {
		padding: $space-2;
		padding-bottom: $space-1;
	  }

	/* 购物车头部统计卡片样式 */
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

	/* 商品列表间距控制 */
	  .cart-list {
		display: flex;
		flex-direction: column;
		gap: $space-2;
	  }

	/* 购物车商品卡片项样式 */
	  .cart-list-item {
		overflow: hidden;
		border-radius: $radius-lg;
		background: $color-bg;
		margin-bottom: $space-2;
		
		/* 深度选择器：移除内部商品项的底边框，交由卡片容器管理 */
		:deep(.goods-item) {
			border-bottom: none;
		}
	  }

	/* 购物车空状态缺省样式 */
	  .empty-cart {
	    display: flex;
	    flex-direction: column;
	    align-items: center;
	    padding-top: 200rpx;
		
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
