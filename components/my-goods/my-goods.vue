<template>
	<view :class="['goods-item', isGrid ? 'grid-mode' : '']" @click="gotoDetail">
		<!-- 商品左侧图片区域 -->
		<view class="goods-item-left" v-if="showImage || showRadio">
			<!-- 使用 v-if 指令控制 radio 组件的显示与隐藏 -->
			<radio :checked="goods.goods_state" color="#C00000" v-if="showRadio" @click.stop="radioClickHandler"></radio>
			<image :src="goods.goods_small_logo || defaultPic" class="goods-pic u-img-rounded" v-if="showImage" :mode="isGrid ? 'widthFix' : 'scaleToFill'"></image>
		</view>
		<!-- 商品右侧信息区域 -->
		<view class="goods-item-right">
			<!-- 商品标题 -->
			<view class="goods-name">{{goods.goods_name}}</view>
			<view class="goods-info-box">
				<!-- 商品价格：通过管道符 | 调用过滤器 -->
				<view class="goods-price">￥{{goods.goods_price | tofixed}}</view>
				<!-- 商品数量 -->
				<uni-number-box :min="1" :value="goods.goods_count" @change="numChangeHandler" v-if="showNum" @click.native.stop></uni-number-box>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name:"my-goods",
		// 定义 props 属性，用来接收外界传递到当前组件的数据
		props: {
			// 商品的信息对象
			goods: {
				type: Object,
				default: {},
			},
			// 是否展示图片左侧的 radio
			showRadio: {
				type: Boolean,
				// 如果外界没有指定 show-radio 属性的值，则默认不展示 radio 组件
				default: false,
			},
			// 是否展示价格右侧的 NumberBox 组件
			showNum: {
				type: Boolean,
				default: false,
			},
			// 是否展示商品图片
			showImage: {
				type: Boolean,
				default: true,
			},
			// 是否开启网格布局模式
			isGrid: {
				type: Boolean,
				default: false,
			},
		},
		data() {
			return {
				// 默认的空图片
				defaultPic: 'https://img3.doubanio.com/f/movie/8dd0c794499fe925ae2ae89ee30cd225750457b4/pics/movie/celebrity-default-medium.png',
			};
		},
		methods: {
			// radio 组件的点击事件处理函数
			radioClickHandler() {
				// 通过 this.$emit() 触发外界通过 @ 绑定的 radio-change 事件，
				// 同时把商品的 Id 和 勾选状态 作为参数传递给 radio-change 事件处理函数
				this.$emit('radio-change', {
					// 商品的 Id
					goods_id: this.goods.goods_id,
					// 改变商品的勾选状态
					goods_state: !this.goods.goods_state
				})
			},
			// NumberBox 组件的 change 事件处理函数
			numChangeHandler(val) {
				// 通过 this.$emit() 触发外界通过 @ 绑定的 num-change 事件
				this.$emit('num-change', {
					// 商品的 Id
					goods_id: this.goods.goods_id,
					// 商品的最新数量
					goods_count: +val
				})
			},
			// 点击商品跳转到商品详情页
			gotoDetail() {
				this.$emit('click', this.goods)
			}
		},
		filters: {
			// 把数字处理为带两位小数点的数字
			tofixed(num) {
				return Number(num).toFixed(2)
			}
		}
	}
</script>

<style lang="scss">
	 .goods-item {
	    width: 100%;
	    box-sizing: border-box;
	    display: flex;
	    padding: $space-2;
		gap: $space-2;
	    border-bottom: 1px solid $color-border-1;
		transition: all 0.3s;
		background-color: #fff;
	
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
	
	    .goods-item-right {
	      display: flex;
	      flex: 1;
	      flex-direction: column;
	      justify-content: space-between;
		  min-width: 0;
	
	      .goods-name {
	        font-size: $font-md;
			font-weight: 600;
			line-height: 1.35;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
	      }
	
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

		// 网格模式样式
		&.grid-mode {
			flex-direction: column;
			padding: 0;
			gap: 0;
			border-bottom: none;
			height: 100%;
			background-color: transparent; // 在网格/瀑布流模式下背景由外层容器控制

			.goods-item-left {
				width: 100%;
				.goods-pic {
					width: 100%;
					height: auto; // 移除固定高度，由 widthFix 决定
					display: block; // 消除底部间隙
					border-radius: $radius-lg $radius-lg 0 0;
				}
			}

			.goods-item-right {
				padding: $space-2;
				gap: $space-2;

				.goods-name {
					font-size: $font-sm;
					-webkit-line-clamp: 2;
					height: auto; // 瀑布流模式下允许高度自适应
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