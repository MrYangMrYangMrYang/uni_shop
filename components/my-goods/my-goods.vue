<!-- 
  商品展示组件
  支持列表模式和网格（瀑布流）模式
  可配置是否显示勾选框、数量选择器、商品图片等
-->
<template>
	<view :class="['goods-item', isGrid ? 'grid-mode' : '']" @click="gotoDetail">
		<!-- 商品左侧区域：包含勾选框和商品图片 -->
		<view class="goods-item-left" v-if="showImage || showRadio">
			<!-- 勾选框：用于购物车选择商品 -->
			<radio :checked="goods.goods_state" :color="primaryColor" v-if="showRadio" @click.stop="radioClickHandler"></radio>
			<!-- 商品主图：支持懒加载 -->
			<image :src="goods.goods_small_logo || defaultPic" class="goods-pic u-img-rounded" v-if="showImage" :mode="isGrid ? 'widthFix' : 'scaleToFill'" lazy-load></image>
		</view>

		<!-- 商品右侧信息区域：标题、价格、数量 -->
		<view class="goods-item-right">
			<!-- 商品标题：支持两行文本截断 -->
			<view class="goods-name">{{goods.goods_name}}</view>
			<view class="goods-info-box">
				<!-- 商品价格：使用 tofixed 过滤器格式化 -->
				<view class="goods-price">￥{{goods.goods_price | tofixed}}</view>
				<!-- 数量选择器：仅在 showNum 为 true 时显示 -->
				<uni-number-box :min="1" :value="goods.goods_count" @change="numChangeHandler" v-if="showNum" @click.native.stop></uni-number-box>
			</view>
		</view>
	</view>
</template>

<script>
	/**
	 * 商品展示组件
	 * 支持列表模式和网格（瀑布流）模式，可配置勾选框、数量选择器、图片展示等
	 */
	export default {
		name:"my-goods",
		// 定义 props 属性，接收父组件传递的数据
		props: {
			// 商品的信息对象
			goods: {
				type: Object,
				default: () => ({}),
			},
			// 是否展示左侧勾选框
			showRadio: {
				type: Boolean,
				default: false,
			},
			// 是否展示数量选择器
			showNum: {
				type: Boolean,
				default: false,
			},
			// 是否展示商品图片
			showImage: {
				type: Boolean,
				default: true,
			},
			// 是否启用网格布局模式（适用于瀑布流列表）
			isGrid: {
				type: Boolean,
				default: false,
			},
		},
		data() {
			return {
				// 默认的空图片占位符，当商品没有图片时显示
				defaultPic: 'https://img3.doubanio.com/f/movie/8dd0c794499fe925ae2ae89ee30cd225750457b4/pics/movie/celebrity-default-medium.png',
				// 主题色常量
				primaryColor: '#C00000'
			};
		},
		methods: {
			/**
			 * 勾选状态改变的回调
			 * 向上级组件分发 radio-change 事件，传递最新的勾选状态
			 */
			radioClickHandler() {
				this.$emit('radio-change', {
					goods_id: this.goods.goods_id,
					goods_state: !this.goods.goods_state
				})
			},
			/**
			 * 数量改变的回调
			 * @param {Number|String} val 最新的数量值
			 * 向上级组件分发 num-change 事件
			 */
			numChangeHandler(val) {
				this.$emit('num-change', {
					goods_id: this.goods.goods_id,
					goods_count: +val
				})
			},
			/**
			 * 点击整个商品项的回调
			 * 向上级分发 click 事件，由外部控制跳转详情页的逻辑
			 */
			gotoDetail() {
				this.$emit('click', this.goods)
			}
		},
		filters: {
			/**
			 * 价格格式化过滤器
			 * @param {Number|String} num 待格式化的价格
			 * @returns {String} 保留两位小数后的字符串
			 */
			tofixed(num) {
				return Number(num).toFixed(2)
			}
		}
	}
</script>

<style lang="scss">
	 /* 商品项通用容器 */
	 .goods-item {
	    width: 100%;
	    box-sizing: border-box;
	    display: flex;
	    padding: $space-2;
		gap: $space-2;
	    border-bottom: 1px solid $color-border-1;
		transition: all 0.3s;
		background-color: $color-bg;
	
	    /* 左侧区域：固定布局下的大小 */
	    .goods-item-left {
	      display: flex;
	      align-items: center;
		  gap: $space-2;
	
	      .goods-pic {
	        width: 180rpx;
	        height: 180rpx;
	        display: block;
	      }
	    }
	
	    /* 右侧信息区域 */
	    .goods-item-right {
	      display: flex;
	      flex: 1;
	      flex-direction: column;
	      justify-content: space-between;
		  min-width: 0; // 配合 flex:1 实现文字截断
	
	      /* 商品名称样式 */
	      .goods-name {
	        font-size: $font-md;
			font-weight: 600;
			line-height: 1.35;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
	      }
	
	      /* 价格和数量容器 */
	      .goods-info-box {
	        display: flex;
	        justify-content: space-between;
	        align-items: center;
	
	        .goods-price {
	          color: $color-primary-600;
	          font-size: $font-lg;
			  font-weight: 700;
	        }
	      }
	    }

		/* 网格模式样式适配（瀑布流） */
		&.grid-mode {
			flex-direction: column;
			padding: 0;
			gap: 0;
			border-bottom: none;
			height: 100%;
			background-color: transparent;

			.goods-item-left {
				width: 100%;
				.goods-pic {
					width: 100%;
					height: auto;
					display: block;
					border-radius: $radius-lg $radius-lg 0 0;
				}
			}

			.goods-item-right {
				padding: $space-2;
				gap: $space-2;

				.goods-name {
					font-size: $font-sm;
					-webkit-line-clamp: 2;
					height: auto;
				}

				.goods-info-box {
					margin-top: auto;
					.goods-price {
						font-size: $font-md;
					}
				}
			}
		}
	  }
</style>