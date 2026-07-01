<!--
  商品展示组件
  支持列表模式和网格（瀑布流）模式
  可配置是否显示勾选框、数量选择器、商品图片等
-->
<template>
	<view :class="['goods-item', isGrid ? 'grid-mode' : '']" @click="gotoDetail">
		<!-- 商品左侧区域：勾选框和商品图片 -->
		<view class="goods-item-left" v-if="showImage || showRadio">
			<radio
				:checked="goods.goods_state"
				:color="primaryColor"
				v-if="showRadio"
				@click.stop="radioClickHandler"
			></radio>
			<u-image
				v-if="showImage"
				:src="goods.goods_small_logo || defaultPic"
				:fallback-src="defaultPic"
				:mode="isGrid ? 'widthFix' : 'scaleToFill'"
				class="goods-pic u-img-rounded"
			/>
		</view>

		<!-- 商品右侧信息区域：标题、价格、数量 -->
		<view class="goods-item-right">
			<view class="goods-name">{{ goods.goods_name }}</view>
			<view class="goods-info-box">
				<view class="goods-price">{{ goods.goods_price | formatPrice }}</view>
				<uni-number-box
					:min="1"
					:value="goods.goods_count"
					@change="numChangeHandler"
					v-if="showNum"
					@click.native.stop
				></uni-number-box>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'my-goods',
	props: {
		goods: {
			type: Object,
			default: () => ({})
		},
		showRadio: {
			type: Boolean,
			default: false
		},
		showNum: {
			type: Boolean,
			default: false
		},
		showImage: {
			type: Boolean,
			default: true
		},
		isGrid: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			// 默认图由 u-image 组件内部兜底，不再依赖外部 CDN
			defaultPic: '',
			primaryColor: '#C00000'
		};
	},
	methods: {
		radioClickHandler() {
			this.$emit('radio-change', {
				goods_id: this.goods.goods_id,
				goods_state: !this.goods.goods_state
			});
		},
		numChangeHandler(val) {
			this.$emit('num-change', {
				goods_id: this.goods.goods_id,
				goods_count: +val
			});
		},
		gotoDetail() {
			this.$emit('click', this.goods);
		}
	}
};
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
	background-color: $color-bg;

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
		min-width: 0; // 配合 flex:1 实现文字截断

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

	/* 网格模式适配（瀑布流） */
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
